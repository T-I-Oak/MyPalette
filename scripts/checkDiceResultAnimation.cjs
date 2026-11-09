const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
for (const card of settings.cards) for (const step of card.steps) {
    step.playEffects = []; step.achievementEffects = [];
}
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="toggle"></button></main>
            <script type="module">
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import {DiceScene} from './src/dice/DiceScene.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            const original=DiceScene.prototype.frame;
            DiceScene.prototype.frame=function(now){window.scene=this;original.call(this,now);};
            const root=document.querySelector('main');
            window.screenCheck=createLayoutScreen(root,document.querySelector('button'));
            window.gameCheck=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(window.screenCheck));
            window.starts=new Map();
            document.addEventListener('animationstart',e=>{
                if(e.animationName==='dice-emerge')window.starts.set(e.target,(window.starts.get(e.target)||0)+1);
            });
            </script>` }));
        await page.goto(base);
        await page.waitForFunction(() => window.scene?.group.dice.length === 3).catch(async error => {
            console.error({ errors, body: await page.locator('body').innerText(), scene: await page.evaluate(() => window.scene?.group.dice.length) });
            throw error;
        });
        // Make repeated outcomes deterministic without changing the physical roll path.
        await page.evaluate(() => window.gameCheck.session.game.state.dice.forEach((die, index) => {
            die.faces = Array.from({ length: 6 }, () => index === 0 ? { special: 'fame1' } : { color: 'orange', material: 'brush' });
        }));
        await page.getByRole('button', { name: '今日の仕事を始める', exact: true }).click({ force: true });
        await page.waitForFunction(() => [...window.scene.visuals.values()].some(v => !v.result.hidden), null, { timeout: 60000 });
        const emerging = await page.evaluate(() => {
            const v = [...window.scene.visuals.values()].find(v => !v.result.hidden);
            const a = v.result.getAnimations()[0], style = getComputedStyle(v.result);
            window.firstResult = v.result; window.firstAnimation = a;
            return { name: a?.animationName, duration: a?.effect.getTiming().duration,
                opacity: Number(style.opacity), y: new DOMMatrixReadOnly(style.transform).m42 };
        });
        assert.equal(emerging.name, 'dice-emerge'); assert.equal(emerging.duration, 700);
        assert(emerging.opacity < 1 && emerging.y > 0, JSON.stringify(emerging));
        await page.waitForFunction(() => window.gameCheck.session.game.state.phase === 'play' && !window.gameCheck.session.game.state.rollRequest,
            null, { timeout: 60000 });
        assert(await page.evaluate(() => window.firstResult.getAnimations()[0] === window.firstAnimation));
        await page.waitForTimeout(800);
        assert(await page.evaluate(() => [...window.scene.visuals.values()].every(v => window.starts.get(v.result) === 1)));

        // Seek actual CSS animations: verify endpoints and the nested floating transform.
        const poses = await page.evaluate(() => {
            window.savedAnimations = [...window.scene.visuals.values()].map(v => [v.result, v.result.getAnimations()[0], v.motion.getAnimations()[0]]);
            return [...window.scene.visuals.values()].map(v => {
                const a = v.result.getAnimations()[0], f = v.motion.getAnimations()[0];
                a.pause(); a.currentTime = 0; f.pause(); f.currentTime = 0;
                const start = getComputedStyle(v.result), matrix = new DOMMatrixReadOnly(start.transform);
                const initial = { opacity: Number(start.opacity), y: matrix.m42, scale: matrix.a };
                a.currentTime = 700; f.currentTime = 700;
                const at = time => { f.currentTime = time; const m = new DOMMatrixReadOnly(getComputedStyle(v.motion).transform);
                    return { y: m.m42, angle: Math.atan2(m.b, m.a) * 180 / Math.PI }; };
                return { initial, opacity: Number(getComputedStyle(v.result).opacity),
                    floatStart: at(700), floatMiddle: at(2200), special: v.result.classList.contains('state-special') };
            });
        });
        assert(poses.some(p => p.special) && poses.some(p => !p.special));
        for (const p of poses) {
            assert.deepEqual(p.initial, { opacity: 0, y: 45, scale: .45 }); assert.equal(p.opacity, 1);
            assert(Math.abs(p.floatStart.y) < .01 && Math.abs(p.floatStart.angle + 3) < .01);
            assert(Math.abs(p.floatMiddle.y + 7) < .01 && Math.abs(p.floatMiddle.angle - 3) < .01);
        }
        // Normal game render, A/B, resize and fixed scale must preserve animation objects.
        await page.locator('.PaintingTab').first().click();
        for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
            await page.setViewportSize(viewport);
            await page.evaluate(() => window.screenCheck.setFixedScale(.8));
            await page.waitForTimeout(100);
            assert(await page.evaluate(() => window.savedAnimations.every(([node, a, f]) =>
                node.isConnected && node.getAnimations()[0] === a && node.firstElementChild.getAnimations()[0] === f)));
        }
        await page.evaluate(() => { window.screenCheck.setFixedScale(1); for (const [, a, f] of window.savedAnimations) { a.play(); f.play(); } });

        // Record continuous natural floating, then reroll while emerging and while floating.
        const floating = await page.evaluate(async () => {
            const v = [...window.scene.visuals.values()][1];
            const before = getComputedStyle(v.motion).transform;
            await new Promise(resolve => setTimeout(resolve, 180));
            return before !== getComputedStyle(v.motion).transform;
        });
        assert(floating);
        for (const elapsed of [250, 1800]) {
            const continuity = await page.evaluate(async elapsed => {
                const scene = window.scene, die = scene.group.dice[1], v = scene.visuals.get(die.id);
                const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                die.prepare(); await frame(); die.begin(); die.settle(0); await frame();
                const a = v.result.getAnimations()[0], f = v.motion.getAnimations()[0];
                a.pause(); a.currentTime = elapsed; f.pause(); f.currentTime = elapsed;
                const before = { transform: getComputedStyle(v.result).transform, opacity: Number(getComputedStyle(v.result).opacity),
                    motion: getComputedStyle(v.motion).transform };
                die.prepare({ animated: true }); await frame();
                const captured = v.returnPose;
                const frozen = getComputedStyle(v.motion).transform;
                const matrix = new DOMMatrixReadOnly(before.transform);
                await new Promise(resolve => setTimeout(resolve, 1000));
                const hidden = v.result.hidden;
                die.begin(); die.settle(0); await frame();
                return { before, captured, frozen, hidden, expected: { x: matrix.m41, y: matrix.m42, scale: matrix.a, opacity: before.opacity },
                    replayed: v.result.getAnimations()[0] !== a && v.result.getAnimations()[0].currentTime < 100 };
            }, elapsed);
            assert.deepEqual(continuity.captured, continuity.expected);
            assert.equal(continuity.frozen, continuity.before.motion);
            assert(continuity.hidden && continuity.replayed);
        }
        const reuse = await page.evaluate(async () => {
            const die = window.scene.group.dice[1], v = window.scene.visuals.get(die.id);
            const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            die.setConsumed(true); await frame(); const hidden = v.result.hidden;
            die.setConsumed(false); await frame();
            return hidden && !v.result.hidden && v.result.getAnimations()[0].currentTime < 100;
        });
        assert(reuse);
        // Control settlement times to ensure per-die playback and no animation wait in the group Promise.
        const staggered = await page.evaluate(async () => {
            const scene = window.scene, group = scene.group, dice = group.dice.slice(1), originalStep = group.step;
            const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            group.step = () => {};
            try {
                for (const die of dice) die.prepare();
                await frame();
                let complete = false;
                const pending = group.roll(dice.map(die => die.id)).then(() => { complete = true; });
                await frame(); dice[0].settle(0); await frame();
                const first = scene.visuals.get(dice[0].id).result.getAnimations()[0];
                const individual = !complete && !scene.visuals.get(dice[0].id).result.hidden && scene.visuals.get(dice[1].id).result.hidden;
                await new Promise(resolve => setTimeout(resolve, 100));
                dice[1].settle(0); await pending; await frame();
                const second = scene.visuals.get(dice[1].id).result.getAnimations()[0];
                return { individual, complete, preserved: scene.visuals.get(dice[0].id).result.getAnimations()[0] === first,
                    firstTime: first.currentTime, secondTime: second.currentTime };
            } finally { group.step = originalStep; }
        });
        assert(staggered.individual && staggered.complete && staggered.preserved);
        assert(staggered.firstTime > staggered.secondTime && staggered.secondTime < 700);
        await page.waitForTimeout(800);
        await page.screenshot({ path: 'tmp_dice_result_animation.png' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(100);
        await page.screenshot({ path: 'tmp_dice_result_animation_portrait.png' });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert(await page.evaluate(() => [...window.scene.visuals.values()].every(v =>
            getComputedStyle(v.result).animationName === 'none' && getComputedStyle(v.motion).animationName === 'none' &&
            getComputedStyle(v.result).opacity === '1' && !v.result.hidden)));
        assert.deepEqual(errors, []);
        console.log('PASS: physical roll, per-result emergence, normal/special, float poses/time, render/A/B/scale persistence, emerging/floating absorption, same-face replay, consume/reuse, reduced motion');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

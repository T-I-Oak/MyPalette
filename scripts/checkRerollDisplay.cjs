const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
for (const card of settings.cards) for (const step of card.steps) {
    step.goals = [{ color: 'yellow', material: null }];
    step.playEffects = [{ type: 'drawCards', count: 3 }];
    step.achievementEffects = [];
}

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
        let singleHand = false;
        // Use production modules with a retained session handle, without adding test APIs to the game.
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
            <script type="module">
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            Math.random=()=>.4;
            const root=document.querySelector('main');
            const screen=createLayoutScreen(root,document.querySelector('button'));
            const presentation=createLayoutPresentation(screen);
            const settings=${JSON.stringify(settings)};
            window.rerollCheck={screen,...mountGame(root,settings,presentation)};
            const game=window.rerollCheck.session.game,complete=game.completeRoll.bind(game);
            let configured=false;
            game.completeRoll=(...args)=>{complete(...args);if(!configured&&game.state.phase==='play'){
                const die=game.state.dice.find(d=>!d.faces[d.current].special),face=die.faces[die.current];
                for(const card of Object.values(game.definitions))for(const step of card.steps)step.goals=[{color:face.color,material:face.material}];configured=true;
                if (${singleHand}) game.state.discard.push(...game.state.hand.splice(1));
            }};
            </script>` }));
        await page.goto(base);
        await page.waitForFunction(()=>document.querySelector('[data-game-end-day]')?.disabled===false,null,{timeout:60000});
        const snapshot = () => page.evaluate(() => JSON.stringify(window.rerollCheck.session.game.state));
        const all = page.getByRole('button', {name:'すべてリロール（リロール権1個消費）',exact:true});
        const die = page.locator('.PaletteViewport .DiceResult:not([hidden])').first();
        await die.click();
        const one = page.getByRole('button',{name:'1つリロール（リロール権1個消費）',exact:true});
        const singleBefore = await snapshot(); await one.click();
        await page.getByRole('button',{name:'戻る',exact:true}).click();
        assert.equal(await snapshot(),singleBefore); await die.click();
        const before = await snapshot();
        await all.click();
        assert.equal(await page.locator('.RerollOverlay').count(),1);
        assert.equal(await page.locator('dialog[open]').count(),0);
        assert.equal(await snapshot(),before);
        assert(await page.locator('.LayoutContent').evaluate(n=>n.inert));
        await page.getByRole('button',{name:'戻る',exact:true}).click();
        assert.equal(await snapshot(),before);
        await all.click();await page.keyboard.press('Escape');assert.equal(await page.locator('.RerollOverlay').count(),0);
        for(const [width,height,scale] of [[1200,700,1],[390,844,.72],[320,740,.59],[768,1024,1],[844,390,.72],[540,960,1]]) {
            await page.setViewportSize({width,height});
            await page.evaluate(scale=>window.rerollCheck.screen.setFixedScale(scale),scale);
            await page.waitForTimeout(150);
            const bounds=await page.locator('.PaletteFixedActions').evaluate(n=>{
                const p=n.getBoundingClientRect();return [...n.children].filter(c=>!c.hidden).map(c=>{const r=c.getBoundingClientRect();return {text:c.textContent,left:r.left-p.left,right:r.right-p.right,height:r.height,clipped:c.scrollWidth>c.clientWidth};});
            });
            assert(bounds.every(b=>b.left>=-1&&b.right<=1&&!b.clipped),JSON.stringify({width,height,scale,bounds}));
        }
        await page.setViewportSize({width:390,height:844});
        await page.evaluate(()=>window.rerollCheck.screen.setFixedScale(.72));
        await all.click();await page.screenshot({path:'tmp_reroll_confirmation_B.png'});
        await page.getByRole('button',{name:'リロールする',exact:true}).click();
        await page.waitForFunction(()=>window.rerollCheck.session.game.state.rerolls===0);
        await page.waitForFunction(()=>!window.rerollCheck.session.game.state.rollRequest,null,{timeout:60000});
        assert.equal(await page.locator('.PaletteRerolls').innerText(),'×0');
        assert.equal(await page.locator('.RerollOverlay').count(),0);
        singleHand = true; await page.reload();
        await page.waitForFunction(()=>document.querySelector('[data-game-end-day]')?.disabled===false,null,{timeout:60000});
        assert.equal(await page.evaluate(()=>window.rerollCheck.session.game.state.hand.length),1);
        assert(await page.locator('[data-scene-area=hand] .state-achievable').count()>0);
        await all.click();
        assert.equal(await page.locator('.RerollOverlay').count(),0);
        assert.equal(await page.evaluate(()=>window.rerollCheck.session.game.state.rerolls),0);
        assert.deepEqual(errors,[]);console.log('reroll display / confirmation / resize checks passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

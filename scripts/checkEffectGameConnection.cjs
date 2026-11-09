const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
for (const card of settings.cards) for (const step of card.steps) { step.playEffects = []; step.achievementEffects = []; }
const base = process.argv[2] || 'http://127.0.0.1:3010/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
        const errors = [];
        page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <meta charset="utf-8"><body class="theme-atelier"><main></main><script type="module">
            import './src/ui/theme.css'; import './src/ui/textures.css'; import './src/ui/layout.css';
            import {mountGame} from './src/game/view.js';
            Math.random=()=>.23;
            window.check=mountGame(document.querySelector('main'),${JSON.stringify(settings)},()=>{});
            window.notices=[];
            new MutationObserver(()=>{
                const node=document.querySelector('.EffectNotice');
                if(node && !window.notices.some(event=>event.id===node.dataset.noticeId))
                    window.notices.push({id:node.dataset.noticeId,timing:node.className,rows:node.querySelectorAll('.EffectBodyRow').length});
            }).observe(document.body,{childList:true,subtree:true});
            </script>` }));
        await page.goto(base);
        const play = () => page.locator('.hand').getByRole('button', { name: '場にプレイ', exact: true }).first();
        const notice = page.locator('.EffectNotice');
        await play().waitFor();
        assert.equal(await notice.count(), 0, 'ordinary daily draw and tickets are not notified');
        async function prepare(effects) {
            await page.evaluate(effects => {
                const g = window.check.session.game;
                g.step(g.state.hand[0]).playEffects = effects;
            }, effects);
        }
        await prepare([{ type: 'changeFame', amount: 2 }, { type: 'gainRerolls', count: 1 }]);
        await play().click();
        await notice.waitFor();
        assert.equal(await notice.locator('.EffectBodyRow').count(), 2);
        assert.equal(await play().isEnabled(), true, 'notification alone does not lock game actions');
        await prepare([{ type: 'reroll' }]);
        await play().click();
        await page.waitForFunction(() => document.querySelector('.EffectNotice')?.dataset.noticeId === '2');
        assert.equal(await page.locator('.GameChoice[open]').count(), 0, 'choice waits until notice ends');
        await page.locator('.GameChoice[open]').waitFor();
        await page.locator('.GameChoice input').first().check();
        await page.getByRole('button', { name: '選択を確定', exact: true }).click();
        await page.waitForFunction(() => !window.check.session.game.task);
        assert.equal(await notice.count(), 0);
        // Activating a special face emits the parent and a grouped child notification.
        await page.evaluate(() => {
            const g = window.check.session.game, d = g.state.dice[0];
            d.faces[d.current] = { special: 'fame1' };
            g.step(g.state.hand[0]).playEffects = [{ type: 'activateSpecialFaces' }];
        });
        await play().click();
        await page.waitForFunction(() => document.querySelector('.EffectNotice')?.dataset.noticeId === '3');
        await page.waitForFunction(() => document.querySelector('.EffectNotice')?.dataset.noticeId === '4');
        assert.ok((await notice.getAttribute('class')).includes('special'));
        await notice.waitFor({ state: 'detached' });
        await page.getByRole('button', { name: '今日の仕事を終える', exact: true }).click();
        await notice.waitFor();
        assert.ok((await notice.getAttribute('class')).includes('special'));
        await notice.waitFor({ state: 'detached' });
        const count = await page.evaluate(() => window.notices.length);
        await page.getByRole('button', { name: '翌日の仕事を始める', exact: true }).click();
        assert.equal(await notice.count(), 0);
        assert.equal(await page.evaluate(() => window.notices.length), count, 'reserved effects do not notify twice');
        // A shortage only offers the remaining unused die; consumed dice stay owned.
        await page.evaluate(() => {
            const g = window.check.session.game;
            g.state.dice.forEach((die, index) => { die.used = index !== 0; });
            g.step(g.state.hand[0]).playEffects = [{ type: 'discardDice', count: 5 }];
        });
        await play().click(); await notice.waitFor();
        await page.locator('.GameChoice[open]').waitFor();
        assert.equal(await page.locator('.GameChoice input').count(), 1);
        await page.locator('.GameChoice input').check();
        await page.getByRole('button', { name: '選択を確定', exact: true }).click();
        assert.equal(await page.evaluate(() => window.check.session.game.state.dice.length), 2);
        await prepare([{ type: 'reroll' }]);
        await play().click(); await notice.waitFor();
        assert.equal(await page.locator('.GameChoice[open]').count(), 0);
        assert.equal(await page.evaluate(() => !!window.check.session.game.task), false, 'no-target effects finish without choosing');
        await notice.waitFor({ state: 'detached' });
        // Disposal while a notice is active removes both its UI and timer.
        await prepare([{ type: 'changeFame', amount: -1 }]);
        await play().click(); await notice.waitFor();
        await page.evaluate(() => window.check.dispose());
        assert.equal(await page.locator('.EffectNoticeLayer').count(), 0);
        await page.waitForTimeout(1100);
        assert.equal(await page.locator('.EffectNoticeLayer').count(), 0);
        assert.deepEqual(errors, []);
        console.log('PASS: real game play, multiple effects, bursts, nonblocking notices, choice resume, nested specials, reservation-only notices and disposal');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

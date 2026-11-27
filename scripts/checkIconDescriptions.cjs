const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3010/MyPalette/';
const { version } = require('../package.json');
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, hasTouch: true });
        const errors = []; page.on('pageerror', error => (errors.push(error.message), console.error(error.message)));
        await page.route(base, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `
            <body class="theme-atelier"><div id="card"></div><script type="module">
            import './src/ui/theme.css'; import './src/ui/textures.css';
            import { Card } from './src/game/Card.js';
            import { releasePaintingIcons } from './src/cardIcons.js';
            const card = new Card('A01');
            const step = { goals: [{material:'brush',color:null},{material:null,color:'yellow'},{material:'brush',color:'yellow'}],
                playEffects:[{type:'changeSpecialFace',face:'fame1'}],achievementEffects:[] };
            window.redraw = () => { releasePaintingIcons(card.element); card.setFace({name:'説明確認', steps:[step,step,step]},0,0,()=>{}); };
            window.redraw(); document.querySelector('#card').append(card.element);
            </script>` }));
        await page.goto(base);
        const goal = page.locator('[data-goal-condition]').first();
        const popup = page.locator('.PaintingIconDetails');
        await goal.hover(); await popup.waitFor();
        assert.equal(await popup.innerText(), 'いずれかの色の絵筆。');
        await page.mouse.move(1100, 850); await popup.waitFor({ state: 'detached' });
        for (const [selector, description] of [
            ['[data-goal-condition]', 'いずれかの色の絵筆。'],
            ['[data-goal-condition*="yellow"]', 'いずれかの黄色の画材。'],
            ['[data-goal-condition*="brush"][data-goal-condition*="yellow"]', '黄色の絵筆。'],
            ['.goal .PaintingBlockLabel', 'カードの目標。'],
            ['.play .PaintingBlockLabel', 'カード着手時に発動する効果。'],
            ['.reward .PaintingBlockLabel', 'ステップ達成時に発動する効果。'],
        ]) {
            const anchor = page.locator(selector).first();
            await anchor.tap(); assert.equal(await popup.innerText(), description);
            assert.equal(await anchor.getAttribute('tabindex'), '-1');
            for (const key of ['Enter', ' ', 'Escape']) {
                await anchor.dispatchEvent('keydown', { key, bubbles: true });
                assert.equal(await anchor.getAttribute('aria-expanded'), 'true');
            }
            const order = await popup.locator('.EffectBodyRow').evaluate(row => {
                const [icon, text] = row.children;
                return icon.getBoundingClientRect().right <= text.getBoundingClientRect().left;
            }); assert.ok(order, 'icon must be left of the explanation');
            await anchor.tap(); assert.equal(await popup.count(), 0);
        }
        for (const width of [1200, 390, 320]) {
            await page.setViewportSize({ width, height: 600 });
            for (const zoom of [.6, 1, 1.5]) {
                await page.locator('#card').evaluate((node, value) => { node.style.zoom = value; }, zoom);
                await goal.tap();
                await page.setViewportSize({ width: width - 20, height: 580 });
                const bounds = await popup.boundingBox();
                assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width - 20 && bounds.y + bounds.height <= 580);
                await page.touchscreen.tap(width - 25, 570); assert.equal(await popup.count(), 0);
                await page.setViewportSize({ width, height: 600 });
            }
        }
        await goal.tap(); await page.evaluate(() => window.redraw()); assert.equal(await popup.count(), 0);
        await page.locator('.play .CardIcon').tap();
        assert.equal(await page.locator('.EffectDetails.is-pinned').count(), 1);
        await goal.tap(); assert.equal(await page.locator('.EffectDetails').count(), 0);
        await page.locator('.PaintingTab').nth(1).tap(); assert.equal(await popup.count(), 0);
        await page.evaluate(() => localStorage.setItem('gameworks_portal_lang', 'en'));
        await page.evaluate(() => window.redraw()); await goal.tap();
        assert.equal(await popup.innerText(), 'Brush of any color.');
        await page.evaluate(() => localStorage.setItem('gameworks_portal_lang', 'ja'));
        await page.unroute(base);
        await page.setViewportSize({ width: 1200, height: 900 });
        await page.goto(new URL('tmp_icon_descriptions_review.html', base).href);
        await page.waitForFunction(expected => document.querySelector('#version')?.textContent === expected, `v${version}`);
        await page.locator('[data-scene-area="hand"] [data-goal-condition]').first().waitFor({ timeout: 60000 });
        await page.waitForFunction(() => { const button = document.querySelector('[data-game-end-day]'); return button && !button.disabled; }, null, { timeout: 60000 });
        await page.locator('[data-scene-area="hand"] [data-goal-condition]').first().tap();
        await page.screenshot({ path: 'tmp_icon_descriptions_review.png' });
        assert.equal(await popup.innerText(), 'いずれかの色の絵筆。');
        assert.deepEqual(errors, []);
        console.log('PASS: normal faces, headings, icon/text order, hover/touch, keys, outside/repeat tap, replacement, cleanup, English, viewport/zoom/resize');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 3, hasTouch: true, reducedMotion: 'reduce' });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        const base = process.argv[2] || 'http://127.0.0.1:3002/MyPalette/';
        const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
        for (const card of settings.cards) for (const step of card.steps) {
            step.goals = [{ color: 'yellow', material: null }]; step.playEffects = []; step.achievementEffects = [];
        }
        await page.route(base, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `
          <meta charset="utf-8">
          <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
          <script type="module">
          import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
          import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
          import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
          Math.random=()=>.4;const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
          window.limitCheck={screen,...mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(screen))};
          </script>` }));
        await page.goto(base); await page.locator('.HandFixedActions button').first().waitFor();
        const snapshot = () => page.evaluate(() => JSON.stringify(window.limitCheck.session.game.state));
        for (const count of [0, 1, 8, 16]) {
            // Seed each independent case in the wide layout; temporary palette layout is outside this check.
            await page.setViewportSize({ width: 1200, height: 900 });
            await page.evaluate(() => window.limitCheck.screen.render());
            await page.evaluate(count => {
                const s = window.limitCheck.session.game.state;
                const cards = [...s.field, ...s.hand, ...s.deck, ...s.discard, ...s.shipped, ...Object.values(s.stocks).flat()];
                s.field = cards.slice(0, count); s.hand = cards.slice(count, count + 4); s.deck = cards.slice(count + 4);
                s.discard = []; s.shipped = []; s.stocks = { A: [], B: [], C: [] }; s.public = { A: null, B: null, C: null };
                s.rerolls = 2; for (const die of s.dice) die.used = false;
            }, count);
            try {
                await page.getByRole('button', { name: '全未使用ダイスをリロール', exact: true }).click({ timeout: 5000 });
            } catch (error) {
                await page.screenshot({ path: 'tmp_play_limits_failure.png' });
                console.log(await page.evaluate(() => {
                    const button = [...document.querySelectorAll('button')].find(node => node.textContent === '全未使用ダイスをリロール');
                    const rect = button.getBoundingClientRect(), hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
                    return { hit: hit?.className, area: hit?.closest('[data-game-area]')?.dataset.gameArea, size: [innerWidth, innerHeight] };
                }));
                throw error;
            }
            assert.equal(await page.locator('.PlayPainting').count(), count);
            const expected = await snapshot();
            for (const viewport of [{ width: 1200, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 240 }]) {
                await page.setViewportSize(viewport);
                await page.evaluate(() => window.limitCheck.screen.render());
                assert.equal(await snapshot(), expected);
                const geometry = await page.locator('.PlayArea').evaluate(host => {
                    const area = host.getBoundingClientRect();
                    return [...host.querySelectorAll('.PlayPainting')].map(node => {
                        const rect = node.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0 && rect.left >= area.left - .1 && rect.right <= area.right + .1;
                    });
                });
                assert.ok(geometry.every(Boolean));
                if (count) {
                    for (const index of [...new Set([0, count - 1])]) {
                        const artwork = page.locator('.PlayCard .PaintingArtwork').nth(index);
                        await artwork.click();
                        await page.locator('.GameCardDetail[open]').waitFor();
                        assert.equal(await snapshot(), expected);
                        await page.locator('.GameCardDetail').getByRole('button', { name: '閉じる', exact: true }).click();
                        await page.waitForFunction(() => !document.querySelector('.GameCardDetail'));
                    }
                }
            }
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.evaluate(() => window.limitCheck.screen.setFixedScale(2));
            await page.locator('#panel-toggle').click();
            assert.equal(await snapshot(), expected);
            await page.locator('#panel-toggle').click();
            await page.evaluate(() => window.limitCheck.screen.setFixedScale(1));
            assert.equal(await snapshot(), expected);
        }
        assert.deepEqual(errors, []);
        console.log('Play limits: 0/1/8/16 works, DPR 3, wide/portrait/320x240, first/last detail taps, fixed scale 1/2, panel and state retention passed.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

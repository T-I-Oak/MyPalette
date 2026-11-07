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
        page.on('pageerror', error => errors.push(error.message));
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
            window.handCheck={screen,...mountGame(root,settings,()=>{},presentation)};
            </script>` }));
        await page.goto(base);
        const hand = page.locator('.HandArea .PaintingCard');
        await hand.first().waitFor();
        async function checkGlow(label) {
            const result = await page.evaluate(async () => {
                const { matchingDice } = await import('./src/game/goals.js');
                const game = window.handCheck.session.game;
                return [...document.querySelectorAll('.HandArea .PaintingCard')].map(node => {
                    const card = game.state.hand.find(card => card.id === node.dataset.cardId);
                    return { id: card.id, actual: node.classList.contains('state-achievable'),
                        expected: !!matchingDice(game.step(card).goals, game.state.dice) };
                });
            });
            for (const card of result) assert.equal(card.actual, card.expected, `${label}: ${card.id}`);
        }
        async function snapshot() {
            return page.evaluate(() => JSON.stringify(window.handCheck.session.game.state));
        }
        await checkGlow('initial');
        const first = await hand.first().getAttribute('data-card-id');
        const before = await snapshot();
        await hand.first().click({ position: { x: 10, y: 40 } });
        const detail = page.locator('.GameCardDetail[open]');
        await detail.waitFor();
        await detail.getByRole('tab', { name: 'Step 1', exact: true }).click();
        assert.equal(await detail.locator('[aria-current="step"]').textContent(), 'Step 0');
        assert.equal(await snapshot(), before);
        await detail.getByRole('button', { name: '閉じる', exact: true }).click();
        await page.waitForFunction(id => document.querySelector(`.HandArea [data-card-id="${id}"] [aria-selected="true"]`)?.textContent === 'Step 1', first);
        assert.equal(await page.locator(`.HandArea [data-card-id="${first}"] [aria-selected="true"]`).textContent(), 'Step 1');
        await page.locator('.HandFixedActions button').first().click();
        assert.equal(await hand.count(), 6);
        await checkGlow('draw');
        for (const size of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1200, height: 700 }]) {
            await page.setViewportSize(size);
            await page.waitForFunction(({ width, height }) => {
                const root = document.querySelector('main');
                return root.clientWidth === width && Math.abs(root.getBoundingClientRect().height - height) < .1;
            }, size);
            await page.evaluate(() => window.handCheck.screen.render());
            if (await page.locator('#panel-toggle').isVisible()) {
                const beforePanel = await snapshot();
                await page.locator('#panel-toggle').click();
                await page.locator('#panel-toggle').click();
                assert.equal(await snapshot(), beforePanel);
            }
            const ids = await hand.evaluateAll(nodes => nodes.map(node => node.dataset.cardId));
            // All exposed card strips must open the correct card, including overlapped ones.
            for (const id of ids) {
                await page.locator(`.HandArea [data-card-id="${id}"]`).click({ position: { x: 5, y: 40 } });
                await detail.waitFor();
                assert.equal(await detail.locator('.PaintingCard').getAttribute('data-card-id'), id);
                await detail.getByRole('button', { name: '閉じる', exact: true }).click();
            }
            await checkGlow('resize');
        }
        await page.locator('[data-game-area="palette"] input').first().check();
        await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).click();
        await checkGlow('consumption');
        await page.locator('[data-game-area="palette"] .GameDie button').nth(1).click();
        await checkGlow('reroll');
        await page.evaluate(() => {
            const game = window.handCheck.session.game;
            const card = game.state.hand[0];
            game.step(card).playEffects = [{ type: 'changeColor', color: 'red' },
                { type: 'discardDice', count: 1 }, { type: 'refreshDice' },
                { type: 'gainColorDice', colors: 'yellow_purple', count: 1, lifetime: 'temporary' }];
        });
        await page.locator('.HandFixedActions button').first().click();
        const choice = page.locator('.GameChoice[open]');
        assert.deepEqual(errors, [], 'fixture rendering');
        await choice.waitFor();
        assert.equal(await page.locator('.HandFixedActions button:not(:disabled)').count(), 0);
        await choice.locator('input').first().check();
        await choice.getByRole('button', { name: '選択を確定' }).click();
        await checkGlow('face rewrite');
        await choice.waitFor();
        await choice.locator('input').first().check();
        await choice.getByRole('button', { name: '選択を確定' }).click();
        await checkGlow('discard, refresh, acquisition');
        assert.equal(await page.evaluate(() => window.handCheck.session.game.state.dice.length), 3);
        assert.equal(await page.evaluate(() => window.handCheck.session.game.state.dice.some(die => die.used)), false);
        await page.getByRole('button', { name: '一日の仕事を終える', exact: true }).click();
        assert.equal(await hand.count(), 0);
        assert.equal(await page.locator('.HandFixedActions button').count(), 0);
        assert.deepEqual(errors, []);
        console.log('Hand: 0/4/6 cards, overlap taps, read-only inspection, current step, A/B/tablet/panel, draw, consumption, reroll, face rewrite, discard, refresh, acquisition, pending choices, day end passed');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

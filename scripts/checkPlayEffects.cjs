const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, hasTouch: true });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        const base = process.argv[2] || 'http://127.0.0.1:3002/MyPalette/';
        const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
        for (const card of settings.cards) for (const step of card.steps) {
            step.goals = [{ color: 'yellow', material: null }]; step.playEffects = [];
            step.achievementEffects = [{ type: 'changeFame', amount: 1 }];
        }
        await page.route(base, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `
          <meta charset="utf-8">
          <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
          <script type="module">
          import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
          import {createLayoutPresentation} from './src/game/layoutPresentation.js';
          import {mountGame} from './src/game/view.js';
          import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
          Math.random=()=>.4;
          const root=document.querySelector('main'), screen=createLayoutScreen(root,document.querySelector('button'));
          const presentation=createLayoutPresentation(screen);
          window.effectCheck={screen,...mountGame(root,${JSON.stringify(settings)},()=>{},presentation)};
          </script>` }));
        await page.goto(base);
        const area = page.locator('.PlayArea');
        const stage = value => page.waitForFunction(value => document.querySelector('.PlayArea').dataset.playEffect === value, value);
        const idle = () => page.waitForFunction(() => !document.querySelector('.PlayArea').dataset.playEffect);
        await page.locator('.HandFixedActions button').first().waitFor();
        const id = await page.locator('.HandFixedActions [data-card-id]').first().getAttribute('data-card-id');
        await page.locator('.HandFixedActions button').first().click();
        await stage('moving');
        await page.locator('.PlayFlyingCard').waitFor();
        assert.equal(await page.locator('.PlayFlyingCard').count(), 1);
        assert.equal(await page.locator('.PlayCard').first().evaluate(node => node.style.opacity), '0');
        await page.screenshot({ path: 'tmp_effect_play.png' });
        await idle(); assert.equal(await page.locator('.PlayFlyingCard').count(), 0);
        await page.locator('[data-game-area=palette] input').first().check();
        await page.locator('.PlayFixedActions button').first().click();
        await stage('repaint');
        const beforeEffect = await page.evaluate(() => {
            const s = window.effectCheck.session.game.state;
            return { used: s.dice[0].used, fame: s.fame, staged: !!s.achievement };
        });
        assert.deepEqual(beforeEffect, { used: true, fame: 0, staged: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: 'tmp_effect_canvas.png' });
        await stage('next-card'); await page.screenshot({ path: 'tmp_effect_next_card.png' });
        await idle();
        assert.equal(await page.locator(`.PlayPainting[data-painting-id="${id}"]`).count(), 0);
        assert.equal(await page.evaluate(() => window.effectCheck.session.game.state.fame), 1);

        // A pending effect must appear after repaint, while the after-step canvas remains visible.
        await page.evaluate(() => {
            const game = window.effectCheck.session.game, card = game.state.hand[0];
            game.definitions[card.id].steps[0].achievementEffects = [{ type: 'gainNormalDice', count: 1, lifetime: 'temporary' }];
        });
        await page.locator('.HandFixedActions button').first().click(); await idle();
        await page.locator('[data-game-area=palette] input').first().check();
        await page.locator('.PlayFixedActions button').first().click();
        await page.locator('.GameChoice[open]').waitFor();
        assert.equal(await area.getAttribute('data-play-effect'), 'effects');
        assert.equal(await page.locator('.PlayCard').first().evaluate(node => node.style.opacity), '0');
        await page.locator('.GameChoice[open] input').first().check();
        await page.locator('.GameChoice[open]').getByRole('button', { name: '選択を確定' }).click();
        await idle();

        // Completion must show Step 3 before the card ships and the empty easel is removed.
        await page.evaluate(() => { window.effectCheck.session.game.state.hand[0].step = 2; });
        await page.locator('.HandFixedActions button').first().click(); await idle();
        await page.locator('[data-game-area=palette] input').first().check();
        await page.locator('.PlayFixedActions button').first().click(); await stage('next-card');
        assert.equal(await page.locator('.PlayCard .PaintingTab[aria-current=step]').textContent(), 'Done');
        await idle();
        assert.equal(await page.evaluate(() => window.effectCheck.session.game.state.shipped.length), 1);

        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.reload(); await page.locator('.HandFixedActions button').first().waitFor();
        await page.locator('.HandFixedActions button').first().click();
        assert.equal(await area.getAttribute('data-play-effect'), null);
        await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.reload();
        await page.locator('.HandFixedActions button').first().click(); await stage('moving');
        await page.evaluate(() => window.effectCheck.dispose());
        await page.waitForTimeout(100);
        assert.equal(await page.locator('.PlayFlyingCard').count(), 0);
        assert.deepEqual(errors, []);
        console.log('Play effects: empty easel, flight, consumed dice before repaint/effects, choices, next card, shipment, resize and reduced motion passed.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

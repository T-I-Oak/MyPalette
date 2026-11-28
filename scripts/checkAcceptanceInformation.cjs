const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { diceListReviewFixture } = require('./diceListReviewFixture.cjs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const directory = process.env.MYPALETTE_ACCEPTANCE_EVIDENCE || 'tmp_acceptance_evidence';
fs.mkdirSync(directory, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce', hasTouch: true });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: diceListReviewFixture() }));
        await page.goto(base);
        await page.waitForFunction(() => window.review?.session.game.state.phase === 'play' && !review.session.game.state.rollRequest, null, { timeout: 90000 });
        const version = await page.locator('#version').textContent();
        assert.equal(version, 'v' + require('../package.json').version);
        await page.locator('.ReviewTools').evaluate(node => { node.style.display = 'none'; });
        await page.locator('.HandFixedActions button:enabled').first().click();
        await page.waitForFunction(() => !reviewPresentation.cards.busy && document.querySelector('[data-scene-area="field"] .PaintingCard'));
        await page.screenshot({ path: `${directory}/field-A.png` });
        const field = page.locator('[data-scene-area="field"] .PaintingCard').first();
        const before = await page.evaluate(() => JSON.stringify(review.session.game.state));
        await field.locator('.PaintingName').click();
        const detail = page.locator('.GameCardDetail');
        await detail.waitFor();
        assert.equal(await detail.locator('.PaintingTab[aria-current="step"]').textContent(), 'Step 0');
        await detail.getByRole('tab', { name: 'Step 2', exact: true }).click();
        assert.equal(await detail.locator('.PaintingTab[aria-current="step"]').textContent(), 'Step 0');
        assert.equal(await detail.locator('.PaintingTab[aria-selected="true"]').textContent(), 'Step 2');
        assert.equal(await detail.locator('.PaintingPanel.state-current').count(), 0);
        assert.equal(await page.evaluate(() => JSON.stringify(review.session.game.state)), before);
        await page.screenshot({ path: `${directory}/field-detail-A.png` });
        await detail.getByRole('button', { name: '閉じる', exact: true }).click();
        const shippedId = await page.evaluate(() => {
            const state = review.session.game.state;
            const card = state.hand.shift(); card.step = 3; state.shipped.push(card);
            state.fame = 17; state.credit = 4; state.flyers = 2; state.progress = 1;
            reviewRefresh.click(); return card.id;
        });
        await page.waitForFunction(() => !reviewPresentation.cards.busy);
        await page.evaluate(() => { reviewPresentation.cards.adopt(review.session.game.state); reviewPresentation.cards.update(); });
        assert.equal(await page.getByRole('img', { name: '名声 17', exact: true }).count(), 1);
        assert.equal(await page.getByRole('img', { name: '信用 4', exact: true }).count(), 1);
        const shipped = page.locator(`[data-scene-card="${shippedId}"]`);
        assert.equal(await shipped.locator('.SceneShippedArtwork').getAttribute('src'), `/MyPalette/assets/paintings/${shippedId}-3.png`);
        await shipped.click(); await detail.waitFor();
        assert.equal(await detail.locator('.PaintingTab[aria-current="step"]').textContent(), 'Done');
        await page.screenshot({ path: `${directory}/shipped-detail-A.png` });
        await detail.getByRole('button', { name: '閉じる', exact: true }).click();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => reviewScreen.setFixedScale(.7));
        await field.locator('.PaintingName').click(); await detail.waitFor();
        assert.equal(await detail.locator('.PaintingTab[aria-current="step"]').textContent(), 'Step 0');
        await page.screenshot({ path: `${directory}/field-detail-B.png` });
        await detail.getByRole('button', { name: '閉じる', exact: true }).click();
        const availability = await page.evaluate(async () => {
            const { matchingDice } = await import('./src/game/goals.js');
            const game = review.session.game;
            const original = structuredClone(game.state.dice[0]);
            const normal = Array.from({ length: 3 }, (_, index) => ({ ...structuredClone(original), id: `qa-match-${index}`, used: false, current: 0,
                faces: Array.from({ length: 6 }, (_, face) => ({ color: 'red', material: face === 0 ? 'brush' : 'pastel' })) }));
            const used = normal.map(die => ({ ...structuredClone(die), used: true }));
            const changed = normal.map(die => ({ ...structuredClone(die), current: 1 }));
            const rewritten = changed.map(die => { die = structuredClone(die); die.faces[1].material = 'brush'; return die; });
            const cases = [['initial', normal], ['consume-all', used], ['reuse-one', [normal[0], ...used.slice(1)]],
                ['reroll-current', changed], ['rewrite-current-face', rewritten], ['remove-all', []], ['add-die', [normal[0]]]];
            const results = [];
            for (const [name, dice] of cases) {
                review.session.dispatch(() => { game.state.dice = structuredClone(dice); }); reviewRefresh.click();
                await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                results.push({ name, cards: [...game.state.hand, ...game.state.field].map(card => ({ id: card.id,
                    expected: Boolean(matchingDice(game.step(card).goals, game.state.dice)),
                    actual: document.querySelector(`[data-scene-card="${card.id}"]`).classList.contains('state-achievable') })) });
            }
            return results;
        });
        for (const row of availability) for (const card of row.cards) assert.equal(card.actual, card.expected, `${row.name}/${card.id}`);
        while (await page.locator('.HandFixedActions button:enabled').count()) {
            await page.locator('.HandFixedActions button:enabled').first().click();
            await page.waitForFunction(() => !reviewPresentation.cards.busy);
        }
        const works = await page.evaluate(() => review.session.game.state.field.map(card => ({ id: card.id, name: review.session.game.definitions[card.id].name })));
        assert(works.length >= 2);
        for (const viewport of [{ width: 1200, height: 900 }, { width: 390, height: 844 }]) {
            await page.setViewportSize(viewport);
            await page.screenshot({ path: `${directory}/multiple-works-${viewport.width}.png` });
            for (const work of works) {
                await page.locator(`[data-scene-card="${work.id}"] .PaintingName`).click();
                await detail.waitFor();
                assert.equal(await detail.locator('.PaintingTitle').textContent(), work.name);
                await detail.getByRole('button', { name: '閉じる', exact: true }).click();
            }
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(`${directory}/information-capture.json`, JSON.stringify({ version, browser: browser.version(), base,
            fixture: 'diceListReviewFixture: page-only empty effects/brush goals; one card played; hand card assigned step3/shipped; fame17/credit4/flyers2/progress1',
            viewports: ['1200x900 fixed1 reduce A', '390x844 fixed0.7 reduce B'], shippedId, availability, works, errors }, null, 2) + '\n');
        console.log('PASS: field/current-vs-inspected steps/read-only state/shipped detail/finished art/fame/credit/A-B detail; availability after consume/reuse/current/face/remove/add');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

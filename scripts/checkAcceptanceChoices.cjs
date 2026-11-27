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
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: diceListReviewFixture() }));
        const start = async effect => {
            await page.goto(base);
            await page.waitForFunction(() => window.review?.session.game.state.phase === 'play' && !review.session.game.state.rollRequest, null, { timeout: 90000 });
            await page.locator('.ReviewTools').evaluate(node => { node.style.display = 'none'; });
            await page.evaluate(effect => {
                const game = review.session.game;
                game.step(game.state.hand[0]).playEffects = [effect, { type: 'changeFame', amount: 3 }];
            }, effect);
        };
        await start({ type: 'gainNormalDice', count: 1, lifetime: 'permanent' });
        await page.locator('.HandFixedActions button:enabled').first().click();
        const choice = page.locator('.GameChoice[open]'); await choice.waitFor();
        assert.equal(await choice.locator('.GameDie').count(), 3);
        assert.equal(await choice.locator('.DieFaceSlot').count(), 18);
        const candidates = await page.evaluate(() => review.session.game.state.pending.options.map(option => option.faces));
        const labels = await choice.locator('.DieFaceSlot .CardIcon').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-label')));
        const expectedLabels = await page.evaluate(async () => {
            const { displayLabel } = await import('./src/effectCatalog.js');
            return review.session.game.state.pending.options.flatMap(option => option.faces.map((face, index) =>
                `${index + 1}面：${face.special ? `特殊面：${displayLabel(face.special)}` : `${displayLabel(face.color)}・${displayLabel(face.material)}`}`));
        });
        assert.deepEqual(labels, expectedLabels);
        const inputs = choice.locator('input');
        const confirm = choice.getByRole('button', { name: '選択を確定', exact: true });
        assert(await confirm.isDisabled());
        await inputs.nth(1).check(); assert(await confirm.isEnabled());
        await inputs.nth(0).check(); assert(await confirm.isDisabled());
        await inputs.nth(0).uncheck(); assert(await confirm.isEnabled());
        await page.screenshot({ path: `${directory}/acquisition-candidates.png` });
        await confirm.click();
        await page.waitForFunction(() => review.session.game.state.dice.length === 4 && !review.session.game.state.rollRequest && review.session.game.state.fame === 3, null, { timeout: 90000 });
        assert.deepEqual(await page.evaluate(() => review.session.game.state.dice.at(-1).faces), candidates[1]);
        const rerolls = [];
        for (const selectedCount of [1, 2, 0]) {
            await start({ type: 'reroll' });
            if (selectedCount === 0) await page.evaluate(() => { review.session.game.state.dice.forEach(die => { die.used = true; }); reviewRefresh.click(); });
            const before = await page.evaluate(() => ({ rerolls: review.session.game.state.rerolls, dice: review.session.game.state.dice.map(die => [die.id, die.current]) }));
            await page.locator('.HandFixedActions button:enabled').first().click();
            const select = page.getByRole('button', { name: '選択して画材を更新する', exact: true });
            if (selectedCount) {
                await select.waitFor(); assert(await select.isDisabled());
                await page.locator('.DiceListOpen').click();
                const rows = page.locator('.DiceListRow');
                for (let index = 0; index < selectedCount; index++) await rows.nth(index).locator('.DiceListVisual').click();
                assert(await select.isEnabled());
                await page.screenshot({ path: `${directory}/immediate-reroll-${selectedCount}.png` });
                await page.locator('.DiceListClose').click();
                await select.click();
            }
            await page.waitForFunction(() => review.session.game.state.fame === 3 && !review.session.game.state.rollRequest && !review.session.game.state.pending, null, { timeout: 90000 });
            const after = await page.evaluate(() => ({ rerolls: review.session.game.state.rerolls, dice: review.session.game.state.dice.map(die => [die.id, die.current]) }));
            assert.equal(after.rerolls, before.rerolls);
            assert.deepEqual(after.dice.slice(selectedCount), before.dice.slice(selectedCount));
            assert.equal(await select.count(), 0);
            rerolls.push({ selectedCount, before, after });
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(`${directory}/choices-capture.json`, JSON.stringify({ version: require('../package.json').version, browser: browser.version(),
            fixture: 'diceListReviewFixture with page-only card play effect gainNormalDice or reroll, followed by fame+3; reroll zero case all used',
            viewport: '1200x900 DPR1 fixed1 A reduce', candidates, labels, rerolls, errors }, null, 2) + '\n');
        console.log('PASS: candidates3x6/exactly one/chosen faces preserved; effect reroll1/2/0/no ticket cost/non-target faces preserved');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

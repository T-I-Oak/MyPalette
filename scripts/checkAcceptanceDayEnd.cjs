const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { diceListReviewFixture } = require('./diceListReviewFixture.cjs');
const { installDayStartGate, waitDayStart, releaseDayStart } = require('./dayStartGate.cjs');
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
        await page.goto(base);
        await page.waitForFunction(() => window.review?.session.game.state.phase === 'play' && !review.session.game.state.rollRequest, null, { timeout: 90000 });
        await page.locator('.ReviewTools').evaluate(node => { node.style.display = 'none'; });
        await page.evaluate(() => {
            const state = review.session.game.state;
            const original = state.dice[0];
            state.dice = Array.from({ length: 5 }, (_, index) => ({ ...structuredClone(original), id: `qa-day-end-${index}`,
                current: 0, used: false, faces: Array.from({ length: 6 }, () => ({ color: 'yellow', material: 'brush' })) }));
            state.credit = 1; state.flyers = 2; state.progress = 0; state.orderCost = 3;
            reviewRefresh.click();
            window.qaDayEndFrames = [];
            const observe = () => {
                const state = review.session.game.state;
                qaDayEndFrames.push({ phase: state.phase, kind: state.dayEndRequest?.kind,
                    used: state.dice.filter(die => die.used).map(die => die.id), flyers: state.flyers, progress: state.progress,
                    orderCost: state.orderCost, credit: state.credit, labels: [...document.querySelectorAll('.InfoResources [role="img"]')].map(node => node.getAttribute('aria-label')),
                    motion: document.querySelector('[data-card-scene-motion]')?.dataset.cardSceneMotion });
                if (state.phase !== 'finished') requestAnimationFrame(observe);
            }; requestAnimationFrame(observe);
        });
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await page.getByRole('button', { name: '今日の仕事を終える', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[data-card-scene-motion="flyer-work"]'));
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${directory}/day-end-flyer-work.png` });
        await page.waitForFunction(() => document.querySelector('[data-card-scene-motion="flyer-reserve"]'), null, { timeout: 60000 });
        await page.screenshot({ path: `${directory}/day-end-flyer-reserve.png` });
        await page.waitForFunction(() => document.querySelector('[data-card-scene-motion="credit-loss"]'), null, { timeout: 60000 });
        await page.screenshot({ path: `${directory}/day-end-credit-loss.png` });
        await page.waitForFunction(() => review.session.game.state.phase === 'finished', null, { timeout: 60000 });
        const result = await page.evaluate(() => {
            const state = review.session.game.state;
            return { credit: state.credit, flyers: state.flyers, progress: state.progress, orderCost: state.orderCost,
                used: state.dice.filter(die => die.used).length, frames: qaDayEndFrames };
        });
        assert.equal(result.credit, 0);
        assert.equal(result.flyers, 0);
        assert.equal(result.progress, 0);
        assert.equal(result.orderCost, 5);
        assert.ok(result.frames.some(frame => frame.motion === 'flyer-work' && frame.used.length >= 1));
        assert.ok(result.frames.some(frame => frame.motion === 'flyer-reserve'));
        assert.ok(result.frames.some(frame => frame.motion === 'credit-loss'));
        const lifecycles = [];
        await installDayStartGate(page);
        for (const setup of [
            { layout: 'A', viewport: { width: 1200, height: 900 }, reducedMotion: 'no-preference', scale: 1 },
            { layout: 'B', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', scale: .7 },
        ]) {
            await page.setViewportSize(setup.viewport); await page.emulateMedia({ reducedMotion: setup.reducedMotion });
            await page.goto(base); await waitDayStart(page); await releaseDayStart(page);
            await page.waitForFunction(() => review.session.game.state.phase === 'play' && !review.session.game.state.rollRequest && !reviewPresentation.cards.busy, null, { timeout: 90000 });
            const permanentIds = await page.evaluate(scale => {
                reviewScreen.setFixedScale(scale);
                document.querySelector('.ReviewTools').style.display = 'none';
                const state = review.session.game.state;
                const ids = state.dice.map(die => die.id);
                state.dice.forEach(die => { die.used = true; });
                state.dice.push({ ...structuredClone(state.dice[0]), id: 'qa-temporary-removal', lifetime: 'temporary', used: true });
                state.flyers = 0; state.credit = 3;
                reviewRefresh.click(); return ids;
            }, setup.scale);
            await page.waitForFunction(() => reviewScene.group.dice.length === 4 && reviewScene.group.dice.every(die => die.consumed));
            await page.locator('.DiceListOpen').click();
            assert.equal(await page.locator('.DiceListRow').count(), 4);
            assert.equal(await page.locator('.DiceListRow.state-consumed').count(), 4);
            await page.screenshot({ path: `${directory}/d02-consumed-${setup.layout}.png` });
            await page.locator('.DiceListClose').click();
            await page.getByRole('button', { name: '今日の仕事を終える', exact: true }).click();
            await waitDayStart(page); await releaseDayStart(page);
            await page.waitForFunction(() => review.session.game.state.day === 2 && review.session.game.state.phase === 'play' && !review.session.game.state.rollRequest && !reviewPresentation.cards.busy, null, { timeout: 90000 });
            const after = await page.evaluate(() => ({
                state: review.session.game.state.dice.map(die => ({ id: die.id, used: die.used, lifetime: die.lifetime })),
                physical: reviewScene.group.dice.map(die => ({ id: die.id, consumed: die.consumed })),
                removedVisual: !reviewScene.visuals.has('qa-temporary-removal'),
            }));
            assert.deepEqual(after.state.map(die => die.id), permanentIds);
            assert(after.state.every(die => die.lifetime === 'permanent' && !die.used));
            assert.deepEqual(after.physical.map(die => die.id), permanentIds);
            assert(after.physical.every(die => !die.consumed));
            assert(after.removedVisual);
            await page.locator('.DiceListOpen').click();
            assert.equal(await page.locator('.DiceListRow').count(), 3);
            assert.equal(await page.locator('.DiceListRow.state-consumed').count(), 0);
            assert.equal(await page.locator('.DiceListRow[data-die-id="qa-temporary-removal"]').count(), 0);
            await page.screenshot({ path: `${directory}/d02-removed-${setup.layout}.png` });
            lifecycles.push({ ...setup, permanentIds, after });
        }
        assert.deepEqual(errors, []);
        fs.writeFileSync(`${directory}/day-end-capture.json`, JSON.stringify({ browser: browser.version(), version: require('../package.json').version,
            viewport: '1200x900 DPR1 fixed1 A', fixture: 'page-only 5 yellow brush dice, credit1, flyers2/progress0/orderCost3; lifecycle cases: 3 permanent and 1 temporary, all consumed; no saved settings changes', result, lifecycles, errors }, null, 2) + '\n');
        console.log('PASS: flyer work/reservation/credit loss; A/normal and B/reduce: consumed dice retained, temporary removed at day end, permanent reused next day');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

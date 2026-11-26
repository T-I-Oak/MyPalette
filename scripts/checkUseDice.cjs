const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const reviewUrl = new URL('tmp_use_dice_review.html', base).href;
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
        await page.goto(new URL('dev.html#icons', base).href);
        await page.locator('.IconLab').waitFor();
        await page.evaluate(async () => {
            const { effectIconCanvas } = await import('./src/icons/render.js');
            const sheet = document.createElement('div'); sheet.id = 'use-dice-icons';
            sheet.style.cssText = 'padding:20px;background:#fff;font:16px system-ui;width:1100px';
            for (const count of [1, 2, 10]) {
                const title = document.createElement('p'); title.textContent = `MP42-V01 / 指定個数 ${count}`; sheet.append(title);
                const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:12px';
                for (const color of ['#f4e9d2', '#d8e5ea']) {
                    const sample = document.createElement('div'); sample.style.cssText = `background:${color};padding:12px;display:flex;align-items:center;gap:16px`;
                    for (const height of [128, 48, 32]) sample.append(effectIconCanvas({ type: 'useDie', count }, height));
                    row.append(sample);
                }
                sheet.append(row);
            }
            document.body.replaceChildren(sheet);
        });
        await page.locator('#use-dice-icons').screenshot({ path: 'tmp_use_dice_icons.png' });
        for (const reducedMotion of process.env.MYPALETTE_ICONS_ONLY ? [] : ['reduce', 'no-preference']) {
            await page.emulateMedia({ reducedMotion });
            await page.setViewportSize({ width: 1200, height: 800 });
            await page.goto(reviewUrl);
            const prepare = page.locator('#prepare');
            await prepare.waitFor();
            await page.waitForFunction(() => !document.querySelector('#prepare').disabled, null, { timeout: 90000 });
            await prepare.click();
            await page.locator('.HandFixedActions button').first().click();
            const choice = page.locator('.GameChoice[open]'); await choice.waitFor();
            assert.equal(await choice.locator('input').count(), 3);
            for (const size of [{ width: 390, height: 844 }, { width: 1200, height: 800 }]) {
                await page.setViewportSize(size);
                await page.evaluate(() => window.useDiceReview.screen.setFixedScale(.75));
                await choice.waitFor();
            }
            await choice.locator('input').nth(0).check(); await choice.locator('input').nth(1).check();
            await choice.getByRole('button', { name: '選択を確定', exact: true }).click();
            await page.waitForFunction(() => !window.useDiceReview.mounted.session.game.task);
            const result = await page.evaluate(() => {
                const r = window.useDiceReview, s = r.mounted.session.game.state;
                return { dice: s.dice, before: r.before, fame: s.fame,
                    consumed: r.scene.group.dice.map(d => d.consumed),
                    hidden: s.dice.map(d => r.scene.visuals.get(d.id).result.hidden), errors: r.errors };
            });
            assert.deepEqual(result.dice, result.before.map((d, i) => ({ ...d, used: i < 2 })));
            assert.equal(result.fame, 0); assert.deepEqual(result.consumed, [true, true, false]);
            assert.deepEqual(result.hidden, [true, true, false]); assert.deepEqual(result.errors, []);
            const glow = await page.evaluate(() => [...document.querySelectorAll('[data-scene-area=hand] .PaintingCard')].map(n => n.classList.contains('state-achievable')));
            assert.ok(glow.length); assert.ok(glow.every(value => !value));
            await page.screenshot({ path: `tmp_use_dice_${reducedMotion}.png` });
            await page.locator('#refresh').click();
            await page.waitForFunction(() => window.useDiceReview.scene.group.dice.every(d => !d.consumed), null, { timeout: 5000 }).catch(async error => {
                console.log(await page.locator('#diagnostic').textContent());
                console.log(await page.evaluate(() => ({ model: window.useDiceReview.mounted.session.game.state.dice.map(d=>d.used), scene: window.useDiceReview.scene.group.dice.map(d=>d.consumed), errors:window.useDiceReview.errors })));
                throw error;
            });
            assert.ok(await page.evaluate(() => [...document.querySelectorAll('[data-scene-area=hand] .PaintingCard')].every(n => n.classList.contains('state-achievable'))));
            console.log(`PASS: ${reducedMotion}, normal/special, permanent/temporary, retained faces, A/B resize, fixed scale, palette, hand glow, reuse`);
        }
        for (const mode of process.env.MYPALETTE_ICONS_ONLY ? [] : ['reward', 'chain', 'empty']) {
            await page.goto(reviewUrl);
            await page.waitForFunction(() => !document.querySelector('#prepare')?.disabled, null, { timeout: 90000 });
            await page.locator('#mode').selectOption(mode); await page.locator('#prepare').click();
            await page.locator('.HandFixedActions button').first().click();
            if (mode === 'reward') {
                await page.waitForFunction(() => !document.querySelector('[data-game-end-day]').disabled);
                const die = page.locator('.PaletteViewport .DiceResult[data-die-id="D1"]');
                await die.click();
                await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).click();
            }
            if (mode !== 'empty') {
                const choice = page.locator('.GameChoice[open]'); await choice.waitFor();
                assert.equal(await choice.locator('input').count(), mode === 'reward' ? 2 : 3);
                await choice.locator('input').nth(0).check(); await choice.locator('input').nth(1).check();
                await choice.getByRole('button', { name: '選択を確定', exact: true }).click();
                if (mode === 'chain') {
                    await choice.waitFor(); assert.equal(await choice.locator('input').count(), 1);
                    await choice.locator('input').check();
                    await choice.getByRole('button', { name: '選択を確定', exact: true }).click();
                }
            }
            await page.waitForFunction(() => !window.useDiceReview.mounted.session.game.task);
            const result = await page.evaluate(() => {
                const r = window.useDiceReview, s = r.mounted.session.game.state;
                return { used: s.dice.map(d => d.used), count: s.dice.length, pending: s.pending, rerolls: s.rerolls, errors: r.errors };
            });
            assert.deepEqual(result.used, [true, true, true]); assert.equal(result.count, 3);
            assert.equal(result.pending, null); assert.deepEqual(result.errors, []);
            if (mode === 'chain') assert.equal(result.rerolls, 3);
            console.log(`PASS: ${mode}, selection resumes and all dice stay owned`);
        }
        await page.goto(base);
        await page.getByText('0.42.0', { exact: false }).first().waitFor();
        console.log('PASS: existing server title version 0.42.0');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

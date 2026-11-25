const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const url = new URL('dev_board_lock_review.html', base).href;
(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        for (const reducedMotion of ['reduce', 'no-preference']) for (const width of [1200, 390]) for (const effect of [true, false]) {
            const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
            const errors = []; page.on('pageerror', e => errors.push(e.message));
            await page.goto(url);
            const prepare = page.locator('#prepare');
            await page.waitForFunction(() => !document.querySelector('#prepare').disabled, null, { timeout: 60000 });
            await page.locator('#effect').setChecked(effect);
            await prepare.click();
            const idle = () => page.waitForFunction(() => !boardLock.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'), null, { timeout: 60000 });
            await idle();
            async function selectDie(id) {
                const point = await page.evaluate(id => {
                    const n = document.querySelector('.PaletteViewport .DiceResult[data-die-id="' + id + '"]');
                    const r = n.getBoundingClientRect();
                    for (const y of [.5,.25,.75]) for (const x of [.5,.25,.75]) {
                        const p = { x: r.x+r.width*x, y: r.y+r.height*y };
                        if (document.elementFromPoint(p.x,p.y)?.closest('.DiceResult') === n) return p;
                    }
                }, id);
                assert.ok(point, 'die has a reachable pointer target');
                await page.mouse.click(point.x, point.y);
            }
            await selectDie(await page.evaluate(() => boardLock.target.die));
            await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).click();
            await idle();
            if (effect) await page.waitForFunction(() => boardLock.mounted.session.game.state.pending?.effectType === 'reroll');
            if (width === 390) await page.locator('#panel-toggle').click();
            await page.waitForFunction(() => boardLock.screen.panelState.mode === 'A' || boardLock.screen.panelState.progress === 1);
            const id = await page.evaluate(() => boardLock.target.id);
            await page.locator('[data-scene-card="' + id + '"] .PaintingName').click();
            const detail = page.locator('.GameCardDetail');
            assert.equal(await page.locator('.LayoutContent').evaluate(n => n.inert), true);
            await detail.getByRole('tab', { name: 'Step 0', exact: true }).click();
            await detail.getByRole('button', { name: '閉じる', exact: true }).click();
            assert.equal(await detail.count(), 0, 'no reopened inspector');
            assert.equal(await page.locator('.LayoutContent').evaluate(n => n.inert), false);
            // Reopening keeps the selected step; closing an unchanged step also releases input.
            await page.locator('[data-scene-card="' + id + '"] .PaintingName').click();
            assert.equal(await detail.locator('[aria-selected="true"]').textContent(), 'Step 0');
            await detail.getByRole('button', { name: '閉じる', exact: true }).click();
            if (width === 390) {
                await page.locator('#panel-toggle').click();
                await page.waitForFunction(() => boardLock.screen.panelState.progress === 0);
                await page.locator('#panel-toggle').click();
                await page.waitForFunction(() => boardLock.screen.panelState.progress === 1);
                await page.locator('#panel-toggle').click();
                await page.waitForFunction(() => boardLock.screen.panelState.progress === 0);
            }
            if (effect) {
                const confirm = page.getByRole('button', { name: '選択して画材を更新する', exact: true });
                await page.waitForFunction(() => !document.querySelector('.EffectNotice'));
                const before = await page.evaluate(() => boardLock.mounted.session.game.state.rerolls);
                const die = await page.evaluate(() => boardLock.mounted.session.game.state.pending.options[0].id);
                await selectDie(die);
                assert.equal(await confirm.isEnabled(), true);
                // Attention pulsing keeps the button in motion; use a real pointer without Playwright's stability wait.
                const box = await confirm.boundingBox();
                await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
                await page.waitForFunction(() => !boardLock.mounted.session.game.state.pending && !boardLock.mounted.session.game.state.rollRequest, null, { timeout: 60000 });
                assert.equal(await page.evaluate(() => boardLock.mounted.session.game.state.rerolls), before+2, 'effect after reroll resumes');
            }
            await page.waitForFunction(() => !document.querySelector('.EffectNotice'));
            await page.locator('.HandFixedActions button:enabled').first().click();
            await idle();
            assert.equal(await page.evaluate(() => boardLock.mounted.session.game.state.field.length), 1, 'next game action succeeds');
            assert.deepEqual(errors, []);
            console.log('PASS board lock:', reducedMotion, width, 'reroll='+effect);
            await page.close();
        }
    } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });

const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => { Math.random = () => .4; });
        await page.goto(base);
        await page.locator('[data-game-area="hand"] .PaintingCard').first().waitFor();
        assert.equal(await page.locator('[data-game-area]').count(), 7);
        assert.equal(await page.locator('[data-game-area="hand"] .PaintingCard').count(), 4);
        const info = page.locator('[data-game-area="info"]');
        const snapshot = await info.innerText();
        await page.getByRole('button', { name: '進行記録を確認', exact: true }).click();
        await page.locator('.GameInspection[open]').getByRole('button', { name: '閉じる', exact: true }).click();
        assert.equal(await info.innerText(), snapshot);
        await page.locator('[data-game-area="palette"] input').first().check();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('.LayoutScreen[data-layout="B"]').waitFor();
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        assert.equal(await page.locator('[data-game-area="palette"] input:checked').count(), 1);
        assert.equal(await info.innerText(), snapshot);
        assert.equal(await page.locator('[data-game-area="stock"]:visible').count(), 1);
        await page.screenshot({ path: 'tmp_game_portrait_open.png' });
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        await page.getByRole('button', { name: '場にプレイ', exact: true }).first().click();
        await page.waitForTimeout(50);
        assert.equal(await page.locator('[data-game-area="hand"] .PaintingCard').count(), 3);
        assert.equal(await page.locator('[data-game-area="play"] .PaintingCard').count(), 1);
        if (await page.locator('.GameChoice[open]').count()) {
            const choice = page.locator('.GameChoice[open]');
            await choice.locator('input').first().check();
            await page.setViewportSize({ width: 1200, height: 800 });
            assert.equal(await choice.locator('input:checked').count(), 1);
            await choice.getByRole('button', { name: '選択を確定' }).click();
        }
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.screenshot({ path: 'tmp_game_wide.png' });
        for (let i = 0; i < 30 && !await page.getByRole('button', { name: 'もう一度遊ぶ' }).count(); i++) {
            const choice = page.locator('.GameChoice[open]');
            if (await choice.count()) {
                await choice.locator('input').first().check();
                await choice.getByRole('button', { name: '選択を確定' }).click();
            } else if (await page.getByRole('button', { name: '一日の仕事を終える', exact: true }).count()) {
                await page.getByRole('button', { name: '一日の仕事を終える', exact: true }).click();
            } else await page.getByRole('button', { name: '翌日の仕事を始める', exact: true }).click();
            await page.waitForTimeout(30);
        }
        await page.getByRole('button', { name: 'もう一度遊ぶ' }).click();
        assert.match(await info.innerText(), /1日目/);
        assert.equal(await page.locator('[data-game-area="hand"] .PaintingCard').count(), 4);
        assert.equal(await page.locator('.GameChoice[open]').count(), 0);
        assert.equal(await page.locator('.GameBoard').count(), 1);
        for (const [body, status, expected] of [['failure', 500, '読み込めません'], ['{}', 200, '設定'], [JSON.stringify({ ...settings, cards: settings.cards.map((card, i) => i ? card : { ...card, name: '' }) }), 200, '設定']]) {
            await page.route('**/data/cards.json', route => route.fulfill({ status, body }));
            await page.reload();
            await page.locator('.GameStartup button').waitFor();
            assert.match(await page.locator('.GameStartup').innerText(), new RegExp(expected));
            assert.equal(await page.locator('[data-game-area]').count(), 0);
            await page.unroute('**/data/cards.json');
        }
        await page.getByRole('button', { name: '再読み込み' }).click();
        await page.locator('[data-game-area="hand"] .PaintingCard').first().waitFor();
        const fixture = structuredClone(settings);
        for (const card of fixture.cards) for (const step of card.steps) {
            step.goals = [{ color: 'yellow', material: null }];
            step.playEffects = [{ type: 'changeCardStep', step: 2 }];
            step.achievementEffects = [{ type: 'gainNormalDice', count: 2, lifetime: 'temporary' },
                { type: 'changeColor', color: 'yellow' }, { type: 'gainStockCards', count: 1 }];
        }
        await page.route('**/data/cards.json', route => route.fulfill({ status: 200, body: JSON.stringify(fixture) }));
        await page.reload();
        await page.locator('[data-game-area="hand"] .PaintingCard').first().waitFor();
        const changedCard = await page.locator('[data-game-area="hand"] .PaintingCard').nth(1).getAttribute('data-card-id');
        async function chooseAll() {
            let count = 0;
            while (await page.locator('.GameChoice[open]').count()) {
                assert.ok(count++ < 10);
                const choice = page.locator('.GameChoice[open]');
                assert.equal(await page.getByRole('button', { name: '一日の仕事を終える', exact: true }).isDisabled(), true);
                await choice.locator('input').first().check();
                await page.setViewportSize({ width: 390, height: 844 });
                assert.equal(await choice.locator('input:checked').count(), 1);
                await page.setViewportSize({ width: 1200, height: 800 });
                await choice.getByRole('button', { name: '選択を確定' }).click();
                await page.waitForTimeout(30);
            }
            return count;
        }
        await page.getByRole('button', { name: '場にプレイ', exact: true }).first().click();
        await page.waitForTimeout(30);
        assert.equal(await chooseAll(), 1);
        await page.locator('[data-game-area="palette"] input').first().check();
        await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).click();
        await page.waitForTimeout(30);
        assert.equal(await chooseAll(), 4);
        assert.equal(await page.locator('[data-game-area="discard"] .PaintingCard').count(), 2);
        assert.equal(await page.locator('[data-game-area="palette"] .GameDie').count(), 5);
        await page.locator(`[data-game-area="hand"] .GameCardSlot:has([data-card-id="${changedCard}"])`).getByRole('button', { name: '場にプレイ' }).click();
        await page.waitForTimeout(30);
        await chooseAll();
        await page.locator('[data-game-area="palette"] input').first().check();
        await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).click();
        await page.waitForTimeout(30);
        await chooseAll();
        assert.match(await info.innerText(), /出荷 1枚/);
        await page.getByRole('button', { name: '出荷済み作品を確認', exact: true }).click();
        assert.equal(await page.locator('.GameInspection[open] .PaintingCard').count(), 1);
        await page.locator('.GameInspection[open]').getByRole('button', { name: '閉じる', exact: true }).click();
        await page.locator('[data-game-area="discard"] .PaintingCard').first().click({ position: { x: 40, y: 40 } });
        await page.locator('.GameCardDetail[open]').waitFor();
        await page.locator('.GameCardDetail[open]').getByRole('button', { name: '閉じる', exact: true }).click();
        assert.deepEqual(errors, []);
        console.log('Game connection: A/B, inspection, selection retention, play, daily flow, ending, replay, errors and retry passed');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        const errors = [], writes = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('request', request => { if (request.method() !== 'GET') writes.push(request.method() + ' ' + request.url()); });
        await page.goto(new URL('dev.html#settings', base).href);
        const ids = page.locator('.OverviewTable tbody tr td:first-child a');
        await ids.first().waitFor(); assert.equal(await ids.count(), 45);
        assert.equal(await page.locator('.OverviewTable tbody tr td:first-child button').count(), 0);
        for (const width of [1920, 1000]) {
            await page.setViewportSize({ width, height: 1032 });
            assert.equal(await ids.evaluateAll(nodes => nodes.filter(node => {
                const rect = node.getBoundingClientRect(), cell = node.parentElement.getBoundingClientRect();
                return rect.left < cell.left || rect.right > cell.right || rect.top < cell.top || rect.bottom > cell.bottom;
            }).length), 0);
        }
        await ids.filter({ hasText: /^A01$/ }).click();
        await page.getByRole('heading', { name: 'A01', exact: true }).waitFor();
        const group = page.getByRole('group', { name: 'ステップ0 プレイ時効果', exact: true });
        await group.getByRole('button', { name: '効果を追加', exact: true }).click();
        const dialog = page.locator('dialog[open]');
        const type = dialog.getByLabel('効果の種類');
        await type.selectOption({ label: 'ダイスの使用済み化' });
        const count = dialog.getByLabel('個数・回数');
        assert.equal(await count.inputValue(), '1');
        await count.fill('2');
        await dialog.getByRole('button', { name: '確定', exact: true }).click();
        const icon = group.locator('.CardIcon'); await icon.last().click();
        assert.equal(await dialog.getByLabel('効果の種類').inputValue(), 'ダイスの使用済み化');
        assert.equal(await dialog.getByLabel('個数・回数').inputValue(), '2');
        await dialog.getByLabel('個数・回数').fill('3');
        await dialog.getByRole('button', { name: '確定', exact: true }).click();
        await icon.last().click();
        assert.equal(await dialog.getByLabel('個数・回数').inputValue(), '3');
        await dialog.getByRole('button', { name: 'キャンセル', exact: true }).click();
        await page.getByRole('button', { name: '効果の評価設定', exact: true }).click();
        await page.getByLabel('ダイスの使用済み化 プレイ時効果の評価点', { exact: true }).waitFor();
        await page.getByLabel('ダイスの使用済み化 達成時効果の評価点', { exact: true }).waitFor();
        assert.deepEqual(errors, []); assert.deepEqual(writes, []);
        console.log('PASS: overview IDs fit; useDie can be added and edited with count 1/2/3; evaluation entry present; no saves or page errors');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

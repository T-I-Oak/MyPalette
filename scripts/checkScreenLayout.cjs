const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 2 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
        await page.goto(base);
        await page.locator('.LayoutScreen[data-layout="A"]').waitFor();
        await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
        assert.equal(await page.locator('.LayoutArea:visible').count(), 7);
        assert.equal(await page.locator('#app-version').textContent(), require('../package.json').version);
        const inspect = () => page.locator('.LayoutArea').evaluateAll(nodes => nodes.map(node => {
            const { x, y, width, height } = node.getBoundingClientRect();
            return { id: node.dataset.area, x, y, width, height, bufferWidth: node.width, bufferHeight: node.height, hidden: node.hidden };
        }));
        for (const area of await inspect()) {
            assert.equal(area.bufferWidth, Math.round(area.width * 2));
            assert.equal(area.bufferHeight, Math.round(area.height * 2));
        }
        await page.screenshot({ path: 'tmp_layout_wide.png' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('.LayoutScreen[data-layout="B"]').waitFor();
        assert.equal(await page.locator('.LayoutArea:visible').count(), 4);
        const toggle = await page.locator('#panel-toggle').boundingBox();
        assert.deepEqual({ width: toggle.width, height: toggle.height, x: toggle.x, y: toggle.y }, { width: 32, height: 64, x: 358, y: 105.5 });
        const main = list => list.filter(area => ['info', 'play', 'palette', 'hand'].includes(area.id));
        const before = main(await inspect());
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(120);
        const middle = (await inspect()).find(area => area.id === 'stock');
        assert.ok(middle.x > 390 * 0.15 && middle.x < 390);
        await page.waitForTimeout(220);
        assert.deepEqual(main(await inspect()), before);
        assert.equal(await page.locator('.LayoutArea:visible').count(), 7);
        const openToggle = await page.locator('#panel-toggle').boundingBox();
        const stock = (await inspect()).find(area => area.id === 'stock');
        const stockFrame=await page.locator('.LayoutAreaFixed[data-area="stock"]').boundingBox();
        assert.ok(Math.abs(openToggle.x + openToggle.width - stockFrame.x) < 0.1);
        assert.equal(openToggle.y, stockFrame.y);
        assert.equal(stockFrame.y, before.find(area => area.id === 'play').y);
        assert.equal(stock.y-stockFrame.y,36);
        await page.screenshot({ path: 'tmp_layout_portrait_open.png' });
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        assert.equal(await page.locator('.LayoutArea:visible').count(), 4);
        await page.screenshot({ path: 'tmp_layout_portrait_closed.png' });
        for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 600, height: 600 }]) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(80);
            assert.equal(await page.locator('.LayoutScreen').getAttribute('data-layout'), viewport.width >= viewport.height ? 'A' : 'B');
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight));
        }
        const session = await page.context().newCDPSession(page);
        await session.send('Emulation.setDeviceMetricsOverride', { width: 600, height: 600, deviceScaleFactor: 1, mobile: false });
        await page.waitForFunction(() => document.querySelector('canvas[data-area="play"]').width === 300);
        await page.goto(base + 'dev.html');
        await page.getByRole('button', { name: 'カード設定を開く', exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: 'ゲームを始める', exact: true }).count(),0);
        for (const [hash, selector] of [['settings', '.Overview'], ['icons', '.IconLab']]) {
            await page.goto(base + 'dev.html#' + hash);
            await page.reload();
            await page.locator(selector).waitFor();
        }
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ viewports: 5, deviceScaleFactors: [2, 1], panelAnimation: 'passed', developerScreens: 2, errors }));
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

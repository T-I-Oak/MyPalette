const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, deviceScaleFactor: 2 });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
        const backgrounds = ['atelier', 'cork-board'].map(name =>
            page.waitForResponse(response => new URL(response.url()).pathname.includes(`/${name}-background`)));
        await page.goto(base);
        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).click();
        await page.locator('.LayoutScreen[data-layout="A"]').waitFor();
        for (const response of await Promise.all(backgrounds)) {
            assert.equal(response.status(), 200, response.url());
            assert.ok(new URL(response.url()).pathname.startsWith(new URL(base).pathname), response.url());
            assert.match(response.headers()['content-type'], /^image\/webp\b/);
        }
        await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
        assert.equal(await page.locator('.LayoutArea:visible').count(), 7);
        const journal = page.locator('.InfoDay.texture-journal-page');
        assert.equal(await journal.locator('.InfoRow').first().textContent(), 'Day 1');
        assert.equal(await journal.getByRole('img', { name: '名声 0' }).count(), 1);
        assert.ok(await journal.evaluate(node => {
            const day = node.querySelector('.InfoDayWord');
            const fame = node.querySelector('.InfoIcon');
            return parseFloat(getComputedStyle(day).fontSize) < parseFloat(getComputedStyle(node).fontSize)
                && parseFloat(getComputedStyle(fame).height) === 34;
        }));
        assert.ok(await journal.evaluate(node => {
            const label = node.querySelector('.InfoRow > span');
            const number = label.lastChild;
            const current = number.textContent;
            number.textContent = ' 88';
            const fits = label.getBoundingClientRect().width <= label.parentElement.getBoundingClientRect().width;
            number.textContent = current;
            return fits;
        }), 'Day 88 fits inside the journal');
        const checkHandArea = async () => {
            const hand = page.locator('.LayoutAreaFixed[data-area="hand"]');
            assert.equal(await hand.locator('.LayoutAreaName').isVisible(), false);
            const fixedBounds = await hand.boundingBox();
            const canvasBounds = await page.locator('canvas.LayoutArea[data-area="hand"]').boundingBox();
            assert.ok(Math.abs(canvasBounds.y - fixedBounds.y) < 0.05);
        };
        await checkHandArea();
        const checkDayAction = async () => {
            const action = await page.locator('[data-game-end-day]').boundingBox();
            const play = await page.locator('.LayoutAreaFixed[data-area="play"]').boundingBox();
            assert.ok(Math.abs(action.x + action.width / 2 - play.x - play.width / 2) < 0.05);
            assert.ok(Math.abs(action.y - play.y) < 0.05);
        };
        await checkDayAction();
        const board = page.locator('.LayoutCorkBoard');
        const checkBoard = async () => {
            const bounds = await board.boundingBox();
            const stock = await page.locator('.LayoutAreaFixed[data-area="stock"]').boundingBox();
            const deck = await page.locator('.LayoutAreaFixed[data-area="deck"]').boundingBox();
            assert.ok(Math.abs(bounds.x - stock.x) < 0.05);
            assert.ok(Math.abs(bounds.y - stock.y) < 0.05);
            assert.ok(Math.abs(bounds.width - stock.width) < 0.05);
            assert.ok(Math.abs(bounds.y + bounds.height - deck.y - deck.height) < 0.05);
            assert.equal(await page.locator('.LayoutPanelFixedLayer .LayoutAreaName.texture-sticky-note:visible').count(), 3);
            assert.equal(await page.locator('.StockArea [data-stock-grade] h3.texture-sticky-note:visible').count(), 3);
        };
        await checkBoard();
        assert.equal(await page.locator('#app-version').count(), 0);
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
        await checkDayAction();
        await checkHandArea();
        assert.equal(await page.locator('.LayoutArea:visible').count(), 4);
        assert.equal(await board.isVisible(), false);
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
        await checkBoard();
        const openToggle = await page.locator('#panel-toggle').boundingBox();
        const stock = (await inspect()).find(area => area.id === 'stock');
        const stockFrame=await page.locator('.LayoutAreaFixed[data-area="stock"]').boundingBox();
        assert.ok(Math.abs(openToggle.x + openToggle.width - stockFrame.x) < 0.1);
        assert.equal(openToggle.y, stockFrame.y);
        assert.equal(stockFrame.y, before.find(area => area.id === 'play').y);
        assert.ok(Math.abs(stock.y - stockFrame.y - 36 * 390 / 540) < 0.02);
        await page.screenshot({ path: 'tmp_layout_portrait_open.png' });
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        assert.equal(await page.locator('.LayoutArea:visible').count(), 4);
        assert.equal(await board.isVisible(), false);
        await page.screenshot({ path: 'tmp_layout_portrait_closed.png' });
        for (const viewport of [{ width: 900, height: 360 }, { width: 1200, height: 180 }, { width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 600, height: 600 }]) {
            await page.setViewportSize(viewport);
            const expectedScale = Math.min(1, viewport.height / 540);
            const expectedMode = viewport.width >= viewport.height ? 'A' : 'B';
            await page.waitForFunction(({ scale, mode }) => {
                const hand = document.querySelector('.LayoutAreaFixed[data-area="hand"]');
                return Math.abs(new DOMMatrix(getComputedStyle(hand).transform).a - scale) < 0.00001
                    && document.querySelector('.LayoutScreen').dataset.layout === mode;
            }, { scale: expectedScale, mode: expectedMode });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight));
            if (viewport.height === 360) {
                await checkDayAction();
                await page.screenshot({ path: 'tmp_layout_short.png' });
            }
        }
        const session = await page.context().newCDPSession(page);
        await session.send('Emulation.setDeviceMetricsOverride', { width: 600, height: 600, deviceScaleFactor: 1, mobile: false });
        await page.waitForFunction(() => document.querySelector('canvas[data-area="play"]').width === 300);
        await page.goto(base + 'dev.html');
        await page.getByRole('button', { name: 'カード設定を開く', exact: true }).waitFor();
        assert.equal(await page.locator('#app-version').textContent(), require('../package.json').version);
        assert.equal(await page.getByRole('button', { name: 'ゲーム開始', exact: true }).count(),0);
        for (const [hash, selector] of [['settings', '.Overview'], ['icons', '.IconLab']]) {
            await page.goto(base + 'dev.html#' + hash);
            await page.reload();
            await page.locator(selector).waitFor();
        }
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ viewports: 7, deviceScaleFactors: [2, 1], panelAnimation: 'passed', developerScreens: 2, errors }));
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

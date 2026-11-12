const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(process.argv[2] || 'http://127.0.0.1:3001/MyPalette/');
        await page.waitForFunction(() => !!document.querySelector('.PaletteViewport > canvas'));
        await page.evaluate(async () => {
            const { layoutScreen } = await import('/MyPalette/src/main.js');
            const { MoveObject, createMoveManager } = await import('/MyPalette/src/ui/areaTransition/index.js');
            const pieces = new Map();
            const local = { x: 20, y: 20, width: 120, height: 60 };
            for (const id of ['stock', 'discard', 'deck', 'play']) {
                const element = document.createElement('button');
                element.textContent = id;
                element.dataset.piece = id;
                Object.assign(element.style, { width: '100%', height: '100%', background: '#ffb144' });
                element.addEventListener('click', () => element.dataset.clicked = 'yes');
                const object = new MoveObject(id, element);
                const area = layoutScreen.areas.get(id);
                area.setSlot('test', local);
                area.place(object, 'test');
                pieces.set(id, object);
            }
            window.layerTest = { ...layoutScreen, pieces, local, manager: createMoveManager(layoutScreen.surface) };
        });
        async function verify(id) {
            const result = await page.evaluate(id => {
                const { areas, pieces, local } = window.layerTest;
                const element = pieces.get(id).element;
                const actual = element.getBoundingClientRect();
                const expected = areas.get(id).readScreenRect(local);
                const top = document.elementFromPoint(actual.x + actual.width / 2, actual.y + actual.height / 2);
                return { top: top === element, error: Math.max(...['x', 'y', 'width', 'height'].map(key => Math.abs(actual[key] - expected[key]))) };
            }, id);
            assert.ok(result.top, id + ' must be in front of its Canvas');
            assert.ok(result.error < 0.1, id + ' coordinates');
            await page.locator(`[data-piece="${id}"]`).click();
            assert.equal(await page.locator(`[data-piece="${id}"]`).getAttribute('data-clicked'), 'yes');
        }
        for (const id of ['stock', 'discard', 'deck']) await verify(id);
        assert.ok(await page.evaluate(() => {
            const { areas, pieces } = window.layerTest;
            const action = document.querySelector('[data-game-end-day]');
            const bounds = action.getBoundingClientRect();
            const x = bounds.x + bounds.width / 2;
            const y = bounds.y + bounds.height / 2;
            const play = areas.get('play');
            const transform = play.readTransform();
            play.setSlot('test', { x: (x - transform.x) / transform.scale - 10,
                y: (y - transform.y) / transform.scale - 10, width: 20, height: 20 });
            return document.elementsFromPoint(x, y).includes(pieces.get('play').element)
                && action.contains(document.elementFromPoint(x, y));
        }), 'the day action remains above overlapping play content');
        await page.setViewportSize({ width: 390, height: 844 });
        await page.locator('.LayoutScreen[data-layout="B"]').waitFor();
        for (const id of ['stock', 'discard', 'deck']) assert.equal(await page.locator(`[data-piece="${id}"]`).count(), 0);
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        for (const id of ['stock', 'discard', 'deck']) await verify(id);
        assert.ok(await page.evaluate(() => {
            const action = document.querySelector('[data-game-end-day]').getBoundingClientRect();
            const top = document.elementFromPoint(action.x + action.width / 2, action.y + action.height / 2);
            return !top?.closest('[data-game-end-day]');
        }), 'the open cork board blocks the day action underneath it');
        // Put a main-area component underneath the panel and ensure the panel blocks it.
        assert.ok(await page.evaluate(() => {
            const { areas, pieces } = window.layerTest;
            const stock = areas.get('stock').readTransform();
            const play = areas.get('play');
            const transform = play.readTransform();
            play.setSlot('test', { x: (stock.x + 1 - transform.x) / transform.scale,
                y: (stock.y + 1 - transform.y) / transform.scale, width: 20, height: 20 });
            const top = document.elementFromPoint(stock.x + 3, stock.y + 3);
            const panel = top?.dataset.area === 'stock' || top?.closest('[data-game-area="stock"]');
            return Boolean(panel) && !pieces.get('play').element.contains(top);
        }));
        await page.evaluate(() => {
            const { manager, areas, pieces } = window.layerTest;
            areas.get('hand').setSlot('arrival', { x: 20, y: 20, width: 120, height: 60 });
            window.layerMove = manager.move({ object: pieces.get('stock'), from: areas.get('stock'),
                to: areas.get('hand'), slot: 'arrival', durationMs: 1000 });
        });
        await page.waitForTimeout(100);
        await page.screenshot({ path: 'tmp_layout_moving_layer.png' });
        assert.ok(await page.evaluate(() => {
            const element = window.layerTest.pieces.get('stock').element;
            const rect = element.getBoundingClientRect();
            const hits = document.elementsFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
            const layer = element.closest('.LayoutMovingLayer');
            return layer !== null && element.parentElement.inert && getComputedStyle(layer).zIndex === '4'
                && hits.some(hit => hit.dataset.area === 'stock');
        }));
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(80);
        await page.setViewportSize({ width: 768, height: 1024 });
        assert.deepEqual(await page.evaluate(() => window.layerMove), { status: 'arrived' });
        assert.equal(await page.evaluate(() => window.layerTest.pieces.get('stock').area.id), 'hand');
        await page.locator('#panel-toggle').click();
        await page.waitForTimeout(350);
        for (const id of ['discard', 'deck']) await verify(id);
        await page.screenshot({ path: 'tmp_layout_layers.png' });
        assert.deepEqual(errors, []);
        console.log('LAYOUT-R01: visible/clickable components, panel occlusion, moving layer, closing and resize passed');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

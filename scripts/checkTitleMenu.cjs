const assert = require('node:assert/strict');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');

const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const fixture = new URL('?title-menu-check', base).href;
const sizes = [[290, 772], [320, 480], [390, 844], [390, 1000], [568, 320], [1200, 900]];

async function checkLayout(page, count, [width, height]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const state = await page.evaluate(() => {
        const room = document.querySelector('.TitleRoom');
        const position = room.dataset.plaquePosition;
        const menu = document.querySelector('.TitleMenu ul');
        const items = [...menu.querySelectorAll('button')].map(button => {
            const frame = button.querySelector('.TitleFrame').getBoundingClientRect();
            const image = button.querySelector('img').getBoundingClientRect();
            const plaque = button.querySelector('.TitlePlaque').getBoundingClientRect();
            const rect = button.getBoundingClientRect();
            return {
                width: image.width, height: image.height,
                placed: position === 'right' ? plaque.left >= frame.right : plaque.top >= frame.bottom,
                visible: rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.top >= 0
                    && rect.right <= innerWidth && rect.bottom <= innerHeight,
                matchesArtwork: Math.abs(rect.left - Math.min(frame.left, plaque.left)) < .1
                    && Math.abs(rect.right - Math.max(frame.right, plaque.right)) < .1,
            };
        });
        return {
            position, items, columns: getComputedStyle(menu).gridTemplateColumns.split(' ').length,
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
        };
    });
    assert.equal(state.items.length, count);
    assert.equal(state.columns, width <= height ? 1 : count);
    assert.deepEqual([state.width, state.height], [width, height]);
    for (const item of state.items) {
        assert.ok(item.placed && item.visible && item.matchesArtwork && item.width > 0,
            `${count} items at ${width}×${height}: ${JSON.stringify(state)}`);
        assert.ok(Math.abs(item.width - item.height * 1.5) < .05);
    }
    return state;
}

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge' });
    try {
        const page = await browser.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(fixture, route => route.fulfill({
            contentType: 'text/html; charset=utf-8',
            body: `<!doctype html><html lang="ja" style="height:100%"><meta name="viewport" content="width=device-width">
                <body style="margin:0;height:100%"><script type="module">
                import { createTitleScreen } from './src/ui/createTitleScreen.js';
                import { titleMenuEntries } from './src/ui/title/menuEntries.js';
                import './src/ui/theme.css';
                import './src/ui/layout.css';
                import './src/ui/textures.css';
                import './src/ui/states.css';
                const select = label => () => { document.body.dataset.selection = label; };
                const title = createTitleScreen('0.26.0', { onSettings: select('設定') });
                document.body.append(title.screen);
                window.showItems = count => title.setMenuItems(titleMenuEntries.slice(0, count).map(entry => ({
                    ...entry, onSelect: select(entry.label),
                })));
                </script></body></html>`,
        }));
        await page.goto(fixture);
        await page.waitForFunction(() => typeof window.showItems === 'function');
        for (const count of [1, 2, 3, 1]) {
            await page.evaluate(count => window.showItems(count), count);
            const initial = await checkLayout(page, count, sizes[0]);
            for (const size of sizes.slice(1)) await checkLayout(page, count, size);
            assert.deepEqual(await checkLayout(page, count, sizes[0]), initial);
        }
        await page.evaluate(() => window.showItems(3));
        for (const label of ['ゲーム開始', '記録', 'ギャラリー', '設定']) {
            await page.getByRole('button', { name: label, exact: true }).click();
            assert.equal(await page.locator('body').getAttribute('data-selection'), label);
        }
        assert.deepEqual(errors, []);
        console.log('PASS: 1–3 title menu items, live resize in both directions, 3:2 art, no scrolling, menu actions');
    } finally {
        await browser.close();
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

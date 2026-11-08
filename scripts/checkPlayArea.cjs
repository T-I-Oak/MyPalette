const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2, hasTouch: true });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        const fixture = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
        for (const card of fixture.cards) for (const step of card.steps) {
            step.playEffects = []; step.achievementEffects = [];
            step.goals = [{ color: 'yellow', material: null }];
        }
        await page.route('**/data/cards.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixture) }));
        await page.addInitScript(() => { Math.random = () => .4; });
        await page.goto(process.argv[2] || 'http://127.0.0.1:3002/MyPalette/');
        await page.locator('.HandFixedActions button').first().waitFor();
        const played = [];
        const cardWidths = [];
        for (let i = 0; i < 3; i++) {
            const action = page.locator('.HandFixedActions [data-card-id]').first();
            played.push(await action.getAttribute('data-card-id'));
            await action.locator('button').click();
            await page.waitForFunction(() => !document.querySelector('.PlayArea').dataset.playEffect);
            cardWidths.push(await page.locator('.PlayArea .PaintingCard').first().evaluate(node => node.getBoundingClientRect().width));
        }
        assert.deepEqual(await page.locator('.PlayPainting').evaluateAll(nodes => nodes.map(node => node.dataset.paintingId)), played);
        assert.equal(await page.locator('.PlayArea .PlayPaintingSurface').count(), 1);
        assert.equal(await page.locator('.PlayArea .PaintingArtwork:visible').count(), 3);
        assert.equal(await page.locator('.PlayArea .PaintingCardCompact').count(), 0);
        const row = page.locator('.PlayPaintings');
        assert.ok(await row.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
        assert.ok(cardWidths.at(-1) < cardWidths[0]);
        assert.equal(await page.locator('.LayoutAreaFixed[data-area=play] .LayoutAreaName:visible').count(), 0);
        assert.equal(await page.locator('.PlayFixedActions .GameCardActions').count(), 3);
        assert.equal(await page.locator('.PlayArea .GameCardActions').count(), 0);
        const buttonBottom = await page.locator('.PlayFixedActions button').first().evaluate(node => node.getBoundingClientRect().bottom);
        const areaBottom = await page.locator('.LayoutAreaFixed[data-area=play]').evaluate(node => node.getBoundingClientRect().bottom);
        assert.ok(Math.abs(buttonBottom - areaBottom) < 1);
        assert.equal(await page.locator('.PlayArea').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)');
        assert.equal(await page.locator('.LayoutArea[data-area=play]').evaluate(node => getComputedStyle(node).getPropertyValue('--area-fill').trim()), 'transparent');
        assert.equal(await page.locator('.LayoutArea[data-area=play]').evaluate(node => node.getContext('2d').getImageData(0, 0, 1, 1).data[3]), 0);
        assert.equal(await page.locator('.PlayPaintingSurface').evaluate(node => node.getContext('webgl2').getContextAttributes().alpha), true);
        const centered = await page.locator('.PlayArea').evaluate(host => {
            const rect = host.getBoundingClientRect(), nodes = [...host.querySelectorAll('.PlayPainting')];
            const first = nodes[0].getBoundingClientRect(), last = nodes.at(-1).getBoundingClientRect();
            return Math.abs((first.left + last.right) / 2 - (rect.left + rect.right) / 2) < .1;
        });
        assert.equal(centered, true);
        await page.locator('.PlayCard .PaintingTitle').first().click();
        await page.locator('.GameCardDetail[open]').waitFor();
        assert.equal(await page.locator('.GameCardDetail .PaintingArtwork').isVisible(), true);
        await page.locator('.GameCardDetail').getByRole('button', { name: '閉じる', exact: true }).click();
        await page.waitForFunction(() => !document.querySelector('.GameCardDetail'));
        await page.screenshot({ path: 'tmp_play_area_wide.png' });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(150);
        assert.deepEqual(await page.locator('.PlayPainting').evaluateAll(nodes => nodes.map(node => node.dataset.paintingId)), played);
        await page.locator('.PlayCard .PaintingTitle').first().tap();
        await page.locator('.GameCardDetail[open]').waitFor();
        await page.locator('.GameCardDetail').getByRole('button', { name: '閉じる', exact: true }).tap();
        await page.waitForFunction(() => !document.querySelector('.GameCardDetail'));
        await page.screenshot({ path: 'tmp_play_area_portrait.png' });
        const checker = await page.addStyleTag({ content: 'body.texture-layout { background: repeating-conic-gradient(#d8d8d8 0 25%, white 0 50%) 0 / 24px 24px; }' });
        await page.screenshot({ path: 'tmp_play_area_transparency.png' });
        await checker.evaluate(node => node.remove());
        await page.locator('#panel-toggle').click(); await page.waitForTimeout(350);
        assert.equal(await page.locator('.PlayPainting').count(), 3);
        assert.deepEqual(errors, []);
        assert.ok(await row.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
        console.log('Play area: play order, paired scaling by count, fixed buttons, transparent background, no name/scroll, detail and responsive layout passed.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

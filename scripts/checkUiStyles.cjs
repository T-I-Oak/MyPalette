const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base);
        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[data-game-end-day]')?.disabled === false);
        const results = [];
        for (const viewport of [{ width: 1200, height: 700 }, { width: 700, height: 1200 }]) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(200);
            results.push(await page.evaluate(() => {
                const tabs = [...document.querySelectorAll('[data-scene-area="hand"] .PaintingTab')];
                return { viewport: [innerWidth, innerHeight], layout: document.querySelector('.LayoutScreen').dataset.layout,
                    tabs: tabs.length, fits: tabs.every(tab => {
                        const range = document.createRange(); range.selectNodeContents(tab);
                        const text = range.getBoundingClientRect(), bounds = tab.getBoundingClientRect();
                        return range.getClientRects().length === 1 && text.width <= bounds.width && text.height <= bounds.height;
                    }) };
            }));
            assert.ok(results.at(-1).tabs > 0 && results.at(-1).fits);
        }
        assert.deepEqual(results.map(result => result.layout), ['A', 'B']);
        // Exercise the production Card component at every progress and selected tab.
        const cardResults = await page.evaluate(async () => {
            const { Card } = await import('./src/game/card.js');
            const settings = await fetch('./data/cards.json').then(response => response.json());
            const host = document.createElement('div'); document.body.append(host);
            let checked = 0; const failures = [];
            for (const scale of [.5, 1, 1.5]) {
                host.style.transform = `scale(${scale})`; host.style.transformOrigin = 'top left';
                for (const definition of settings.cards) for (let step = 0; step <= 3; step++) {
                    const card = new Card(definition.id); host.append(card.element);
                    card.setFace(definition, step, step, () => {});
                    const tabs = [...card.element.querySelectorAll('.PaintingTab')];
                    for (const tab of tabs) {
                        tab.click();
                        const range = document.createRange(); range.selectNodeContents(tab);
                        const bounds = tab.getBoundingClientRect(), text = range.getBoundingClientRect();
                        if (range.getClientRects().length !== 1 || text.width > bounds.width || text.height > bounds.height
                            || tab.getAttribute('aria-selected') !== 'true') failures.push({ id: definition.id, step, scale, label: tab.textContent });
                        checked++;
                    }
                    card.element.remove();
                }
            }
            host.remove(); return { checked, failures };
        });
        assert.deepEqual(cardResults.failures, []);
        const button = page.locator('[data-game-end-day]');
        await button.evaluate(node => { node.disabled = true; node.classList.add('state-attention'); });
        const read = () => button.evaluate(node => {
            const style = getComputedStyle(node);
            return { background: style.backgroundColor, color: style.color, border: style.borderTopColor,
                shadow: style.boxShadow, animation: style.animationName, disabled: node.disabled };
        });
        const disabled = await read();
        assert.equal(disabled.background, 'rgb(188, 188, 188)');
        assert.equal(disabled.color, 'rgb(72, 72, 72)');
        assert.equal(disabled.border, 'rgba(0, 0, 0, 0)');
        assert.equal(disabled.shadow, 'none'); assert.equal(disabled.animation, 'none');
        await button.hover(); assert.deepEqual(await read(), disabled);
        await page.mouse.down(); assert.deepEqual(await read(), disabled); await page.mouse.up();
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        assert.equal((await read()).animation, 'ButtonAttentionPulse');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.screenshot({ path: 'tmp_ui_styles_game.png' });
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ results, cardResults, disabled, errors }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { version } = require('../package.json');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const directory = process.env.MYPALETTE_ACCEPTANCE_EVIDENCE || 'tmp_acceptance_evidence';
fs.mkdirSync(directory, { recursive: true });

(async () => {
    fs.mkdirSync(directory, { recursive: true });
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(new URL('dev.html#icons', base).href);
        assert.equal(await page.locator('#app-version').textContent(), version);
        const count = await page.evaluate(async () => {
            const { ICON_REVIEW_CASES } = await import('./src/icons/reviewCases.js');
            const { effectIconCanvas, goalIconCanvas, controlIconCanvas } = await import('./src/icons/render.js');
            document.body.replaceChildren();
            document.documentElement.style.cssText = 'height:auto;overflow:visible';
            document.body.style.cssText = 'margin:0;padding:16px;background:#fff;color:#20342d;font:14px system-ui;box-sizing:border-box;height:auto;overflow:visible';
            const heading = document.createElement('h1'); heading.textContent = 'QA icon atlas / 32px and 128px / DPR 1'; document.body.append(heading);
            const grid = document.createElement('main'); grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:12px'; document.body.append(grid);
            for (const item of ICON_REVIEW_CASES) {
                const cell = document.createElement('section'); cell.dataset.reviewId = item.id;
                cell.style.cssText = 'min-width:0;height:158px;border:1px solid #aaa;padding:6px;box-sizing:border-box';
                const label = document.createElement('div'); label.textContent = item.id; cell.append(label);
                for (const size of [32, 128]) {
                    const canvas = item.control ? controlIconCanvas(item.control, size) : item.effect ? effectIconCanvas(item.effect, size) : goalIconCanvas(item.condition, size);
                    canvas.style.cssText = `height:${size}px;width:auto;max-width:100%;vertical-align:middle;margin-right:8px`;
                    cell.append(canvas);
                }
                grid.append(cell);
            }
            return ICON_REVIEW_CASES.length;
        });
        assert.equal(count, 138);
        const cells = page.locator('[data-review-id]');
        const sheets = [];
        for (let start = 0; start < count; start += 16) {
            await cells.evaluateAll((nodes, range) => nodes.forEach((node, i) => { node.hidden = i < range[0] || i >= range[1]; }), [start, start + 16]);
            await page.evaluate(() => window.scrollTo(0, 0));
            const file = `icons-${String(start / 16 + 1).padStart(2, '0')}.png`;
            await page.screenshot({ path: `${directory}/${file}`, fullPage: true });
            sheets.push({ file, ids: await page.locator('[data-review-id]:visible').evaluateAll(nodes => nodes.map(node => node.dataset.reviewId)) });
        }
        await page.goto(new URL('dev.html', base).href);
        const cards = await page.evaluate(async () => {
            const { Card } = await import('./src/game/Card.js');
            await import('./src/game/card.css');
            const settings = await fetch('./data/cards.json').then(response => response.json());
            document.body.replaceChildren();
            document.documentElement.style.cssText = 'height:auto;overflow:visible';
            document.body.style.cssText = 'margin:0;padding:16px;background:#e8e2d4;color:#20342d;font:14px system-ui;height:auto;overflow:visible';
            const grid = document.createElement('main'); grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,294px);gap:12px'; document.body.append(grid);
            const definition = settings.cards.find(card => card.id === 'A01');
            for (const step of [0, 1, 2, 3]) {
                const card = new Card(definition.id); card.setFace(definition, step, Math.min(step, 2), () => {});
                const slot = document.createElement('div'); slot.append(`currentStep ${step}`, card.element); grid.append(slot); card.render({ scale: 1 });
            }
            await Promise.all([...document.images].map(image => image.decode()));
            return { id: definition.id, images: [...document.images].map(image => new URL(image.src).pathname) };
        });
        await page.setViewportSize({ width: 1250, height: 550 });
        await page.screenshot({ path: `${directory}/card-stages.png`, fullPage: true });
        await page.goto(new URL('dev.html', base).href);
        await page.evaluate(async () => {
            const { Card } = await import('./src/game/Card.js');
            const { showCardDetail } = await import('./src/game/cardDetail.js');
            await import('./src/game/view.css');
            const settings = await fetch('./data/cards.json').then(response => response.json());
            const definition = structuredClone(settings.cards[0]);
            definition.steps[0].playEffects = [{ type: 'changeSpecialFace', face: 'temporaryBrush1' }];
            definition.steps[0].achievementEffects = [{ type: 'gainColorDice', colors: 'yellow_purple', lifetime: 'temporary', count: 10 }];
            document.body.replaceChildren();
            const root = document.createElement('main'); document.body.append(root);
            const source = new Card(definition.id); source.setFace(definition, 0, 0, () => {}); root.append(source.element);
            showCardDetail({ root, label: definition.name, source: source.element, actions: () => [], onClose() {},
                createDetail(step) {
                    const slot = document.createElement('div'); slot.className = 'GameCardSlot';
                    const card = new Card(definition.id); card.setFace(definition, 0, step, () => {});
                    const actions = document.createElement('div'); actions.className = 'GameCardActions';
                    slot.append(card.element, actions); return slot;
                } });
            await Promise.all([...document.images].map(image => image.decode()));
        });
        for (const viewport of [{ width: 1200, height: 900 }, { width: 390, height: 844 }]) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(100);
            await page.screenshot({ path: `${directory}/complex-detail-${viewport.width}.png` });
        }
        assert.deepEqual(errors, []);
        const report = { version, browser: browser.version(), base, viewport: '1200x900 icons; 1250x550 cards; 1200x900 and 390x844 detail', dpr: 1, reducedMotion: 'reduce', fixture: 'production renderers; unmodified saved settings A01 currentStep 0/1/2/3; icon review cases; page-only complex detail uses changeSpecialFace temporaryBrush1 and temporary yellow_purple dice x10', sheets, cards, errors };
        fs.writeFileSync(`${directory}/visual-capture.json`, JSON.stringify(report, null, 2) + '\n');
        console.log(JSON.stringify(report));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

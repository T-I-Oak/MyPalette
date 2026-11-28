const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { diceListReviewFixture } = require('./diceListReviewFixture.cjs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const directory = process.env.MYPALETTE_ACCEPTANCE_EVIDENCE || 'tmp_acceptance_evidence';
fs.mkdirSync(directory, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.route('**/src/game/easel/createEasel.js*', async route => {
            const response = await route.fetch(), body = await response.text();
            const original = 'const easel = new THREE.Group();';
            assert(body.includes(original));
            await route.fulfill({ response, body: body.replace(original, original + ' window.qaCardEasels ??= []; window.qaCardEasels.push(easel);') });
        });
        await page.route(base, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: diceListReviewFixture() }));
        await page.goto(base);
        await page.waitForFunction(() => window.review?.session.game.state.phase === 'play' && !review.session.game.state.rollRequest, null, { timeout: 90000 });
        await page.locator('.ReviewTools').evaluate(node => { node.style.display = 'none'; });
        await page.locator('.HandFixedActions button:enabled').first().click();
        await page.waitForFunction(() => !reviewPresentation.cards.busy && document.querySelector('[data-scene-area="field"] .PaintingCard'));
        const measurement = await page.evaluate(async () => {
            const { createPaintingCamera } = await import('./src/game/easel/paintingView.js');
            const { layoutPlay, playMetrics } = await import('./src/game/playLayout.js');
            const entry = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname.endsWith('/three.js'));
            const THREE = await import(entry.name);
            const card = document.querySelector('[data-scene-area="field"] .PaintingCard');
            const front = card.querySelector('.PaintingFront'), style = getComputedStyle(front);
            const matrix = new DOMMatrix(card.parentElement.style.transform);
            const frontHeight = parseFloat(style.height);
            const point = (x, y) => { const p = new DOMPoint(x, y, 0, 1).matrixTransform(matrix); return { x: p.x / p.w, y: p.y / p.w }; };
            const samples = [0, 147, 294].map(x => ({ x, reference: point(x, 414), actual: point(x, frontHeight),
                downwardPixels: point(x, frontHeight).y - point(x, 414).y }));
            const play = reviewScreen.areas.get('play'), count = review.session.game.state.field.length;
            const slot = layoutPlay(count, play.logicalWidth, play.logicalHeight)[0];
            const frame = play.readScreenRect({ ...slot, width: playMetrics.width, height: playMetrics.height });
            const camera = createPaintingCamera(playMetrics.width / playMetrics.height);
            camera.setViewOffset(playMetrics.width, 760, 0, 50, playMetrics.width, playMetrics.height);
            camera.updateMatrixWorld();
            const tray = qaCardEasels[0].getObjectByName('tray-shelf'); tray.updateWorldMatrix(true, false);
            const trayEdge = [0, 147, 294].map(x => {
                const p = tray.localToWorld(new THREE.Vector3((x / 294 - .5) * 1.16, .0275, .075)).project(camera);
                const edge = { x: frame.x + (p.x + 1) * frame.width / 2, y: frame.y + (1 - p.y) * frame.height / 2 };
                return { x, edge, downwardPixels: point(x, frontHeight).y - edge.y };
            });
            const area = document.querySelector('.LayoutContent').getBoundingClientRect();
            const middle = samples[1].actual;
            const matchedRules = [...document.styleSheets].flatMap(sheet => [...sheet.cssRules])
                .filter(rule => rule.selectorText && front.matches(rule.selectorText) && /border-width|transform|box-shadow/.test(rule.cssText))
                .map(rule => ({ selector: rule.selectorText, css: rule.style.cssText }));
            return { cardId: card.dataset.cardId, cardArea: card.dataset.cardArea, parentClass: card.parentElement.className,
                frontTransform: style.transform, matchedRules, frontHeight, cardHeight: getComputedStyle(card).height, trayEdge,
                projectionHeight: 414, borderWidth: style.borderBottomWidth, boxSizing: style.boxSizing,
                shadow: style.boxShadow, outline: style.outline, samples,
                clip: { x: Math.max(0, area.x + middle.x - 170), y: Math.max(0, area.y + middle.y - 95), width: 340, height: 190 } };
        });
        await page.screenshot({ path: `${directory}/d03-card-lower-edge.png`, clip: measurement.clip });
        await page.addStyleTag({ content: '.CardSceneCard > .PaintingCard[data-card-area="field"] .PaintingFront { box-shadow:none !important; outline:none !important; } .CardSceneCard > .PaintingCard[data-card-area="field"] .PaintingFront::after { box-shadow:none !important; }' });
        await page.screenshot({ path: `${directory}/d03-card-lower-edge-no-shadow.png`, clip: measurement.clip });
        const unshadowedHeight = await page.locator('[data-scene-area="field"] .PaintingFront').first().evaluate(node => parseFloat(getComputedStyle(node).height));
        assert.equal(unshadowedHeight, measurement.frontHeight);
        assert.deepEqual(errors, []);
        fs.writeFileSync(`${directory}/d03-card-lower-edge.json`, JSON.stringify({ version: require('../package.json').version, browser: browser.version(),
            fixture: 'diceListReviewFixture; actual play operation; A 1200x900 DPR3 reduce; second screenshot disables shadow/outline in browser only', measurement, unshadowedHeight, errors }, null, 2) + '\n');
        assert.ok(Math.abs(measurement.frontHeight - measurement.projectionHeight) < .1,
            `rendered card height ${measurement.frontHeight} differs from projection height ${measurement.projectionHeight}`);
        console.log('PASS: card lower edge matches easel projection');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

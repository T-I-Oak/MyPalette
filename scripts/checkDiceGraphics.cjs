const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    const page = await browser.newPage(); await page.goto('http://127.0.0.1:5174/#dice');
    const checks = await page.evaluate(async () => {
        const { loadResultGraphics } = await import('/src/dice/resultGraphics.js');
        const { INKS } = await import('/src/dice/icons.js');
        const { colorizeGrayscale } = await import('/src/dice/colorizeGrayscale.js');
        const { MATERIALS, SPECIAL_FACES } = await import('/src/effectCatalog.js');
        const graphics = await loadResultGraphics();
        const pixels = async url => {
            const image = new Image(); image.src = url; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
            return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        };
        const results = [];
        for (const material of MATERIALS) {
            const gray = await pixels(`/assets/dice/${material}_grayscale.png`);
            const fixed = await pixels(`/assets/dice/${material}_fixed.png`);
            for (const [color, hex] of Object.entries(INKS)) {
                const merged = await pixels(graphics.get({ material, color }));
                const ink = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
                const colored = new Uint8ClampedArray(gray); colorizeGrayscale(colored, hex);
                let opaqueFixed = 0, transparent = 0, tinted = 0, maxFixedError = 0, maxTintError = 0;
                for (let i = 0; i < merged.length; i += 4) {
                    if (fixed[i + 3] >= 240) {
                        opaqueFixed++;
                        const fa = fixed[i + 3] / 255;
                        const ga = gray[i+3]/255;
                        const alpha = fa + ga * (1 - fa);
                        for (let c = 0; c < 3; c++) {
                            const expected = (fixed[i + c] * fa + colored[i+c] * ga * (1 - fa)) / alpha;
                            maxFixedError = Math.max(maxFixedError, Math.abs(merged[i + c] - Math.round(expected)));
                        }
                    }
                    if (gray[i + 3] === 0 && fixed[i + 3] === 0) { if (merged[i + 3] !== 0) throw Error('Transparency lost'); transparent++; }
                    if (gray[i + 3] >= 240 && gray[i] >= 128 && fixed[i + 3] === 0) {
                        tinted++;
                        for (let c = 0; c < 3; c++) maxTintError = Math.max(maxTintError, Math.abs(merged[i + c] - colored[i+c]));
                    }
                    if (fixed[i+3]===0 && merged[i+3]!==gray[i+3]) throw Error('Original alpha changed');
                }
                results.push({ material, color, opaqueFixed, transparent, tinted, maxFixedError, maxTintError });
            }
        }
        const special = SPECIAL_FACES.map(special => graphics.get({ special }).startsWith('data:image/png'));
        graphics.dispose(); return { results, special };
    });
    for (const result of checks.results) {
        assert.ok(result.opaqueFixed > 0 && result.transparent > 0 && result.tinted > 0, JSON.stringify(result));
        assert.ok(result.maxFixedError <= 2, JSON.stringify(result));
        assert.ok(result.maxTintError <= 2, JSON.stringify(result));
    }
    assert.ok(checks.special.every(Boolean));
    console.log(JSON.stringify(checks)); await browser.close();
})().catch(error => { console.error(error); process.exit(1); });

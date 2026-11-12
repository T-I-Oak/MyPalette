const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(() => {
            Math.random = () => .4;
            const NativeObserver = ResizeObserver;
            window.iconObservers = new Map();
            window.ResizeObserver = class extends NativeObserver {
                constructor(callback) { super(callback); window.iconObservers.set(this, new Set()); }
                observe(target, options) { super.observe(target, options); window.iconObservers.get(this).add(target); }
                unobserve(target) { super.unobserve(target); window.iconObservers.get(this).delete(target); }
                disconnect() { super.disconnect(); window.iconObservers.get(this).clear(); }
            };
        });
        await page.goto(base);
        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).click();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();
        const togglePanel = () => page.locator('#panel-toggle').evaluate(button => button.click());
        async function rememberHosts() {
            await togglePanel();
            await page.locator('[data-game-area="stock"]').waitFor();
            await page.evaluate(() => { window.currentHosts = [...document.querySelectorAll('[data-game-area]')]; });
            await togglePanel();
        }
        async function checkOwnership(label) {
            const result = await page.evaluate(() => {
                const frames = [...window.iconObservers.values()].flatMap(set => [...set])
                    .filter(node => node.classList.contains('PaintingIconFrame'));
                const current = new Set([...document.querySelectorAll('.PaintingIconFrame'),
                    ...window.currentHosts.flatMap(host => [...host.querySelectorAll('.PaintingIconFrame')])]);
                return { registered: frames.length, current: current.size,
                    stale: frames.filter(frame => !current.has(frame)).length,
                    missing: [...current].filter(frame => !frames.includes(frame)).length };
            });
            assert.equal(result.stale, 0, `${label}: stale registrations: ${JSON.stringify(result)}`);
            assert.equal(result.missing, 0, `${label}: current icons must remain observed`);
            return result;
        }
        await rememberHosts();
        const counts = [await checkOwnership('initial')];
        const updates = 12;
        let endings = 0;
        const start = page.getByRole('button', { name: '今日の仕事を始める', exact: true });
        const end = page.getByRole('button', { name: '今日の仕事を終える', exact: true });
        for (let step = 0; step < updates; step++) {
            if (await end.count()) {
                await end.click();
                await page.waitForFunction(() => {
                    const button = document.querySelector('[data-game-end-day]');
                    return !button || (button.textContent === '今日の仕事を始める' && !button.disabled);
                });
                if (!await start.count()) {
                    endings++;
                    const returnToTitle = page.getByRole('button', { name: 'タイトルへ戻る', exact: true });
                    await returnToTitle.waitFor();
                    await checkOwnership('game over');
                    if (step + 1 < updates) {
                        await returnToTitle.click();
                        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).click();
                        await start.waitFor();
                        await rememberHosts();
                    }
                }
            } else {
                await start.click({ force: true });
                await page.waitForFunction(() => document.querySelector('[data-game-end-day]')?.disabled === false, null, { timeout: 60000 });
                if (step === 0) {
                    await togglePanel();
                    await page.waitForFunction(() => {
                        const frames = [...document.querySelectorAll('[data-scene-area="stock"] [data-scene-back="false"] .PaintingIconFrame')];
                        return frames.length > 0 && frames.every(frame => frame.querySelector('canvas')?.height > 0);
                    });
                    await togglePanel();
                    await checkOwnership('panel closed after redisplay');
                }
            }
            counts.push(await checkOwnership(`update ${step + 1}`));
        }
        assert.ok(endings > 0, 'must cover game over with the panel closed');
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ regression: 'GC-R01', counts, endings, stale: 0, redisplay: 'passed' }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

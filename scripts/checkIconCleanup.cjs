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
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();
        async function rememberHosts() {
            await page.locator('#panel-toggle').click();
            await page.locator('[data-game-area="stock"]').waitFor();
            await page.evaluate(() => { window.currentHosts = [...document.querySelectorAll('[data-game-area]')]; });
            await page.locator('#panel-toggle').click();
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
        let replays = 0;
        for (let step = 0; step < 12; step++) {
            if (await page.getByRole('button', { name: 'もう一度遊ぶ', exact: true }).count()) {
                await page.getByRole('button', { name: 'もう一度遊ぶ', exact: true }).click();
                replays++;
            } else if (await page.getByRole('button', { name: '今日の仕事を終える', exact: true }).count()) {
                await page.getByRole('button', { name: '今日の仕事を終える', exact: true }).click();
            } else { await page.getByRole('button', { name: '今日の仕事を始める', exact: true }).click({force:true});await page.waitForFunction(()=>document.querySelector('[data-game-end-day]')?.disabled===false,null,{timeout:60000}); }
            counts.push(await checkOwnership(`update ${step + 1}`));
        }
        assert.ok(replays > 0, 'must cover replay with the panel closed');
        await page.locator('#panel-toggle').click();
        await page.waitForFunction(() => {
            const frames = [...document.querySelectorAll('[data-game-area="stock"] .PaintingIconFrame')];
            return frames.length > 0 && frames.every(frame => frame.querySelector('canvas')?.height > 0);
        });
        await page.locator('#panel-toggle').click();
        // Freeze the next settings load so menu disposal can be checked before a new game mounts.
        await page.route('**/data/cards.json', route => route.fulfill({ status: 500, body: 'test failure' }));
        await page.getByRole('button', { name: '入口へ戻る', exact: true }).click();
        await page.locator('.GameStartup button').waitFor();
        assert.equal((await checkOwnership('menu disposal')).registered, 0);
        assert.equal(await page.locator('[data-game-area]').count(), 0);
        await page.unroute('**/data/cards.json');
        await page.getByRole('button', { name: '再読み込み', exact: true }).click();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();
        await rememberHosts();
        await checkOwnership('new presentation');
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({ regression: 'GC-R01', counts, replays, stale: 0, menuRegistered: 0, redisplay: 'passed' }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

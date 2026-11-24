const assert = require('node:assert/strict');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { version } = require('../package.json');
const { installBuiltAssetRoutes } = require('./builtAssetRoutes.cjs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge' });
    try {
        const page = await browser.newPage({ hasTouch: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await installBuiltAssetRoutes(page, base);
        await page.goto(base);
        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).waitFor();
        assert.match(await page.locator('.TitleMetadata').textContent(), new RegExp(`v${version.replaceAll('.', '\\.')}$`));
        const check = async () => {
            const state = await page.evaluate(() => {
                const dispatch = (type, count) => {
                    const event = new Event(type, { bubbles: true, cancelable: true });
                    Object.defineProperty(event, 'touches', { value: Array(count).fill({}) });
                    document.querySelector('.LayoutScreen').dispatchEvent(event);
                    return event.defaultPrevented;
                };
                return {
                    gestures: ['gesturestart', 'gesturechange', 'dblclick'].map(type => dispatch(type, 0)),
                    pinch: ['touchstart', 'touchmove'].map(type => dispatch(type, 2)),
                    normal: ['touchstart', 'touchmove', 'touchend', 'click'].map(type => dispatch(type, 1)),
                    scrollPolicy: getComputedStyle(document.querySelector('.LayoutScreen')).touchAction,
                    dicePolicy: [...document.querySelectorAll('.DiceViewport, .DiceDraggable')].map(node => getComputedStyle(node).touchAction),
                };
            });
            assert.deepEqual(state.gestures, [true, true, true]);
            assert.deepEqual(state.pinch, [true, true]);
            assert.deepEqual(state.normal, [false, false, false, false]);
            assert.equal(state.scrollPolicy, 'manipulation');
            assert.ok(state.dicePolicy.every(value => value === 'none'));
        };
        await check();
        for (const selector of ['.TitleSign img']) {
            const point = await page.locator(selector).first().evaluate(node => {
                const rect = node.getBoundingClientRect();
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
                    policy: getComputedStyle(node).touchAction };
            });
            assert.equal(point.policy, 'manipulation');
            await page.touchscreen.tap(point.x, point.y);
            await page.touchscreen.tap(point.x, point.y);
            assert.equal(await page.evaluate(() => visualViewport.scale), 1);
        }
        // A real double tap must deliver both click actions, without zooming.
        await page.evaluate(() => {
            const button = document.createElement('button');
            button.id = 'tap-check';
            button.textContent = 'tap';
            button.style = 'position:fixed;top:0;left:0;z-index:10000;width:80px;height:50px';
            window.tapCount = 0;
            button.onclick = () => window.tapCount++;
            document.body.append(button);
        });
        await page.touchscreen.tap(40, 25);
        await page.touchscreen.tap(40, 25);
        assert.equal(await page.evaluate(() => window.tapCount), 2);
        assert.equal(await page.evaluate(() => visualViewport.scale), 1);
        await page.locator('#tap-check').evaluate(node => node.remove());
        await page.evaluate(() => {
            const scroll = document.createElement('div');
            scroll.id = 'scroll-check';
            scroll.style = 'position:fixed;left:100px;top:50px;width:150px;height:200px;overflow:auto;z-index:10000';
            scroll.innerHTML = '<div style="height:1000px;background:gray">scroll</div>';
            document.body.append(scroll);
        });
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 220 }] });
        for (const y of [200, 170, 140, 110, 80]) {
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 150, y }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(() => document.querySelector('#scroll-check').scrollTop > 0);
        await page.locator('#scroll-check').evaluate(node => node.remove());
        await cdp.detach();
        const portal = page.getByRole('link', { name: 'GameWorks OAK', exact: true });
        const portalUrl = await portal.getAttribute('href');
        await page.context().route(portalUrl, route => route.fulfill({ contentType: 'text/html', body: '<title>portal tap check</title>' }));
        const [popup] = await Promise.all([page.waitForEvent('popup'), portal.tap()]);
        await popup.waitForLoadState();
        assert.equal(popup.url(), portalUrl);
        await popup.close();
        await page.getByRole('button', { name: 'ゲーム開始', exact: true }).tap();
        await page.waitForFunction(() => [...document.querySelectorAll('.PaletteFixedActions button')]
            .some(node => node.textContent === 'すべてリロール' && !node.disabled), null, { timeout: 60000 });
        await check();
        await page.setViewportSize({ width: 1000, height: 600 });
        await check();
        await page.setViewportSize({ width: 568, height: 320 });
        await check();
        await page.goto(new URL('dev.html', base).href);
        assert.equal(await page.locator('#app-version').textContent(), version);
        assert.equal(await page.locator('.GameBrowserSurface').count(), 0);
        assert.deepEqual(errors, []);
        console.log('PASS: zoom event cancellation, normal touch events, double tap clicks, dice CSS, rotation/A-B, developer scope; Safari real-device zoom unverified');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });

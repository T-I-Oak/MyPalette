const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3003/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, hasTouch: true });
        const errors = [];
        page.on('pageerror', error => { errors.push(error.message); console.error('pageerror:', error.message); });
        page.on('response', response => { if (response.status() >= 400) console.error(response.status(), response.url()); });
        page.on('requestfailed', request => console.error('request failed:', request.url(), request.failure()));
        page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <meta charset="utf-8"><body class="theme-atelier"><button id="notice">通知</button><div id="card"></div>
            <script type="module">
            import './src/ui/theme.css'; import './src/ui/textures.css';
            import {Card} from './src/game/Card.js';
            import {createEffectNotices} from './src/game/effectNotices.js';
            const card = new Card('A01');
            card.setFace({name:'確認',steps:Array.from({length:3},()=>({goals:[],playEffects:[{type:'changeSpecialFace',face:'fame1'}],achievementEffects:[]}))},0,0,()=>{});
            document.querySelector('#card').append(card.element);
            const notices = createEffectNotices(document.body,()=>{});
            window.showSpecial=()=>notices.sync({effectNotices:[{id:2,timing:'special',effects:Array.from({length:20},()=>({type:'changeFame',amount:1}))}]},false);
            window.showLong=()=>notices.sync({effectNotices:[{id:3,timing:'play',effects:[{type:'exchangeCards',count:1}]}]},false);
            document.querySelector('#notice').onclick=()=>notices.sync({effectNotices:[{id:1,timing:'play',effects:[{type:'gainRerolls',count:1}]}]},false);
            </script>` }));
        await page.goto(base);
        await page.waitForFunction(() => document.querySelector('.PaintingCard'), null, { timeout: 10000 });
        const anchor = page.locator('.PaintingBlock.play .CardIcon');
        await anchor.hover();
        await page.locator('.EffectDetails').waitFor();
        await page.mouse.move(1100, 850);
        await page.locator('.EffectDetails').first().waitFor({ state: 'detached' });
        await anchor.click();
        await page.mouse.move(1100, 850);
        assert.equal(await page.locator('.EffectDetails.is-pinned').count(), 1);
        const inline = page.locator('.EffectDetails .EffectBodyText .CardIcon').first();
        await inline.hover();
        assert.equal(await page.locator('.EffectDetails .EffectDetails:not(.is-pinned)').count(), 1);
        await page.mouse.move(1100, 850);
        assert.equal(await page.locator('.EffectDetails').count(), 1, 'leaving nested hover closes only the child');
        await inline.click();
        assert.equal(await page.locator('.EffectDetails .EffectDetails').count(), 1);
        assert.ok((await page.locator('.EffectDetails .EffectDetails').innerText()).includes('名声値を増やす。'));
        await page.mouse.move(1100, 850);
        assert.equal(await page.locator('.EffectDetails').count(), 2);
        await inline.click();
        assert.equal(await page.locator('.EffectDetails').count(), 1, 'tapping the nested anchor again closes its own popup');
        await inline.click();
        await page.locator('.EffectDetails').first().locator(':scope > .EffectBody > .EffectBodyRow > .CardIcon').click();
        assert.equal(await page.locator('.EffectDetails').count(), 1, 'a tap in the parent outside the child closes only the child');
        await page.mouse.click(1100, 850);
        await page.locator('.EffectDetails').first().waitFor({ state: 'detached' });
        for (const width of [1200, 754, 720, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            await page.locator('#notice').click();
            const notice = page.locator('.EffectNotice');
            await notice.waitFor();
            assert.equal(await page.locator('.EffectNoticeTitle').innerText(), '獲得効果');
            const background = await page.locator('.EffectNoticeTitle').evaluate(node => getComputedStyle(node).backgroundColor);
            assert.notEqual(background, 'rgba(0, 0, 0, 0)');
            assert.notEqual(background, 'transparent');
            const size = await notice.evaluate(node => {
                const style = getComputedStyle(node), frame = node.querySelector('.PaintingIconFrame');
                const bounds = node.getBoundingClientRect();
                return { font: style.fontSize, icon: getComputedStyle(frame).height, left: bounds.left, right: bounds.right };
            });
            assert.equal(size.font, '20px'); assert.equal(size.icon, '40px');
            assert.ok(size.left >= 0 && size.right <= width);
            const overflow = await page.locator('.EffectNoticeGroup').evaluate(group => [group, ...group.querySelectorAll('.EffectNotice, .EffectBody')]
                .map(node => ({ client: node.clientWidth, scroll: node.scrollWidth })));
            assert.ok(overflow.every(node => node.scroll <= node.client), `horizontal overflow at ${width}px: ${JSON.stringify(overflow)}`);
            if (width === 1200 && process.env.MYPALETTE_UI_SCREENSHOT) await page.screenshot({ path: process.env.MYPALETTE_UI_SCREENSHOT });
            await notice.waitFor({ state: 'detached' });
        }
        await anchor.tap();
        assert.equal(await page.locator('.EffectDetails.is-pinned').count(), 1);
        await page.locator('.EffectDetails .EffectBodyText .CardIcon').first().tap();
        assert.equal(await page.locator('.EffectDetails .EffectDetails').count(), 1);
        await page.locator('.EffectDetails .EffectBodyText .CardIcon').first().tap();
        assert.equal(await page.locator('.EffectDetails').count(), 1);
        await page.locator('.EffectDetails .EffectBodyText .CardIcon').first().tap();
        await page.touchscreen.tap(380, 850);
        await page.locator('.EffectDetails').first().waitFor({ state: 'detached' });
        await page.evaluate(() => window.showSpecial());
        await page.locator('.EffectNotice.special').waitFor();
        assert.equal(await page.locator('.EffectNotice.special .EffectBodyRow').count(), 1);
        const scroll = await page.locator('.EffectNoticeGroup').evaluate(node => ({ x: getComputedStyle(node).overflowX, y: getComputedStyle(node).overflowY }));
        assert.deepEqual(scroll, { x: 'visible', y: 'visible' });
        await page.locator('.EffectNotice.special').waitFor({ state: 'detached' });
        for (const width of [320, 390, 1200]) {
            await page.setViewportSize({ width, height: 900 });
            await page.evaluate(() => window.showLong());
            await page.waitForFunction(() => document.querySelector('.EffectNotice .PaintingIconFrame canvas')?.width > 0);
            const ratio = await page.locator('.EffectNotice .PaintingIconFrame').evaluate(frame => {
                const box = frame.getBoundingClientRect(), canvas = frame.querySelector('canvas');
                return { displayed: box.width / box.height, original: canvas.width / canvas.height };
            });
            assert.ok(Math.abs(ratio.displayed - ratio.original) < .03, `long-effect icon distorted at ${width}px: ${JSON.stringify(ratio)}`);
            await page.locator('.EffectNotice').waitFor({ state: 'detached' });
        }
        await page.evaluate(() => localStorage.setItem('gameworks_portal_lang', 'en'));
        await page.locator('#notice').click();
        assert.equal(await page.locator('.EffectNoticeTitle').innerText(), 'Gained effects');
        assert.ok((await page.locator('.EffectNotice').innerText()).includes('Gain reroll tickets.'));
        assert.deepEqual(errors, []);
        console.log('EUI-C01: hover dismissal, tap persistence, outside tap dismissal, nested icon tap, enlarged notices, narrow viewport and auto-dismiss passed');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

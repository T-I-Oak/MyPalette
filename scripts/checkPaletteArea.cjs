const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        const shadowWarnings = [];
        page.on('console', message => {
            if (/PCFSoftShadowMap has been removed/.test(message.text())) shadowWarnings.push(message.text());
        });
        await page.addInitScript(() => { Math.random = () => .4; });
        await page.goto(base);
        const palette = page.locator('[data-game-area="palette"]');
        const roll = page.getByRole('button', { name: '今日の仕事を始める', exact: true });
        await roll.waitFor();
        await page.waitForFunction(() => !!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
        const rerolls = page.locator('.PaletteRerolls');
        assert(await rerolls.isHidden());
        const initialTabStops = await page.locator('button,[role="button"],[role="tab"]').evaluateAll(nodes =>
            nodes.filter(node => node.tabIndex >= 0).map(node => node.outerHTML));
        assert.deepEqual(initialTabStops, [], '初日の開始前は裏向きカードで説明アイコンもない');
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.matches('button,[role="button"],[role="tab"]')), false);
        assert(await roll.evaluate(node => node.classList.contains('state-attention')));
        assert.equal(await roll.evaluate(node => getComputedStyle(node).fontSize), '24px');
        assert.equal(await page.locator('.HandArea').evaluate(node => {
            const labels = [...document.querySelectorAll('.LayoutAreaName')];
            return getComputedStyle(labels.find(label => label.textContent === '手札')).fontSize;
        }), '24px');
        const attention = await roll.evaluate(node => {
            const animation = node.getAnimations().find(item => item.animationName === 'ButtonAttentionPulse');
            if (!animation) return null;
            animation.pause(); animation.currentTime = 0;
            const start = getComputedStyle(node).scale;
            animation.currentTime = 800;
            const peak = getComputedStyle(node).scale;
            animation.play(); return { start, peak };
        });
        assert.deepEqual(attention, { start:'1', peak:'1.1' });
        await page.emulateMedia({ reducedMotion:'reduce' });
        assert.equal(await roll.evaluate(node => getComputedStyle(node).animationName), 'none');
        await page.emulateMedia({ reducedMotion:'no-preference' });
        assert.equal(await palette.locator('.DiceResult:not([hidden])').count(), 0);
        assert(await roll.isEnabled());
        await page.screenshot({ path:'tmp_palette_roll_ready.png' });
        await page.evaluate(async () => {
            window.emergeCounts = new Map();
            document.addEventListener('animationstart', event => {
                if (event.animationName === 'dice-emerge' && event.target.closest('.PaletteViewport')) {
                    const counts = window.emergeCounts;
                    counts.set(event.target, (counts.get(event.target) || 0) + 1);
                }
            });
            const loaded = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname.endsWith('/dice/DiceGroup.js'));
            const { DiceGroup } = await import(loaded.name);
            const original = DiceGroup.prototype.roll;
            DiceGroup.prototype.roll = async function (...args) {
                window.lastRollGroup = this;
                const results = await original.apply(this, args);
                window.lastPhysicalResults = results;
                window.lastPhysicalPose = JSON.stringify(this.dice.map(die => die.body.quaternion));
                return results;
            };
        });
        await roll.click({ force: true });
        const endDay=page.getByRole('button',{name:'今日の仕事を終える',exact:true});
        await page.waitForFunction(()=>document.querySelector('[data-game-end-day]')?.disabled===false,null,{timeout:60000});
        assert(await endDay.isEnabled());assert(await rerolls.isVisible());assert.equal(await rerolls.innerText(),'×1');
        const effectIcons = page.locator('.PaintingBlock.play .CardIcon[aria-expanded], .PaintingBlock.reward .CardIcon[aria-expanded]');
        assert(await effectIcons.count() > 0, 'ドロー後のカードに説明アイコンがある');
        assert(await effectIcons.evaluateAll(nodes => nodes.every(node => node.tabIndex === -1 && node.getAttribute('role') === 'button')));
        const tabStops = await page.locator('button,[role="button"],[role="tab"]').evaluateAll(nodes =>
            nodes.filter(node => node.tabIndex >= 0).map(node => node.outerHTML));
        assert.deepEqual(tabStops, [], '効果説明を含む操作ボタン・タブはTab順次フォーカス対象外');
        await page.evaluate(() => { document.activeElement.blur(); });
        await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(() => document.activeElement.matches('button,[role="button"],[role="tab"]')), false);
        const firstTab = page.locator('[data-game-area="hand"] .PaintingTab').first();
        await firstTab.click();
        assert.equal(await firstTab.getAttribute('aria-selected'), 'true');
        assert.equal(await page.locator('.HandFixedActions .Button').first().evaluate(node => getComputedStyle(node).fontSize), '24px');
        const ticketPosition = await rerolls.evaluate(node => {
            const actual = node.getBoundingClientRect(), parent = node.parentElement.getBoundingClientRect();
            return { x:actual.left-parent.left, y:actual.top-parent.top };
        });
        assert(Math.abs(ticketPosition.x)<1 && Math.abs(ticketPosition.y)<1);
        const endDayPlacement = await page.locator('[data-game-end-day]').evaluate(node => {
            const wrapper=node.closest('.PlayEndDayAction'), rect=wrapper?.getBoundingClientRect(), layer=wrapper?.parentElement.getBoundingClientRect();
            return { fixed:!!wrapper, top:rect?.top-layer?.top, right:layer?.right-rect?.right };
        });
        assert(endDayPlacement.fixed && Math.abs(endDayPlacement.top)<1 && Math.abs(endDayPlacement.right)<1,JSON.stringify(endDayPlacement));
        assert.equal(await page.locator('[data-game-area="info"] [data-game-end-day]').count(),0);
        await palette.locator('.DiceResult:not([hidden])').first().waitFor();
        await page.waitForTimeout(100);
        const emerges = await page.evaluate(() => [...window.emergeCounts.values()]);
        assert.equal(emerges.length, 3);
        assert(emerges.every(count => count === 1), `出現アニメーションの再開: ${JSON.stringify(emerges)}`);
        const physical = await page.evaluate(async () => {
            const { displayLabel } = await import('/MyPalette/src/effectCatalog.js');
            return {
                preserved: window.lastPhysicalPose === JSON.stringify(window.lastRollGroup.dice.map(die => die.body.quaternion)),
                expected: window.lastPhysicalResults.map(result => result.face.special ? displayLabel(result.face.special) :
                    `${displayLabel(result.face.color)}・${displayLabel(result.face.material)}`),
                actual: [...document.querySelectorAll('.PaletteViewport .DiceResult img')].map(image => image.alt),
            };
        });
        assert(physical.preserved); assert.deepEqual(physical.actual, physical.expected);
        assert.equal(await palette.locator('canvas').count(), 1);
        assert.equal(await palette.locator('.DiceResult').count(), 3);
        assert.equal(await palette.locator('.DiceLabId,.GameDicePane').count(), 0);
        await palette.locator('canvas').evaluate(node => { window.paletteCanvas = node; });
        for (const [width, height] of [[1200,800], [390,844], [844,390]]) {
            await page.setViewportSize({ width, height });
            await page.waitForTimeout(300);
            const bounds = await palette.evaluate(node => {
                const host = node.getBoundingClientRect(), canvas = node.querySelector('canvas').getBoundingClientRect();
                return { width: host.width, height: host.height, dx: Math.abs(host.width-canvas.width),
                    dy: Math.abs(host.height-canvas.height), same: node.querySelector('canvas') === window.paletteCanvas };
            });
            assert(bounds.width > 0 && bounds.height > 0);
            assert(bounds.dx < 1 && bounds.dy < 1 && bounds.same, JSON.stringify(bounds));
            const actionSpace = await page.locator('.PaletteFixedActions').evaluate(node => {
                const actions = node.getBoundingClientRect();
                const viewport = document.querySelector('.PaletteViewport').getBoundingClientRect();
                return { height: actions.height, gap: actions.top - viewport.bottom };
            });
            assert(Math.abs(actionSpace.height - 36) < 1, JSON.stringify(actionSpace));
            assert(Math.abs(actionSpace.gap) < 1, JSON.stringify(actionSpace));
            const bottomMargins = await page.evaluate(() => {
                const paletteActions = document.querySelector('.PaletteFixedActions');
                const handActions = document.querySelector('.HandFixedActions');
                const gap = node => node.parentElement.getBoundingClientRect().bottom - node.getBoundingClientRect().bottom;
                return { palette: gap(paletteActions), hand: gap(handActions) };
            });
            assert(Math.abs(bottomMargins.palette - bottomMargins.hand) < 1, JSON.stringify(bottomMargins));
            await page.screenshot({ path: `tmp_palette_area_${width}.png` });
        }
        await page.setViewportSize({ width:390,height:844 });
        const before = await palette.getAttribute('class');
        await page.locator('#panel-toggle').click(); await page.waitForTimeout(350);
        assert.equal(await palette.getAttribute('class'), before);
        await page.setViewportSize({ width:1200,height:800 });
        await page.getByRole('button', { name:'今日の仕事を終える',exact:true }).click();
        await page.waitForTimeout(300);
        assert(await rerolls.isHidden());
        assert(await palette.locator('canvas').evaluate(node => node === window.paletteCanvas));
        await roll.waitFor();assert.equal(await page.locator('.HandFixedActions .Button').count(),0);
        await page.waitForFunction(() => {
            const button = document.querySelector('[data-game-end-day]');
            return button?.textContent === '今日の仕事を始める' && !button.disabled && !document.querySelector('[data-stock-effect]');
        });
        // 注目アニメーションで拡縮し続けるため、演出完了と有効状態は上で明示的に待つ。
        await roll.click({ force: true });
        await page.waitForFunction(() => {
            const button = document.querySelector('[data-game-end-day]');
            return button?.textContent === '今日の仕事を終える' && !button.disabled;
        }, null, { timeout: 60000 });
        assert(await rerolls.isVisible());assert.equal(await rerolls.innerText(),'×1');
        await page.getByRole('button', { name:'入口へ戻る',exact:true }).click();
        await roll.waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
        assert.equal(await palette.locator('.DiceResult:not([hidden])').count(), 0);
        assert.equal(await palette.locator('canvas').count(), 1);
        assert(await palette.locator('canvas').evaluate(node => node !== window.paletteCanvas));
        assert.deepEqual(errors, []);
        assert.deepEqual(shadowWarnings, []);
        console.log('PASS: palette in game, A/B, resize, panel, persistent canvas, restart, no browser errors');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

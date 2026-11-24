const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const settings = require('../public/data/cards.json');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 360 } });
        const errors = []; page.on('pageerror', error => { errors.push(error.message); console.error(error); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: `
            <body class="GameBrowserSurface"><main id="root"><section id="background"></section><section id="preserved" inert></section></main>
            <script type="module">
            import {preventBrowserZoom} from './src/ui/browserInteraction.js';
            import './src/ui/browserInteraction.css';
            preventBrowserZoom(document.body);
            import {Card} from './src/game/Card.js';import {showCardDetail} from './src/game/cardDetail.js';
            import {cardActionButton} from './src/game/cardActions.js';
            import './src/game/view.css';import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/states.css';import './src/ui/textures.css';
            const definition=${JSON.stringify(settings.cards[0])};
            const source=new Card(definition.id);source.setFace(definition,0,0,()=>{});
            const root=document.querySelector('main');document.querySelector('#background').append(source.element);
            const hiddenAction={id:'hidden',label:'取得',visible:false,enabled:false,run(){throw new Error('hidden action');}};
            const hiddenButton=cardActionButton(hiddenAction);hiddenButton.id='hidden-action';root.append(hiddenButton);
            const disabledAction={id:'disabled',label:'無効操作',visible:true,enabled:false,run(){throw new Error('disabled action');}};
            const disabledButton=cardActionButton(disabledAction);disabledButton.id='disabled-action';root.append(disabledButton);
            window.detailCloseCount=0;window.executed=0;
            window.openDetail=(choice=false)=>{
                if(choice){const dialog=document.createElement('dialog');dialog.className='GameChoice';root.append(dialog);dialog.append(source.element);dialog.showModal();}
                window.detail=showCardDetail({root,label:definition.name,source:source.element,
                    createDetail(selectedStep=0){const slot=document.createElement('div');slot.className='GameCardSlot';
                        const card=new Card(definition.id);card.setFace(definition,0,selectedStep,()=>{});
                        const actions=document.createElement('div');actions.className='GameCardActions';slot.append(card.element,actions);return slot;},
                    actions:()=>[hiddenAction,disabledAction,{id:'test',label:'実行',visible:true,enabled:true,run(){
                        if(detail.isOpen)throw new Error('action before close');executed++;}}],onClose(){detailCloseCount++;}});
            };
            window.ready=true;
            </script>` }));
        await page.goto(base); await page.waitForFunction(() => window.ready);
        assert.equal(await page.locator('#hidden-action').isVisible(), false);
        for (const choice of [false, true]) {
            await page.getByRole('tab', { name: 'Step 2', exact: true }).click();
            await page.evaluate(choice => window.openDetail(choice), choice);
            const detail = page.locator('.GameCardDetail'); await detail.waitFor();
            assert.equal(await detail.getByRole('button', { name: '取得', exact: true }).count(), 0);
            const readState = button => ({ hidden: button.hidden, disabled: button.disabled, visible: getComputedStyle(button).display !== 'none' });
            assert.deepEqual(await detail.locator('button').filter({ hasText: '取得' }).evaluate(readState), await page.locator('#hidden-action').evaluate(readState));
            assert.deepEqual(await detail.getByRole('button', { name: '無効操作', exact: true }).evaluate(readState), await page.locator('#disabled-action').evaluate(readState));
            assert.equal(await detail.locator('.PaintingTab[aria-selected=true]').textContent(), 'Step 2');
            assert.equal(await detail.evaluate(node => node.tagName), 'DIV');
            assert.equal(await detail.evaluate(node => node.parentElement.matches('dialog')), choice);
            await detail.getByRole('tab', { name: 'Step 1', exact: true }).click();
            await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.equal(await page.evaluate(() => !document.activeElement.closest('.GameCardDetail')), true);
            const bounds = await detail.locator('.GameCardActions').evaluate(node => node.getBoundingClientRect().toJSON());
            assert.ok(bounds.bottom <= 360 && bounds.left >= 0 && bounds.right <= 390);
            await detail.getByRole('button', { name: '実行', exact: true }).click();
            assert.equal(await detail.count(), 0);
            assert.equal(await page.locator('#preserved').evaluate(node => node.inert), true);
            assert.equal(await page.locator('#background').evaluate(node => node.inert), false);
            assert.equal(await page.locator('.PaintingTab[aria-selected=true]').textContent(), 'Step 1');
            if (choice) await page.locator('dialog').evaluate(node => { document.querySelector('#background').append(node.querySelector('.PaintingCard')); node.remove(); });
        }
        await page.evaluate(() => window.openDetail());
        for (const key of ['Escape', 'Tab', 'Shift+Tab', 'Enter', 'Space', 'ArrowRight', 'ArrowLeft']) {
            await page.keyboard.press(key);
            assert.equal(await page.locator('.GameCardDetail').count(), 1, key + ' must not close the detail');
            assert.deepEqual(await page.evaluate(() => [detailCloseCount, executed]), [2, 2]);
        }
        await page.locator('.GameCardDetail').getByRole('button', { name: '閉じる', exact: true }).click();
        assert.equal(await page.locator('.GameCardDetail').count(), 0);
        await page.evaluate(() => { window.openDetail(); detail.close(); detail.close(); detail.refresh(); });
        assert.deepEqual(await page.evaluate(() => [detailCloseCount, executed]), [4, 2]);
        assert.deepEqual(errors, []);
        console.log('card detail: root/choice dialog, short viewport, tabs, focus, keyboard blocking including Escape, close-before-action, inert restoration, idempotent disposal passed');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: process.env.MYPALETTE_STOCK_MOTION ? 'no-preference' : 'reduce' });
        const errors = [];
        page.on('pageerror', error => { errors.push(error.message); console.error(error); });
        page.on('console', message => { if(message.type()==='error' && /^\w*Error:/.test(message.text())) errors.push(message.text()); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout GameBrowserSurface"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
            <script type="module">
            import {preventBrowserZoom} from './src/ui/browserInteraction.js';
            import './src/ui/browserInteraction.css';
            preventBrowserZoom(document.body);
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            Math.random=()=>.4;
            const root=document.querySelector('main');
            const screen=createLayoutScreen(root,document.querySelector('button'));
            const presentation=createLayoutPresentation(screen);
            const settings=${JSON.stringify(settings)};
            const mounted=mountGame(root,settings,presentation);
            window.stockCheck={screen,presentation,mounted,root,settings};
            </script>` }));
        await installDayStartGate(page);await page.goto(base);
        await page.locator('[data-scene-area=stock] .PaintingCard').first().waitFor();
        await releaseDayStart(page);
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            game.step(game.state.hand[0]).playEffects=[{type:'gainStockCards',count:2}];
        });
        await page.setViewportSize({width:390,height:844});
        const playId=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand[0].id);
        await page.locator(`[data-scene-id="${playId}"] [data-scene-card]`).click({position:{x:10,y:40}});
        const normalLabel = await page.locator(`.HandFixedActions [data-card-id="${playId}"] button`).textContent();
        assert.equal(normalLabel, '着手');
        const font = node => { const style=getComputedStyle(node); return {family:style.fontFamily,size:style.fontSize,weight:style.fontWeight,style:style.fontStyle}; };
        assert.deepEqual(await page.locator('.GameCardDetail').getByRole('button',{name:normalLabel,exact:true}).evaluate(font),
            await page.locator(`.HandFixedActions [data-card-id="${playId}"] button`).evaluate(font));
        await page.locator('.GameCardDetail').getByRole('button',{name:normalLabel,exact:true}).click();
        await page.locator('[data-stock-acquire]').first().waitFor();
        assert.equal(await page.locator('#panel-toggle').getAttribute('aria-expanded'),'true');
        assert.equal(await page.locator('.GameChoice[open]').count(),0);
        assert.equal(await page.locator('[data-stock-acquire]').count(),3);
        assert.equal(await page.locator('[data-stock-acquire].state-attention').count(),3);
        const geometry=await page.locator('[data-stock-acquire]').first().evaluate(button=>{
            button.style.animation='none';button.style.scale='1';
            const first=button.getBoundingClientRect();button.style.scale='1.1';
            const second=button.getBoundingClientRect();
            button.style.removeProperty('animation');button.style.removeProperty('scale');
            const source=document.querySelector('[data-scene-area=stock] .PaintingCard[data-scene-back=true]');
            const before=getComputedStyle(source.querySelector('.PaintingBack'));
            const normal=[before.width,before.height,before.boxSizing];
            const copy=source.cloneNode(true);copy.dataset.stockMotionCard='geometry-check';
            document.body.append(copy);
            const after=getComputedStyle(copy.querySelector('.PaintingBack'));
            const moving=[after.width,after.height,after.boxSizing];copy.remove();
            return {dx:(first.x+first.width/2)-(second.x+second.width/2),dy:(first.y+first.height/2)-(second.y+second.height/2),normal,moving};
        });
        assert.ok(Math.abs(geometry.dx)<.1&&Math.abs(geometry.dy)<.1,'attention scales around the button center');
        assert.deepEqual(geometry.moving,geometry.normal,'normal and moving card backs have identical dimensions');
        async function acquireDetail() {
            const id=await page.locator('[data-stock-acquire]').first().getAttribute('data-stock-acquire');
            await page.locator(`[data-scene-id="${id}"] [data-scene-card]`).click({position:{x:10,y:40}});
            const detail=page.locator('.GameCardDetail[data-open="true"]');
            await detail.waitFor();
            assert.equal(await detail.evaluate(node=>node.tagName),'DIV');
            assert.equal(await page.locator('.LayoutContent').evaluate(node=>node.inert),true);
            await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.equal(await page.evaluate(()=>document.activeElement===document.body),true);
            await page.keyboard.press('Escape');
            assert.equal(await detail.count(),1);
            await detail.getByRole('button',{name:'閉じる',exact:true}).click();
            assert.equal(await detail.count(),0);
            assert.equal(await page.locator('.LayoutContent').evaluate(node=>node.inert),false);
            await page.locator(`[data-scene-id="${id}"] [data-scene-card]`).click({position:{x:10,y:40}});
            await detail.getByRole('button',{name:'取得',exact:true}).click();
            assert.equal(await detail.count(),0);
        }
        const id=await page.locator('[data-stock-acquire]').first().getAttribute('data-stock-acquire');
        const next=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A[1].id);
        await acquireDetail();
        assert.equal(await page.evaluate(id=>window.stockCheck.mounted.session.game.state.discard.some(c=>c.id===id),id),true);
        await page.locator(`[data-stock-acquire="${next}"]`).waitFor();
        await acquireDetail();
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.pending),null);
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        // Select a return through the hand button, then acquire directly from a stock.
        await page.locator('#panel-toggle').click();
        await page.evaluate(()=>{
            const g=window.stockCheck.mounted.session.game;
            g.step(g.state.hand[0]).playEffects=[{type:'exchangeCards',count:1}];
        });
        await page.locator('.HandFixedActions button:enabled').first().click({force:true});
        await page.locator('[data-hand-return]:enabled').first().waitFor();
        assert.equal(await page.locator('.GameChoice[open]').count(),0);
        assert.ok(await page.locator('[data-hand-return]:enabled').first().evaluate(node=>node.classList.contains('state-attention')));
        const returnId=await page.locator('[data-hand-return]:enabled').first().getAttribute('data-hand-return');
        await page.locator(`[data-scene-id="${returnId}"] [data-scene-card]`).click({position:{x:10,y:40}});
        await page.locator('.GameCardDetail').getByRole('button',{name:'返却',exact:true}).click();
        if(process.env.MYPALETTE_STOCK_MOTION) {
            await page.waitForFunction(()=>!window.stockCheck.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'));
            await page.screenshot({path:'tmp_stock_hand_return.png'});
        }
        await page.locator('[data-stock-acquire]').first().waitFor();
        const handSize=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.length);
        await acquireDetail();
        if(process.env.MYPALETTE_STOCK_MOTION) await page.waitForFunction(()=>!window.stockCheck.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'));
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.length),handSize+1);
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.pending),null);
        await page.waitForFunction(()=>!window.stockCheck.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'));
        await page.evaluate(()=>{
            const s=window.stockCheck.mounted.session.game.state;
            s.dice.forEach(d=>d.used=true);s.flyers=s.orderCost;
        });
        if (await page.locator('#panel-toggle').isVisible() && await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
                await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
        await page.locator('[data-stock-acquire]').first().waitFor();
        const replacement=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A[1].id);
        await acquireDetail();
        await page.waitForFunction(()=>!window.stockCheck.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'));
        const end=await page.evaluate(()=>window.stockCheck.mounted.session.game.state);
        assert.deepEqual(end.public,{A:null,B:null,C:null});
        assert.equal(end.stocks.A.at(-1).id,replacement);
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        assert.deepEqual(errors,[]);
        console.log('card interaction: custom detail, focus, background restoration, play, return, stock gain/exchange/order passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

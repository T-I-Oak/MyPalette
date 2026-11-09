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
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if(message.type()==='error' && /^\w*Error:/.test(message.text())) errors.push(message.text()); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
            <script type="module">
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
            const mounted=mountGame(root,settings,()=>{},presentation);
            window.stockCheck={screen,presentation,mounted,root,settings};
            </script>` }));
        await page.goto(base);
        await page.locator('.StockArea .PaintingCard').first().waitFor();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            game.step(game.state.hand[0]).playEffects=[{type:'gainStockCards',count:2}];
        });
        await page.setViewportSize({width:390,height:844});
        await page.locator('.HandFixedActions button:enabled').first().click({force:true});
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
            const source=document.querySelector('.StockArea .PaintingCardBackOnly');
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
        const id=await page.locator('[data-stock-acquire]').first().getAttribute('data-stock-acquire');
        const next=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A[1].id);
        await page.locator('[data-stock-acquire]').first().click({force:true});
        assert.equal(await page.evaluate(id=>window.stockCheck.mounted.session.game.state.discard.some(c=>c.id===id),id),true);
        await page.locator(`[data-stock-acquire="${next}"]`).waitFor();
        await page.locator(`[data-stock-acquire="${next}"]`).click({force:true});
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
        await page.locator('[data-hand-return]:enabled').first().click({force:true});
        if(process.env.MYPALETTE_STOCK_MOTION) {
            await page.locator('[data-stock-hand-motion]').first().waitFor();
            await page.screenshot({path:'tmp_stock_hand_return.png'});
        }
        await page.locator('[data-stock-acquire]').first().waitFor();
        const handSize=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.length);
        await page.locator('[data-stock-acquire]').first().click({force:true});
        if(process.env.MYPALETTE_STOCK_MOTION) await page.locator('[data-stock-hand-motion]').first().waitFor();
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.length),handSize+1);
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.pending),null);
        await page.waitForFunction(()=>!document.querySelector('[data-stock-motion-card],[data-stock-hand-motion]'));
        await page.evaluate(()=>{
            const s=window.stockCheck.mounted.session.game.state;
            s.dice.forEach(d=>d.used=true);s.flyers=s.orderCost;
        });
        await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
        await page.locator('[data-stock-acquire]').first().waitFor();
        const replacement=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A[1].id);
        await page.locator('[data-stock-acquire]').first().click({force:true});
        await page.waitForFunction(()=>!document.querySelector('[data-stock-motion-card],[data-stock-hand-motion]'));
        const end=await page.evaluate(()=>window.stockCheck.mounted.session.game.state);
        assert.deepEqual(end.public,{A:null,B:null,C:null});
        assert.equal(end.stocks.A.at(-1).id,replacement);
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        assert.deepEqual(errors,[]);
        console.log('stock acquisition: B auto-open, direct buttons, sequential gain, replenishment and exchange passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

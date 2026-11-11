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
        await page.locator('[data-scene-area=stock] .PaintingCard').first().waitFor();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        await page.evaluate(()=>{
            const g=window.stockCheck.mounted.session.game;
            for(const grade of ['A','B','C']) {g.state.discard.push(...g.state.stocks[grade]);g.state.stocks[grade]=[];g.state.public[grade]=null;}
            g.step(g.state.hand[0]).playEffects=[{type:'exchangeCards',count:2}];
        });
        await page.locator('.HandFixedActions button:enabled').first().click({force:true});
        for(let cycle=0;cycle<2;cycle++) {
            await page.locator('[data-hand-return]:enabled').first().waitFor();
            const id=await page.locator('[data-hand-return]:enabled').first().getAttribute('data-hand-return');
            await page.locator('[data-hand-return]:enabled').first().click({force:true});
            if(process.env.MYPALETTE_STOCK_MOTION) {
                await page.locator('[data-stock-hand-motion]').first().waitFor();
                if(cycle===0) {
                    await page.setViewportSize({width:390,height:844});
                    await page.evaluate(()=>window.stockCheck.screen.setFixedScale(1.25));
                }
            }
            await page.locator(`[data-stock-acquire="${id}"]`).waitFor();
            assert.equal(await page.locator('[data-stock-acquire]').count(),1);
            assert.equal(await page.locator('.GameChoice[open]').count(),0);
            await page.locator(`[data-stock-acquire="${id}"]`).click({force:true});
            if(process.env.MYPALETTE_STOCK_MOTION) {
                await page.locator('[data-stock-hand-motion]').first().waitFor();
                const copies=await page.locator(`[data-stock-motion-card="${id}"]`).count();
                assert.equal(copies,0,'last acquired card is not duplicated in the moving stock');
            }
            await page.waitForFunction(()=>!document.querySelector('[data-stock-hand-motion],[data-stock-motion-card]'));
            assert.equal(await page.evaluate(id=>window.stockCheck.mounted.session.game.state.hand.find(c=>c.id===id).step,id),0);
            assert.equal(await page.locator('[data-scene-area=stock] .PaintingCard').count(),0);
        }
        if(await page.locator('#panel-toggle').isVisible()) await page.locator('#panel-toggle').click();
        await page.evaluate(()=>{
            const g=window.stockCheck.mounted.session.game;
            g.step(g.state.hand[0]).playEffects=[{type:'gainStockCards',count:2}];
        });
        await page.locator('.HandFixedActions button:enabled').first().click({force:true});
        await page.waitForFunction(()=>!window.stockCheck.mounted.session.game.state.pending && !document.querySelector('[data-stock-hand-motion],[data-stock-motion-card]'));
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        assert.equal(await page.locator('[data-hand-return]').count(),0);
        await page.waitForTimeout(1500);
        await page.evaluate(()=>{
            const s=window.stockCheck.mounted.session.game.state;s.dice.forEach(d=>d.used=true);s.flyers=s.orderCost;
        });
        await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='awaitingStart');
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        assert.deepEqual(errors,[]);
        console.log('stock edges: empty-grade return, same-card acquisition, two exchanges, resize/scale, no duplicates, all-empty gain and ordering passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

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
        page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
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
            const mounted=mountGame(root,settings,presentation);
            window.stockCheck={screen,presentation,mounted,root,settings};
            </script>` }));
        await installDayStartGate(page);await page.goto(base);
        await page.locator('[data-scene-area=stock] .PaintingCard').first().waitFor();
        await releaseDayStart(page);
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        await page.setViewportSize({width:390,height:844});
        const context=()=>page.evaluate(()=>window.stockCheck.screen.panelState);
        const idle=()=>page.waitForFunction(()=>!window.stockCheck.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'));
        const play=async(type,count)=>{
            await idle();
            await page.evaluate(({type,count})=>{
                const g=window.stockCheck.mounted.session.game;
                g.step(g.state.hand[0]).playEffects=[{type,count}];
            },{type,count});
            await page.locator('.HandFixedActions button:enabled').first().click({force:true});
        };
        const acquire=async()=>{await page.locator('[data-stock-acquire]:enabled').first().click({force:true});};
        const waitSelection=async()=>{try {await page.locator('[data-stock-acquire]:enabled').first().waitFor();} catch(e) {console.error(await page.evaluate(()=>({panel:window.stockCheck.screen.panelState,state:window.stockCheck.mounted.session.game.state,html:document.querySelector('.PlaySessionActions')?.textContent})));throw e;}};
        await play('gainStockCards',2); await waitSelection();
        assert.equal((await context()).open,true);
        await acquire(); await waitSelection();
        assert.equal((await context()).open,true,'continuous acquisition stays open');
        await page.evaluate(()=>{
            const { screen, presentation } = window.stockCheck;
            const close = screen.closePanel.bind(screen);
            window.stockCheck.closeSnapshots = [];
            screen.closePanel = () => {
                window.stockCheck.closeSnapshots.push({ busy: presentation.cards.busy,
                    motion: document.querySelector('[data-card-scene-motion]')?.dataset.cardSceneMotion });
                close();
            };
        });
        await acquire(); await idle();
        await page.waitForFunction(()=>window.stockCheck.screen.panelState.progress===0);
        assert.equal((await context()).open,false,'closes after replenishment');
        assert.deepEqual(await page.evaluate(()=>window.stockCheck.closeSnapshots), [{busy:false,motion:undefined}],
            'auto-close starts only after card transfer and replenishment finish');
        await page.locator('#panel-toggle').click();
        await play('gainStockCards',1); await waitSelection(); await acquire(); await idle();
        assert.equal((await context()).open,true,'manually opened board stays open');
        await page.locator('#panel-toggle').click();
        await play('exchangeCards',2);
        await page.locator('[data-hand-return]:enabled').first().waitFor();
        assert.equal((await context()).open,true);
        await page.locator('#panel-toggle').click(); await page.locator('#panel-toggle').click();
        for(let i=0;i<2;i++) {
            await page.locator('[data-hand-return]:enabled').first().click({force:true});
            await waitSelection(); await acquire();
            if(i===0) {await page.locator('[data-hand-return]:enabled').first().waitFor();assert.equal((await context()).open,true);}
        }
        await idle(); assert.equal((await context()).open,true,'manual close and reopen takes priority');
        await page.setViewportSize({width:1200,height:700});
        await page.reload();
        await page.locator('[data-scene-area=stock] .PaintingCard').first().waitFor();
        await releaseDayStart(page);
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        await page.setViewportSize({width:390,height:844});
        await play('gainStockCards',2); await waitSelection();
        await page.locator('#panel-toggle').click();
        await page.waitForFunction(()=>window.stockCheck.screen.panelState.progress===0);
        await page.setViewportSize({width:1200,height:700});
        await acquire(); await waitSelection();
        await page.setViewportSize({width:390,height:844});
        assert.equal((await context()).open,false,'manual close survives next selection and A/B switch');
        await page.locator('#panel-toggle').click();
        await page.waitForFunction(()=>window.stockCheck.screen.panelState.progress===1);
        await acquire(); await idle();
        assert.equal((await context()).open,true);
        assert.deepEqual(errors,[]);
        console.log('board behavior: auto close, continuous gain/exchange, manual priority, A/B passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

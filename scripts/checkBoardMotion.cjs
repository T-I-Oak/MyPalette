const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: process.env.MYPALETTE_STOCK_MOTION ? 'no-preference' : 'reduce' });
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
        await installDayStartGate(page); await page.goto(base);
        await page.waitForFunction(()=>window.dayStartWaiting);
        await page.evaluate(()=>{
            const {cards}=stockCheck.presentation;
            const move=cards.move.bind(cards);window.motionCalls=[];
            cards.move=async(state,duration,name,options)=>{
                motionCalls.push({name,duration});
                await move(state,duration,name,options);
            };
        });
        await releaseDayStart(page);
        await page.waitForFunction(()=>stockCheck.mounted.session.game.state.phase==='play'&&!stockCheck.presentation.cards.busy,null,{timeout:60000});
        const startup=await page.evaluate(()=>motionCalls);
        assert.equal(startup.find(c=>c.name==='initial-deal').duration,0);
        assert.ok(startup.filter(c=>c.name.startsWith('stock-')).every(c=>c.duration===0));
        if(process.env.MYPALETTE_STOCK_MOTION) assert.ok(startup.find(c=>c.name==='draw').duration>0);
        await page.evaluate(async()=>{
            const {createCardSceneTimeline}=await import('./src/game/cardSceneTimeline.js');
            const {screen,presentation}=stockCheck, cards=presentation.cards;
            const initial=structuredClone(cards.display);
            window.identities=[...document.querySelectorAll('[data-scene-card]')];
            window.runBoardScenario=async(mode,flipDuring=false)=>{
                await cards.move(initial,0,'restore');cards.busy=false;cards.update();
                if(mode==='closed')screen.closePanel();else screen.openPanel();
                await new Promise(resolve=>{
                    function wait(){if(screen.panelState.progress===(mode==='closed'?0:1))resolve();else requestAnimationFrame(wait);}wait();
                });
                let calls=[],resumeCount=0;
                const original=cards.move;
                cards.move=async(state,duration,name,options)=>{
                    calls.push({name,duration});
                    const result=original(state,duration,name,options);
                    if(flipDuring&&calls.length===1) {if(mode==='closed')screen.openPanel();else screen.closePanel();}
                    await result;
                };
                const timeline=createCardSceneTimeline(screen,cards,presentation.play,{}, {}, {},()=>{});
                const target=structuredClone(initial);target.phase='play';
                target.stocks.A.reverse();target.public.A=target.stocks.A[0].id;
                timeline.begin();timeline.hasWork(target,[]);await timeline.run(target,()=>[],()=>[],()=>[]);
                const stockCalls=[...calls];
                if(mode==='closed')screen.closePanel();else screen.openPanel();
                await new Promise(resolve=>{function wait(){if(screen.panelState.progress===(mode==='closed'?0:1))resolve();else requestAnimationFrame(wait);}wait();});
                // Use the actual hand as a discard pile so the next draw requires a recycle.
                const held=structuredClone(initial);held.discard.push(...held.hand,...held.deck);held.hand=[];held.deck=[];
                cards.adopt(held);await original(held,0,'recycle-setup');cards.update();
                const state=structuredClone(held);state.phase='play';state.recycleRequest={id:42};calls=[];
                timeline.begin();timeline.hasWork(state,[]);
                await timeline.run(state,()=>[],id=>{
                    if(id!==42)throw new Error('wrong recycle request');resumeCount++;
                    const shuffled=[...state.discard].reverse();
                    state.discard=[];state.hand=[shuffled[0]];state.deck=shuffled.slice(1);state.recycleRequest=null;
                    return [{kind:'recycle',cards:shuffled},{kind:'draw',card:shuffled[0]}];
                },()=>[]);
                const final=structuredClone(cards.display),locations=[...cards.model.cards.values()].map(c=>c.area);
                cards.move=original;
                return {stockCalls,recycleCalls:calls,resumeCount,final,expected:state,locations,
                    identities:identities.every(n=>n.isConnected),count:document.querySelectorAll('[data-scene-card]').length};
            };
        });
        for(const scenario of [{mode:'closed',width:390,height:844},{mode:'open',width:390,height:844},{mode:'A',width:1200,height:700}]) {
            await page.setViewportSize({width:scenario.width,height:scenario.height});
            const result=await page.evaluate(mode=>runBoardScenario(mode),scenario.mode);
            const skip=!process.env.MYPALETTE_STOCK_MOTION||scenario.mode==='closed';
            assert.ok(result.stockCalls.length>0);
            assert.ok(result.stockCalls.every(c=>(c.duration===0)===skip));
            assert.ok(result.recycleCalls.filter(c=>c.name.startsWith('recycle-')).every(c=>(c.duration===0)===skip));
            assert.equal(result.resumeCount,1);assert.equal(result.final.hand.length,1);
            assert.deepEqual(result.final.deck,result.expected.deck);assert.deepEqual(result.final.public,result.expected.public);
            assert.equal(result.locations.length,45);assert.equal(result.count,45);assert.equal(result.identities,true);
            if(process.env.MYPALETTE_STOCK_MOTION)assert.ok(result.recycleCalls.find(c=>c.name==='draw').duration>0);
        }
        await page.setViewportSize({width:390,height:844});
        if(process.env.MYPALETTE_STOCK_MOTION)for(const mode of ['closed','open']) {
            const result=await page.evaluate(mode=>runBoardScenario(mode,true),mode);
            assert.ok(result.stockCalls.every(c=>(c.duration===0)===(mode==='closed')));
            assert.ok(result.recycleCalls.filter(c=>c.name.startsWith('recycle-')).every(c=>(c.duration===0)===(mode==='closed')));
        }
        assert.deepEqual(errors,[]);
        console.log('board motion: initial deal, stock cycle, recycle, draw, A/B, mid-animation toggles and 45 persistent cards passed');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

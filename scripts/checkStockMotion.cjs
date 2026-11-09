const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: 'no-preference' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
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
        assert.equal(await page.locator('.StockArea .PaintingCard').count(),45);
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),0);
        const initialA=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A.map(card=>card.id));
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>document.querySelector('[data-stock-effect="running"]'));
        const depths=await page.evaluate(ids=>ids.slice(0,8).map(id=>{
            const node=document.querySelector(`[data-stock-motion-card="${id}"]`);
            return {z:Number(node.parentElement.style.zIndex),visible:node.style.visibility!=='hidden'};
        }),initialA);
        assert.equal(depths[7].z,8,'公開待ちのカードは元の積み順を維持');
        const visible=depths.filter(card=>card.visible);
        for(let i=1;i<visible.length;i++) assert.ok(visible[i-1].z>visible[i].z,'上から抜く順と前後関係が一致');
        await page.waitForFunction(()=>[...document.querySelectorAll('[data-stock-motion-card] .PaintingFaces')].some(n=>{
            const angle=parseFloat(n.style.getPropertyValue('--painting-flip'));return angle>1&&angle<179;
        }));
        const angles=await page.locator('[data-stock-motion-card] .PaintingFaces').evaluateAll(nodes=>nodes.map(n=>parseFloat(n.style.getPropertyValue('--painting-flip'))));
        assert.ok(new Set(angles).size>1,'A/B/C are staggered');
        await page.screenshot({path:'tmp_stock_reveal.png'});
        await page.waitForFunction(()=>!document.querySelector('[data-stock-motion-card]'));
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        assert.equal(await page.locator('[data-stock-motion-card]').count(),0);
        const before=await page.evaluate(()=>{
            const s=window.stockCheck.mounted.session.game.state;
            s.dice.forEach(d=>d.used=true);s.flyers=0;
            return Object.fromEntries(['A','B','C'].map(g=>[g,s.stocks[g].map(c=>c.id)]));
        });
        await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
        await page.waitForFunction(()=>document.querySelector('[data-stock-effect="running"]'));
        const endButton=page.locator('[data-game-end-day]');assert.equal(await endButton.isDisabled(),true);
        await page.waitForTimeout(700);
        await page.screenshot({path:'tmp_stock_rotate.png'});
        await page.setViewportSize({width:390,height:844});
        await page.locator('#panel-toggle').click();
        await page.evaluate(()=>window.stockCheck.screen.setFixedScale(1.25));
        await page.waitForFunction(()=>!document.querySelector('[data-stock-motion-card]'));
        const after=await page.evaluate(()=>window.stockCheck.mounted.session.game.state);
        assert.deepEqual(after.public,{A:null,B:null,C:null});
        for(const grade of ['A','B','C']) assert.deepEqual(after.stocks[grade].map(c=>c.id),[...before[grade].slice(1),before[grade][0]]);
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),0);
        assert.equal(await page.locator('[data-stock-motion-card]').count(),0);
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>document.querySelector('[data-stock-effect="running"]'));
        await page.waitForTimeout(300);
        await page.locator('#panel-toggle').click();
        await page.waitForFunction(()=>!document.querySelector('[data-stock-motion-card]'));
        assert.equal(await page.locator('[data-stock-motion-card]').count(),0);
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),0,'closed panel is detached');
        await page.locator('#panel-toggle').click();await page.waitForTimeout(300);
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),3);
        assert.deepEqual(errors,[]);
        console.log('stock motion: initial deal, staggered reveal, rotate/insert, locks, resize, fixed scale, panel and next-day reveal passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

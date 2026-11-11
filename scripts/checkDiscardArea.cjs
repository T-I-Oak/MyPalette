const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
 import {createLayoutPresentation} from './src/game/layoutPresentation.js';
 import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main');const screen=createLayoutScreen(root,document.querySelector('button'));
 const mounted=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(screen));
 window.check={screen,mounted};
 </script>`}));
 await page.goto(base);await page.locator('[data-game-area=discard]').waitFor({state:'attached'});
 assert.equal(await page.locator('.LayoutAreaFixed[data-area="discard"] .LayoutAreaName').textContent(),'捨て札 0枚');
 await page.evaluate(()=>{const g=check.mounted.session.game;g.state.discard.push(...g.state.stocks.B.splice(0,12));});
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
 await page.waitForFunction(()=>document.querySelectorAll('[data-scene-area=discard] .PaintingCard').length===12);
 await page.waitForFunction(()=>check.mounted.session.game.state.phase==='play',null,{timeout:60000});
 assert.equal(await page.locator('.LayoutAreaFixed[data-area="discard"] .LayoutAreaName').textContent(),'捨て札 12枚');
 const state=await page.evaluate(()=>JSON.stringify(check.mounted.session.game.state));
 const placements=await page.locator('[data-scene-area=discard] .PaintingCard').evaluateAll(ns=>ns.map(n=>n.getAttribute('style')));
 const topId=await page.evaluate(()=>check.mounted.session.game.state.discard.at(-1).id);
 const top=page.locator('[data-scene-card="'+topId+'"]');
 await top.click();await page.locator('.GameCardDetail[open]').waitFor();
 await page.locator('.GameCardDetail [role="tab"]').first().click();
 await page.getByRole('button',{name:'閉じる',exact:true}).click();
 assert.equal(await page.evaluate(()=>JSON.stringify(check.mounted.session.game.state)),state);
 for(const viewport of [{width:390,height:844},{width:1200,height:800}]){
 await page.setViewportSize(viewport);
 if(viewport.width===390) await page.evaluate(()=>check.screen.openPanel());
 await page.waitForTimeout(300);
 assert.deepEqual(await page.locator('[data-scene-area=discard] .PaintingCard').evaluateAll(ns=>ns.map(n=>n.getAttribute('style'))),placements);
 const inside=await page.locator('[data-game-area=discard]').evaluate(host=>{const box=host.getBoundingClientRect();return [...host.querySelectorAll('.PaintingCard')].every(n=>{const r=n.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom;});});
 assert.ok(inside);
 }
 await page.screenshot({path:'tmp_discard_area.png'});
 assert.deepEqual(errors,[]);console.log('PASS: empty/count, detail/steps without mutation, A/B bounds, stable scatter');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

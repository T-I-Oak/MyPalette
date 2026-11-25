const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:process.env.MYPALETTE_STOCK_MOTION?'no-preference':'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
 for(const card of settings.cards)for(const step of card.steps)step.achievementEffects=[{type:'gainRerolls',count:1}];
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
 import {createLayoutPresentation} from './src/game/layoutPresentation.js';
 import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main');const screen=createLayoutScreen(root,document.querySelector('button'));
 const mounted=mountGame(root,${JSON.stringify(settings)},createLayoutPresentation(screen));
 window.check={screen,mounted};
 </script>`}));
 await installDayStartGate(page);await page.goto(base);await page.locator('[data-game-area=discard]').waitFor({state:'attached'});
 assert.equal(await page.locator('.LayoutAreaFixed[data-area="discard"] .LayoutAreaName').textContent(),'捨て札 0枚');
 await page.evaluate(()=>{const g=check.mounted.session.game;g.state.discard.push(...g.state.stocks.B.splice(0,12));});
 await releaseDayStart(page);
 await page.waitForFunction(()=>document.querySelectorAll('[data-scene-area=discard] .PaintingCard').length===12);
 await page.waitForFunction(()=>check.mounted.session.game.state.phase==='play',null,{timeout:60000});
 assert.equal(await page.locator('.LayoutAreaFixed[data-area="discard"] .LayoutAreaName').textContent(),'捨て札 12枚');
 const state=await page.evaluate(()=>JSON.stringify(check.mounted.session.game.state));
 const placements=await page.locator('[data-scene-area=discard] .PaintingCard').evaluateAll(ns=>ns.map(n=>n.getAttribute('style')));
 const topId=await page.evaluate(()=>check.mounted.session.game.state.discard.at(-1).id);
 const top=page.locator('[data-scene-card="'+topId+'"]');
 const tab=top.getByRole('tab',{name:'Step 1',exact:true});
 assert.equal(await tab.evaluate(n=>!!n.closest('[inert]')),false,'discard tabs use the common interactive face');
 await tab.click();
 assert.equal(await top.locator('[aria-selected="true"]').textContent(),'Step 1');
 assert.equal(await page.locator('.GameCardDetail').count(),0,'tab does not open detail');
 await top.click();await page.locator('.GameCardDetail[data-open="true"]').waitFor();
 await page.locator('.GameCardDetail').getByRole('tab',{name:'Step 2',exact:true}).click();
 await page.getByRole('button',{name:'閉じる',exact:true}).click();
 assert.equal(await page.locator('.GameCardDetail').count(),0,'closing a changed discard tab must not reopen detail');
 assert.equal(await page.locator('.LayoutContent').evaluate(n=>n.inert),false,'detail releases board input');
 assert.equal(await page.evaluate(()=>JSON.stringify(check.mounted.session.game.state)),state);
 for(const viewport of [{width:390,height:844},{width:1200,height:800}]){
 await page.setViewportSize(viewport);
 if(viewport.width===390) await page.evaluate(()=>check.screen.openPanel());
 await page.waitForTimeout(300);
 await top.getByRole('tab',{name:'Step 1',exact:true}).click();
 assert.equal(await top.locator('[aria-selected="true"]').textContent(),'Step 1');
 assert.equal(await page.locator('.GameCardDetail').count(),0,'discard tab changes only the step');
 const effect=top.locator('.CardIcon[aria-expanded]').first();
 await effect.click();
 assert.equal(await page.locator('.EffectDetails.is-pinned').count(),1,'discard effect opens its explanation');
 assert.equal(await page.locator('.GameCardDetail').count(),0,'effect does not open detail');
 await effect.click();
 await page.mouse.move(1,1);
 assert.equal(await page.locator('.EffectDetails').count(),0,'effect explanation closes');
 await top.locator('.PaintingName').click();
 const detail=page.locator('.GameCardDetail');
 assert.equal(await detail.locator('[aria-selected="true"]').textContent(),'Step 1');
 await detail.getByRole('tab',{name:'Step 2',exact:true}).click();
 await detail.getByRole('button',{name:'閉じる',exact:true}).click();
 assert.equal(await detail.count(),0,'detail does not reenter after restoring step');
 assert.equal(await page.locator('.LayoutContent').evaluate(n=>n.inert),false);
 assert.equal(await page.evaluate(()=>JSON.stringify(check.mounted.session.game.state)),state);
 const occluded=await page.evaluate(topId=>{
 const top=document.querySelector('[data-scene-card="'+topId+'"]');
 const r=top.querySelector('.PaintingName').getBoundingClientRect();
 return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-scene-card]')?.dataset.sceneCard;
 },topId);
 assert.equal(occluded,topId,'a pointer over the stack reaches the visible top card');
 assert.equal(await page.locator('[data-scene-area=deck]').first().evaluate(n=>n.inert),true,'back-facing deck stays inert');
 assert.deepEqual(await page.locator('[data-scene-area=discard] .PaintingCard').evaluateAll(ns=>ns.map(n=>n.getAttribute('style'))),placements);
 const inside=await page.locator('[data-game-area=discard]').evaluate(host=>{const box=host.getBoundingClientRect();return [...host.querySelectorAll('.PaintingCard')].every(n=>{const r=n.getBoundingClientRect();return r.left>=box.left&&r.right<=box.right&&r.top>=box.top&&r.bottom<=box.bottom;});});
 assert.ok(inside);
 }
 await page.screenshot({path:'tmp_discard_area.png'});
 assert.deepEqual(errors,[]);console.log('PASS: empty/count, detail/steps without mutation, A/B bounds, stable scatter');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

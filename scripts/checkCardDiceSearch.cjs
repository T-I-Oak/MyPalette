const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
for(const c of settings.cards)for(const s of c.steps){s.playEffects=[];s.achievementEffects=[];s.goals=[
 {material:'brush',color:null},{material:null,color:'orange'},{material:'brush',color:'orange'},{material:'airbrush',color:'purple'}];}
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route(base,route=>route.fulfill({contentType:'text/html; charset=utf-8',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button tabindex="-1" id="panel-toggle" class="PanelToggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
 window.searchCheck=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(screen));
 </script>`}));
 await page.goto(base);await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();
 await page.waitForFunction(()=>performance.getEntriesByType('resource').some(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')));
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')).name;
  const {DiceScene}=await import(url),original=DiceScene.prototype.project;
  DiceScene.prototype.project=function(...args){window.searchScene=this;return original.apply(this,args);};
  const g=window.searchCheck.session.game,face=(material,color)=>({material,color});
  g.state.dice[0].faces=[face('brush','orange'),face('brush','orange'),face('brush','blue'),face('pastel','orange'),face('pastel','green'),face('pastel','green')];
  g.state.dice[1].faces=Array.from({length:6},()=>face('airbrush','blue'));
  g.state.dice[2].faces=Array.from({length:6},()=>face('pastel','orange'));
 });
 const goal=condition=>page.locator(`[data-scene-area="hand"] [data-goal-condition='${JSON.stringify(condition)}']`).first();
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
 await goal({material:'brush',color:'orange'}).click();
 await page.waitForFunction(()=>!!window.searchScene?.faceSearch.active);
 assert(await page.evaluate(()=>window.searchScene.group.rolling));
 assert.deepEqual(await page.evaluate(()=>window.searchScene.faceSearch.result.hits.map(h=>h.count)),[2]);
 await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).waitFor({timeout:60000});
 await page.evaluate(()=>{window.searchCheck.session.game.state.dice[0].used=true;});
 await page.locator('.HandFixedActions .Button').first().click();
 const baseline=await page.evaluate(()=>JSON.stringify(window.searchCheck.session.game.state));
 for(const [condition,counts] of [[{material:'brush'},[3]],[{color:'orange'},[3,6]],[{material:'brush',color:'orange'},[2]]]){
  await goal(condition).click();
  await page.waitForFunction(()=>window.searchScene.faceSearch.opacity>.9);
  assert.deepEqual(await page.evaluate(()=>window.searchScene.faceSearch.result.hits.map(h=>h.count)),counts);
  assert.equal(await page.locator('.PaletteViewport .DiceSearchBadge:not([hidden])').count(),counts.length);
  assert(await page.locator('.PaletteSearchNotice').isHidden());
  assert.equal(await page.evaluate(()=>JSON.stringify(window.searchCheck.session.game.state)),baseline);
 }
 assert(await page.evaluate(()=>window.searchScene.visuals.get(window.searchScene.group.dice[0].id).searchBadge.hidden===false&&window.searchScene.group.dice[0].consumed));
 assert.equal(await page.locator('.GameCardDetail[open]').count(),0);
 await goal({material:'airbrush',color:'purple'}).click();
 const notice=page.locator('.PaletteSearchNotice');await notice.waitFor();
 assert((await notice.innerText()).includes('を含む画材ダイスはありません'));assert.equal(await notice.locator('canvas').count(),1);
 const centered=await notice.evaluate(n=>{
  const a=n.getBoundingClientRect(),p=n.parentElement.getBoundingClientRect();
  return Math.abs(a.x+a.width/2-p.x-p.width/2)<1&&Math.abs(a.y+a.height/2-p.y-p.height/2)<1;
 });assert(centered);await page.screenshot({path:'tmp_palette_search_none.png'});
 await page.waitForTimeout(3200);assert(await notice.isHidden());
 assert.deepEqual(errors,[]);console.log('PASS: goal material/color/pair search, rolling and consumed dice, face counts, centered empty notice, expiry, read-only');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

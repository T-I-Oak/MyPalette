const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
for(const card of settings.cards)for(const step of card.steps){step.playEffects=[];step.achievementEffects=[];}
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:800},hasTouch:true,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button tabindex="-1" id="panel-toggle" class="PanelToggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
 import {createLayoutPresentation} from './src/game/layoutPresentation.js';
 import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main');const screen=createLayoutScreen(root,document.querySelector('button'));
 window.selectionCheck=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(screen));
 </script>`}));
 await page.goto(base);
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')).name;
  const {DiceScene}=await import(url),original=DiceScene.prototype.project;
  DiceScene.prototype.project=function(...args){window.selectionScene=this;return original.apply(this,args);};
 });
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
 await page.waitForFunction(()=>{const b=document.querySelector('[data-game-end-day]');return b&&b.textContent==='今日の仕事を終える'&&!b.disabled;},null,{timeout:60000});
 const icon=async()=>page.evaluate(()=>{
  const nodes=[...document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex));
  const node=nodes[0],r=node.getBoundingClientRect();return{id:node.dataset.dieId,x:r.left+r.width/2,y:r.top+r.height/2};
 });
 let target=await icon();
 await page.evaluate(id=>{
  const game=window.selectionCheck.session.game,die=game.state.dice.find(d=>d.id===id),face=die.faces[die.current];
  for(const card of Object.values(game.definitions))for(const step of card.steps)step.goals=[{color:face.color,material:face.material}];
 },target.id);
 await page.locator('.HandFixedActions .Button').first().click();
 const achieve=page.getByRole('button',{name:'選択ダイスで達成',exact:true});
 await achieve.waitFor();assert(await achieve.isDisabled());
 const selected=async id=>page.evaluate(id=>({selected:window.selectionScene.selected.has(id),outline:window.selectionScene.visuals.get(id).outline.visible,
  label:window.selectionScene.visuals.get(id).label.classList.contains('state-selected')}),id);
 target=await icon();await page.mouse.click(target.x,target.y);await page.waitForTimeout(30);
 assert.deepEqual(await selected(target.id),{selected:true,outline:true,label:true});assert(await achieve.isEnabled());
 const extra=await page.evaluate(id=>{
  for(const node of document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')){
   if(node.dataset.dieId===id)continue;
   const r=node.getBoundingClientRect();
   for(const u of [.25,.5,.75])for(const v of [.25,.5,.75]){
    const x=r.left+r.width*u,y=r.top+r.height*v;
    if(document.elementFromPoint(x,y)?.closest('.DiceResult')===node)return{id:node.dataset.dieId,x,y};
   }
  }
 },target.id);assert(extra);
 await page.mouse.click(extra.x,extra.y);assert(await achieve.isDisabled());
 await page.mouse.click(extra.x,extra.y);assert(await achieve.isEnabled());
 await page.mouse.click(target.x,target.y);await page.waitForTimeout(30);assert.equal((await selected(target.id)).selected,false);assert(await achieve.isDisabled());
 await page.mouse.move(target.x,target.y);await page.mouse.down();await page.waitForTimeout(650);await page.mouse.up();
 assert.equal((await selected(target.id)).selected,false);assert.equal(await page.locator('dialog[open]').count(),0);
 await page.mouse.move(target.x,target.y);await page.mouse.down();await page.mouse.move(target.x+20,target.y+15,{steps:5});await page.mouse.up();
 assert.equal((await selected(target.id)).selected,false);
 target=await icon();await page.mouse.click(target.x,target.y);await page.waitForTimeout(30);assert(await achieve.isEnabled());
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);
 assert.equal((await selected(target.id)).selected,true);
 await page.screenshot({path:'tmp_dice_selected.png'});
 await achieve.click();await page.waitForTimeout(100);
 assert.equal(await page.evaluate(id=>window.selectionCheck.session.game.state.dice.find(d=>d.id===id).used,target.id),true);
 assert.equal((await selected(target.id)).selected,false);
 // Body tap uses the same selection path. Pick a visible canvas point to avoid overlaid icons.
 await page.setViewportSize({width:1200,height:800});await page.waitForTimeout(150);
 // Spread the display fixture apart so another floating icon cannot cover the body tap target.
 await page.evaluate(()=>window.selectionScene.group.dice.forEach((die,index)=>
  die.setPosition({x:-7+index*6,y:die.body.position.y,z:0})));
 await page.waitForTimeout(200);
 const body=await page.evaluate(()=>{
  const s=window.selectionScene,r=s.renderer.domElement.getBoundingClientRect();
  for(const d of s.group.dice.filter(d=>!d.consumed)){
   const p=s.project(d.body.position);
   for(const dy of [0,5,10,-5])for(const dx of [0,-5,5]){
    const x=r.left+p.x*r.width/s.width+dx,y=r.top+p.y*r.height/s.height+dy;
    if(document.elementFromPoint(x,y)===s.renderer.domElement)return{id:d.id,x,y};
   }
  }
 });assert(body);
 await page.mouse.click(body.x,body.y);await page.waitForTimeout(30);assert.equal((await selected(body.id)).selected,true);
 await page.touchscreen.tap(body.x,body.y);await page.waitForTimeout(30);assert.equal((await selected(body.id)).selected,false);
 assert.deepEqual(errors,[]);console.log('PASS: icon/body tap toggle, outline, achievement consumption, drag/long-press suppression, resize');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

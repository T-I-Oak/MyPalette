const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const source=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
const base=process.argv[2]||'http://127.0.0.1:3013/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const requested=process.argv.slice(3).map(Number);
 for(const count of requested.length?requested:[13,20,30]){
  const settings=structuredClone(source);
  for(const c of settings.cards)for(const s of c.steps){s.playEffects=[{type:'gainMaterialDice',material:'brush',count:count-3,lifetime:'temporary'},{type:'changeFame',amount:5}];s.achievementEffects=[];}
  const page=await browser.newPage({viewport:{width:1200,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(base,r=>r.fulfill({contentType:'text/html',body:`
  <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="toggle"></button></main>
  <script type="module">
  import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
  import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
  const root=document.querySelector('main');window.largeScreen=createLayoutScreen(root,document.querySelector('button'));
  window.largeCheck=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(window.largeScreen));
  </script>`}));
  await page.goto(base);await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
  await page.evaluate(async()=>{const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')).name;const {DiceScene}=await import(url),project=DiceScene.prototype.project;DiceScene.prototype.project=function(...args){window.largeScene=this;return project.apply(this,args);};});
  await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click();
  await page.waitForFunction(()=>window.largeCheck.session.game.state.phase==='play',null,{timeout:60000});
  const baseline=await page.evaluate(()=>window.largeScreen.areas.get('palette').layoutFrame.scale);
  await page.locator('.HandFixedActions .Button').first().click();
  await page.waitForFunction(n=>{const s=window.largeCheck.session.game.state;return s.dice.length===n&&s.fame===5&&!s.rollRequest;},count,{timeout:90000});
  await page.waitForFunction(n=>window.largeScene.visuals.size===n,count);
  assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),count);
  const dimensions=await page.evaluate(()=>{const s=window.largeScene,a=window.largeScreen.areas.get('palette');return{scale:s.group.fieldScale,image:[s.floor.scale.x,s.floor.scale.y],areaScale:a.layoutFrame.scale,logical:[a.standardWidth,a.standardHeight],dice:s.group.dice.map(d=>({current:d.current,top:d.top.index})),buttonHeight:document.querySelector('.PaletteFixedActions button').getBoundingClientRect().height};});
  assert(Math.abs(dimensions.scale-Math.sqrt(count/12))<1e-9);assert.deepEqual(dimensions.image,[dimensions.scale,dimensions.scale]);assert(dimensions.areaScale<baseline);assert.equal(dimensions.buttonHeight,36);assert(dimensions.dice.every(d=>d.current===d.top));
  if(count===30){
   const drag=await page.evaluate(async()=>{
    const {dragPosition}=await import('./src/dice/dragPosition.js');const s=window.largeScene,canvas=s.renderer.domElement.getBoundingClientRect();
    for(const node of document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')){
     const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
     if(document.elementFromPoint(x,y)?.closest('.DiceResult')!==node)continue;
     const die=s.group.get(node.dataset.dieId),before={...die.body.position};
     for(const [dx,dz] of [[4,0],[-4,0],[0,4],[0,-4]]){const target=dragPosition(s.group,die,{...before,x:before.x+dx,z:before.z+dz});
      if(Math.hypot(target.x-before.x,target.z-before.z)<.1)continue;
      const a=s.project(before),b=s.project(target);return{id:die.id,before,x,y,dx:(b.x-a.x)*canvas.width/s.width,dy:(b.y-a.y)*canvas.height/s.height};}
    }
   });assert(drag);await page.mouse.move(drag.x,drag.y);await page.mouse.down();await page.mouse.move(drag.x+drag.dx,drag.y+drag.dy,{steps:5});await page.mouse.up();
   assert(await page.evaluate(d=>{const p=window.largeScene.group.get(d.id).body.position;return Math.hypot(p.x-d.before.x,p.z-d.before.z)>.05;},drag));
  }
  const target=await page.evaluate(()=>{for(const node of [...document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))){const r=node.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(document.elementFromPoint(x,y)?.closest('.DiceResult')===node)return{id:node.dataset.dieId,x,y};}});assert(target);
  await page.mouse.click(target.x,target.y);assert(await page.getByRole('button',{name:'1つの画材を更新する',exact:true}).isEnabled());
  await page.getByRole('button',{name:'1つの画材を更新する',exact:true}).click();
  await page.waitForFunction(()=>!window.largeCheck.session.game.state.rollRequest,null,{timeout:60000});
  await page.screenshot({path:`tmp_large_palette_${count}.png`});
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>{window.largeCheck.session.game.step(window.largeCheck.session.game.state.hand[0]).playEffects=[{type:'discardDice',count:1},{type:'changeFame',amount:2}];});
  await page.locator('.HandFixedActions .Button').first().click();const dialog=page.locator('.GameChoice[open]');await dialog.waitFor();await dialog.locator('input').first().check();await dialog.getByRole('button',{name:'選択を確定'}).click();
  await page.waitForFunction(n=>window.largeScene.group.dice.length===n,count-1);
  assert.equal(await page.evaluate(()=>window.largeCheck.session.game.state.fame),7);assert.deepEqual(errors,[]);
  console.log(`PASS: ${count} dice acquire/roll/resume, scaled palette, fixed buttons, selection/reroll, narrow discard`);await page.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
for(const c of settings.cards)for(const s of c.steps){s.playEffects=[];s.achievementEffects=[];}
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR:',e.message);});
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button tabindex="-1" id="panel-toggle" class="PanelToggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
 window.achievementCheck=mountGame(root,${JSON.stringify(settings)},()=>location.reload(),createLayoutPresentation(screen));
 </script>`}));
 await page.goto(base);try { await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice')); } catch(e) { console.error(await page.locator('body').innerText()); throw e; }
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')).name;
  const {DiceScene}=await import(url),original=DiceScene.prototype.project;
  DiceScene.prototype.project=function(...args){window.achievementScene=this;return original.apply(this,args);};
 });
 const roll=page.getByRole('button',{name:'今日の仕事を始める',exact:true});
 await roll.click({force:true});await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).waitFor({timeout:60000});
 const chosen=await page.evaluate(()=>{
  const game=window.achievementCheck.session.game,ids=game.state.dice.slice(0,2).map(d=>d.id);
  const goals=game.state.dice.slice(0,2).map(d=>({...d.faces[d.current]}));
  for(const c of Object.values(game.definitions))for(const step of c.steps){step.goals=goals;step.achievementEffects=[{type:'changeFame',amount:5},{type:'gainMaterialDice',material:'brush',count:1,lifetime:'temporary'}];}
  window.achievementScene.group.dice.forEach((die,index)=>die.setPosition({x:-7+index*6,y:die.body.position.y,z:0}));
  return {ids,card:game.state.hand[0].id};
 });
 await page.locator('.HandFixedActions .Button').first().click();
 await page.waitForFunction(()=>!document.querySelector('.PlayArea').dataset.playEffect);
 for(const id of chosen.ids){
  const point=await page.locator(`.PaletteViewport .DiceResult[data-die-id="${id}"]`).boundingBox();
  await page.mouse.click(point.x+point.width/2,point.y+point.height/2);
 }
 const achieve=page.getByRole('button',{name:'選択ダイスで達成',exact:true});assert(await achieve.isEnabled());
 await page.evaluate(chosen=>{
  window.achievementSamples=[];window.achievementChosen=chosen;
  const sample=()=>{
   const g=window.achievementCheck.session.game,s=window.achievementScene;
   window.achievementSamples.push({time:performance.now(),stage:document.querySelector('.PlayArea').dataset.playEffect,
    fame:g.state.fame,painting:!!document.querySelector('[data-painting-id="'+chosen.card+'"]'),notice:!!document.querySelector('.EffectNotice'),
    step:document.querySelector('[data-painting-id="'+chosen.card+'"] [aria-current="step"]')?.textContent,
    consumed:chosen.ids.map(id=>s.group.get(id).consumed),
    flights:[...document.querySelectorAll('.AchievementMaterial')].map(n=>({id:n.dataset.dieId,stage:n.dataset.materialStage}))});
   if(!window.stopAchievementSamples)requestAnimationFrame(sample);
  };requestAnimationFrame(sample);
 },chosen);
 await achieve.click();
 await page.locator('.AchievementMaterial[data-material-stage="orbit"]').first().waitFor();
 await page.screenshot({path:'tmp_achievement_orbit.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForFunction(()=>window.achievementCheck.session.game.state.fame===5,{},{timeout:20000});
 const samples=await page.evaluate(()=>{window.stopAchievementSamples=true;return window.achievementSamples;});
 for(const stage of ['canvas','repaint','next-card'])assert(samples.some(s=>s.stage===stage),stage);
 assert(samples.filter(s=>['canvas','repaint','next-card'].includes(s.stage)).every(s=>s.fame===0));
 assert(samples.filter(s=>['canvas','repaint','next-card'].includes(s.stage)).every(s=>!s.notice));
 assert(samples.some(s=>s.stage==='next-card'&&s.step==='Step 1'));
 assert(samples.filter(s=>s.fame>0).every(s=>!s.painting));
 const first=chosen.ids.map(id=>samples.find(s=>s.flights.some(f=>f.id===id))?.time);assert(first[1]-first[0]>=100);
 for(const id of chosen.ids)for(const stage of ['outbound','orbit','inbound','absorb'])assert(samples.some(s=>s.flights.some(f=>f.id===id&&f.stage===stage)),`${id}:${stage}`);
 assert(samples.some(s=>s.consumed[0]&&!s.consumed[1]));
 assert.equal(await page.locator('.AchievementMaterial').count(),0);
 assert.equal(await page.locator(`[data-painting-id="${chosen.card}"]`).count(),0);
 await page.locator('.EffectNotice.reward').waitFor();
 assert(await page.evaluate(id=>window.achievementCheck.session.game.state.discard.some(card=>card.id===id),chosen.card));
 await page.locator('#panel-toggle').click();
 assert.equal(await page.locator(`.discard .PaintingCard[data-card-id="${chosen.card}"]`).evaluate(node=>node.closest('.GameCardSlot').hidden),false);
 await page.locator('#panel-toggle').click();
 assert.equal(await page.locator('.EffectNotice.reward .EffectBodyRow').count(),2);
 assert.equal(await page.evaluate(()=>window.achievementCheck.session.game.state.rollRequest.status),'ready');
 await page.locator('.EffectNotice.reward').waitFor({state:'detached'});
 await page.waitForFunction(()=>window.achievementCheck.session.game.state.rollRequest===null,{},{timeout:60000});
 await page.waitForFunction(()=>!document.querySelector('.PlayArea').dataset.playEffect);
 assert.equal(await page.locator(`[data-painting-id="${chosen.card}"]`).count(),0);
 // Cancel another achievement while its icon is moving, then verify a clean restart.
 const again=await page.evaluate(()=>{
  const scene=window.achievementScene,g=window.achievementCheck.session.game;
  const node=[...document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0];
  const die=g.state.dice.find(d=>d.id===node.dataset.dieId),card=g.state.hand[0];
  g.definitions[card.id].steps[card.step].goals=[{...die.faces[die.current]}];
  return die.id;
 });
 await page.locator('.HandFixedActions .Button').first().click();await page.waitForFunction(()=>!document.querySelector('.PlayArea').dataset.playEffect);
 const icon=await page.locator(`.PaletteViewport .DiceResult[data-die-id="${again}"]`).boundingBox();
 await page.mouse.click(icon.x+icon.width/2,icon.y+icon.height/2);await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).click();
 await page.locator('.AchievementMaterial').first().waitFor();
 await page.getByRole('button',{name:'入口へ戻る',exact:true}).click();
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
 assert.equal(await page.locator('.AchievementMaterial').count(),0);
 assert.equal(await page.evaluate(()=>window.achievementCheck.session.game.state.fame),0);
 assert.deepEqual(errors,[]);console.log('PASS: staggered orbit/return/absorb, delayed grayscale, next-card before effects, easel removed before effects, acquisition resume, resize');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

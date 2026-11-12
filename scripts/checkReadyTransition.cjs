const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 await page.getByRole('button',{name:'ゲーム開始',exact:true}).click();
 await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
 await page.evaluate(async()=>{
  const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname.endsWith('/dice/DiceScene.js')).name;
  const {DiceScene}=await import(url),original=DiceScene.prototype.project;
  DiceScene.prototype.project=function(...args){window.readyScene=this;return original.apply(this,args);};
 });
 const roll=page.getByRole('button',{name:'今日の仕事を始める',exact:true});
 await roll.click({force:true});await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).waitFor({timeout:60000});
 await page.waitForTimeout(1000);
 const outcome=await page.evaluate(async()=>{
  const scene=window.readyScene,die=scene.group.dice[0],id=die.id;
  const before={y:die.body.position.y,q:{...die.body.quaternion}};
  const others=JSON.stringify(scene.group.dice.slice(1).map(d=>[d.body.position,d.body.quaternion,d.current]));
  const result=scene.visuals.get(id).result;
  // Select just this die through the normal pointer path on the result.
  const r=result.getBoundingClientRect();
  return {id,before,others,x:r.left+r.width/2,y:r.top+r.height/2};
 });
 // Use the all operation to avoid relying on icon overlap for selecting a single target.
 await page.evaluate(()=>{
  window.readySamples=[];
  const sample=()=>{
   const scene=window.readyScene,die=scene.group.dice[0],v=scene.visuals.get(die.id);
   window.readySamples.push({y:die.body.position.y,preparing:!!die.readyMotion,elapsed:die.readyMotion?.elapsed,
    returning:v.result.classList.contains('state-returning'),hidden:v.result.hidden,opacity:Number(getComputedStyle(v.result).opacity),
    locked:document.querySelector('[data-game-end-day]')?.disabled,state:die.state});
   if(!window.stopReadySamples)requestAnimationFrame(sample);
  };requestAnimationFrame(sample);
 });
 await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).click();
 await page.waitForFunction(()=>window.readyScene.group.rolling && window.readySamples.some(s=>s.preparing));
 const samples=await page.evaluate(()=>{window.stopReadySamples=true;return window.readySamples;});
 const returning=samples.filter(s=>s.returning);assert(returning.length>1);
 assert(returning.every(s=>!s.hidden&&s.locked));
 assert(returning.at(-1).opacity<returning[0].opacity);
 const lifting=samples.filter(s=>s.preparing&&!s.returning);assert(lifting.some(s=>s.y>outcome.before.y+.1&&s.y<4.5));
 assert(lifting.every(s=>s.hidden&&s.locked));
 assert(samples.some(s=>s.preparing&&s.y>4.3));
 await page.screenshot({path:'tmp_palette_ready_lift.png'});
 await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).waitFor({timeout:60000});
 assert.deepEqual(errors,[]);console.log('PASS: icon return, delayed lift, increased ready height, start lock, physical reroll');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

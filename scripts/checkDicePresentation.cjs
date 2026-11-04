const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/#dice');await page.locator('.DiceLabId').first().waitFor();assert.equal(await page.locator('.DiceLabId').count(),3);
 await page.getByRole('button',{name:'使う画材を決める',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.texture-primary').disabled,null,{timeout:60000});
 assert.equal(await page.locator('.DiceResult:not([hidden])').count(),3);
 await page.getByRole('button',{name:'消費済みにする',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.DiceResult:not([hidden])').length===2);
 await page.getByRole('button',{name:'未消費に戻す',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.DiceResult:not([hidden])').length===3);
 const result=await page.evaluate(async()=>{
  const {DiceScene}=await import('/src/dice/DiceScene.js');const {DiceGroup}=await import('/src/dice/DiceGroup.js');const {loadResultGraphics}=await import('/src/dice/resultGraphics.js');
  const container=document.createElement('div');container.style.width=innerWidth+'px';container.style.height=Math.round(innerHeight*.6)+'px';document.body.append(container);
  const group=new DiceGroup();const die=group.add({id:'standalone',faces:Array.from({length:6},()=>({special:'fame1'}))});
  const scene=new DiceScene(container,group,await loadResultGraphics(),()=>{});let latest=[];const unsubscribe=scene.subscribeScreenPositions(items=>latest=items);
  const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  await die.roll();await frame();const before=JSON.stringify(die.result);const shown=!container.querySelector('.DiceResult').hidden;
  die.setConsumed(true);await frame();const hidden=container.querySelector('.DiceResult').hidden;
  die.setConsumed(false);await frame();const restored=!container.querySelector('.DiceResult').hidden&&JSON.stringify(die.result)===before;
  die.setPosition({x:0,y:.5,z:0});await frame();const projected=scene.project({x:die.body.position.x,y:die.body.position.y-.35,z:die.body.position.z});
  const tracks=latest[0].id===die.id&&Math.abs(latest[0].x-projected.x)<.01&&Math.abs(latest[0].y-projected.y)<.01;
  const noId=!container.querySelector('.DiceId,.DiceLabId');scene.dispose();const cleared=latest.length===0;unsubscribe();container.remove();
  return {shown,hidden,restored,tracks,noId,cleared};
 });for(const value of Object.values(result))assert.equal(value,true);assert.deepEqual(errors,[]);console.log(JSON.stringify({result,errors}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

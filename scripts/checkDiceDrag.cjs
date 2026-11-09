const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);
  await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).waitFor();await page.waitForFunction(()=>!!document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
  await page.evaluate(async()=>{
   const loaded=performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname.endsWith('/dice/DiceScene.js'));
   const {DiceScene}=await import(loaded.name);
   const original=DiceScene.prototype.project;
   DiceScene.prototype.project=function(...args){window.dragScene=this;return original.apply(this,args);};
  });
  await page.waitForFunction(()=>!!window.dragScene);
  const point=async id=>page.evaluate(id=>{
   const scene=window.dragScene,die=scene.group.get(id),p=scene.project(die.body.position),r=scene.renderer.domElement.getBoundingClientRect();
   return {x:r.left+p.x*r.width/scene.width,y:r.top+p.y*r.height/scene.height};
  },id);
  const position=async id=>page.evaluate(id=>({...window.dragScene.group.get(id).body.position}),id);
  const ids=await page.evaluate(()=>window.dragScene.group.dice.map(d=>d.id));
  const id=ids[0],start=await position(id),p=await point(id);
  await page.mouse.move(p.x,p.y);await page.mouse.down();
  assert.equal(await page.locator('.PaletteViewport.state-dragging').count(),1);
  await page.mouse.move(p.x-60,p.y+25,{steps:10});await page.mouse.up();
  const moved=await position(id);assert(Math.hypot(moved.x-start.x,moved.z-start.z)>.1);
  assert.equal(moved.y,start.y);
  // Pointer capture keeps the drag active outside the area; the field still clamps it.
  const edge=await point(id);await page.mouse.move(edge.x,edge.y);await page.mouse.down();
  await page.mouse.move(-500,-500,{steps:4});await page.mouse.up();
  assert(await page.evaluate(async id=>{
   const {fieldContains}=await import('/MyPalette/src/dice/field.js');return fieldContains(window.dragScene.group.get(id).body.position,1.79);
  },id));
  await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
  const during=await point(ids[1]);await page.mouse.move(during.x,during.y);await page.mouse.down();
  assert.equal(await page.locator('.PaletteViewport.state-dragging').count(),0);await page.mouse.up();
  await page.waitForFunction(()=>{const b=document.querySelector('[data-game-end-day]');return b&&b.textContent==='今日の仕事を終える'&&!b.disabled;},null,{timeout:60000});
  await page.waitForTimeout(800);
  for(const [width,height] of [[1200,800],[390,844]]) {
   await page.setViewportSize({width,height});await page.waitForTimeout(200);
   const bottomGap=await page.evaluate(async()=>{
    const {FIELD_DEPTH}=await import('/MyPalette/src/dice/field.js');
    const s=window.dragScene;return s.height-s.project({x:0,y:0,z:FIELD_DEPTH/2}).y;
   });assert(Math.abs(bottomGap-8)<.01,`palette bottom gap: ${bottomGap}`);
   // Use the foremost result so an overlapping result cannot intercept the pointer.
   const icon=await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex));
    const node=nodes[0],r=node.getBoundingClientRect();return {id:node.dataset.dieId,x:r.left+r.width/2,y:r.top+r.height/2};
   });
   const before=await position(icon.id);
   const face=await page.evaluate(id=>window.dragScene.group.get(id).current,icon.id);
   await page.mouse.move(icon.x,icon.y);await page.mouse.down();
   assert.equal(await page.locator('.PaletteViewport.state-dragging').count(),1);
   await page.mouse.move(icon.x-50,icon.y+25,{steps:8});await page.mouse.up();
   const after=await position(icon.id);assert(Math.hypot(after.x-before.x,after.z-before.z)>.05);
   assert.equal(await page.evaluate(id=>window.dragScene.group.get(id).current,icon.id),face);
  }
  const touch=await page.evaluate(async()=>{
   const scene=window.dragScene;
   const nodes=[...document.querySelectorAll('.PaletteViewport .DiceResult:not([hidden])')].sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex));
   const node=nodes[0],die=scene.group.get(node.dataset.dieId),r=node.getBoundingClientRect(),canvas=scene.renderer.domElement.getBoundingClientRect();
   const {dragPosition}=await import('/MyPalette/src/dice/dragPosition.js');
   for(const [dx,dz] of [[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2]]) {
    const target=dragPosition(scene.group,die,{x:die.body.position.x+dx,y:die.body.position.y,z:die.body.position.z+dz});
    if(Math.hypot(target.x-die.body.position.x,target.z-die.body.position.z)<.1)continue;
    const a=scene.project(die.body.position),b=scene.project(target);
    return {id:die.id,x:r.left+r.width/2,y:r.top+r.height/2,dx:(b.x-a.x)*canvas.width/scene.width,dy:(b.y-a.y)*canvas.height/scene.height};
   }
  });
  assert(touch);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
  const beforeTouch=await position(touch.id);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:touch.x,y:touch.y,id:0}]});
  assert.equal(await page.locator('.PaletteViewport.state-dragging').count(),1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:touch.x+touch.dx,y:touch.y+touch.dy,id:0}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const afterTouch=await position(touch.id);assert(Math.hypot(afterTouch.x-beforeTouch.x,afterTouch.z-beforeTouch.z)>.05);
  assert.deepEqual(errors,[]);console.log('PASS: ready body drag, bounds, global roll lock, floating icon drag, A/B, face preserved, touch drag');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

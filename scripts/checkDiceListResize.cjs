const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {diceListReviewFixture}=require('./diceListReviewFixture.cjs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try {for(const width of [1200,390]) {
  const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce',hasTouch:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:3000/MyPalette/';
  await page.route(base,r=>r.fulfill({contentType:'text/html',body:diceListReviewFixture()}));
  await page.goto(base);
  const ready=()=>page.waitForFunction(()=>window.review?.session.game.state.phase==='play'&&!review.session.game.state.rollRequest,null,{timeout:60000});
  await ready();await page.locator('#many').click();await page.locator('.DiceListOpen').click();
  const panel=page.locator('.DiceList');
  const initial=await panel.boundingBox();assert(initial.height<=844*.6+1);
  const drag=async(axis,dx,dy)=>{
   const r=await page.locator('.DiceListResize.'+axis).boundingBox();
   await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();
   await page.mouse.move(r.x+r.width/2+dx,r.y+r.height/2+dy,{steps:8});await page.mouse.up();
  };
  const face=()=>page.locator('.DiceListFace').first().boundingBox();
  const firstFace=await face();await drag('s',0,-180);
  const short=await panel.boundingBox();assert(short.height<initial.height-100);
  assert(Math.abs((await face()).width-firstFace.width)<1);
  await drag('e',-1000,0);
  const small=await panel.boundingBox();assert(Math.abs(small.width-Math.min(300,width*.4))<2);
  assert((await face()).width<firstFace.width);assert(Math.abs(small.height-short.height)<2);
  const overflow=await page.locator('.DiceListScroll').evaluate(n=>({width:n.clientWidth,scroll:n.scrollWidth,height:n.clientHeight,total:n.scrollHeight}));
  assert(overflow.scroll<=overflow.width+1);assert(overflow.total>overflow.height);
  await panel.screenshot({path:`tmp_dice_list_resize_${width}_small.png`});
  await page.locator('.DiceListClose').click();await page.locator('.DiceListOpen').click();assert.deepEqual(await panel.boundingBox(),small);
  await drag('se',120,100);
  const large=await panel.boundingBox();assert(large.width>small.width+10&&large.height>small.height+10);
  await panel.screenshot({path:`tmp_dice_list_resize_${width}.png`});
  const saved=await page.evaluate(()=>localStorage.getItem('MyPalette'));
  await page.reload();await ready();await page.locator('.DiceListOpen').click();
  assert.deepEqual(await panel.boundingBox(),large,'reload restores persisted size and position');
  await page.locator('#many').click();assert.deepEqual(await panel.boundingBox(),large,'more dice do not grow resized window');
  for(const scale of [.7,1.25,1]) {
   await page.evaluate(s=>reviewScreen.setFixedScale(s),scale);
   const rect=await panel.boundingBox();assert(Math.abs(rect.width-large.width)<1&&Math.abs(rect.height-large.height)<1);
   const content=await page.locator('.DiceListScroll').evaluate(n=>({width:n.clientWidth,total:n.scrollWidth}));assert(content.total<=content.width+1);
  }
  const heading=await page.locator('.DiceListHeading').boundingBox();
  await page.mouse.move(heading.x+10,heading.y+10);await page.mouse.down();await page.mouse.move(30,120,{steps:5});await page.mouse.up();
  const moved=await panel.boundingBox();assert(moved.x<large.x||moved.y<large.y);
  const savedMoved=await page.evaluate(()=>localStorage.getItem('MyPalette'));assert.notEqual(savedMoved,saved);
  assert.equal(await page.locator('.DiceListResize > span').count(),2,'only the bottom right has a visible mark');
  for(const direction of ['n','e','s','w','ne','se','sw','nw']) {
   const before=await panel.boundingBox();
   const dx=direction.includes('w')?12:direction.includes('e')?-12:0;
   const dy=direction.includes('n')?12:direction.includes('s')?-12:0;
   await drag(direction,dx,dy);const after=await panel.boundingBox();
   const near=(actual,expected)=>assert(Math.abs(actual-expected)<1,`${direction}: ${actual} != ${expected}`);
   near(after.width,before.width-Math.abs(dx));near(after.height,before.height-Math.abs(dy));
   near(after.x+(direction.includes('w')?after.width:0),before.x+(direction.includes('w')?before.width:0));
   near(after.y+(direction.includes('n')?after.height:0),before.y+(direction.includes('n')?before.height:0));
   await drag(direction,-dx,-dy);
  }
  const savedAfterEdges=await page.evaluate(()=>localStorage.getItem('MyPalette'));
  await page.setViewportSize({width:320,height:480});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const fitted=await panel.boundingBox();assert(fitted.x>=0&&fitted.y>=0&&fitted.x+fitted.width<=321&&fitted.y+fitted.height<=481);
  assert.equal(await page.evaluate(()=>localStorage.getItem('MyPalette')),savedAfterEdges,'automatic correction does not overwrite preference');
  await page.setViewportSize({width,height:844});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.deepEqual(await panel.boundingBox(),moved);
  const cdp=await page.context().newCDPSession(page),grip=await page.locator('.DiceListResize.s').boundingBox();
  const x=grip.x+grip.width/2,y=grip.y+grip.height/2;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-40}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert((await panel.boundingBox()).height<moved.height-20,'touch resizes height');
  assert.deepEqual(errors,[]);console.log(`PASS ${width}: resize, scale, min width, touch, persistence, position and viewport correction`);
  await page.close();
 }} finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

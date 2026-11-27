const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/tmp_dice_list_review.html?review=scroll';
(async()=>{
 const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL||'chrome',headless:true});
 try {
  for(const width of [1200,390]) {
   const page=await browser.newPage({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);
   await page.waitForFunction(()=>document.querySelectorAll('.DiceListRow').length===30&&!document.querySelector('.DiceList').hidden,null,{timeout:60000});
   const scroll=page.locator('.DiceListScroll'),rail=page.locator('.ScrollBar'),thumb=page.locator('.ScrollThumb');
   const panel=page.locator('.DiceList'),status=page.locator('.ReviewTools output');
   assert.equal(await scroll.evaluate(n=>getComputedStyle(n).scrollbarWidth),'none');
   for(const scale of [.7,1.25]) {
    await page.evaluate(async scale=>{reviewScreen.setFixedScale(scale);document.querySelector('.DiceListScroll').scrollTop=0;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},scale);
    assert.equal(await rail.evaluate(n=>n.classList.contains('state-inactive')),false);
    const box=await panel.boundingBox(),r=await rail.boundingBox(),t=await thumb.boundingBox();
    await page.mouse.move(t.x+t.width/2,t.y+t.height/2);await page.mouse.down();
    await page.mouse.move(t.x+t.width/2,r.y+r.height+20,{steps:8});await page.mouse.up();
    await page.waitForFunction(()=>document.querySelector('.ReviewTools output').textContent.includes('末尾'));
    assert.deepEqual(await panel.boundingBox(),box,'scrollbar drag must not move the dialog');
    await page.mouse.click(r.x+r.width/2,r.y+1);
    await page.waitForFunction(()=>document.querySelector('.DiceListScroll').scrollTop===0);
   }
   await page.screenshot({path:`tmp_dice_list_scrollbar_${width}.png`});
   await rail.hover();await page.mouse.wheel(0,180);await page.waitForFunction(()=>document.querySelector('.DiceListScroll').scrollTop>0);
   await scroll.evaluate(n=>{n.scrollTop=0;});
   const area=await scroll.boundingBox(),cdp=await page.context().newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:area.x+area.width/2,y:area.y+area.height-20}]});
   for(let i=1;i<=4;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:area.x+area.width/2,y:area.y+area.height-20-i*25}]});await page.waitForTimeout(35);}
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await page.waitForFunction(()=>document.querySelector('.DiceListScroll').scrollTop>0);
   await page.locator('#empty').click();await page.waitForFunction(()=>document.querySelector('.ScrollBar').classList.contains('state-inactive'));
   assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}: custom thumb drag, track click, wheel, touch, scaled positions, no native scrollbar, empty list`);
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

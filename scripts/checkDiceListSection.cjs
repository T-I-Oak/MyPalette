const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {diceListReviewFixture}=require('./diceListReviewFixture.cjs');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';

(async()=>{
 const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL||'msedge',headless:true});
 try {
  for(const width of [1200,390]) {
   const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.route(base,route=>route.fulfill({contentType:'text/html',body:diceListReviewFixture()}));
   await page.goto(base);
   await page.waitForFunction(()=>window.review?.session.game.state.phase==='play'&&!review.session.game.state.rollRequest,null,{timeout:60000});
   await page.locator('.DiceListOpen').click();
   const snapshot=()=>page.evaluate(()=>{
    const rect=node=>{const r=node.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
    const scroll=document.querySelector('.DiceListScroll');
    return {
     bounds:[...document.querySelectorAll('.DiceList,.DiceListHeading,.DiceListSection,.DiceListRow,.DiceListVisual,.DiceListFace')].map(rect),
     scroll:[scroll.clientWidth,scroll.clientHeight,scroll.scrollWidth,scroll.scrollHeight,scroll.scrollTop],
    };
   });
   for(const count of [3,30,0]) {
    if(count===30)await page.locator('#many').click();
    if(count===0)await page.locator('#empty').click();
    assert.equal(await page.locator('.DiceListSection .DiceListRow').count(),count);
    for(const scale of [.7,1,1.25]) {
     await page.evaluate(async scale=>{reviewScreen.setFixedScale(scale);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},scale);
     if(count===30)await page.locator('.DiceListScroll').evaluate(node=>{node.scrollTop=300;});
     const before=await snapshot();
     await page.locator('#section-frame').click();
     assert.equal(await page.locator('#section-frame').getAttribute('aria-pressed'),'true');
     assert.deepEqual(await snapshot(),before,`frame changes geometry at ${width}px / ${scale} / ${count} dice`);
     if(count===3&&scale===1)await page.locator('.DiceList').screenshot({path:`tmp_dice_list_section_${width}_framed.png`});
     await page.locator('#section-frame').click();
     assert.equal(await page.locator('#section-frame').getAttribute('aria-pressed'),'false');
     assert.deepEqual(await snapshot(),before,`hiding frame changes geometry at ${width}px / ${scale} / ${count} dice`);
     if(count===3&&scale===1)await page.locator('.DiceList').screenshot({path:`tmp_dice_list_section_${width}_plain.png`});
    }
   }
   assert.deepEqual(errors,[]);await page.close();
   console.log(`PASS ${width}px: section frame preserves dialog, rows, faces and scroll geometry at .7/1/1.25 scales with 3/30/0 dice`);
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

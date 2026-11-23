const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const version=require('../package.json').version;
(async()=>{
 const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL||'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:850},reducedMotion:'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]||'http://127.0.0.1:3002/MyPalette/tmp_board_motion_review.html');
  await page.waitForFunction(()=>document.querySelector('#status').textContent==='準備完了',null,{timeout:60000});
  assert.ok(await page.title().then(t=>t.includes(version)));
  for(const open of [false,true]){
   if(open){await page.locator('#panel-toggle').click();await page.waitForTimeout(300);}
   for(const id of ['stock','recycle']){
    await page.locator('#'+id).click();
    await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('完了'),null,{timeout:30000});
    assert.equal(await page.locator('[data-scene-card]').count(),45);
   }
  }
  await page.locator('#wide').click();
  await page.locator('#stock').click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('完了'),null,{timeout:30000});
  assert.deepEqual(errors,[]);console.log('board motion review: startup, closed/open stock and recycle, A, version, 45 cards passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

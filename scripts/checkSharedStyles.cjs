const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=process.argv[2]||'http://127.0.0.1:5174/';const results=[];
  for(const hash of ['#settings','#dice']){
   await page.goto(base+hash);await page.reload();await page.locator(hash==='#dice'?'.DiceRow':'.CardDetail').first().waitFor({state:'attached'});
   const result=await page.evaluate(()=>{
    const surfaces=[...document.querySelectorAll('.texture-paper')];
    const colors=surfaces.map(el=>getComputedStyle(el).backgroundColor);
    const radii=surfaces.map(el=>getComputedStyle(el).borderRadius);
    document.body.style.setProperty('--ui-surface','rgb(210, 220, 230)');
    const changed=surfaces.map(el=>getComputedStyle(el).backgroundColor);
    document.body.style.removeProperty('--ui-surface');
    const row=document.querySelector('.DiceRow');
    return {colors,radii,changed,row:row&&getComputedStyle(row).backgroundColor,old:document.querySelectorAll('[class*="texture-dice-"]').length};
   });
   assert(result.colors.length>0);assert(result.colors.every(x=>x==='rgb(255, 253, 247)'));
   assert(result.radii.every(x=>['8px','4px'].includes(x)));assert(result.changed.every(x=>x==='rgb(210, 220, 230)'));assert.equal(result.old,0);
   if(hash==='#dice')assert.equal(result.row,'rgb(244, 246, 239)');
   results.push({hash,...result});
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({results,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

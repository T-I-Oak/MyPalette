const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:4173/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const runs=[];
 for(let i=0;i<3;i++){
  const context=await browser.newContext({viewport:{width:1200,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base);
  const start=page.getByRole('button',{name:'今日の仕事を始める',exact:true});await start.waitFor();
  await page.waitForFunction(()=>document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
  const readyMs=await page.evaluate(()=>performance.now());
  assert.equal(await page.locator('.HandArea .PaintingCard').count(),0);
  assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),0);
  await start.click({force:true});
  await page.waitForFunction(()=>{const b=[...document.querySelectorAll('.PaletteFixedActions button')].find(n=>n.textContent==='すべての画材を更新する');return b&&!b.disabled;},null,{timeout:60000});
  assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),3);
  const metrics=await page.evaluate(()=>({settledMs:performance.now(),javascript:performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.endsWith('.js')).map(e=>({file:new URL(e.name).pathname.split('/').at(-1),bytes:e.encodedBodySize}))}));
  runs.push({readyMs:Math.round(readyMs),...metrics});
  if(i===0){
   await page.setViewportSize({width:390,height:844});assert(await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).isEnabled());
   await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
   await start.waitFor();assert.equal(await page.locator('.HandArea .PaintingCard').count(),0);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync('tmp_production_startup_runs.json',JSON.stringify(runs,null,2));
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base+'dev.html#dice');await page.getByRole('button',{name:'カード設定を開く',exact:true}).waitFor();
 assert.equal(await page.locator('.DiceLab').count(),0);assert.equal(await page.getByRole('button',{name:'ダイス動作確認を開く',exact:true}).count(),0);
 assert.equal(await page.getByRole('button',{name:'ゲームを始める',exact:true}).count(),0);
 assert.equal(await page.locator('.GameMenu button').count(),2);
 await page.goto('about:blank');await page.goto(base+'dev.html#easel');await page.getByRole('button',{name:'カード設定を開く',exact:true}).waitFor();
 assert.equal(await page.locator('.EaselLab').count(),0);assert.equal(await page.getByRole('button',{name:'イーゼル確認を開く',exact:true}).count(),0);
 await page.goto('about:blank');await page.goto(base+'dev.html#icons');await page.locator('#editor canvas').first().waitFor();
 assert.deepEqual(errors,[]);
 const report={conditions:{browser:browser.version(),viewport:'1200x900',deviceScaleFactor:1,cache:'fresh browser context per run',network:'localhost preview, no throttling',reducedMotion:true},runs};
 fs.writeFileSync('tmp_production_startup.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 console.log('PASS: production game startup, physical roll, narrow next-day gate, developer icons, removed dice/easel labs');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

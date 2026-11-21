const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {version}=require('../package.json');
const base=process.argv[2]||'http://127.0.0.1:4173/MyPalette/';
const startTitle=page=>page.getByRole('button',{name:'ゲーム開始',exact:true});
const startDay=page=>page.getByRole('button',{name:'今日の仕事を始める',exact:true});
const endDay=page=>page.getByRole('button',{name:'今日の仕事を終える',exact:true});
const titleGeometry=page=>page.locator('.TitleMenuButton').evaluate(async button=>{
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 return [button,button.querySelector('.TitleFrame'),button.querySelector('.TitlePlaque')]
  .map(node=>node.getBoundingClientRect().toJSON());
});
const waitForRoll=page=>page.waitForFunction(()=>{
 const button=[...document.querySelectorAll('.PaletteFixedActions button')].find(node=>node.textContent==='すべての画材を更新する');
 return button&&!button.disabled;
},null,{timeout:60000});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const runs=[];
 for(let i=0;i<4;i++){
  const viewport=i===1?{width:390,height:844}:{width:1200,height:900};
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(base);
  await page.getByRole('heading',{name:'My Palette',exact:true}).waitFor();
  assert.equal(await page.locator('.TitleMetadata').textContent(),`© T.I.OAK 2026 | GameWorks OAKv${version}`);
  assert.equal(await page.getByRole('link',{name:'GameWorks OAK',exact:true}).getAttribute('href'),'https://t-i-oak.github.io/GameWorksOAK/');
  assert.equal(await startDay(page).count(),0);
  const before=await titleGeometry(page);
  if(i<2 || i===3){
   let release;
   const waiting=new Promise(resolve=>{release=resolve;});
   await page.route('**/data/cards.json',async route=>{
    await waiting;
    if(i===0)await route.fulfill({body:'{}'});
    else if(i===3){const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));settings.cards[0].steps[0].goals=[];await route.fulfill({body:JSON.stringify(settings)});}
    else await route.continue();
   },{times:1});
   try {
    await startTitle(page).click();
    await page.getByText('ゲームの準備をしています…',{exact:true}).waitFor();
    assert.ok(await startTitle(page).isDisabled());
    assert.deepEqual(await titleGeometry(page),before);
   } finally {
    release();
   }
  }else await startTitle(page).click();
  if(i===0 || i===3){
   const retry=startTitle(page);
   await page.getByRole('status').filter({hasText:'ゲームを開始できませんでした。'}).waitFor();
   await retry.waitFor();
   assert.match(await page.getByRole('status').textContent(),/ゲームを開始できませんでした。/);
   assert.match(await page.getByRole('status').textContent(),/「ゲーム開始」を押して、もう一度お試しください。/);
   assert.ok(await page.getByRole('heading',{name:'My Palette',exact:true}).isVisible());
   assert.equal(await startDay(page).count(),0);
   assert.doesNotMatch(await page.getByRole('status').textContent(),/提供元|お知らせください/);
   assert.doesNotMatch(await page.getByRole('status').textContent(),/cards|配列|ステップ|制作途中/);
   assert.equal(await page.getByRole('button',{name:'再読み込み',exact:true}).count(),0);
   const retryGeometry=await titleGeometry(page);
   assert.deepEqual(retryGeometry,before);
   assert.equal(retryGeometry[1].width / retryGeometry[1].height > 1, true);
   assert.ok(await page.locator('.TitlePlaque').evaluate(node=>node.scrollWidth<=node.clientWidth), 'retry label must fit its plaque');
   assert.ok(retryGeometry.every(rect=>rect.left>=0&&rect.top>=0&&rect.right<=viewport.width&&rect.bottom<=viewport.height), 'retry button must remain within viewport');
   await retry.click();
  }
  const start=startDay(page);await start.waitFor();
  assert.equal(await page.locator('.StartIssues').count(),0);
  assert.equal(await page.getByRole('button',{name:'入口へ戻る',exact:true}).count(),0);
  assert.equal(await page.locator('.LayoutScreen').getAttribute('data-layout'),i===1?'B':'A');
  await page.waitForFunction(()=>document.querySelector('.PaletteViewport > canvas')&&!document.querySelector('.PaletteNotice'));
  const readyMs=await page.evaluate(()=>performance.now());
  assert.equal(await page.locator('[data-scene-area=hand] .PaintingCard').count(),0);
  assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),0);
  await start.click({force:true});
  await waitForRoll(page);
  assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),3);
  const metrics=await page.evaluate(()=>({settledMs:performance.now(),javascript:performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname.endsWith('.js')).map(e=>({file:new URL(e.name).pathname.split('/').at(-1),bytes:e.encodedBodySize}))}));
  runs.push({viewport,readyMs:Math.round(readyMs),...metrics});
  if(i<2){
   await endDay(page).click();
   await start.waitFor();
   assert.match(await page.locator('.InfoDay').textContent(),/Day 2/);
   assert.equal(await page.locator('[data-scene-area=hand] .PaintingCard').count(),0);
   const result=page.getByRole('heading',{name:'ゲーム終了',exact:true});
   for(let day=2;day<=3;day++){
    await start.click({force:true});
    await waitForRoll(page);
    await endDay(page).click();
    await start.or(result).waitFor();
    if(await result.isVisible())break;
   }
   assert.ok(await result.isVisible());
   await page.getByRole('button',{name:'タイトルへ戻る',exact:true}).click();
   await startTitle(page).click();
   await start.waitFor();
   assert.match(await page.locator('.InfoDay').textContent(),/Day 1/);
   assert.equal(await page.locator('[data-scene-area=hand] .PaintingCard').count(),0);
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 fs.writeFileSync('tmp_production_startup_runs.json',JSON.stringify(runs,null,2));
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base+'dev.html#dice');await page.getByRole('button',{name:'カード設定を開く',exact:true}).waitFor();
 assert.equal(await page.locator('.DiceLab').count(),0);assert.equal(await page.getByRole('button',{name:'ダイス動作確認を開く',exact:true}).count(),0);
 assert.equal(await page.getByRole('button',{name:'ゲーム開始',exact:true}).count(),0);
 assert.equal(await page.locator('.GameMenu button').count(),2);
 await page.goto('about:blank');await page.goto(base+'dev.html#easel');await page.getByRole('button',{name:'カード設定を開く',exact:true}).waitFor();
 assert.equal(await page.locator('.EaselLab').count(),0);assert.equal(await page.getByRole('button',{name:'イーゼル確認を開く',exact:true}).count(),0);
 await page.goto('about:blank');await page.goto(base+'dev.html#icons');await page.locator('#editor canvas').first().waitFor();
 assert.deepEqual(errors,[]);
 const report={conditions:{browser:browser.version(),deviceScaleFactor:1,cache:'fresh browser context per run',network:'localhost preview, no throttling',reducedMotion:true},runs};
 fs.writeFileSync('tmp_production_startup.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 console.log('PASS: stable title while loading, settings retry, day progression and restart in layouts A/B, developer tools');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

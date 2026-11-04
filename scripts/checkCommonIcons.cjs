const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1150,height:850}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.argv[2]||'http://127.0.0.1:5174/')+'?icon=color-orange#icons');
  await page.getByRole('heading',{name:'面の色変更：橙',exact:true}).waitFor();
  const results=await page.evaluate(async()=>{
   const {ICON_REVIEW_CASES}=await import('/src/icons/reviewCases.js');
   const {effectIconCanvas,goalIconCanvas}=await import('/src/icons/render.js');
   const {faceCanvas}=await import('/src/dice/icons.js');
   const {SPECIAL_FACE_EFFECTS}=await import('/src/effectCatalog.js');
   const {specialSymbol}=await import('/src/icons/symbols.js');
   const oldFill=CanvasRenderingContext2D.prototype.fillText,oldStroke=CanvasRenderingContext2D.prototype.strokeText;
   CanvasRenderingContext2D.prototype.fillText=CanvasRenderingContext2D.prototype.strokeText=()=>{throw new Error('Font dependency');};
   let rendered=0;const empty=[];const clipped=[];
   try{
    for(const item of ICON_REVIEW_CASES)for(const size of [32,128,256]){
     const canvas=item.effect?effectIconCanvas(item.effect,size):goalIconCanvas(item.condition,size);
     const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
     if(!data.some((v,i)=>i%4===3&&v>0))empty.push(item.id);
     if(size===256){
      let edge=false;
      for(let x=0;x<canvas.width;x++)if(data[x*4+3]||data[((canvas.height-1)*canvas.width+x)*4+3])edge=true;
      for(let y=0;y<canvas.height;y++)if(data[(y*canvas.width)*4+3]||data[(y*canvas.width+canvas.width-1)*4+3])edge=true;
      if(edge)clipped.push(item.id);
     }
     rendered++;
    }
    for(const special of Object.keys(SPECIAL_FACE_EFFECTS)){faceCanvas({special},'permanent',128);}
   }finally{CanvasRenderingContext2D.prototype.fillText=oldFill;CanvasRenderingContext2D.prototype.strokeText=oldStroke;}
   return {rendered,empty,clipped,cases:ICON_REVIEW_CASES.length};
  });
  assert.deepEqual(results.empty,[]);assert.deepEqual(results.clipped,[]);assert.deepEqual(errors,[]);
  await page.locator('.IconLab').screenshot({path:'tmp_review_card_color_orange.png'});
  const kind=page.getByLabel('アイコンの種類',{exact:true});
  await kind.selectOption('color-yellow');await page.getByRole('heading',{name:'面の色変更：黄',exact:true}).waitFor();
  await page.getByRole('button',{name:'次のアイコン',exact:true}).click();await page.getByRole('heading',{name:'面の色変更：緑',exact:true}).waitFor();
  await page.getByRole('button',{name:'前のアイコン',exact:true}).click();await page.getByRole('heading',{name:'面の色変更：黄',exact:true}).waitFor();
  await kind.selectOption('draw-1');const quantity=page.getByLabel('数量',{exact:true});await quantity.fill('3');
  assert.equal(await page.locator('.IconComparisons canvas').count(),6);
  await quantity.fill('0');assert.equal(await page.locator('.IconComparisons canvas').count(),0);
  await quantity.fill('10');assert.equal(await page.locator('.IconComparisons canvas').count(),6);
  await kind.selectOption('fame--10');await page.getByLabel('増減値',{exact:true}).fill('-8');
  assert.equal(await page.locator('.IconComparisons canvas').count(),6);
  await kind.selectOption('reroll');assert.equal(await page.locator('.IconLab input[type=number]').isVisible(),false);
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log(JSON.stringify({...results,errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
for(const c of settings.cards)for(const s of c.steps){s.playEffects=[];s.achievementEffects=[];s.goals=[{material:'brush',color:null}];}
const base=process.argv[2]||'http://127.0.0.1:3007/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.route(base,r=>r.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="toggle"></button></main>
 <script type="module">

 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main');window.screenCheck=createLayoutScreen(root,document.querySelector('button'));
 window.check=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(window.screenCheck));
 const g=window.check.session.game;g.state.field=['A01','A02','A03','A04'].map(id=>({id,step:2}));
 for(const d of g.state.dice)d.faces=Array.from({length:6},()=>({material:'brush',color:'orange'}));
 </script>`}));
 await page.goto(base);await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
 await page.waitForFunction(()=>window.check.session.game.state.phase==='play',{},{timeout:60000});
 assert.equal(await page.locator('.PlayPainting').count(),4);
 for(let i=0;i<2;i++){
  const icons=page.locator('.PaletteViewport .DiceResult:not([hidden])');const box=await icons.first().boundingBox();
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click();
  await page.waitForFunction(()=>document.querySelector('.PlayArea').dataset.playEffect==='repaint');
  await page.waitForTimeout(900);await page.screenshot({path:`tmp_consecutive_${4-i}_repaint.png`});
  await page.waitForFunction(()=>document.querySelector('.PlayArea').dataset.playEffect==='next-card');
  const preview=page.locator('.PlayPainting[data-effect="next-card"]');
  assert.equal(await preview.locator('[aria-current="step"]').textContent(),'Done');
  assert.equal(await preview.locator('[role="tab"][aria-selected="true"]').textContent(),'Done');
  assert.equal(await preview.locator('.PaintingAtelierSignature').textContent(),'Atelier My Palette');
  const signature=await preview.locator('.PaintingAtelierLabel').evaluate(n=>({size:parseFloat(getComputedStyle(n).fontSize),parent:parseFloat(getComputedStyle(n.parentElement).fontSize),align:getComputedStyle(n).verticalAlign}));
  assert.equal(signature.size/signature.parent,.75);assert.equal(signature.align,'top');
  await page.waitForFunction(()=>!document.querySelector('.PlayArea').dataset.playEffect,{},{timeout:20000});
  assert.equal(await page.locator('.PlayPainting').count(),3-i);
 }
 assert.deepEqual(errors,[]);console.log('PASS: 4→3→2 consecutive achievements');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
for(const c of settings.cards)for(const s of c.steps){s.playEffects=[];s.achievementEffects=[];}
const base=process.argv[2]||'http://127.0.0.1:3007/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1200,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route(base,r=>r.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="toggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 const root=document.querySelector('main');window.check=mountGame(root,${JSON.stringify(settings)},()=>{},createLayoutPresentation(createLayoutScreen(root,document.querySelector('button'))));
 </script>`}));
 await page.goto(base);
 const start=page.getByRole('button',{name:'今日の仕事を始める',exact:true});
 const end=page.getByRole('button',{name:'今日の仕事を終える',exact:true});
 const state=()=>page.evaluate(()=>structuredClone(window.check.session.game.state));
 await start.waitFor();assert((await start.getAttribute('class')).includes('state-attention'));
 assert.equal((await state()).hand.length,0);assert.equal((await state()).rerolls,0);
 await page.waitForTimeout(1100);assert.equal((await state()).hand.length,0);
 assert((await state()).dice.every(die=>die.current===null));
 assert.equal(await page.locator('.PaletteViewport .DiceResult:not([hidden])').count(),0);
 // At maximum attention scale the button remains inside the top and right edges.
 const inside=await start.evaluate(n=>{n.style.animation='none';n.style.transform='scale(1.1)';const r=n.getBoundingClientRect(),p=n.parentElement.parentElement.getBoundingClientRect();return r.top>=p.top-.1&&r.right<=p.right+.1;});assert(inside);
 await start.click();await end.waitFor();assert.equal((await state()).hand.length,4);
 assert.equal(await page.getByRole('button',{name:'使用する画材を決める'}).count(),0);
 await page.waitForFunction(()=>window.check.session.game.state.phase==='play',{},{timeout:60000});
 assert(await end.isEnabled());
 await page.evaluate(()=>window.check.session.game.state.rerolls=2);
 const target=await page.locator('.PaletteViewport .DiceResult:not([hidden])').first().evaluate(n=>{const r=n.getBoundingClientRect();return{id:n.dataset.dieId,x:r.left+r.width/2,y:r.top+r.height/2};});
 await page.mouse.click(target.x,target.y);
 const unchanged=(await state()).dice.filter(d=>d.id!==target.id).map(d=>[d.id,d.current]);
 await page.getByRole('button',{name:'1つの画材を更新する',exact:true}).click();
 assert.deepEqual((await state()).rollRequest.ids,[target.id]);assert.equal((await state()).rerolls,1);
 await page.waitForFunction(()=>!window.check.session.game.state.rollRequest,{},{timeout:60000});
 assert.deepEqual((await state()).dice.filter(d=>d.id!==target.id).map(d=>[d.id,d.current]),unchanged);
 await page.getByRole('button',{name:'すべての画材を更新する',exact:true}).click();
 assert.equal((await state()).rerolls,0);assert(await end.isDisabled());
 await page.waitForFunction(()=>!window.check.session.game.state.rollRequest,{},{timeout:60000});
 // Immediate reroll keeps target selection, but starts rolling automatically after confirmation.
 await page.evaluate(()=>{const g=window.check.session.game,c=g.state.hand[0];g.step(c).playEffects=[{type:'reroll'},{type:'changeFame',amount:3}];});
 await page.locator('.HandFixedActions .Button').first().click();
 const select=page.getByRole('button',{name:'選択して画材を更新する',exact:true});await select.waitFor();assert(await select.isDisabled());
 await page.emulateMedia({reducedMotion:'no-preference'});
 const disabledPulse=await select.evaluate(n=>{const a=n.getAnimations().find(a=>a.animationName==='ButtonAttentionPulse');if(!a)return null;a.pause();a.currentTime=0;const initial=getComputedStyle(n).scale;a.currentTime=800;return[initial,getComputedStyle(n).scale];});
 assert.deepEqual(disabledPulse,['1','1.1']);assert(await select.isDisabled());
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await select.evaluate(n=>getComputedStyle(n).animationName),'none');
 const point=await page.locator('.PaletteViewport .DiceResult:not([hidden])').first().boundingBox();
 await page.mouse.click(point.x+point.width/2,point.y+point.height/2);assert(await select.isEnabled());await select.click();
 await page.waitForFunction(()=>window.check.session.game.state.fame===3,{},{timeout:60000});
 // A gain uses the same automatic physical roll path.
 await page.evaluate(()=>{const g=window.check.session.game,c=g.state.hand[0];g.step(c).playEffects=[{type:'gainColorDice',count:1,lifetime:'temporary',colors:'orange_blue'}];});
 await page.locator('.HandFixedActions .Button').first().click();
 await page.waitForFunction(()=>window.check.session.game.state.dice.length===4&&!window.check.session.game.state.rollRequest,{},{timeout:60000});
 await end.click();await start.waitFor();assert.equal((await state()).hand.length,0);assert.equal((await state()).day,2);
 await start.click();await page.waitForFunction(()=>window.check.session.game.state.phase==='play',{},{timeout:60000});
 assert.equal((await state()).day,2);assert.equal((await state()).hand.length,4);
 assert.deepEqual(errors,[]);console.log('PASS: start gate, no early draw, attention bounds, disabled attention pulse, automatic start/single/all/effect/acquire rolls, non-target preservation, next day gate');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

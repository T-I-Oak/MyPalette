const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL||'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack)});
 page.on('console',m=>{if(m.type()==='error'&&/TypeError|Unknown physical card|Card scene|exactly one location/.test(m.text()))errors.push(m.text());});
 const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
 for(const card of settings.cards)for(const step of card.steps){step.playEffects=[];step.achievementEffects=[];}
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <style>.LayoutScreen::-webkit-scrollbar{width:17px;height:17px}</style>
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
 import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 Math.random=()=>.4;
 const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
 const presentation=createLayoutPresentation(screen);const mounted=mountGame(root,${JSON.stringify(settings)},()=>{},presentation);window.check={screen,mounted,presentation,settings:${JSON.stringify(settings)}};
 window.frames=[];window.cardSceneFailures=[];window.easelIdentities=new Map();
 const finish=presentation.play.finish.bind(presentation.play);
 presentation.play.finish=()=>{
 presentation.play.sample(1);
 const read=()=>JSON.stringify([...document.querySelectorAll('.PlayPainting')].map(n=>[n.dataset.paintingId,n.style.transform]));
 const before=read(),surface=document.querySelector('.PlayPaintingSurface'),pixels=surface.toDataURL();
 const resizeObserver=new MutationObserver(()=>{});resizeObserver.observe(surface,{attributes:true,attributeFilter:['width','height']});
 finish();screen.render();
 if(resizeObserver.takeRecords().length)cardSceneFailures.push('easel redundant canvas resize');resizeObserver.disconnect();
 if(read()!==before)cardSceneFailures.push('easel completion position');
 if(surface.toDataURL()!==pixels)cardSceneFailures.push('easel completion pixels');
 };
 window.originalCards=new Map([...document.querySelectorAll('[data-scene-card]')].map(n=>[n.dataset.sceneCard,n]));
 function observe(time){
 const surface=root.querySelector('.PlayPaintingSurface'),content=root.querySelector('.LayoutContent');
 if(root.querySelector('.PlayPainting')&&surface.width!==Math.floor(content.clientWidth*devicePixelRatio))window.cardSceneFailures.push('easel buffer width:'+surface.width+'/'+content.clientWidth);
 const nodes=[...document.querySelectorAll('[data-scene-card]')];
 if(nodes.length!==45)window.cardSceneFailures.push('count:'+nodes.length);
 for(const node of nodes){
 if(originalCards.get(node.dataset.sceneCard)!==node)window.cardSceneFailures.push('identity:'+node.dataset.sceneCard);
 if(!node.isConnected||getComputedStyle(node).visibility==='hidden'||getComputedStyle(node).display==='none')window.cardSceneFailures.push('hidden:'+node.dataset.sceneCard);
 }
 const model=presentation.cards.model,counts=presentation.cards.counts;
 if(counts.deck+counts.hand+counts.field+counts.discard+counts.shipped+counts.transit+Object.values(counts.stocks).reduce((a,b)=>a+b,0)!==45)window.cardSceneFailures.push('location count');
 for(const [id,record] of model.cards){
 if(record.area==='field'&&presentation.cards.display.field.some(c=>c.id===id)){
 const expected=presentation.play.cardMatrix(id);
 if(expected.some((v,i)=>Math.abs(v-record.pose.matrix[i])>1e-7))window.cardSceneFailures.push('easel-anchor:'+id);
 }
 }
 for(const node of root.querySelectorAll('.PlayPainting')){
 const id=node.dataset.paintingId;
 if(easelIdentities.has(id)&&easelIdentities.get(id)!==node)window.cardSceneFailures.push('easel-identity:'+id);
 easelIdentities.set(id,node);
 }
 const hidden=[...model.cards.values()].filter(c=>c.opacity<.999);
 const motion=root.querySelector('[data-card-scene-motion]')?.dataset.cardSceneMotion;
 const shipment=root.querySelector('.CardSceneLayer.moving [data-scene-area="shipped"] .SceneShippedCanvas');
 const tilt=shipment?.style.getPropertyValue('--shipment-progress');
 if(motion==='achievement-shipment'&&shipment&&
     (getComputedStyle(shipment).display==='none'||getComputedStyle(shipment.previousElementSibling).visibility!=='hidden'||
      shipment.querySelector('canvas')?.width!==1536))window.cardSceneFailures.push('shipment face');
 if(motion==='stock-reveal'&&mounted.session.game.state.phase==='start'&&[...root.querySelectorAll('.PaletteViewport .DiceResult')].some(n=>!n.hidden))window.cardSceneFailures.push('stock revealed before dice ready');
 if(hidden.length&&motion!=='achievement-canvas')window.cardSceneFailures.push('opacity:'+motion);
 window.frames.push({time,motion,tilt,day:root.querySelector('.InfoDay span').textContent,hidden:hidden.map(c=>c.id),cards:[...model.cards].map(([id,c])=>({id,matrix:Array.from(c.pose.matrix),flip:c.pose.flip})),easels:[...root.querySelectorAll('.PlayPainting')].map(n=>({id:n.dataset.paintingId,transform:n.style.transform}))});
 window.cardSceneRaf=requestAnimationFrame(observe);
 }
 requestAnimationFrame(observe);
 </script>`}));


 const idle=async()=>{await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});};
 const begin=async()=>{await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});await page.waitForFunction(()=>check.mounted.session.game.state.phase==='play',null,{timeout:60000});await idle();};
 const play=async()=>{await page.locator('.HandFixedActions button:enabled').first().click({force:true});await idle();};
 const stock=async()=>{await page.waitForFunction(()=>document.querySelector('[data-stock-acquire]')?.disabled===false);await page.locator('[data-stock-acquire]').first().click({force:true});await idle();};
 const select=async id=>{
 const point=await page.evaluate(id=>{
   const node=document.querySelector('.PaletteViewport .DiceResult[data-die-id="'+id+'"]'),rect=node.getBoundingClientRect();
   for(const y of [.5,.25,.75])for(const x of [.5,.25,.75]){
     const point={x:rect.x+rect.width*x,y:rect.y+rect.height*y};
     if(document.elementFromPoint(point.x,point.y)?.closest('.DiceResult')===node)return point;
   }
   return null;
 },id);
 assert.ok(point,'対象ダイスの見えている位置を選ぶ');await page.mouse.click(point.x,point.y);
 assert.equal(await page.locator('.PaletteViewport .DiceResult[data-die-id="'+id+'"]').getAttribute('aria-label'),'選択中');
 };
 await page.goto(base);await page.waitForFunction(()=>window.check);await begin();
 assert.equal(await page.evaluate(async()=>{
 const {createEasel}=await import('./src/game/easel/createEasel.js');
 const easel=createEasel(),meshes=[];
 easel.object.traverse(n=>{if(n.isMesh)meshes.push(n);});
 const read=()=>JSON.stringify(meshes.map(n=>n.position.toArray()));
 const before=read(),object=easel.object.clone(false);
 easel.mountCanvas({object,placement:{center:[0,1.4,.3],top:2.1}});
 const stable=read()===before;easel.dispose();return stable;
 }),true,'カンバスを載せてもイーゼル部品の位置を変えない');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await play();
 assert.ok(await page.evaluate(()=>{const f=frames.find(f=>f.motion==='play'&&f.easels.length);return new DOMMatrix(f.easels[0].transform).m41>=document.querySelector('.LayoutContent').clientWidth;}),'イーゼルは右の画面外から入る');
 const first=await page.evaluate(()=>{const g=check.mounted.session.game;const die=g.state.dice.find(d=>!d.faces[d.current].special);for(const c of [...g.state.hand,...g.state.field])g.step(c).goals=[{color:die.faces[die.current].color,material:null}];window.firstEasel=document.querySelector('.PlayPainting');return {id:g.state.field[0].id,die:die.id};});
 await play();
 assert.ok(await page.evaluate(()=>window.firstEasel===document.querySelector('.PlayPainting')),'残るイーゼルの個体を維持');
 assert.ok(await page.evaluate(()=>{
 const button=document.querySelector('.PlayEndDayAction button'),r=button.getBoundingClientRect();
 const probe=document.createElement('div');probe.className='CardSceneCard';probe.style.cssText='pointer-events:auto;z-index:99999;transform:translate('+r.x+'px,'+r.y+'px);background:red';document.querySelector('.CardSceneLayer.main').append(probe);
 const visible=Boolean(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.PlayEndDayAction'));probe.remove();return visible;
 }),'終了ボタンはカードと重なっても最前面で操作できる');
 await select(first.die);
 const beforeAchievement=await page.evaluate(()=>({start:frames.length,easels:[...document.querySelectorAll('.PlayPainting')].map(n=>({id:n.dataset.paintingId,transform:n.style.transform}))}));
 await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click({force:true});await idle();
 assert.ok(await page.evaluate(before=>frames.slice(before.start).filter(f=>f.motion==='achievement-canvas').every(f=>JSON.stringify(f.easels)===JSON.stringify(before.easels)),beforeAchievement),'達成開始・カンバス演出中に全イーゼルの配置を変えない');
 assert.ok(await page.evaluate(()=>check.mounted.session.game.state.discard.some(c=>c.step===1)));
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.hidden.length>0)),'カンバス演出中だけ非表示');
 assert.ok(await page.evaluate(()=>new DOMMatrix(document.querySelector('[data-painting-id="'+check.mounted.session.game.state.discard.find(c=>c.step===1).id+'"]').style.transform).m41<0),'イーゼルは左の画面外へ抜ける');
 await page.evaluate(()=>{const g=check.mounted.session.game;g.step(g.state.hand[0]).playEffects=[{type:'gainStockCards',count:1},{type:'drawCards',count:3}];});
 await play();await stock();console.log('stock gain and draw');
 assert.equal(await page.evaluate(()=>check.mounted.session.game.state.hand.length),4);
 await page.evaluate(()=>{const g=check.mounted.session.game;g.step(g.state.hand[0]).playEffects=[{type:'exchangeCards',count:1}];});
 await play();
 await page.locator('[data-hand-return]:enabled').first().click({force:true});await idle();await stock();console.log('exchange');
 await page.evaluate(()=>{const s=check.mounted.session.game.state;s.credit=100;s.dice.forEach(d=>d.used=true);s.flyers=3;s.orderCost=3;});
 await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click({force:true});await idle();await stock();
 const cleanup=await page.evaluate(()=>frames.filter(f=>['day-cleanup','stock-close','stock-rotate'].includes(f.motion)));
 assert.ok(cleanup.some(f=>f.motion==='day-cleanup')&&cleanup.some(f=>f.motion==='stock-rotate'));
 assert.ok(cleanup.every(f=>f.day==='Day 1'));
 assert.equal(await page.locator('.InfoDay .InfoRow').first().textContent(),'Day 2');
 assert.ok(await page.evaluate(()=>check.mounted.session.game.state.dice.every(die=>die.current!==null)));
 await page.screenshot({path:'tmp_card_scene_cleanup.png'});
 await begin();console.log('morning recycle');
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='recycle-spread')));
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='recycle-gather')));
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='recycle-transfer')));
 // Ship a work, retaining the actual card in the information-area pile.
 const ship=await page.evaluate(()=>{const g=check.mounted.session.game,c=g.state.hand[0],d=g.state.dice.find(d=>!d.faces[d.current].special);c.step=2;g.step(c).playEffects=[];g.step(c).achievementEffects=[];g.step(c).goals=[{color:d.faces[d.current].color,material:null}];return {id:c.id,die:d.id};});
 await play();
 await select(ship.die);
 await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click({force:true});await idle();
 assert.equal(await page.locator('[data-scene-area="shipped"] [data-scene-card]').count(),1);
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='achievement-shipment'&&Number(f.tilt)>0&&Number(f.tilt)<1)));
 assert.equal(await page.locator('[data-scene-area="shipped"] .SceneShippedCanvas canvas').count(),1);
 await page.screenshot({path:'tmp_card_scene_shipped.png'});
 await page.locator('[data-scene-area="shipped"] [data-scene-card]').click();await page.locator('.GameCardDetail[open]').waitFor();
 await page.getByRole('button',{name:'閉じる',exact:true}).click();
 assert.equal(await page.locator('[data-scene-card]').count(),45);
 assert.deepEqual(await page.evaluate(()=>window.cardSceneFailures),[]);
 assert.deepEqual(errors,[]);
 // Resizing and panel movement keep all physical cards and their identity.
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>check.screen.openPanel());await page.waitForTimeout(300);
 assert.equal(await page.locator('[data-scene-card]').count(),45);
 await page.evaluate(()=>cancelAnimationFrame(window.cardSceneRaf));
 await page.locator('.HandFixedActions button:enabled').first().click({force:true});
 await page.waitForFunction(()=>document.querySelector('[data-card-scene-motion]'));
 await page.evaluate(()=>check.mounted.dispose());await page.waitForTimeout(100);
 assert.equal(await page.locator('[data-scene-card]').count(),0);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(async()=>{const {mountGame}=await import('./src/game/view.js');check.mounted=mountGame(document.querySelector('main'),check.settings,()=>{},check.presentation);});
 assert.equal(await page.locator('[data-scene-card]').count(),45);
 await page.locator('#panel-toggle').click();
 assert.equal(await page.locator('.LayoutCorkBoard').isVisible(),false);
 await begin();
 assert.equal(await page.evaluate(()=>check.mounted.session.game.state.hand.length),4);
 assert.deepEqual(errors,[]);
 console.log('PASS: 45 persistent card identities every frame, visibility invariant, hand/easel reflow, achievement canvas, shipping, stock gain/exchange, draw/recycle, cleanup, resize, cancellation');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

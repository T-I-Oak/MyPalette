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
 window.cardSceneFailures=[];window.easelIdentities=new Map();
 window.originalCards=new Map([...document.querySelectorAll('[data-scene-card]')].map(n=>[n.dataset.sceneCard,n]));
 function observe(){
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
 if(motion==='stock-reveal'&&mounted.session.game.state.phase==='start'&&mounted.session.game.state.dice.some(d=>d.current!==null))window.cardSceneFailures.push('stock revealed before dice ready');
 if(hidden.length&&motion!=='achievement-canvas')window.cardSceneFailures.push('opacity:'+motion);
 window.cardSceneRaf=requestAnimationFrame(observe);
 }
 requestAnimationFrame(observe);
 </script>`}));


 const idle=async()=>{await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});};
 const begin=async()=>{await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});await page.waitForFunction(()=>check.mounted.session.game.state.phase==='play',null,{timeout:60000});await idle();};
 const play=async()=>{await page.locator('.HandFixedActions button:enabled').first().click({force:true});await idle();};
 await page.goto(base);await page.waitForFunction(()=>window.check);await begin();
 const verify=async label=>{
 const failures=await page.evaluate(async()=>{
 const {playMetrics,layoutPlay}=await import('./src/game/playLayout.js');
 const p=check.presentation,area=check.screen.areas.get('play'),failures=[];
 const surface=document.querySelector('.PlayPaintingSurface'),content=document.querySelector('.LayoutContent');
 if(surface.width!==Math.floor(content.clientWidth*devicePixelRatio))failures.push('easel final buffer width');
 const field=p.cards.display.field,slots=layoutPlay(field.length,area.logicalWidth,area.logicalHeight);
 for(const [index,card] of field.entries()){
 const pair=document.querySelector('.PlayPainting[data-painting-id="'+card.id+'"]'),actual=new DOMMatrix(pair.style.transform);
 const expected=area.readScreenRect({...slots[index],width:playMetrics.width,height:playMetrics.height});
 if(Math.abs(actual.m41-expected.x)>.001||Math.abs(actual.m42-expected.y)>.001||Math.abs(actual.m11-expected.width/playMetrics.width)>1e-6)failures.push('easel final position:'+card.id+':'+pair.style.transform);
 if(pair.hasAttribute('data-retired'))failures.push('active retired:'+card.id);
 }
 for(const pair of document.querySelectorAll('.PlayPainting[data-retired]')){
 const matrix=new DOMMatrix(pair.style.transform);
 if(matrix.m41+400*matrix.m11>0)failures.push('retired easel visible:'+pair.dataset.paintingId);
 }
 for(const [id,record] of p.cards.model.cards){
 const expected=p.cards.poseFor(id);
 if(expected.matrix.some((v,i)=>Math.abs(v-record.pose.matrix[i])>1e-7)||expected.flip!==record.pose.flip)failures.push('card final pose:'+id);
 }
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)failures.push('motion setting changed');
 if(document.querySelectorAll('[data-scene-card]').length!==45)failures.push('card count');
 return failures;
 });assert.deepEqual(failures,[],label);assert.deepEqual(await page.evaluate(()=>cardSceneFailures),[],label);assert.deepEqual(errors,[],label);
 };
 await play();await verify('reduce first play');
 const first=await page.evaluate(()=>{const g=check.mounted.session.game,d=g.state.dice.find(d=>!d.faces[d.current].special);for(const c of [...g.state.field,...g.state.hand])g.step(c).goals=[{color:d.faces[d.current].color,material:null}];return {id:g.state.field[0].id,die:d.id};});
 await play();await verify('reduce second play');await play();await verify('reduce third play and scaling');
 const select=async id=>{
 const point=await page.evaluate(id=>{const n=document.querySelector('.PaletteViewport .DiceResult[data-die-id="'+id+'"]'),r=n.getBoundingClientRect();for(const y of [.5,.25,.75])for(const x of [.5,.25,.75]){const p={x:r.x+r.width*x,y:r.y+r.height*y};if(document.elementFromPoint(p.x,p.y)?.closest('.DiceResult')===n)return p;}return null;},id);
 assert.ok(point,'対象ダイスの見えている位置を選ぶ');await page.mouse.click(point.x,point.y);
 assert.equal(await page.locator('.PaletteViewport .DiceResult[data-die-id="'+id+'"]').getAttribute('aria-label'),'選択中');
 };
 await select(first.die);
 await page.setViewportSize({width:390,height:844});
 await page.locator('.LayoutScreen[data-layout="B"]').waitFor();
 const panel=page.locator('#panel-toggle'), board=page.locator('.LayoutCorkBoard');
 await panel.click();
 assert.equal(await board.isVisible(),true);
 await verify('reduce panel open with selected die');
 await panel.click();
 assert.equal(await board.isVisible(),false);
 await page.setViewportSize({width:1200,height:800});
 await page.locator('.LayoutScreen[data-layout="A"]').waitFor();
 assert.equal(await page.locator('.PaletteViewport .DiceResult[data-die-id="'+first.die+'"]').getAttribute('aria-label'),'選択中');
 await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click({force:true});await idle();
 assert.equal(await page.evaluate(()=>check.mounted.session.game.state.field.length),2);await verify('reduce achievement and reflow');
 const end=async()=>{await page.evaluate(()=>{const s=check.mounted.session.game.state;s.credit=100;s.flyers=0;s.dice.forEach(d=>d.used=true);});await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click({force:true});await idle();};
 await end();await verify('reduce cleanup');assert.equal(await page.locator('.PlayPainting:not([data-retired])').count(),0);
 await begin();await verify('reduce morning draw and recycle');assert.equal(await page.evaluate(()=>check.mounted.session.game.state.recycleRequest),null);
 const ship=await page.evaluate(()=>{const g=check.mounted.session.game,c=g.state.hand[0],d=g.state.dice.find(d=>!d.faces[d.current].special);c.step=2;for(const c of [...g.state.hand,...g.state.field])g.step(c).goals=[{color:d.faces[d.current].color,material:null}];return {id:c.id,die:d.id};});
 await play();await play();await verify('reduce play after morning');await select(ship.die);
 await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click({force:true});await idle();await verify('reduce shipping');
 assert.equal(await page.evaluate(id=>check.mounted.session.game.state.shipped.some(c=>c.id===id),ship.id),true);
 await end();await verify('reduce final cleanup');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);await verify('reduce mobile');
 console.log('PASS: reduced motion first/multiple play, scaling, achievement, retirement, cleanup, morning recycle, shipping, mobile, 45 identities');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.argv[2]||'http://127.0.0.1:3000/MyPalette/';
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true,ignoreDefaultArgs:['--hide-scrollbars']});try{
 const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack)});
 page.on('console',m=>{if(m.type()==='error'&&/TypeError|Unknown physical card|Card scene|exactly one location/.test(m.text()))errors.push(m.text());});
 const settings=JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
 for(const card of settings.cards)for(const step of card.steps){step.playEffects=[];step.achievementEffects=[];}
 await page.route(base,route=>route.fulfill({contentType:'text/html',body:`
 <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle"></button></main>
 <script type="module">
 import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
 import {createLayoutPresentation} from './src/game/layoutPresentation.js';import {mountGame} from './src/game/view.js';
 import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
 Math.random=()=>.4;
 const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
 const presentation=createLayoutPresentation(screen);const mounted=mountGame(root,${JSON.stringify(settings)},()=>{},presentation);window.check={screen,mounted,presentation};
 window.frames=[];window.cardSceneFailures=[];
 window.initialStock=presentation.cards.display.stocks.A.map(c=>({id:c.id,pose:structuredClone(presentation.cards.model.get(c.id).pose)}));
 window.originalCards=new Map([...document.querySelectorAll('[data-scene-card]')].map(n=>[n.dataset.sceneCard,n]));
 function observe(time){
 const nodes=[...document.querySelectorAll('[data-scene-card]')];
 if(nodes.length!==45)window.cardSceneFailures.push('count:'+nodes.length);
 for(const node of nodes){
 if(originalCards.get(node.dataset.sceneCard)!==node)window.cardSceneFailures.push('identity:'+node.dataset.sceneCard);
 if(!node.isConnected||getComputedStyle(node).visibility==='hidden'||getComputedStyle(node).display==='none')window.cardSceneFailures.push('hidden:'+node.dataset.sceneCard);
 }
 const model=presentation.cards.model,counts=presentation.cards.counts;
 if(counts.deck+counts.hand+counts.field+counts.discard+counts.shipped+counts.transit+Object.values(counts.stocks).reduce((a,b)=>a+b,0)!==45)window.cardSceneFailures.push('location count');
 const hidden=[...model.cards.values()].filter(c=>c.opacity<.999);
 const motion=root.querySelector('[data-card-scene-motion]')?.dataset.cardSceneMotion;
 if(hidden.length&&motion!=='achievement-canvas')window.cardSceneFailures.push('opacity:'+motion);
 window.frames.push({time,motion,phase:mounted.session.game.state.phase,unconfirmed:mounted.session.game.state.dice.every(d=>d.current===null),hand:counts.hand,achievable:[...root.querySelectorAll('[data-scene-card].state-achievable')].map(n=>n.dataset.sceneCard),hidden:hidden.map(c=>c.id),cards:[...model.cards].map(([id,c])=>({id,matrix:Array.from(c.pose.matrix),flip:c.pose.flip,z:c.pose.z})),easels:[...root.querySelectorAll('.PlayPainting')].map(n=>({id:n.dataset.paintingId,transform:n.style.transform}))});
 window.cardSceneRaf=requestAnimationFrame(observe);
 }
 requestAnimationFrame(observe);
 </script>`}));



 const begin=async()=>{await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});await page.waitForFunction(()=>check.mounted.session.game.state.phase==='play',null,{timeout:60000});await page.waitForFunction(()=>!check.presentation.cards.busy);};
 await page.goto(base);await page.emulateMedia({reducedMotion:'no-preference'});await begin();
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='initial-deal')));
 assert.ok(await page.evaluate(()=>frames.filter(f=>f.motion==='initial-deal').every(f=>initialStock.slice(0,7).every(({id,pose})=>{const c=f.cards.find(c=>c.id===id);return !c.matrix.every((v,i)=>Math.abs(v-pose.matrix[i])<1e-7)||c.z===pose.z;}))),'配分開始を待つカードはストックの重なり順を保つ');
 assert.ok(await page.evaluate(()=>frames.some(f=>f.motion==='initial-deal'&&f.cards.some(c=>c.z>1000))),'配分中のカードはストックの手前を通る');
 assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='draw')));
 assert.deepEqual(await page.evaluate(()=>window.cardSceneFailures),[]);
 // Every card can be placed into the hand by the shared layout without creating or losing a card.
 await page.evaluate(async()=>{
 const scene=check.presentation.cards,initial=structuredClone(scene.display);
 const all=[...initial.deck,...initial.hand,...initial.field,...initial.discard,...initial.shipped,...Object.values(initial.stocks).flat()];
 const target={...initial,hand:all,field:[],deck:[],discard:[],shipped:[],stocks:{A:[],B:[],C:[]},public:{A:null,B:null,C:null}};
 scene.busy=true;await scene.move(target,200,'limit45');
 window.limitRects=[...document.querySelectorAll('[data-scene-area=hand] [data-scene-card]')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
 await scene.move(initial,200,'limit-restore');scene.busy=false;scene.update();
 });
 assert.equal(await page.evaluate(()=>window.limitRects.length),45);
 assert.ok(await page.evaluate(()=>window.limitRects.every(r=>r.x>=0&&r.x+r.width<=innerWidth&&r.y>=0&&r.y+r.height<=innerHeight)));
 // Three morning draws precede a recycle pause; the previous results must already be unconfirmed.
 await page.evaluate(()=>{const g=check.mounted.session.game,s=g.state,d=s.dice.find(d=>!d.faces[d.current].special);for(const c of s.deck)g.step(c).goals=[{color:d.faces[d.current].color,material:null}];s.credit=100;s.flyers=0;s.dice.forEach(d=>d.used=true);});
 await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click({force:true});
 await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});
 await page.evaluate(()=>frames.length=0);await begin();
 assert.ok(await page.evaluate(()=>frames.some(f=>f.phase==='start'&&f.motion==='recycle-spread'&&f.hand===3)),'3枚ドロー後に翌朝の再構成待ちへ入る');
 assert.ok(await page.evaluate(()=>frames.filter(f=>f.phase==='start'&&f.motion==='recycle-spread').every(f=>f.unconfirmed&&f.achievable.length===0)),'準備中は出目そのものが未確定で、前日の出目によるマークが付かない');
 // Recycle at the size limits; all cards remain in the scene and the engine only shuffles at transfer.
 for(const count of [45,1,0]){
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 await page.evaluate(count=>{const s=check.mounted.session.game.state,all=Object.values(s.stocks).flat();s.stocks={A:[],B:[],C:[]};s.public={A:null,B:null,C:null};s.discard=all.slice(0,count);s.shipped=all.slice(count).map(c=>({...c,step:3}));},count);
 await page.emulateMedia({reducedMotion:'no-preference'});await begin();
 assert.equal(await page.evaluate(()=>check.mounted.session.game.state.hand.length),Math.min(4,count));
 if(count>0)assert.ok(await page.evaluate(()=>window.frames.some(f=>f.motion==='recycle-transfer')));
 else assert.ok(await page.evaluate(()=>!window.frames.some(f=>f.motion==='recycle-transfer')));
 assert.deepEqual(await page.evaluate(()=>window.cardSceneFailures),[]);
 console.log('PASS recycle limit',count);
 }
 // A one-card public stock must still turn over continuously at day end.
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
 const single=await page.evaluate(()=>{const s=check.mounted.session.game.state,removed=s.stocks.B.splice(1);s.shipped.push(...removed.map(c=>({...c,step:3})));return s.stocks.B[0].id;});
 await begin();await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>{const s=check.mounted.session.game.state;s.credit=100;s.dice.forEach(d=>d.used=true);s.flyers=0;});
 await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click({force:true});
 await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});
 assert.ok(await page.evaluate(id=>window.frames.some(f=>f.motion==='stock-close'&&f.cards.some(c=>c.id===id&&c.flip>0&&c.flip<180)),single));
 assert.equal(await page.evaluate(id=>check.presentation.cards.model.get(id).pose.flip,single),180);
 assert.deepEqual(await page.evaluate(()=>window.cardSceneFailures),[]);
 // A just-achieved card can be recycled and drawn again in its own reward, twice.
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await begin();
 const cycling=await page.evaluate(()=>{const g=check.mounted.session.game;g.state.shipped.push(...g.state.deck.splice(0).map(c=>({...c,step:3})));check.presentation.cards.adopt(g.state);check.presentation.cards.update();return g.state.hand[0].id;});
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const nextStep of [1,2]){
 const die=await page.evaluate(id=>{const g=check.mounted.session.game,c=g.state.hand.find(c=>c.id===id),d=g.state.dice.find(d=>!d.faces[d.current].special);d.used=false;g.step(c).playEffects=[];g.step(c).achievementEffects=[{type:'drawCards',count:1}];g.step(c).goals=[{color:d.faces[d.current].color,material:null}];return d.id;},cycling);
 await page.evaluate(()=>window.playFrameStart=frames.length);
 await page.locator('.HandFixedActions [data-card-id="'+cycling+'"] button:enabled').click({force:true});
 await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});
 assert.ok(await page.evaluate(id=>{const frame=frames.slice(playFrameStart).find(f=>f.motion==='play'&&f.easels.some(e=>e.id===id));return new DOMMatrix(frame.easels.find(e=>e.id===id).transform).m41>=document.querySelector('.LayoutContent').clientWidth;},cycling),'再利用するイーゼルも右の画面外から入る');
 if(nextStep===1)await page.evaluate(id=>window.cycleEasel=document.querySelector('.PlayPainting[data-painting-id="'+id+'"]'),cycling);
 else assert.ok(await page.evaluate(id=>window.cycleEasel===document.querySelector('.PlayPainting[data-painting-id="'+id+'"]'),cycling));
 const box=await page.locator('.PaletteViewport .DiceResult[data-die-id="'+die+'"]').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).click({force:true});
 await page.waitForFunction(()=>!check.presentation.cards.busy&&!document.querySelector('[data-card-scene-motion]'),null,{timeout:60000});
 assert.equal(await page.evaluate(id=>check.mounted.session.game.state.hand.find(c=>c.id===id).step,cycling),nextStep);
 assert.ok(await page.evaluate(id=>originalCards.get(id)===document.querySelector('[data-scene-card="'+id+'"]'),cycling));
 }
 assert.deepEqual(await page.evaluate(()=>window.cardSceneFailures),[]);
 console.log('PASS same-card achievement reward recycle/draw and reused easel');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>check.screen.openPanel());await page.waitForTimeout(300);
 assert.equal(await page.locator('[data-scene-card]').count(),45);
 await page.evaluate(()=>check.screen.setFixedScale(2));await page.waitForTimeout(100);
 assert.equal(await page.locator('[data-scene-card]').count(),45);
 assert.ok(await page.evaluate(()=>[...check.presentation.cards.model.cards.values()].every(c=>Array.from(c.pose.matrix).every(Number.isFinite))));
 assert.deepEqual(errors,[]);console.log('PASS animated initial deal/draw, hand45, recycle45/1/0, empty stocks, mobile panel');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

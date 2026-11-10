const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: 'no-preference' });
        const errors = [];
        page.on('requestfailed',request=>console.error('request failed',request.url(),request.failure()));
        page.on('console',message=>{ if(message.type()==='error') console.error(message.text()); });
        page.on('pageerror', error => { errors.push(error.message); console.error(error.message); });
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
            <script type="module">
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            Math.random=()=>.4;
            const root=document.querySelector('main');
            const screen=createLayoutScreen(root,document.querySelector('button'));
            const presentation=createLayoutPresentation(screen);
            const settings=${JSON.stringify(settings)};
            const mounted=mountGame(root,settings,()=>{},presentation);
            window.stockCheck={screen,presentation,mounted,root,settings};
            </script>` }));
        await page.goto(base);
        await page.locator('.DeckArea').waitFor();
        await page.evaluate(() => {
            const root=window.stockCheck.root;
            window.deckFrames=[];
            window.deckLastPlacements={};
            const surface=window.stockCheck.screen.surface;
            const renderMoving=surface.renderMoving.bind(surface);
            surface.renderMoving=(actor,...args)=>{
                if(actor.element.dataset.deckMotionCard) window.deckLastPlacements[actor.id]=
                    ['--painting-x','--painting-y','--painting-tilt'].map(key=>parseFloat(actor.element.style.getPropertyValue(key)));
                return renderMoving(actor,...args);
            };
            let last='';
            function sample() {
                const placement=n=>['--painting-x','--painting-y','--painting-tilt'].map(key=>parseFloat(n.style.getPropertyValue(key)));
                const name=root.querySelector('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent;
                const actors=[...root.querySelectorAll('[data-deck-motion-card]')].filter(node=>node.isConnected&&node.style.visibility!=='hidden');
                const value={name,ids:[...root.querySelectorAll('.DeckArea [data-deck-card-id]')].map(n=>n.dataset.deckCardId),
                    deck:[...root.querySelectorAll('.DeckArea [data-deck-card-id]')].map(n=>({id:n.dataset.deckCardId,placement:placement(n),top:parseFloat(n.style.top)})),
                    hand:[...root.querySelectorAll('.HandArea .PaintingCard')].map(n=>({id:n.dataset.cardId,placement:placement(n)})),
                    moving:actors.map(n=>({id:n.dataset.deckMotionCard,placement:placement(n),angle:parseFloat(n.querySelector('.PaintingFaces').style.getPropertyValue('--painting-flip'))})),
                    stage:root.querySelector('.LayoutContent').dataset.deckEffect};
                const key=JSON.stringify(value);
                if(key!==last) { window.deckFrames.push(value);last=key; }
                window.deckRaf=requestAnimationFrame(sample);
            }
            sample();
        });
        assert.equal(await page.locator('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent(),'デッキ 0枚');
        const original=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.stocks.A.slice(0,7).map(c=>c.id));
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>document.querySelector('[data-deck-effect="running"]'));
        await page.screenshot({path:'tmp_deck_draw.png'});
        await page.setViewportSize({width:390,height:844});
        await page.locator('#panel-toggle').click();
        await page.evaluate(()=>window.stockCheck.screen.setFixedScale(1.25));
        await page.waitForFunction(()=>!document.querySelector('[data-deck-effect]'));
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        const frames=await page.evaluate(()=>window.deckFrames);
        const lastPlacements=await page.evaluate(()=>window.deckLastPlacements);
        const names=frames.map(f=>f.name);
        for(let count=0;count<=7;count++) assert.ok(names.includes(`デッキ ${count}枚`),`配分${count}枚を表示`);
        const seven=frames.findIndex(f=>f.name==='デッキ 7枚');
        const firstDraw=frames.findIndex(f=>f.moving.length);
        assert.ok(seven<firstDraw,'7枚受入後にドロー');
        const firstPile=frames.find(frame=>frame.name==='デッキ 1枚').deck;
        const baseTop=firstPile.find(card=>card.id===original[0]).top;
        for(let count=1;count<=7;count++) {
            const pile=frames.find(frame=>frame.name===`デッキ ${count}枚`).deck;
            assert.deepEqual(pile.map(card=>card.id),original.slice(0,count).reverse(),'先着カードの下へ追加');
            assert.equal(pile.find(card=>card.id===original[0]).top,baseTop-(count-1)*1.5,'追加ごとに先着カードを1.5上げる');
        }
        const seen=[];
        for(const f of frames) for(const actor of f.moving) if(!seen.includes(actor.id)) seen.push(actor.id);
        assert.deepEqual(seen,original.slice(0,4),'ゲームのドロー順で表返し');
        for(const id of seen) {
            const angles=frames.flatMap(f=>f.moving.filter(c=>c.id===id).map(c=>c.angle));
            assert.ok(angles.some(a=>a>0&&a<180),'途中の表返しを確認');
            assert.ok(angles.includes(0),'表返し完了');
            const source=frames.flatMap(f=>f.deck).find(card=>card.id===id).placement;
            const destination=frames.flatMap(f=>f.hand).find(card=>card.id===id).placement;
            assert.ok(source.some(value=>value!==0),'位置ずれ・回転のある条件で検証');
            const moving=frames.flatMap(f=>f.moving.filter(card=>card.id===id));
            for(const card of moving.filter(card=>card.angle>0)) {
                assert.deepEqual(card.placement,source,'持ち上げ・表返し中は山の位置ずれと回転を維持');
            }
            const last=lastPlacements[id];
            last.forEach((value,index)=>assert.ok(Math.abs(value-destination[index])<1e-9,'手札の位置ずれ・回転へ接続'));
            assert.ok(moving.some(card=>card.placement.some((value,index)=>
                value!==source[index]&&value!==destination[index])),'飛行中に手札の値へ補間');
        }
        assert.equal(await page.locator('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent(),'デッキ 3枚');
        assert.equal(await page.locator('[data-deck-motion-card]').count(),0);
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),4);
        await page.locator('#panel-toggle').click();await page.waitForTimeout(300);
        await page.locator('#panel-toggle').click();await page.waitForTimeout(300);
        await page.screenshot({path:'tmp_deck_final.png'});
        await page.setViewportSize({width:1200,height:700});
        await page.evaluate(()=>{
            const state=window.stockCheck.mounted.session.game.state;
            state.dice.forEach(die=>die.used=true); state.flyers=0;
        });
        await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='awaitingStart');
        await page.waitForFunction(()=>!document.querySelector('[data-stock-effect]'));
        await page.setViewportSize({width:390,height:844});
        if(await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
        await page.waitForTimeout(300);
        await page.evaluate(()=>{
            window.dailyActors={};
            const surface=window.stockCheck.screen.surface;
            const original=surface.renderMoving.bind(surface);
            surface.renderMoving=(actor,rect,...args)=>{
                if(actor.element.dataset.deckMotionCard&&!window.dailyActors[actor.id]) window.dailyActors[actor.id]={...rect};
                return original(actor,rect,...args);
            };
        });
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        const daily=await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            return {events:structuredClone(game.deckEvents),hand:structuredClone(game.state.hand)};
        });
        assert.deepEqual(daily.events.map(event=>event.kind),['draw','draw','draw','recycle','draw'],'日次の途中再構成');
        await page.waitForFunction(()=>document.querySelector('[data-deck-effect="running"]'));
        assert.equal(await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).isDisabled(),true,'日次ドロー中の操作をロック');
        await page.waitForFunction(()=>!document.querySelector('[data-deck-effect]'));
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        assert.equal(await page.locator('#panel-toggle').getAttribute('aria-expanded'),'false','自動ではパネルを開かない現状を観測');
        const dailyActors=await page.evaluate(()=>window.dailyActors);
        assert.deepEqual(Object.keys(dailyActors),daily.hand.map(card=>card.id),'日次も実際の順序で4枚を描画');
        assert.ok(Object.values(dailyActors).every(rect=>rect.x>=390),'閉パネルでは画面外のデッキ位置から描画');
        await page.locator('#panel-toggle').click();await page.waitForTimeout(300);
        assert.equal(await page.locator('.DeckArea [data-deck-card-id]').count(),3,'パネルを開くと残り3枚');
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),4);
        await page.setViewportSize({width:1200,height:700});
        await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            game.state.discard=game.state.deck.splice(1);
            game.state.discard.forEach(card=>card.step=2);
            for(const card of game.state.hand) game.definitions[card.id].steps[card.step].playEffects=[{type:'drawCards',count:6}];
        });
        const beforeEffect=await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.length);
        await page.locator('.HandFixedActions button').first().click();
        await page.waitForFunction(()=>document.querySelector('[data-deck-effect="running"]'));
        await page.waitForFunction(()=>!document.querySelector('[data-deck-effect]'));
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),beforeEffect-1+3,'不足時は引ける3枚だけ');
        assert.equal(await page.locator('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent(),'デッキ 0枚');
        assert.equal(await page.locator('[data-deck-motion-card]').count(),0);
        await page.evaluate(()=>cancelAnimationFrame(window.deckRaf));
        assert.ok(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.hand.some(card=>card.step===2)),'再構成後のstepを維持');
        const achievementDie=await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            const die=game.state.dice.find(d=>!d.faces[d.current].special);
            const step=game.step(game.state.field[0]);
            step.goals=[{color:die.faces[die.current].color,material:null}];
            step.achievementEffects=[{type:'drawCards',count:1}];
            return die.id;
        });
        const result=page.locator(`.PaletteViewport .DiceResult[data-die-id="${achievementDie}"]`);
        const resultBox=await result.boundingBox();
        await page.mouse.click(resultBox.x+resultBox.width/2,resultBox.y+resultBox.height/2);
        const beforeAchievement=await page.locator('.HandArea .PaintingCard').count();
        await page.getByRole('button',{name:'選択ダイスで達成',exact:true}).first().click();
        await page.waitForFunction(()=>document.querySelector('[data-deck-effect="running"]'),null,{timeout:60000});
        await page.waitForFunction(()=>!document.querySelector('[data-deck-effect]'));
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),beforeAchievement+1,'達成後のドローを再構成とともに演出');
        assert.equal(await page.evaluate(()=>window.stockCheck.mounted.session.game.state.field.length),0);
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.reload();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>window.stockCheck.mounted.session.game.state.phase==='play',null,{timeout:60000});
        assert.equal(await page.locator('[data-deck-motion-card]').count(),0);
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),4);
        assert.equal(await page.locator('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent(),'デッキ 3枚');
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.evaluate(()=>{
            const game=window.stockCheck.mounted.session.game;
            game.state.shipped.push(...game.state.deck.splice(0),...game.state.discard.splice(0));
            for(const card of game.state.hand) game.step(card).playEffects=[{type:'drawCards',count:4}];
        });
        await page.locator('.HandFixedActions button').first().click();
        await page.waitForFunction(()=>document.querySelector('.PlayArea').dataset.playEffect==='moving');
        await page.waitForFunction(()=>!document.querySelector('.PlayArea').dataset.playEffect);
        assert.equal(await page.locator('.HandArea .PaintingCard').count(),3,'両山0枚では新しい手札を作らない');
        assert.equal(await page.locator('.LayoutAreaFixed[data-area="deck"] .LayoutAreaName').textContent(),'デッキ 0枚');
        assert.equal(await page.locator('[data-deck-motion-card]').count(),0);
        await page.reload();
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click({force:true});
        await page.waitForFunction(()=>document.querySelector('[data-deck-effect="running"]'));
        await page.evaluate(()=>window.stockCheck.mounted.dispose());
        await page.waitForTimeout(100);
        assert.equal(await page.locator('[data-deck-motion-card]').count(),0);
        assert.equal(await page.locator('.state-deck-moving, .state-deck-receiving').count(),0);
        assert.deepEqual(errors,[]);
        console.log('deck: 0→7→3, order/step, reveal, cleanup, A/B, resize, panel, fixed scale and physical-roll continuation passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

const fs = require('node:fs');
exports.diceListReviewFixture = () => {
    const settings = JSON.parse(fs.readFileSync('public/data/cards.json','utf8'));
    for (const card of settings.cards) for (const step of card.steps) {
        step.playEffects = []; step.achievementEffects = [];
        step.goals = [{material:'brush',color:null}];
    }
    return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <body class="theme-atelier texture-layout GameBrowserSurface"><main class="LayoutScreen"><button tabindex="-1" id="toggle" class="PanelToggle"></button></main>
    <aside class="ReviewTools texture-paper" style="position:fixed;top:0;left:0;z-index:85;font:14px system-ui;max-width:75%">
    <span id="version"></span><button id="width">A/B幅切替</button><button id="scale">固定倍率切替</button>
    <button id="section-frame" aria-pressed="false">セクション枠切替</button>
    <button id="many">30個</button><button id="mixed">面・状態変更</button><button id="empty">0個</button><button id="restart">最初から確認</button>
    </aside><script type="module">
    import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
    import {createLayoutPresentation} from './src/game/layoutPresentation.js';
    import {mountGame} from './src/game/view.js';
    import {preventBrowserZoom} from './src/ui/browserInteraction.js';
    import {initializeAppVersion} from './src/version.js';
    import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';
    import './src/ui/screenLayout/layout.css';import './src/ui/browserInteraction.css';
    const sceneUrl=performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname.endsWith('/dice/DiceScene.js')).name;
    const {DiceScene}=await import(sceneUrl);
    const project=DiceScene.prototype.project;
    DiceScene.prototype.project=function(...args){window.reviewScene=this;return project.apply(this,args);};
    preventBrowserZoom(document.body);
    document.querySelector('#version').textContent='v'+initializeAppVersion();
    const root=document.querySelector('main');
    window.reviewScreen=createLayoutScreen(root,document.querySelector('#toggle'));
    window.reviewPresentation=createLayoutPresentation(reviewScreen);
    const present=reviewPresentation.present;
    reviewPresentation.present=(board,...args)=>{window.reviewRefresh=board.querySelector('.GameTabs button');return present(board,...args);};
    window.review=mountGame(root,${JSON.stringify(settings)},reviewPresentation);
    const change=action=>{review.session.dispatch(game=>action(game.state));reviewRefresh.click();};
    document.querySelector('#many').onclick=()=>change(s=>{
        const original=s.dice[0];s.dice=Array.from({length:30},(_,i)=>({...structuredClone(original),id:'review-'+i,current:i%6,lifetime:i%2?'temporary':'permanent',used:false}));
    });
    document.querySelector('#mixed').onclick=()=>change(s=>s.dice.forEach((die,i)=>{
        die.current=i===0?null:i%6;die.used=i%3===2;die.lifetime=i%2?'temporary':'permanent';
        die.faces[1]={special:'fame1'};die.faces[2]={color:'blue',material:'airbrush'};
    }));
    document.querySelector('#empty').onclick=()=>change(s=>{s.dice=[];});
    document.querySelector('#restart').onclick=()=>location.reload();
    let narrow=false,large=false;
    document.querySelector('#width').onclick=()=>{narrow=!narrow;root.style.width=narrow?'390px':'100%';reviewScreen.render();};
    document.querySelector('#scale').onclick=()=>{large=!large;reviewScreen.setFixedScale(large?1.25:.7);};
    document.querySelector('#section-frame').onclick=event=>{
        const framed=document.querySelector('.DiceListSection').classList.toggle('state-framed');
        event.currentTarget.setAttribute('aria-pressed',String(framed));
    };
    document.querySelectorAll('.ReviewTools button').forEach(button=>button.tabIndex=-1);
    if(new URLSearchParams(location.search).get('review')==='scroll'){
        const status=document.createElement('output');document.querySelector('.ReviewTools').append(status);
        status.textContent='スクロール確認の準備中…';
        await new Promise(resolve=>{const wait=()=>{
            const s=review.session.game.state;
            if(s.phase==='play'&&!s.rollRequest&&document.querySelector('.HandFixedActions .Button:enabled'))resolve();
            else requestAnimationFrame(wait);
        };wait();});
        document.querySelector('#many').click();
        if(document.querySelector('.DiceList').hidden)document.querySelector('.DiceListOpen').click();
        const scroll=document.querySelector('.DiceListScroll');
        const progress=()=>{
            const count=document.querySelectorAll('.DiceListRow').length,max=scroll.scrollHeight-scroll.clientHeight;
            const location=scroll.scrollTop<=1?'上端':scroll.scrollTop>=max-1?'末尾':'途中';
            status.textContent=count+'個・'+location+'：リスト内をホイール／スワイプして確認';
        };
        scroll.addEventListener('scroll',progress,{passive:true});progress();
    }
    </script>`;
};

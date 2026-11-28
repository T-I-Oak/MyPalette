const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const file = path.join(root, 'tmp_board_motion_review.html');
fs.writeFileSync(file, `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ボード演出確認 ${version}</title>
<style>
html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column;align-items:center;background:#ebe2cd}
.guide{box-sizing:border-box;width:100%;padding:8px 12px;font:14px/1.5 system-ui;background:#fff4c9;color:#302a18}.guide p{margin:0 0 6px}.guide button{font:inherit;margin-right:8px}
main.LayoutScreen{flex:1;min-height:0;height:0;width:min(100%,460px)}body[data-wide=true] main{width:100%}
.LayoutMainFixedLayer,.LayoutPanelFixedLayer,.CardSceneLayer{pointer-events:none!important}
</style></head><body class="theme-atelier texture-layout">
<aside class="guide"><p>MP36-02 / ${version}：初日の7枚配分・公開、公開切替、再構成を比較します。Bで完全に閉じていれば即時更新し、開状態とAでは演出します。ドローは維持します。実行中も右上のボード開閉を試せます。確認ページ内の状態だけを使用します。</p>
<button id="restart">初日から（閉）</button><button id="restart-open">初日から（開）</button><button id="wide">A/B幅切替</button><button id="stock" disabled>公開切替</button><button id="recycle" disabled>再構成＋ドロー</button><span id="status">自動開始を待っています</span></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {createCardSceneTimeline} from './src/game/cardSceneTimeline.js';
import {mountGame} from './src/game/view.js';import {loadSettings} from './src/settingsStorage.js';import {shuffle} from './src/game/dice.js';
import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
const status=document.querySelector('#status'),stockButton=document.querySelector('#stock'),recycleButton=document.querySelector('#recycle');
document.querySelector('#restart').onclick=()=>{location.search='';};document.querySelector('#restart-open').onclick=()=>{location.search='?open=1';};
document.querySelector('#wide').onclick=()=>{document.body.dataset.wide=String(document.body.dataset.wide!=='true');};
try {
    const settings=structuredClone((await loadSettings()).document);
    const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
    if(new URLSearchParams(location.search).has('open'))screen.openPanel();
    const presentation=createLayoutPresentation(screen),mounted=mountGame(root,settings,presentation),cards=presentation.cards;
    await new Promise(resolve=>{function wait(){if(mounted.session.game.state.phase==='play'&&!cards.busy)resolve();else requestAnimationFrame(wait);}wait();});
    const initial=structuredClone(cards.display);
    presentation.clear();
    status.textContent='準備完了';stockButton.disabled=false;recycleButton.disabled=false;
    async function run(kind) {
        stockButton.disabled=true;recycleButton.disabled=true;status.textContent='実行中：'+(kind==='stock'?'公開切替':'再構成＋ドロー');
        try {
            cards.busy=true;cards.adopt(initial);await cards.move(initial,0,'review-restore');
            const state=structuredClone(initial);state.phase='play';
            if(kind==='stock') {for(const grade of ['A','B','C']) {state.stocks[grade].push(state.stocks[grade].shift());state.public[grade]=state.stocks[grade][0].id;}}
            else {state.discard.push(...state.deck,...state.hand);state.deck=[];state.hand=[];cards.adopt(state);await cards.move(state,0,'review-recycle-setup');state.recycleRequest={id:1};}
            const timeline=createCardSceneTimeline(screen,cards,presentation.play,{}, {}, {},()=>{});
            timeline.begin();timeline.hasWork(state,[]);
            await timeline.run(state,()=>[],()=>{
                const shuffled=shuffle(state.discard,Math.random);state.discard=[];state.hand=[shuffled[0]];state.deck=shuffled.slice(1);state.recycleRequest=null;
                return [{kind:'recycle',cards:shuffled},{kind:'draw',card:shuffled[0]}];
            },()=>[]);
            status.textContent='完了：ボードを開くと更新後のカードを確認できます';
        }finally{cards.busy=false;cards.update();stockButton.disabled=false;recycleButton.disabled=false;}
    }
    stockButton.onclick=()=>run('stock');recycleButton.onclick=()=>run('recycle');
}catch(error){status.textContent='確認ページのエラー：'+error.message;throw error;}
</script></body></html>`, 'utf8');
console.log(file);

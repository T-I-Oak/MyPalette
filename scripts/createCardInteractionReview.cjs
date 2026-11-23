const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const file = path.join(root,'tmp_card_interaction_review.html');
fs.writeFileSync(file, `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>カード操作の確認 ${version}</title>
<style>
html,body{margin:0;width:100%;height:100vh;height:100dvh;overflow:hidden}
body{display:flex;flex-direction:column}
.review-guide{flex:none;padding:6px 12px;background:#fff4c9;color:#302a18;font:14px/1.5 system-ui;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.review-guide p{margin:0;flex:1;min-width:180px}
.review-guide button{font:inherit;cursor:pointer}
main.LayoutScreen{flex:1;min-height:0;width:100%;height:0}
</style></head><body class="theme-atelier texture-layout">
<aside class="review-guide"><p>確認用 ${version}：手札・場札・公開ストックのカード面で詳細を開き操作を確認。場札は最初のダイス1個で達成可能です。「発注の準備」後は仕事を終えて取得を確認します。保存済み設定は変更しません。</p><select id="scenario"><option value="gain">ストック2枚取得</option><option value="exchange">手札交換</option><option value="achieve">達成・重なり</option></select><button onclick="location.reload()">最初から確認</button><button id="order">発注の準備</button></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {mountGame} from './src/game/view.js';
import {loadSettings} from './src/settingsStorage.js';
import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
try {
    const settings=structuredClone((await loadSettings()).document);
    const mode=new URLSearchParams(location.search).get('mode') || 'gain';
    const scenario=document.querySelector('#scenario');scenario.value=mode;
    scenario.onchange=()=>{location.search='?mode='+scenario.value;};
    for(const card of settings.cards) for(const step of card.steps) {
        step.playEffects=mode==='gain'?[{type:'gainStockCards',count:2}]:mode==='exchange'?[{type:'exchangeCards',count:1}]:[];step.achievementEffects=[];
    }
    const root=document.querySelector('main');
    const screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
    const presentation=createLayoutPresentation(screen);
    const mounted=mountGame(root,settings,presentation),game=mounted.session.game;
    const complete=game.completeRoll.bind(game);
    game.completeRoll=(...args)=>{
        complete(...args);
        const die=game.state.dice.find(d=>!d.used && d.faces[d.current] && !d.faces[d.current].special);
        if(die) for(const card of Object.values(game.definitions)) for(const step of card.steps)
            step.goals=[{color:die.faces[die.current].color,material:die.faces[die.current].material}];
    };
    document.querySelector('#order').onclick=()=>{
        if(game.state.phase!=='play'||game.state.pending) return;
        game.state.dice.forEach(d=>d.used=true);game.state.flyers=game.state.orderCost;
    };
} catch(error) {
    document.querySelector('.review-guide p').textContent='確認ページを開けませんでした：'+error.message;
}
</script></body></html>`, 'utf8');
console.log(file);

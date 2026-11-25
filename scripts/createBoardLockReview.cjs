const fs = require('node:fs');
const path = require('node:path');
const version = require('../package.json').version;
const file = path.resolve(__dirname, '../dev_board_lock_review.html');
fs.writeFileSync(file, `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MP38-05 確認 ${version}</title>
<style>html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column}
aside{padding:4px 10px;background:#fff4c9;color:#302a18;font:13px/1.4 system-ui}aside p{margin:2px}
main.LayoutScreen{flex:1;min-height:0;height:0;width:100%}#diagnostic{overflow-wrap:anywhere}</style>
<body class="theme-atelier texture-layout GameBrowserSurface"><aside>
<p>MP38-05 / ${version}：開始後「検証用カードを着手」→表示されたダイスを選択→「達成」→ボードを開く→捨て札の詳細でStep 0を確認→閉じる→ボードを閉じる→未使用ダイスを選択して更新。設定ファイルは変更しません。</p>
<button id="prepare" disabled>検証用カードを着手</button><button onclick="location.reload()">最初から</button>
<label><input id="effect" type="checkbox" checked>達成時の即時リロール</label>
<p id="instruction"></p><p id="diagnostic"></p></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {mountGame} from './src/game/view.js';
import {loadSettings} from './src/settingsStorage.js';
import {preventBrowserZoom} from './src/ui/browserInteraction.js';
import './src/ui/browserInteraction.css';import './src/ui/theme.css';import './src/ui/layout.css';
import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
preventBrowserZoom(document.body);
const errors=[];window.addEventListener('error',e=>errors.push(e.message));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const settings=structuredClone((await loadSettings()).document);
for(const card of settings.cards)for(const step of card.steps){step.playEffects=[];step.achievementEffects=[];}
Math.random=()=>.4;
const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
const presentation=createLayoutPresentation(screen),mounted=mountGame(root,settings,presentation);
window.boardLock={screen,presentation,mounted,errors};
const prepare=document.querySelector('#prepare');let prepared=false;
prepare.onclick=()=>{
 const g=mounted.session.game,c=g.state.hand[0];
 const d=g.state.dice.find(d=>!d.used&&!d.faces[d.current].special);
 g.step(c).goals=[{color:d.faces[d.current].color,material:null}];
 g.step(c).achievementEffects=document.querySelector('#effect').checked?[{type:'reroll'},{type:'gainRerolls',count:2}]:[];
 window.boardLock.target={id:c.id,die:d.id};prepared=true;prepare.disabled=true;
 document.querySelector('#instruction').textContent='達成用ダイス：'+d.id+' / カード：'+c.id;
 document.querySelector('.HandFixedActions button:enabled').click();
};
setInterval(()=>{
 const s=mounted.session.game.state;
 prepare.disabled=prepared||s.phase!=='play'||!!s.rollRequest||presentation.cards.busy;
 document.querySelector('#diagnostic').textContent=JSON.stringify({version:'${version}',reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,
 layout:screen.panelState,phase:s.phase,pending:s.pending?.kind,roll:s.rollRequest?.status,
 achievement:s.achievement,busy:presentation.cards.busy,details:document.querySelectorAll('.GameCardDetail').length,
 inert:root.querySelector('.LayoutContent').inert,errors});
},250);
</script></body></html>`, 'utf8');
console.log(file);

const fs = require('node:fs');
const path = require('node:path');
const version = require('../package.json').version;
const file = path.resolve(__dirname, '../tmp_use_dice_review.html');
fs.writeFileSync(file, `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>MP42 使用済み化 ${version}</title>
<style>html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column}
aside{padding:4px 10px;background:#fff4c9;font:13px/1.4 system-ui}aside p{margin:2px}
main.LayoutScreen{flex:1;min-height:0;height:0;width:100%}#diagnostic{overflow-wrap:anywhere}</style>
<body class="theme-atelier texture-layout GameBrowserSurface"><aside>
<p>MP42 / ${version}：開始後にケースを準備→先頭の手札で着手。D1＝通常面・永続、D2＝名声特殊面・一時、D3＝ドロー特殊面・永続。保存設定は変更しません。</p>
<select id="mode"><option value="play">着手時：2個使用済み化</option><option value="reward">達成時：2個使用済み化</option><option value="chain">連続：2個→2個→対象なし</option><option value="empty">対象なし</option></select>
<button id="prepare" disabled>ケースを準備</button><button id="refresh" disabled>再利用</button><button onclick="location.reload()">最初から</button>
<label>固定倍率<select id="scale"><option>1</option><option>0.75</option><option>1.25</option></select></label>
<span id="icons"></span><p id="instruction"></p><p id="diagnostic"></p></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {mountGame} from './src/game/view.js';
import {DiceScene} from './src/dice/DiceScene.js';
import {loadSettings} from './src/settingsStorage.js';
import {effectIconCanvas} from './src/icons/render.js';
import {preventBrowserZoom} from './src/ui/browserInteraction.js';
import './src/ui/browserInteraction.css';import './src/ui/theme.css';import './src/ui/layout.css';
import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
preventBrowserZoom(document.body);
const errors=[];window.addEventListener('error',e=>errors.push(e.message));
window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
const settings=structuredClone((await loadSettings()).document);
for(const card of settings.cards)for(const step of card.steps){step.playEffects=[];step.achievementEffects=[];step.goals=[{color:'orange',material:'brush'}];}
const review=window.useDiceReview={errors,version:'${version}'};
const project=DiceScene.prototype.project;
DiceScene.prototype.project=function(...args){review.scene=this;return project.apply(this,args);};
const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
const presentation=createLayoutPresentation(screen),mounted=mountGame(root,settings,presentation);
Object.assign(review,{screen,presentation,mounted});
for(const count of [1,2,10])document.querySelector('#icons').append(effectIconCanvas({type:'useDie',count},32));
let prepared=false;
document.querySelector('#prepare').onclick=()=>{
 const mode=document.querySelector('#mode').value;
 mounted.session.dispatch(g=>{
  g.state.dice.forEach((d,i)=>{d.used=mode==='empty';d.lifetime=i===1?'temporary':'permanent';d.faces=d.faces.map(()=>i===0?{color:'orange',material:'brush'}:{special:i===1?'fame1':'draw1'});});
  const effects=mode==='chain'?[{type:'useDie',count:2},{type:'useDie',count:2},{type:'useDie',count:1},{type:'gainRerolls',count:2}]:[{type:'useDie',count:2}];
  const c=g.state.hand[0];g.step(c).playEffects=mode==='reward'?[]:effects;
  g.step(c).achievementEffects=mode==='reward'?effects:[];
  review.target=c.id;review.before=structuredClone(g.state.dice);
 });
 prepared=true;
 document.querySelector('#instruction').textContent=mode==='reward'?'先頭の手札を着手→D1を選択→達成→D2とD3を選択して確定。':'先頭の手札を着手→ダイスを指定個数選択して確定。';
};
document.querySelector('#refresh').onclick=()=>{
 const g=mounted.session.game;
 g.step(g.state.hand[0]).playEffects=[{type:'refreshDice'}];
 document.querySelector('.HandFixedActions button:enabled').click();
};
document.querySelector('#scale').onchange=e=>screen.setFixedScale(Number(e.target.value));
setInterval(()=>{
 const s=mounted.session.game.state,ready=s.phase==='play'&&!mounted.session.game.task&&!presentation.cards.busy&&!document.querySelector('.EffectNoticeLayer .EffectNotice');
 document.querySelector('#prepare').disabled=prepared||!ready;
 document.querySelector('#refresh').disabled=!ready;
 document.querySelector('#diagnostic').textContent=JSON.stringify({version:'${version}',layout:screen.panelState.mode,phase:s.phase,pending:s.pending?.effectType,dice:s.dice.map(d=>({id:d.id,used:d.used,special:d.faces[d.current]?.special})),errors});
},200);
</script></body></html>`, 'utf8');
console.log(file);

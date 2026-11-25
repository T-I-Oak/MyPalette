const fs = require('node:fs');
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
fs.writeFileSync('tmp_hand_action_review.html', `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>手札追従確認 ${version}</title><style>
html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column;background:#ebe2cd}
.guide{padding:8px 12px;font:14px/1.5 system-ui;background:#fff4c9;color:#302a18}.guide p{margin:0 0 6px}.guide button,.guide select{font:inherit;margin-right:8px}
main.LayoutScreen{flex:1;min-height:0;height:0;width:100%;align-self:center}body[data-narrow=true] main{width:min(100%,390px)}
</style></head><body class="theme-atelier texture-layout">
<aside class="guide"><p>MP38-01〜03 / ${version}：初日のドローを観察し、手札の「着手」で2枚の効果ドローを確認。着手したカードのボタンは移動開始時に消え、残る手札も追従します。演出中は操作できません。保存済み設定は変更しません。</p>
<button id="restart">最初から</button><button id="width">A/B幅切替</button><label>固定倍率<select id="scale"><option value="1">1</option><option value="0.65">0.65</option><option value="1.2">1.2</option></select></label><span id="status"></span></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {mountGame} from './src/game/view.js';import {loadSettings} from './src/settingsStorage.js';
import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
const settings=structuredClone((await loadSettings()).document);
for(const card of settings.cards)for(const step of card.steps){step.playEffects=[{type:'drawCards',count:2}];step.achievementEffects=[];}
const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
const presentation=createLayoutPresentation(screen),mounted=mountGame(root,settings,presentation);
window.handActionReview={screen,presentation,mounted};
screen.setFixedScale(1);
document.querySelector('#restart').onclick=()=>location.reload();
document.querySelector('#width').onclick=()=>{document.body.dataset.narrow=String(document.body.dataset.narrow!=='true');};
document.querySelector('#scale').onchange=event=>screen.setFixedScale(Number(event.target.value));
document.querySelector('#status').textContent=matchMedia('(prefers-reduced-motion: reduce)').matches?'動きを減らす：有効':'動きを減らす：無効';
</script></body></html>`, 'utf8');
console.log('tmp_hand_action_review.html / '+version);

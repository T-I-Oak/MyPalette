const fs = require('node:fs');
fs.writeFileSync('tmp_icon_descriptions_review.html', `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>アイコン説明の確認</title>
<style>body{margin:0}header{padding:8px;font:14px sans-serif}main.LayoutScreen{height:calc(100dvh - 56px)}</style>
<body class="theme-atelier texture-layout"><header>アイコン説明 <strong id="version"></strong>
<label>固定倍率 <select id="scale"><option>1</option><option>0.75</option><option>1.25</option></select></label>
<a href="./">通常のゲームへ</a><div>手札の目標3種・左の見出しをホバー／タップしてください。</div></header>
<main class="LayoutScreen"><button tabindex="-1" id="panel-toggle" class="PanelToggle"></button></main>
<script type="module">
import { initializeAppVersion } from './src/version.js';
import { createLayoutScreen } from './src/ui/screenLayout/createLayoutScreen.js';
import { createLayoutPresentation } from './src/game/layoutPresentation.js';
import { mountGame } from './src/game/view.js';
import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
document.querySelector('#version').textContent='v'+initializeAppVersion();
const settings=await (await fetch('./data/cards.json')).json();
for(const card of settings.cards)for(const step of card.steps){
 step.goals=[{material:'brush',color:null},{material:null,color:'yellow'},{material:'brush',color:'yellow'}];
 step.playEffects=[];step.achievementEffects=[{type:'gainRerolls',count:1}];
}
const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
mountGame(root,settings,createLayoutPresentation(screen));
document.querySelector('#scale').onchange=event=>screen.setFixedScale(Number(event.target.value));
</script></body></html>`);
console.log('Created tmp_icon_descriptions_review.html (page-only settings; saved data unchanged)');

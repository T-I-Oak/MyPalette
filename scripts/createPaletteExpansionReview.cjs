const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
const file = path.join(root, 'tmp_palette_expansion_review.html');
fs.writeFileSync(file, `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>パレット拡大確認 ${version}</title>
<style>
html,body{margin:0;height:100%;overflow:hidden}body{display:flex;flex-direction:column;background:#ebe2cd}
.guide{padding:8px 12px;font:14px/1.5 system-ui;background:#fff4c9;color:#302a18}.guide p{margin:0 0 6px}.guide button{font:inherit;margin-right:8px}
main.LayoutScreen{flex:1;min-height:0;height:0;width:100%;align-self:center}body[data-narrow=true] main{width:min(100%,390px)}
</style></head><body class="theme-atelier texture-layout">
<aside class="guide"><p>v${version}：初期ダイス20個。再投入のたびに1.03倍へ拡大します。保存済み設定は変更しません。</p>
<button id="restart">最初から確認</button><button id="motion">動きを減らす設定で再開始</button><button id="width">A/B幅切替</button><span id="status">ゲームを準備しています</span></aside>
<main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
<script type="module">
import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
import {createLayoutPresentation} from './src/game/layoutPresentation.js';
import {mountGame} from './src/game/view.js';
import {loadSettings} from './src/settingsStorage.js';
import {Game} from './src/game/engine.js';
import {DiceGroup} from './src/dice/DiceGroup.js';
import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
const reduced=new URLSearchParams(location.search).has('reduce');
if(reduced){
 const originalMatchMedia=window.matchMedia.bind(window);
 window.matchMedia=query=>{
  const media=originalMatchMedia(query);
  if(query==='(prefers-reduced-motion: reduce)')Object.defineProperty(media,'matches',{value:true});
  return media;
 };
}
const status=document.querySelector('#status');
document.querySelector('#motion').onclick=()=>{location.search=reduced?'':'?reduce=1';};
document.querySelector('#restart').onclick=()=>location.reload();
document.querySelector('#width').onclick=()=>{document.body.dataset.narrow=String(document.body.dataset.narrow!=='true');};
try{
 const settings=structuredClone((await loadSettings()).document);
 const nextDay=Game.prototype.nextDay;
 Game.prototype.nextDay=function(...args){
  if(this.state.day===0){
   const faces=this.state.dice.map(d=>structuredClone(d.faces));
   while(this.state.dice.length<20)this.state.dice.push(this.makeDie(structuredClone(faces[this.state.dice.length%faces.length]),'permanent'));
   for(const die of this.state.dice)die.current=null;
  }
  return nextDay.apply(this,args);
 };
 const expand=DiceGroup.prototype.expandField;let expansions=0;
 DiceGroup.prototype.expandField=function(...args){const result=expand.apply(this,args);expansions++;return result;};
 const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
 let mounted;
 try{mounted=mountGame(root,settings,createLayoutPresentation(screen));}finally{Game.prototype.nextDay=nextDay;}
 window.paletteExpansionReview={screen,...mounted};
 function update(){
  const s=mounted.session.game.state;
  status.textContent=(reduced?'動きを減らす / ':'通常 / ')+s.dice.length+'個 / 拡大'+expansions+'回（'+Math.round(1.03**expansions*100)+'%） / '+(s.rollRequest?'ロール中':'ロール完了');
  requestAnimationFrame(update);
 }
 update();
}catch(error){status.textContent='確認ページのエラー：'+error.message;throw error;}
</script></body></html>`, 'utf8');
console.log(file);

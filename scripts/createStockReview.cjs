const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const version = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version;
const file = path.join(root,'tmp_stock_review.html');
fs.writeFileSync(file, `<!doctype html>
<html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>ストック・手札交換の確認 ${version}</title>
<style>
html,body{margin:0;width:100%;height:100vh;height:100dvh;overflow:hidden}
body{display:flex;flex-direction:column}
.review-guide{flex:none;padding:6px 12px;background:#fff4c9;color:#302a18;font:14px/1.5 system-ui;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.review-guide p{margin:0;flex:1;min-width:180px}
.review-guide button{font:inherit;cursor:pointer}
main.LayoutScreen{flex:1;min-height:0;width:100%;height:0}
</style></head><body class="theme-atelier texture-layout">
<aside class="review-guide"><p>確認用 ${version}：①仕事を開始 → ②任意の手札で「着手」 → ③「返却」 → ④ストックの「取得」。全カードに手札交換を設定しています。保存済み設定には影響しません。</p><button onclick="location.reload()">最初から確認</button></aside>
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
    for(const card of settings.cards) for(const step of card.steps) {
        step.playEffects=[{type:'exchangeCards',count:1}];step.achievementEffects=[];
    }
    const root=document.querySelector('main');
    const screen=createLayoutScreen(root,document.querySelector('#panel-toggle'));
    const presentation=createLayoutPresentation(screen);
    mountGame(root,settings,()=>location.reload(),presentation);
} catch(error) {
    document.querySelector('.review-guide p').textContent='確認ページを開けませんでした：'+error.message;
}
</script></body></html>`, 'utf8');
console.log(file);

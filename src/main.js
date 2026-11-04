import { initializeAppVersion } from './version.js';
import './style.css';
import { mountEditor } from './editor.js';
import { loadSettings } from './settingsStorage.js';
import { mountGame } from './game/view.js';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
const root = document.querySelector('#editor');
root.textContent = 'ゲーム設定を読み込んでいます…';
async function start() {
    try {
        const saved = await loadSettings();
        root.replaceChildren();
        const home = () => { location.href = location.pathname + location.search; };
        const mode = document.querySelector('header > span');
        if (location.hash === '#settings') {
            mode.textContent = 'カード設定';
            const back = document.createElement('button'); back.className = 'Button'; back.textContent = '入口へ戻る';
            back.addEventListener('click', home); root.append(back);
            mountEditor(root, saved.document, saved.revision);
        } else {
            mode.textContent = '評価用ゲーム';
            const menu = document.createElement('section'); menu.className = 'GameMenu texture-paper';
            const heading = document.createElement('h2'); heading.textContent = 'アトリエで制作を始めましょう';
            const description = document.createElement('p'); description.textContent = '保存済みの45枚のカード設定で遊びます。画材を選んで作品を進め、信用を保ちながら名声を高めましょう。';
            const play = document.createElement('button'); play.className = 'Button'; play.textContent = 'ゲームを始める';
            play.addEventListener('click', () => mountGame(root, saved.document, home));
            const editor = document.createElement('button'); editor.className = 'Button'; editor.textContent = 'カード設定を開く';
            editor.addEventListener('click', () => { location.hash = 'settings'; location.reload(); });
            menu.append(heading, description, play, editor); root.append(menu);
        }
    } catch (error) {
        root.textContent = `ゲーム設定を開けませんでした。${error.message}`;
        const retry = document.createElement('button'); retry.textContent = '再読み込み';
        retry.addEventListener('click', () => location.reload()); root.append(retry);
    }
}
start();

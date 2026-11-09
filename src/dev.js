import { initializeAppVersion } from './version.js';
import './style.css';
import { mountEditor } from './editor.js';
import { loadSettings, loadSettingsFile } from './settingsStorage.js';
import { readEvaluation } from './effectEvaluation.js';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
const root = document.querySelector('#editor');
root.textContent = 'ゲーム設定を読み込んでいます…';
async function start() {
    try {
        if (location.hash === '#icons') {
            document.querySelector('header > span').textContent = '共通アイコン確認';
            const { mountIconLab } = await import('./icons/lab.js');
            mountIconLab(root, () => { location.href = location.pathname + location.search; });
            return;
        }
        root.replaceChildren();
        const home = () => { location.href = location.pathname + location.search; };
        const mode = document.querySelector('header > span');
        if (location.hash === '#settings') {
            const saved = await loadSettings();
            mode.textContent = 'カード設定';
            const back = document.createElement('button'); back.tabIndex = -1; back.className = 'Button texture-raised SettingsBack'; back.textContent = '入口へ戻る';
            back.addEventListener('click', home); document.querySelector('header').append(back);
            const evaluation = await loadSettingsFile('/api/effect-evaluation', readEvaluation);
            mountEditor(root, saved.document, saved.revision, evaluation);
        } else {
            mode.textContent = '開発者用ツール';
            const menu = document.createElement('section'); menu.className = 'GameMenu Surface texture-paper';
            const heading = document.createElement('h2'); heading.textContent = '確認・編集';
            const editor = document.createElement('button'); editor.tabIndex = -1; editor.className = 'Button texture-raised'; editor.textContent = 'カード設定を開く';
            editor.addEventListener('click', () => { location.hash = 'settings'; location.reload(); });
            const icons = document.createElement('button'); icons.tabIndex = -1; icons.className = 'Button texture-raised'; icons.textContent = '共通アイコン確認を開く';
            icons.addEventListener('click', () => { location.hash = 'icons'; location.reload(); });
            menu.append(heading, editor, icons); root.append(menu);
        }
    } catch (error) {
        root.textContent = `ゲーム設定を開けませんでした。${error.message}`;
        const retry = document.createElement('button'); retry.tabIndex = -1; retry.textContent = '再読み込み';
        retry.addEventListener('click', () => location.reload()); root.append(retry);
    }
}
start();

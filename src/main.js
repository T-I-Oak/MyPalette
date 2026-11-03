import { initializeAppVersion } from './version.js';
import './style.css';
import { mountEditor } from './editor.js';
import { loadSettings } from './settingsStorage.js';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
const root = document.querySelector('#editor');
root.textContent = 'ゲーム設定を読み込んでいます…';
async function start() {
    try {
        const saved = await loadSettings();
        root.replaceChildren();
        mountEditor(root, saved.document, saved.revision);
    } catch (error) {
        root.textContent = `ゲーム設定を開けませんでした。${error.message}`;
        const retry = document.createElement('button'); retry.textContent = '再読み込み';
        retry.addEventListener('click', () => location.reload()); root.append(retry);
    }
}
start();

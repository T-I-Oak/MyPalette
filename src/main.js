import { initializeAppVersion } from './version.js';
import { createLayoutScreen } from './ui/screenLayout/createLayoutScreen.js';
import { loadSettings } from './settingsStorage.js';
import { gameIssues } from './game/engine.js';
import { mountGame } from './game/view.js';
import { createLayoutPresentation } from './game/layoutPresentation.js';
import './ui/theme.css';
import './ui/layout.css';
import './ui/textures.css';
import './ui/states.css';
import './ui/screenLayout/layout.css';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
export const layoutScreen = createLayoutScreen(document.querySelector('#layout-screen'), document.querySelector('#panel-toggle'));
const root = document.querySelector('#layout-screen');
const notice = document.createElement('section');
notice.className = 'GameStartup';
notice.setAttribute('role', 'status');
root.append(notice);
async function start() {
    notice.hidden = false;
    notice.textContent = 'ゲーム設定を読み込んでいます…';
    let settings;
    try {
        settings = (await loadSettings()).document;
        const issues = gameIssues(settings);
        if (issues.length) throw new Error(`設定が制作途中のため開始できません。\n${issues.join('\n')}`);
    } catch (error) {
        const message = document.createElement('pre');
        message.className = 'StartIssues'; message.textContent = `ゲーム設定を開けませんでした。\n${error.message}`;
        const retry = document.createElement('button'); retry.tabIndex = -1;
        retry.textContent = '再読み込み'; retry.className = 'Button texture-raised';
        retry.addEventListener('click', start);
        notice.replaceChildren(message, retry);
        return;
    }
    notice.hidden = true;
    const presentation = createLayoutPresentation(layoutScreen);
    mountGame(root, settings, () => { presentation.dispose(); start(); }, presentation);
}
start();

import { initializeAppVersion } from './version.js';
import { createTitleScreen } from './ui/createTitleScreen.js';
import startPainting from './ui/title/start-painting.webp';
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

const diagnosis = new URLSearchParams(location.search).has('diagnose-start');
if (diagnosis) {
    const report = document.createElement('pre');
    report.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:9999;margin:0;padding:8px;background:white;color:black;white-space:pre-wrap;max-height:40vh;overflow:auto;user-select:text;-webkit-user-select:text';
    report.textContent = '起動診断: 「ゲーム開始」を押してください。';
    document.body.append(report);
    const show = error => {
        report.textContent = error?.stack || error?.message || String(error);
    };
    window.addEventListener('error', event => show(event.error ?? event.message));
    window.addEventListener('unhandledrejection', event => show(event.reason));
}

const version = initializeAppVersion(__APP_VERSION__);
const root = document.querySelector('#layout-screen');
export const layoutScreen = createLayoutScreen(root, document.querySelector('#panel-toggle'));
const gameLayout = root.querySelector('.LayoutContent');
const { screen: title, notice, setMenuItems } = createTitleScreen(version);
const startLabel = 'ゲーム開始';
const [{ button: startButton, plaque: startPlaque }] = setMenuItems([
    { label: startLabel, artwork: startPainting, onSelect: start },
]);

const result = document.createElement('section');
result.className = 'GameStartup';
const resultHeading = document.createElement('h1');
resultHeading.textContent = 'ゲーム終了';
const returnButton = document.createElement('button');
returnButton.type = 'button';
returnButton.className = 'Button texture-raised';
returnButton.textContent = 'タイトルへ戻る';
result.append(resultHeading, returnButton);
root.append(title, result);

function showTitle() {
    gameLayout.hidden = true;
    result.hidden = true;
    title.hidden = false;
    notice.textContent = '';
    startPlaque.textContent = startLabel;
    startButton.disabled = false;
}

async function start() {
    if (startButton.disabled) return;
    startButton.disabled = true;
    notice.textContent = 'ゲーム設定を読み込んでいます…';
    let settings;
    try {
        settings = (await loadSettings()).document;
        const issues = gameIssues(settings);
        if (issues.length) throw new Error(`設定が制作途中のため開始できません。\n${issues.join('\n')}`);
    } catch (error) {
        notice.textContent = `ゲーム設定を開けませんでした。\n${error.message}`;
        startPlaque.textContent = '再読み込み';
        startButton.disabled = false;
        return;
    }
    title.hidden = true;
    gameLayout.hidden = false;
    layoutScreen.render();
    const presentation = createLayoutPresentation(layoutScreen);
    mountGame(root, settings, () => {
        presentation.dispose();
        showTitle();
    }, presentation, () => {
        presentation.dispose();
        gameLayout.hidden = true;
        result.hidden = false;
        returnButton.focus();
    });
}
returnButton.addEventListener('click', () => {
    showTitle();
    startButton.focus();
});
showTitle();

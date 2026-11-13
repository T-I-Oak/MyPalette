import { initializeAppVersion } from './version.js';
import { createTitleScreen } from './ui/createTitleScreen.js';
import { titleMenuEntries } from './ui/title/menuEntries.js';
import { createLayoutScreen } from './ui/screenLayout/createLayoutScreen.js';
import { loadSettings } from './settingsStorage.js';
import { loadResultGraphics } from './dice/resultGraphics.js';
import { gameIssues } from './game/engine.js';
import { mountGame } from './game/view.js';
import { createLayoutPresentation } from './game/layoutPresentation.js';
import { trace, traceText } from './game/startupTrace.js';
import './ui/theme.css';
import './ui/layout.css';
import './ui/textures.css';
import './ui/states.css';
import './ui/screenLayout/layout.css';

const version = initializeAppVersion(__APP_VERSION__);
trace('page-open', { version, navigation: performance.getEntriesByType('navigation')[0]?.type });
document.addEventListener('visibilitychange', () => trace('visibility', { state: document.visibilityState }));
for (const event of ['pagehide', 'pageshow']) {
    window.addEventListener(event, ({ persisted }) => trace(event, { persisted }));
}
window.addEventListener('error', event => trace('error', { message: event.message, stack: event.error?.stack }));
window.addEventListener('unhandledrejection', event => trace('rejection', { message: String(event.reason), stack: event.reason?.stack }));
const root = document.querySelector('#layout-screen');
export const layoutScreen = createLayoutScreen(root, document.querySelector('#panel-toggle'));
const gameLayout = root.querySelector('.LayoutContent');
const { screen: title, notice, setMenuItems } = createTitleScreen(version);
const startLabel = titleMenuEntries[0].label;
const menuActions = { start };
const menuItems = setMenuItems(titleMenuEntries.filter(entry => entry.unlocked)
    .map(entry => ({ ...entry, onSelect: menuActions[entry.id] })));
const [{ button: startButton, plaque: startPlaque }] = menuItems;

function setPreparing(preparing) {
    for (const { button } of menuItems) button.disabled = preparing;
    startButton.classList.toggle('is-preparing', preparing);
}

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

const diagnostics = document.createElement('details');
diagnostics.className = 'StartupTrace';
const diagnosticLabel = document.createElement('summary');
diagnosticLabel.textContent = '調査記録';
const diagnosticText = document.createElement('textarea');
diagnosticText.readOnly = true;
diagnosticText.setAttribute('aria-label', '調査記録');
diagnostics.append(diagnosticLabel, diagnosticText);
title.append(diagnostics);
diagnostics.addEventListener('toggle', () => {
    if (diagnostics.open) diagnosticText.value = traceText();
});

function showTitle(reason) {
    trace('title', { reason });
    diagnostics.open = false;
    gameLayout.hidden = true;
    result.hidden = true;
    title.hidden = false;
    notice.textContent = '';
    startPlaque.textContent = startLabel;
    setPreparing(false);
}

async function start() {
    if (startButton.disabled) return;
    setPreparing(true);
    notice.textContent = 'ゲームの準備をしています…';
    let settings, graphics;
    try {
        const [saved, resultGraphics] = await Promise.all([loadSettings(), loadResultGraphics()]);
        settings = saved.document;
        graphics = resultGraphics;
        const issues = gameIssues(settings);
        if (issues.length) throw new Error(`設定が制作途中のため開始できません。\n${issues.join('\n')}`);
    } catch (error) {
        notice.textContent = `ゲームを開始できませんでした。\n${error.message}`;
        startPlaque.textContent = '再読み込み';
        setPreparing(false);
        return;
    }
    title.hidden = true;
    trace('game-open');
    gameLayout.hidden = false;
    layoutScreen.render();
    const presentation = createLayoutPresentation(layoutScreen, graphics);
    mountGame(root, settings, () => {
        presentation.dispose();
        showTitle('game-menu');
    }, presentation, () => {
        presentation.dispose();
        gameLayout.hidden = true;
        result.hidden = false;
        trace('game-finished');
        returnButton.focus();
    });
}
returnButton.addEventListener('click', () => {
    showTitle('result-button');
    startButton.focus();
});
showTitle('page-startup');

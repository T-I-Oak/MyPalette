import { initializeAppVersion } from './version.js';
import { createTitleScreen } from './ui/createTitleScreen.js';
import { titleMenuEntries } from './ui/title/menuEntries.js';
import { createLayoutScreen } from './ui/screenLayout/createLayoutScreen.js';
import { loadSettings } from './settingsStorage.js';
import { loadResultGraphics } from './dice/resultGraphics.js';
import { gameIssues } from './game/engine.js';
import { mountGame } from './game/view.js';
import { createLayoutPresentation } from './game/layoutPresentation.js';
import './ui/theme.css';
import './ui/layout.css';
import './ui/textures.css';
import './ui/states.css';
import './ui/screenLayout/layout.css';

const version = initializeAppVersion(__APP_VERSION__);
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

function showTitle() {
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
    gameLayout.hidden = false;
    layoutScreen.render();
    const presentation = createLayoutPresentation(layoutScreen, graphics);
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

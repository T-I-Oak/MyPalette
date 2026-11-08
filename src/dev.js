import { initializeAppVersion } from './version.js';
import './style.css';
import { mountEditor } from './editor.js';
import { loadSettings, loadSettingsFile } from './settingsStorage.js';
import { readEvaluation } from './effectEvaluation.js';
import { mountGame } from './game/view.js';

document.querySelector('#app-version').textContent = initializeAppVersion(__APP_VERSION__);
const root = document.querySelector('#editor');
root.textContent = 'ゲーム設定を読み込んでいます…';
async function start() {
    try {
        if (location.hash === '#easel') {
            document.querySelector('header > span').textContent = 'イーゼル確認';
            const { mountEaselLab } = await import('./game/easel/lab.js');
            await mountEaselLab(root);
            return;
        }
        if (location.hash === '#icons') {
            document.querySelector('header > span').textContent = '共通アイコン確認';
            const { mountIconLab } = await import('./icons/lab.js');
            mountIconLab(root, () => { location.href = location.pathname + location.search; });
            return;
        }
        if (location.hash === '#dice') {
            document.querySelector('header > span').textContent = 'ダイス動作確認';
            const { mountDiceLab } = await import('./dice/lab.js');
            await mountDiceLab(root, () => { location.href = location.pathname + location.search; });
            return;
        }
        const saved = await loadSettings();
        root.replaceChildren();
        const home = () => { location.href = location.pathname + location.search; };
        const mode = document.querySelector('header > span');
        if (location.hash === '#settings') {
            mode.textContent = 'カード設定';
            const back = document.createElement('button'); back.className = 'Button texture-raised SettingsBack'; back.textContent = '入口へ戻る';
            back.addEventListener('click', home); document.querySelector('header').append(back);
            const evaluation = await loadSettingsFile('/api/effect-evaluation', readEvaluation);
            mountEditor(root, saved.document, saved.revision, evaluation);
        } else {
            mode.textContent = '評価用ゲーム';
            const menu = document.createElement('section'); menu.className = 'GameMenu Surface texture-paper';
            const heading = document.createElement('h2'); heading.textContent = 'アトリエで制作を始めましょう';
            const description = document.createElement('p'); description.textContent = '保存済みの45枚のカード設定で遊びます。画材を選んで作品を進め、信用を保ちながら名声を高めましょう。';
            const play = document.createElement('button'); play.className = 'Button texture-raised'; play.textContent = 'ゲームを始める';
            play.addEventListener('click', () => mountGame(root, saved.document, home));
            const editor = document.createElement('button'); editor.className = 'Button texture-raised'; editor.textContent = 'カード設定を開く';
            editor.addEventListener('click', () => { location.hash = 'settings'; location.reload(); });
            const dice = document.createElement('button'); dice.className = 'Button texture-raised'; dice.textContent = 'ダイス動作確認を開く';
            dice.addEventListener('click', () => { location.hash = 'dice'; location.reload(); });
            const icons = document.createElement('button'); icons.className = 'Button texture-raised'; icons.textContent = '共通アイコン確認を開く';
            icons.addEventListener('click', () => { location.hash = 'icons'; location.reload(); });
            const easel = document.createElement('button'); easel.className = 'Button texture-raised'; easel.textContent = 'イーゼル確認を開く';
            easel.addEventListener('click', () => { location.hash = 'easel'; location.reload(); });
            menu.append(heading, description, play, editor, dice, icons, easel); root.append(menu);
        }
    } catch (error) {
        root.textContent = `ゲーム設定を開けませんでした。${error.message}`;
        const retry = document.createElement('button'); retry.textContent = '再読み込み';
        retry.addEventListener('click', () => location.reload()); root.append(retry);
    }
}
start();

import { Game, gameIssues } from './engine.js';
import { currentFace } from './dice.js';
import { matchingDice, satisfiesSelection } from './goals.js';
import { displayLabel } from '../effectCatalog.js';
import { describeGoals, describeEffect } from '../cardSummary.js';
import './view.css';

const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
};
function button(text, action, disabled = false) {
    const node = el('button', text, 'Button'); node.type = 'button'; node.disabled = disabled;
    node.addEventListener('click', action); return node;
}
export const faceLabel = face => face.special ? `特殊面：${displayLabel(face.special)}` : `${displayLabel(face.color)}・${displayLabel(face.material)}`;
const phaseLabel = { play: '制作中', start: 'ターン開始処理', end: 'ターン終了処理', betweenDays: '一日の仕事を終了', finished: 'ゲーム終了' };

export function mountGame(root, settings, onMenu) {
    const issues = gameIssues(settings);
    if (issues.length) {
        root.replaceChildren(el('h2', '設定が制作途中のため開始できません'), el('pre', issues.join('\n'), 'StartIssues'), button('入口へ戻る', onMenu));
        return;
    }
    const game = new Game(settings);
    let selected = new Set();
    let activeTab = 'play';
    const scroll = el('div', undefined, 'GameBoard'); root.replaceChildren(scroll);
    const act = action => {
        action(); selected = new Set(); activeTab = 'play'; render();
    };
    function cardView(card) {
        const definition = game.definitions[card.id];
        const node = el('article', undefined, 'GameCard texture-paper'); node.dataset.cardId = card.id;
        const heading = el('div', undefined, 'GameCardHeading');
        heading.append(el('strong', `${card.id} ${definition.name}`), el('span', `ステップ${card.step}${card.step === 3 ? '（出荷済み）' : ''}`, 'GameCardStep'));
        node.append(heading);
        if (card.step < 3) {
            const step = definition.steps[card.step];
            node.append(el('p', `目標：${describeGoals(step.goals)}`, 'card-goal'));
            for (const [key, label] of [['playEffects', 'プレイ時'], ['achievementEffects', '達成時']]) {
                if (step[key].length) node.append(el('p', `${label}：${step[key].map(describeEffect).join(' → ')}`, key === 'playEffects' ? 'card-play-effect' : 'card-achievement-effect'));
            }
        }
        const detail = el('div', undefined, 'GameCardDetails'); detail.hidden = true;
        definition.steps.forEach((step, i) => {
            detail.append(el('p', `ステップ${i}${card.step === i ? '（現在）' : ''} 目標：${describeGoals(step.goals)}`, 'card-goal'));
            for (const [key, label] of [['playEffects', 'プレイ時'], ['achievementEffects', '達成時']]) {
                if (step[key].length) detail.append(el('p', `${label}：${step[key].map(describeEffect).join(' → ')}`, key === 'playEffects' ? 'card-play-effect' : 'card-achievement-effect'));
            }
        });
        const image = el('img'); image.src = `${import.meta.env.BASE_URL}assets/paintings/${card.id}-3.png`;
        image.alt = `${definition.name}の完成図`; image.loading = 'lazy'; detail.append(image);
        const actions = el('div', undefined, 'GameCardActions');
        const showSteps = button('全ステップ表示', () => {
            detail.hidden = !detail.hidden;
            showSteps.setAttribute('aria-expanded', String(!detail.hidden));
            showSteps.textContent = detail.hidden ? '全ステップ表示' : '全ステップを閉じる';
        });
        showSteps.setAttribute('aria-expanded', 'false'); actions.append(showSteps); node.append(actions, detail);
        return node;
    }
    function diceView(die, compact = false) {
        const node = el('article', undefined, `GameDie texture-paper${die.used ? ' state-used' : ''}`);
        node.dataset.dieId = die.id;
        node.append(el('strong', `${die.id} · ${displayLabel(die.lifetime)} · ${die.used ? '消費済み' : '未使用'}`), el('p', faceLabel(currentFace(die))));
        const detail = el('details'); detail.append(el('summary', compact ? '6面' : '6面の構成'));
        die.faces.forEach((face, i) => detail.append(el('p', `${i + 1}：${faceLabel(face)}${i === die.current ? ' ← 現在' : ''}`)));
        node.append(detail); return node;
    }
    function checkbox(node, id, label, update) {
        const wrapper = el('label', undefined, 'GameSelection'); const input = el('input'); input.type = 'checkbox';
        input.value = id; input.checked = selected.has(id); input.setAttribute('aria-label', label);
        input.addEventListener('change', () => { if (input.checked) selected.add(id); else selected.delete(id); update(); });
        wrapper.append(input, document.createTextNode(label)); node.prepend(wrapper);
    }
    function section(title, parent = scroll, className = '') {
        const node = el('section', undefined, `GameSection ${className}`); node.append(el('h2', title)); parent.append(node); return node;
    }
    function selectionPanel(pending) {
        const dialog = el('dialog', undefined, 'GameChoice'); scroll.append(dialog);
        dialog.addEventListener('cancel', event => event.preventDefault());
        const node = section(`選択待ち：${pending.title}`, dialog, 'state-choice');
        node.append(el('p', `${pending.min === pending.max ? pending.min : `${pending.min}〜${pending.max}`}個を選んで確定してください。`));
        const list = el('div', undefined, 'GameGrid');
        const submit = button('選択を確定', () => act(() => game.choose([...selected])), true);
        const count = el('p', '選択数：0');
        const update = () => { count.textContent = `選択数：${selected.size}`; submit.disabled = selected.size < pending.min || selected.size > pending.max; };
        for (const option of pending.options) {
            let item;
            if (pending.kind === 'candidates') {
                item = el('article', undefined, 'GameDie texture-paper');
                item.append(el('strong', `候補${Number(option.id) + 1}`), ...option.faces.map(face => el('p', faceLabel(face))));
            } else if (pending.kind === 'dice') item = diceView(game.state.dice.find(d => d.id === option.id));
            else {
                const card = [...game.state.hand, ...Object.values(game.state.stocks).flat()].find(c => c.id === option.id);
                item = cardView(card);
            }
            checkbox(item, option.id, `${pending.kind === 'candidates' ? '候補' + (Number(option.id) + 1) : option.id}を選択`, update);
            list.append(item);
        }
        const footer = el('div', undefined, 'GameChoiceFooter'); footer.append(count, submit);
        node.append(list, footer); dialog.showModal();
    }
    function render() {
        const positions = new Map([...scroll.querySelectorAll('[data-pane]')].map(node => [node.dataset.pane, node.scrollTop]));
        scroll.replaceChildren(); const s = game.state;
        const status = section(`${s.day}日目 · ${phaseLabel[s.phase]}${s.pending ? '（効果を選択中）' : ''}`, scroll, 'GameStatus');
        status.append(el('p', `名声 ${s.fame} / 信用 ${s.credit} / リロール権 ${s.rerolls} / 出荷 ${s.shipped.length}枚`),
            el('p', `チラシ ${s.flyers}枚 · 制作進捗 ${s.progress}/2 · 次回発注 ${s.orderCost}枚`));
        const menu = button('入口へ戻る', onMenu); status.append(menu);
        if (s.phase === 'finished') {
            status.append(el('h2', `結果：${s.day}日 · 名声 ${s.fame} · 出荷 ${s.shipped.length}枚`), button('もう一度遊ぶ', () => mountGame(root, settings, onMenu)));
        }
        const tabs = el('nav', undefined, 'GameTabs'); tabs.setAttribute('aria-label', 'ゲーム情報');
        for (const [id, label] of [['play', '制作と手札'], ['stock', `ストック・山札（${s.deck.length}）・捨て札（${s.discard.length}）`], ['shipped', `出荷済み（${s.shipped.length}）`], ['logs', '進行記録']]) {
            const tab = button(label, () => { activeTab = id; render(); });
            tab.setAttribute('aria-pressed', String(activeTab === id)); tabs.append(tab);
        }
        scroll.append(tabs);
        const workspace = el('div', undefined, 'GameWorkspace'); scroll.append(workspace);
        const canPlay = s.phase === 'play' && !s.pending;
        const visibleDice = s.phase === 'betweenDays' ? s.dayEndDice : s.dice;
        const diceSection = section(`画材ダイス ${visibleDice.length}個${s.phase === 'betweenDays' ? '（仕事終了時）' : ''}`, workspace, 'GameDicePane'), diceList = el('div', undefined, 'GameGrid');
        diceList.dataset.pane = 'dice';
        const achieveButtons = [];
        const updateAchievements = () => {
            for (const { card, node } of achieveButtons) node.disabled = !canPlay || !satisfiesSelection(game.step(card).goals, s.dice, [...selected]);
        };
        for (const die of visibleDice) {
            const node = diceView(die, true);
            if (canPlay && !die.used) checkbox(node, die.id, `${die.id}を達成に使用`, updateAchievements);
            const reroll = button('↻', () => act(() => game.reroll(die.id)), !canPlay || die.used || !s.rerolls);
            reroll.setAttribute('aria-label', `${die.id}をリロール`); reroll.title = `${die.id}をリロール`;
            node.append(reroll); diceList.append(node);
        }
        diceSection.append(diceList, button('全未使用ダイスをリロール', () => act(() => game.reroll()), !canPlay || !s.rerolls || !s.dice.some(d => !d.used)));
        diceSection.title = 'ダイスにチェックを付け、制作中の作品の達成ボタンで確定します。';
        for (const [key, label] of [['field', '制作中'], ['hand', '手札'], ['shipped', '出荷済み作品']]) {
            const zone = section(`${label} ${s[key].length}枚`, workspace, `GameCardsPane ${key}`), list = el('div', undefined, 'GameGrid');
            zone.hidden = key === 'shipped' ? activeTab !== 'shipped' : activeTab !== 'play';
            list.dataset.pane = key;
            for (const card of s[key]) {
                const node = cardView(card);
                const match = key === 'hand' || key === 'field' ? matchingDice(game.step(card).goals, s.dice) : null;
                node.classList.toggle('state-achievable', !!match);
                if (key === 'hand') node.querySelector('.GameCardActions').prepend(button('場にプレイ', () => act(() => game.play(card.id)), !canPlay || s.hand.length < 2));
                if (key === 'field') {
                    const action = button('選択ダイスで達成', () => act(() => game.achieve(card.id, [...selected])), true);
                    action.title = match ? '達成可能：使用するダイスを選んでください' : '現在は達成できません';
                    achieveButtons.push({ card, node: action }); node.querySelector('.GameCardActions').prepend(action);
                }
                list.append(node);
            }
            zone.append(list);
        }
        const stocks = section(`公開ストック · デッキ ${s.deck.length}枚 · 捨て札 ${s.discard.length}枚`, workspace, 'GameStockPane');
        stocks.hidden = activeTab !== 'stock';
        const stockList = el('div', undefined, 'GameGrid');
        stockList.dataset.pane = 'stock';
        for (const grade of ['A', 'B', 'C']) {
            const node = el('div'); node.append(el('h3', `グレード${grade} 残り${s.stocks[grade].length}枚`));
            if (s.public[grade]) node.append(cardView(s.stocks[grade][0]));
            else node.append(el('p', '公開カードなし'));
            stockList.append(node);
        }
        stocks.append(stockList);
        const logs = section('進行記録', workspace, 'GameLogsPane'); logs.hidden = activeTab !== 'logs';
        const logText = el('pre', s.logs.join('\n'), 'GameLog'); logText.dataset.pane = 'logs'; logs.append(logText);
        const controls = section('仕事の進行', scroll, 'GameControls');
        controls.append(el('p', s.logs.at(-1), 'GameLatestLog'));
        if (s.phase === 'play') {
            controls.append(el('p', '任意のタイミングで仕事を終了できます。余った画材はチラシ制作・信用更新に使われます。'),
                button('一日の仕事を終える', () => act(() => game.endDay()), !canPlay));
        } else if (s.phase === 'betweenDays') controls.append(button('翌日の仕事を始める', () => act(() => game.nextDay())));
        updateAchievements();
        for (const node of scroll.querySelectorAll('[data-pane]')) node.scrollTop = positions.get(node.dataset.pane) ?? 0;
        if (s.pending) selectionPanel(s.pending);
    }
    render();
}

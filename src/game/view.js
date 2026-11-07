import { createGameSession } from './session.js';
import { gameIssues } from './engine.js';
import { matchingDice, satisfiesSelection } from './goals.js';
import { displayLabel } from '../effectCatalog.js';
import { copyPaintingIconDrawers, dieFaceIcon, releasePaintingIcons } from '../cardIcons.js';
import { Card } from './Card.js';
import { cardLocations, changedCardAreas, createGameAreaTransitions } from './areaTransitions.js';
import './view.css';

const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
};
function button(text, action, disabled = false) {
    const node = el('button', text, 'Button texture-raised'); node.type = 'button'; node.disabled = disabled;
    node.addEventListener('click', action); return node;
}
export const faceLabel = face => face.special ? `特殊面：${displayLabel(face.special)}` : `${displayLabel(face.color)}・${displayLabel(face.material)}`;
const phaseLabel = { play: '制作中', start: 'ターン開始処理', end: 'ターン終了処理', betweenDays: '一日の仕事を終了', finished: 'ゲーム終了' };

export function mountGame(root, settings, onMenu, presentation = null) {
    const issues = gameIssues(settings);
    if (issues.length) {
        root.replaceChildren(el('h2', '設定が制作途中のため開始できません'), el('pre', issues.join('\n'), 'StartIssues'), button('入口へ戻る', onMenu));
        return;
    }
    const candidateOrigins = new Map();
    let candidateSource;
    const session = createGameSession(settings, {
        onCandidateAcquired(id) {
            if (candidateSource) candidateOrigins.set(id, candidateSource);
        },
    });
    const game = session.game;
    let disposed = false;
    let selected = new Set();
    let activeTab = 'play';
    let moving = false;
    const scroll = el('div', undefined, 'GameBoard');
    if (presentation) root.append(scroll); else root.replaceChildren(scroll);
    const scope = presentation ? root : scroll;
    const transitions = presentation ? { captureCard() {}, captureCandidate() {}, play() {}, refresh() {}, dispose() {} } : createGameAreaTransitions(root, scroll, {
        copyCardDrawing: copyPaintingIconDrawers,
        createCardTransfer(key, element, from, to) {
            const card = new Card(key, element);
            card.setReveal(from === 'deck', to === 'deck');
            element.style.setProperty('--painting-x', '0px');
            element.style.setProperty('--painting-y', '0px');
            return card;
        },
    });
    function setActionLock(locked) {
        for (const node of scope.querySelectorAll('[data-game-action]')) {
            if (locked && !node.disabled) {
                node.dataset.transferLocked = '';
                node.disabled = true;
            } else if (!locked && 'transferLocked' in node.dataset) {
                delete node.dataset.transferLocked;
                node.disabled = false;
            }
        }
    }
    function openChoice() {
        const dialog = scope.querySelector('.GameChoice');
        if (dialog?.isConnected && !dialog.open) dialog.showModal();
    }
    function act(action, source = null) {
        if (moving) return;
        const before = cardLocations(game.state);
        candidateSource = source;
        try {
            session.dispatch(action);
        } finally {
            candidateSource = null;
        }
        const transfers = changedCardAreas(before, cardLocations(game.state)).map(move => {
            placements.delete(move.to + ':' + move.id);
            inspectedSteps.delete(move.to + ':' + move.id);
            return { ...move, source: transitions.captureCard(move.from, move.id) };
        });
        for (const { id } of game.state.dice) {
            const origin = candidateOrigins.get(id);
            if (origin) {
                transfers.push({ id, from: 'candidates', to: 'dice', source: origin });
                candidateOrigins.delete(id);
            }
        }
        selected = new Set();
        activeTab = 'play';
        moving = !presentation && transfers.length > 0;
        render();
        if (!moving) return;
        const running = transfers.map(transfer => transitions.play(transfer));
        Promise.allSettled(running).then(results => {
            if (disposed) return;
            moving = false;
            setActionLock(false);
            openChoice();
            for (const result of results) {
                if (result.status === 'rejected') console.error(result.reason);
            }
        });
    }
    function gameButton(text, action, disabled) {
        const node = button(text, action, disabled);
        node.dataset.gameAction = '';
        return node;
    }
    const placements = new Map();
    const inspectedSteps = new Map();
    function cardPlacement(area, id) {
        const key = area + ':' + id;
        if (!placements.has(key)) {
            const yRange = area === 'stock' ? 0.45 : 1;
            placements.set(key, { x: Math.random() * 2 - 1, y: (Math.random() * 2 - 1) * yRange, angle: Math.random() * 3 - 1.5 });
        }
        return placements.get(key);
    }
    function cardView(card, area = 'choice', detail = false) {
        const component = new Card(card.id);
        const key = area + ':' + card.id;
        component.setPresentation(area, detail ? { x: 0, y: 0, angle: 0 } : cardPlacement(area, card.id));
        const remembered = inspectedSteps.get(key);
        component.setFace(game.definitions[card.id], card.step,
            remembered?.current === card.step ? remembered.selected : card.step,
            selected => inspectedSteps.set(key, { current: card.step, selected }));
        const node = el('div', undefined, 'GameCardSlot');
        const actions = el('div', undefined, 'GameCardActions');
        const face = component.element;
        node.append(face, actions);
        if (!detail) {
            face.setAttribute('aria-haspopup', 'dialog');
            face.addEventListener('click', event => {
                if (!moving && !event.target.closest('button, .CardIcon')) openCardDetail(card, area, face, actions);
            });
        }
        return node;
    }
    function openCardDetail(card, area, source, sourceActions) {
        const dialog = el('dialog', undefined, 'GameCardDetail');
        dialog.setAttribute('aria-label', game.definitions[card.id].name);
        const detail = cardView(card, area, true);
        const face = detail.querySelector('.PaintingCard');
        const viewport = el('div', undefined, 'GameCardDetailViewport');
        face.replaceWith(viewport);
        viewport.append(face);
        face.classList.toggle('state-achievable', source.classList.contains('state-achievable'));
        const actions = detail.querySelector('.GameCardActions');
        function close() {
            dialog.close();
        }
        face.addEventListener('click', event => {
            if (!event.target.closest('button, .CardIcon')) close();
        });
        for (const action of sourceActions.querySelectorAll('button')) {
            actions.append(button(action.textContent, () => {
                close();
                action.click();
            }, action.disabled));
        }
        actions.append(button('閉じる', close));
        dialog.addEventListener('close', () => {
            releasePaintingIcons(dialog);
            dialog.remove();
            const selectedTab = face.querySelector('[aria-selected="true"]');
            const sourceTabs = [...source.querySelectorAll('[role="tab"]')];
            const sourceTab = sourceTabs.find(tab => tab.textContent === selectedTab?.textContent);
            if (source.isConnected && sourceTab?.getAttribute('aria-selected') !== 'true') sourceTab?.click();
        }, { once: true });
        dialog.append(detail);
        scroll.append(dialog);
        dialog.showModal();
    }
    function cardArea(section, key) {
        const area = el('div', undefined, 'GameCardArea');
        area.dataset.pane = key;
        const content = el('div', undefined, 'GameGrid GameCardAreaContent');
        if (key === 'hand') content.classList.add('GameHandCards');
        area.append(content);
        section.append(area);
        return content;
    }
    function facesView(faces, lifetime, current) {
        const row = el('div', undefined, 'DieFaces');
        faces.forEach((face, i) => {
            const slot = el('span', undefined, `DieFaceSlot${i === current ? ' state-current' : ''}`);
            slot.append(dieFaceIcon(face, lifetime, `${i + 1}面：${faceLabel(face)}${i === current ? '（現在）' : ''}`),
                el('span', `${i + 1}${i === current ? ' 現在' : ''}`, 'DieFaceIndex'));
            row.append(slot);
        });
        return row;
    }
    function diceView(die) {
        const node = el('article', undefined, `GameDie Surface texture-paper${die.used ? ' state-used' : ''}`);
        node.dataset.dieId = die.id;
        node.append(el('strong', `${die.id} · ${displayLabel(die.lifetime)} · ${die.used ? '消費済み' : '未使用'}`),
            facesView(die.faces, die.lifetime, die.current));
        return node;
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
        const candidateNodes = new Map();
        const submit = button('選択を確定', () => {
            const ids = [...selected];
            const candidate = candidateNodes.get(ids[0]);
            act(() => game.choose(ids), candidate ? transitions.captureCandidate(candidate) : null);
        }, true);
        const count = el('p', '選択数：0');
        const update = () => { count.textContent = `選択数：${selected.size}`; submit.disabled = selected.size < pending.min || selected.size > pending.max; };
        for (const option of pending.options) {
            let item;
            if (pending.kind === 'candidates') {
                item = el('article', undefined, 'GameDie Surface texture-paper');
                item.append(el('strong', `候補${Number(option.id) + 1}`), facesView(option.faces, option.lifetime, -1));
                candidateNodes.set(option.id, item);
            } else if (pending.kind === 'dice') item = diceView(game.state.dice.find(d => d.id === option.id));
            else {
                const card = [...game.state.hand, ...Object.values(game.state.stocks).flat()].find(c => c.id === option.id);
                item = cardView(card);
            }
            checkbox(item, option.id, `${pending.kind === 'candidates' ? '候補' + (Number(option.id) + 1) : option.id}を選択`, update);
            list.append(item);
        }
        const footer = el('div', undefined, 'GameChoiceFooter'); footer.append(count, submit);
        node.append(list, footer);
        update();
    }
    function render() {
        const positions = new Map([...scope.querySelectorAll('[data-pane]')].map(node => [node.dataset.pane, node.scrollTop]));
        releasePaintingIcons(scope);
        presentation?.clear();
        scroll.replaceChildren(); const s = game.state;
        const status = section(`${s.day}日目 · ${phaseLabel[s.phase]}${s.pending ? '（効果を選択中）' : ''}`, scroll, 'GameStatus');
        status.append(el('p', `名声 ${s.fame} / 信用 ${s.credit} / リロール権 ${s.rerolls} / 出荷 ${s.shipped.length}枚`),
            el('p', `チラシ ${s.flyers}枚 · 制作進捗 ${s.progress}/2 · 次回発注 ${s.orderCost}枚`));
        const menu = button('入口へ戻る', () => { dispose(); onMenu(); }); status.append(menu);
        if (s.phase === 'finished') {
            status.append(el('h2', `結果：${s.day}日 · 名声 ${s.fame} · 出荷 ${s.shipped.length}枚`), button('もう一度遊ぶ', () => {
                dispose();
                mountGame(root, settings, onMenu, presentation);
            }));
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
            const node = diceView(die);
            if (canPlay && !die.used) {
                checkbox(node, die.id, `${die.id}を達成に使用`, updateAchievements);
                node.querySelector('input').dataset.gameAction = '';
            }
            const reroll = gameButton('↻', () => act(() => game.reroll(die.id)), !canPlay || die.used || !s.rerolls);
            reroll.setAttribute('aria-label', `${die.id}をリロール`); reroll.title = `${die.id}をリロール`;
            node.append(reroll); diceList.append(node);
        }
        diceSection.append(diceList, gameButton('全未使用ダイスをリロール', () => act(() => game.reroll()), !canPlay || !s.rerolls || !s.dice.some(d => !d.used)));
        diceSection.title = 'ダイスにチェックを付け、制作中の作品の達成ボタンで確定します。';
        const cardZones = [['field', '制作中'], ['hand', '手札'], ['shipped', '出荷済み作品']];
        if (presentation) cardZones.push(['discard', '捨て札']);
        for (const [key, label] of cardZones) {
            const zone = section(`${label} ${s[key].length}枚`, workspace, `GameCardsPane ${key}`);
            zone.hidden = key === 'shipped' ? activeTab !== 'shipped' : activeTab !== 'play';
            const list = cardArea(zone, key);
            for (const [index, card] of s[key].entries()) {
                const node = cardView(card, key);
                const match = key === 'hand' || key === 'field' ? matchingDice(game.step(card).goals, s.dice) : null;
                const face = node.querySelector('.PaintingCard');
                face.classList.toggle('state-achievable', !!match);
                if (match) face.setAttribute('aria-label', '達成可能');
                if (key === 'hand') {
                    const intervals = Math.max(3, s.hand.length - 1);
                    node.style.setProperty('--hand-position', index / intervals);
                    node.querySelector('.GameCardActions').prepend(gameButton('場にプレイ', () => act(() => game.play(card.id)), !canPlay || s.hand.length < 2));
                }
                if (key === 'field') {
                    const action = gameButton('選択ダイスで達成', () => act(() => game.achieve(card.id, [...selected])), true);
                    achieveButtons.push({ card, node: action }); node.querySelector('.GameCardActions').prepend(action);
                }
                list.append(node);
            }
        }
        const stocks = section('公開ストック', workspace, 'GameStockPane');
        stocks.hidden = activeTab !== 'stock';
        const counts = el('p', undefined, 'GamePileCounts');
        for (const [area, label] of [['deck', 'デッキ'], ['discard', '捨て札']]) {
            const count = el('span', `${label} ${s[area].length}枚`);
            count.dataset.transferAnchor = area;
            counts.append(count);
        }
        stocks.append(counts);
        const stockList = cardArea(stocks, 'stock');
        for (const grade of ['A', 'B', 'C']) {
            const cards = s.stocks[grade];
            const node = el('div');
            node.append(el('h3', `グレード${grade} 残り${cards.length}枚`));
            if (cards.length) {
                const pile = el('div', undefined, 'GameStockPile');
                pile.style.setProperty('--stack-layers', cards.length - 1);
                for (let index = cards.length - 1; index >= 0; index--) {
                    const card = cards[index];
                    let face;
                    if (index === 0 && s.public[grade]) {
                        face = cardView(card, 'stock').firstElementChild;
                    } else {
                        const component = new Card(card.id);
                        component.setPresentation('stock', cardPlacement('stock', card.id));
                        component.setBack();
                        face = component.element;
                    }
                    face.style.setProperty('--stack-layer', cards.length - 1 - index);
                    pile.append(face);
                }
                node.append(pile);
            }
            if (!s.public[grade]) node.append(el('p', '公開カードなし'));
            stockList.append(node);
        }
        const logs = section('進行記録', workspace, 'GameLogsPane'); logs.hidden = activeTab !== 'logs';
        const logText = el('pre', s.logs.join('\n'), 'GameLog'); logText.dataset.pane = 'logs'; logs.append(logText);
        const controls = section('仕事の進行', scroll, 'GameControls');
        controls.append(el('p', s.logs.at(-1), 'GameLatestLog'));
        if (s.phase === 'play') {
            controls.append(el('p', '任意のタイミングで仕事を終了できます。余った画材はチラシ制作・信用更新に使われます。'),
                gameButton('一日の仕事を終える', () => act(() => game.endDay()), !canPlay));
        } else if (s.phase === 'betweenDays') controls.append(gameButton('翌日の仕事を始める', () => act(() => game.nextDay())));
        updateAchievements();
        if (s.pending) selectionPanel(s.pending);
        presentation?.present(scroll, s);
        for (const node of scope.querySelectorAll('[data-pane]')) node.scrollTop = positions.get(node.dataset.pane) ?? 0;
        transitions.refresh();
        if (moving) setActionLock(true);
        else openChoice();
    }
    function dispose() {
        disposed = true;
        releasePaintingIcons(scope);
        transitions.dispose();
        presentation?.clear();
        scroll.remove();
    }
    render();
    return { session, dispose };
}

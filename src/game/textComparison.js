import { createGameSession } from './session.js';
import { currentFace } from './dice.js';
import { satisfiesSelection } from './goals.js';
import { goalGroups } from '../goalGroups.js';
import { displayLabel } from '../effectCatalog.js';
import { sampleResources, startTraceAction, trace } from './startupTrace.js';
import { CanvasArea } from '../ui/screenLayout/CanvasArea.js';
import { areaDefinitions } from '../ui/screenLayout/ScreenLayout.js';

class ComparisonCanvasArea extends CanvasArea {
    draws = 0;

    draw() {
        super.draw();
        this.draws++;
    }
}

function element(tag, text = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
}

function button(text, click) {
    const node = element('button', text);
    node.type = 'button';
    node.addEventListener('click', click);
    return node;
}

function faceText(face) {
    if (!face) return 'ロール待ち';
    return face.special ? displayLabel(face.special) : [face.color, face.material].filter(Boolean).map(displayLabel).join('・');
}

export function mountTextComparison(root, settings, onFinished, calculateLayout) {
    const session = createGameSession(settings, { manualDayStart: true });
    const { game } = session;
    const s = game.state;
    let sampledDay = 0;
    let layoutApplications = 0;
    let panelOpen = false;
    const canvasAreas = Object.entries(areaDefinitions).map(([id, definition]) => {
        const canvas = element('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        return new ComparisonCanvasArea(id, null, definition, canvas);
    });
    const cardName = id => `${id} ${game.definitions[id].name}`;
    const dieText = die => `${die.id} ${faceText(currentFace(die))}${die.used ? '（消費済み）' : ''}`;

    function act(kind, change, detail = {}) {
        startTraceAction();
        const firstLog = s.logs.length;
        trace('action-start', { kind, day: s.day, phase: s.phase, ...detail });
        session.dispatch(change);
        if (s.phase === 'betweenDays') session.dispatch(() => game.nextDay());
        trace('action', { kind, day: s.day, phase: s.phase, ...detail, logs: s.logs.slice(firstLog) });
        s.effectNotices.length = 0;
        render();
    }

    function section(title, parent = root) {
        const node = element('section');
        node.append(element('h2', title));
        parent.append(node);
        return node;
    }

    function render() {
        const state = { day: s.day, phase: s.phase };
        const start = trace('view-render-start', state);
        renderView();
        trace('view-render-end', { ...state, start });
    }

    function renderView() {
        const sample = stage => sampleResources(stage, {
            mode: 'text', canvases: root.querySelectorAll('canvas').length, layoutApplications,
            canvasDraws: canvasAreas.reduce((count, area) => count + area.draws, 0),
        }, s.day);
        root.replaceChildren();
        if (s.phase === 'finished') {
            sample('disposed');
            onFinished(s.fame, s.shipped.length);
            return;
        }
        if (s.pending) renderChoice(s.pending);
        const board = element('div');
        board.className = 'TextComparisonBoard';
        board.append(...canvasAreas.map(area => area.canvas));
        const info = section(`${s.day}日目`, board);
        info.append(element('p',
            `名声 ${s.fame} / 信用 ${s.credit} / リロール権 ${s.rerolls} / チラシ ${s.flyers}枚（制作 ${s.progress}/2、次回発注 ${s.orderCost}枚）`));
        if (s.phase === 'awaitingStart') info.append(button('今日の仕事を始める', () => act('begin-day', () => game.beginDay())));
        const canPlay = s.phase === 'play' && !s.pending;
        const selected = new Set();
        const controls = [];
        const dice = section('画材ダイス', board);
        for (const die of s.dice) {
            const row = element('div');
            const label = element('label', dieText(die));
            if (canPlay && !die.used) {
                const input = element('input');
                input.type = 'checkbox';
                input.dataset.dieId = die.id;
                input.addEventListener('change', () => {
                    if (input.checked) selected.add(die.id); else selected.delete(die.id);
                    updateControls();
                });
                label.prepend(input);
            }
            row.append(label);
            dice.append(row);
        }
        const hand = section(`手札 ${s.hand.length}枚`, board);
        const field = section(`制作中 ${s.field.length}枚`, board);
        for (const [zone, cards] of [[hand, s.hand], [field, s.field]]) {
            for (const card of cards) {
                const row = element('div');
                row.dataset.cardId = card.id;
                const step = game.step(card);
                const goals = goalGroups(step.goals).map(group => group.map(faceText).join(' ＋ ')).join(' または ');
                row.append(element('strong', `${cardName(card.id)} · Step ${card.step}`), element('p', `目標 ${goals}`));
                if (step.playEffects.length) row.append(element('p', `着手時 ${step.playEffects.map(effect => game.effectLabel(effect)).join('、')}`));
                if (step.achievementEffects.length) row.append(element('p', `達成時 ${step.achievementEffects.map(effect => game.effectLabel(effect)).join('、')}`));
                if (canPlay && zone === hand && s.hand.length >= 2) {
                    row.append(button('着手', () => act('play', () => game.play(card.id), { id: card.id })));
                }
                if (canPlay && zone === field) {
                    const achieve = button('達成', () => act('achieve', () => game.achieve(card.id, [...selected]), { id: card.id }));
                    row.append(achieve);
                    controls.push({ node: achieve, enabled: () => satisfiesSelection(step.goals, s.dice, [...selected]) });
                }
                zone.append(row);
            }
        }
        const stock = section('ストック', board);
        const deck = section(`デッキ ${s.deck.length}枚`, board);
        const discard = section(`捨て札 ${s.discard.length}枚`, board);
        for (const grade of ['A', 'B', 'C']) {
            const id = s.public[grade];
            stock.append(element('p', `${grade}：${s.stocks[grade].length}枚${id ? ' · ' + cardName(id) : ''}`));
        }
        const shipped = section(`出荷済み ${s.shipped.length}枚`, field);
        for (const card of s.shipped) shipped.append(element('p', cardName(card.id)));
        if (canPlay) {
            const all = button('すべての画材を更新する', () => act('reroll-all', () => game.reroll()));
            const one = button('1つの画材を更新する', () => act('reroll-one', () => game.reroll([...selected][0])));
            dice.append(all, one);
            controls.push(
                { node: all, enabled: () => s.rerolls > 0 && s.dice.some(die => !die.used) },
                { node: one, enabled: () => s.rerolls > 0 && selected.size === 1 },
            );
            info.append(button('今日の仕事を終える', () => act('end-day', () => game.endDay())));
        }
        info.append(element('p', s.logs.at(-1)));
        const panel = button('ストックを開く', () => {
            panelOpen = !panelOpen;
            applyLayout();
        });
        root.append(board, panel);
        const areas = { info, play: field, palette: dice, hand, stock, deck, discard };
        applyLayout();
        if (s.phase === 'awaitingStart' && sampledDay !== s.day) {
            sampledDay = s.day;
            sample('day-ready');
        }
        updateControls();

        function applyLayout() {
            const frame = calculateLayout(panelOpen ? 1 : 0);
            if (!frame) return;
            const start = trace('layout-apply-start', { mode: frame.mode, panelOpen });
            board.style.height = `${frame.height}px`;
            for (const [id, node] of Object.entries(areas)) {
                const { rect, visible } = frame.areas[id];
                Object.assign(node.style, {
                    left: `${rect.x}px`, top: `${rect.y}px`,
                    width: `${rect.width}px`, height: `${rect.height}px`,
                });
                node.hidden = !visible;
                node.dataset.textArea = id;
            }
            const canvasStart = trace('canvas-layout-start', { mode: frame.mode });
            for (const area of canvasAreas) area.applyLayout(frame.areas[area.id], window.devicePixelRatio);
            trace('canvas-layout-end', {
                start: canvasStart, draws: canvasAreas.reduce((count, area) => count + area.draws, 0),
            });
            panel.hidden = frame.mode === 'A';
            panel.textContent = panelOpen ? 'ストックを閉じる' : 'ストックを開く';
            panel.setAttribute('aria-expanded', String(panelOpen));
            trace('layout-apply-end', { start, count: ++layoutApplications });
        }

        function updateControls() {
            for (const { node, enabled } of controls) node.disabled = !enabled();
        }
    }

    function renderChoice(pending) {
        const group = section(pending.title);
        group.append(element('p', `${pending.min}〜${pending.max}個を選択`));
        const selected = new Set();
        const confirm = button('選択を確定', () => act('choose', () => game.choose([...selected]), { choice: pending.kind }));
        confirm.disabled = pending.min > 0;
        for (const option of pending.options) {
            let labelText;
            if (pending.kind === 'candidates') labelText = `候補 ${Number(option.id) + 1}：${option.faces.map(faceText).join(' / ')}`;
            else if (pending.kind === 'dice') labelText = dieText(s.dice.find(die => die.id === option.id));
            else labelText = cardName(option.id);
            const label = element('label', labelText);
            const input = element('input');
            input.type = 'checkbox';
            input.value = option.id;
            input.addEventListener('change', () => {
                if (input.checked) selected.add(option.id); else selected.delete(option.id);
                confirm.disabled = selected.size < pending.min || selected.size > pending.max;
            });
            label.prepend(input);
            const row = element('div');
            row.append(label);
            group.append(row);
        }
        group.append(confirm);
    }
    render();
}

import { createGameSession } from './session.js';
import { currentFace } from './dice.js';
import { satisfiesSelection } from './goals.js';
import { displayLabel } from '../effectCatalog.js';
import { sampleResources, startTraceAction, trace } from './startupTrace.js';

function element(tag, text = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
}

function button(text, click) {
    const node = element('button', text);
    node.type = 'button';
    node.tabIndex = -1;
    node.className = 'Button texture-raised';
    node.addEventListener('click', click);
    return node;
}

function faceText(face) {
    if (!face) return 'ロール待ち';
    return face.special ? displayLabel(face.special) : [face.color, face.material].filter(Boolean).map(displayLabel).join('・');
}

export function mountSynchronousComparison(root, settings, presentation, onFinished) {
    const session = createGameSession(settings, { manualDayStart: true });
    const { game } = session;
    const s = game.state;
    let sampledDay = 0;
    const cardName = id => `${id} ${game.definitions[id].name}`;
    const dieText = die => `${die.id} ${faceText(currentFace(die))}${die.used ? '（消費済み）' : ''}`;

    presentation.initialize(game.definitions, s);

    async function act(kind, change, detail = {}) {
        startTraceAction();
        const firstLog = s.logs.length;
        trace('action-start', { kind, day: s.day, phase: s.phase, ...detail });
        session.dispatch(change);
        if (s.phase === 'betweenDays') session.dispatch(() => game.nextDay());
        trace('action', { kind, day: s.day, phase: s.phase, ...detail, logs: s.logs.slice(firstLog) });
        s.effectNotices.length = 0;
        root.inert = true;
        try {
            await presentation.present(s);
            render();
        } finally {
            root.inert = false;
        }
    }

    function section(title, area) {
        const node = element('section');
        if (area) node.dataset.comparisonArea = area;
        node.append(element('h2', title));
        root.append(node);
        return node;
    }

    function render() {
        const state = { day: s.day, phase: s.phase };
        const start = trace('view-render-start', state);
        renderView();
        if (s.phase !== 'finished') presentation.renderControls(root, s);
        trace('view-render-end', { ...state, start });
    }

    function renderView() {
        root.replaceChildren();
        if (s.phase === 'finished') {
            presentation.dispose();
            sampleResources('disposed', presentation.resources(), s.day);
            onFinished(s.fame, s.shipped.length);
            return;
        }
        const info = section(`${s.day}日目`, 'info');
        info.append(element('p', `名声 ${s.fame}　信用 ${s.credit}　チラシ ${s.flyers}枚`),
            element('p', `制作 ${s.progress}/2　次回発注 ${s.orderCost}枚　出荷済み ${s.shipped.length}枚`));
        if (s.phase === 'awaitingStart' && sampledDay !== s.day) {
            sampledDay = s.day;
            sampleResources('day-ready', presentation.resources(), s.day);
        }
        if (s.pending) renderChoice(s.pending);
        const dayActions = section('', 'play');
        dayActions.classList.add('ComparisonDayActions');
        if (s.phase === 'awaitingStart') dayActions.append(button('今日の仕事を始める', () => act('begin-day', () => game.beginDay())));
        const canPlay = s.phase === 'play' && !s.pending;
        const selected = new Set();
        const controls = [];
        const dice = section(`リロール権 ${s.rerolls}`, 'palette');
        const faces = element('div');
        faces.className = 'ComparisonDice';
        dice.append(faces);
        for (const die of s.dice) {
            const row = element('div');
            row.className = 'ComparisonDie';
            const label = element('label', faceText(currentFace(die)));
            row.classList.toggle('is-used', die.used);
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
            faces.append(row);
        }
        const hand = section('', 'hand');
        const field = section('', 'play');
        hand.classList.add('ComparisonCardActions');
        field.classList.add('ComparisonCardActions');
        for (const [zone, cards] of [[hand, s.hand], [field, s.field]]) {
            for (const card of cards) {
                const row = element('div');
                row.dataset.cardId = card.id;
                const step = game.step(card);
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
        if (canPlay) {
            const all = button('すべての画材を更新する', () => act('reroll-all', () => game.reroll()));
            const one = button('1つの画材を更新する', () => act('reroll-one', () => game.reroll([...selected][0])));
            dice.append(all, one);
            controls.push(
                { node: all, enabled: () => s.rerolls > 0 && s.dice.some(die => !die.used) },
                { node: one, enabled: () => s.rerolls > 0 && selected.size === 1 },
            );
            dayActions.append(button('今日の仕事を終える', () => act('end-day', () => game.endDay())));
        }
        updateControls();

        function updateControls() {
            for (const { node, enabled } of controls) node.disabled = !enabled();
        }
    }

    function renderChoice(pending) {
        const group = section(pending.title);
        group.className = 'ComparisonChoice';
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

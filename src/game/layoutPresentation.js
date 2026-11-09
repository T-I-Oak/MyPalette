import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { createHandPresentation } from './handPresentation.js';
import { createPlayPresentation } from './playPresentation.js';
import { createPlayEffects } from './playEffects.js';
import { createPalettePresentation } from './palettePresentation.js';
import './layoutGame.css';

// Each host can later be replaced by an area-specific renderer.
export function createLayoutPresentation(screen) {
    const hosts = new Map();
    for (const [id, area] of screen.areas) {
        const host = document.createElement('div');
        host.className = 'GameAreaHost';
        host.dataset.gameArea = id;
        host.setAttribute('aria-label', area.name);
        const object = new MoveObject(`game:${id}`, host);
        area.setSlot(object.id, { x: 0, y: 0, width: area.logicalWidth, height: area.logicalHeight });
        area.place(object, object.id);
        hosts.set(id, { host, object });
    }
    const handPresentation = createHandPresentation(screen.areas.get('hand'), hosts.get('hand').host);
    const palettePresentation = createPalettePresentation(screen.areas.get('palette'), hosts.get('palette').host, () => screen.render());
    const playPresentation = createPlayPresentation(screen.areas.get('play'), hosts.get('play').host, () => screen.render());
    const effects = createPlayEffects(screen, hosts.get('play').host, playPresentation, screen.areas.get('play').canvas.closest('.LayoutScreen'), palettePresentation);
    const unsubscribe = screen.subscribe(() => {
        for (const [id, { object }] of hosts) {
            const area = screen.areas.get(id);
            area.setSlot(object.id, { x: 0, y: 0, width: area.logicalWidth, height: area.logicalHeight });
        }
        handPresentation.update();
        palettePresentation.update();
        playPresentation.update();
    });
    function clear() {
        handPresentation.clear();
        palettePresentation.clear();
        playPresentation.clear();
        for (const [id, { host }] of hosts) {
            // Keep the palette connected so unrelated renders do not restart its CSS animations.
            if (id === 'palette') continue;
            // Closed panel hosts are detached, so the screen root cannot release their observers.
            releasePaintingIcons(host);
            host.replaceChildren();
        }
    }
    return {
        clear,
        reset: palettePresentation.reset,
        searchFaces: palettePresentation.searchFaces,
        beginAction: effects.begin,
        field: effects.field,
        hasAnimation: effects.hasWork,
        animate: effects.run,
        cancelEffects: effects.cancel,
        present(board, state, actions) {
            const move = (id, selector) => {
                const node = board.querySelector(selector);
                node.hidden = false;
                hosts.get(id).host.append(node);
                return node;
            };
            move('info', '.GameStatus');
            const infoControls = move('info', '.GameControls');
            const palette = move('palette', '.GameDicePane');
            palettePresentation.present(palette, state, actions);
            effects.hideDestination(board);
            const field = move('play', '.field');
            playPresentation.present(field, { ...state, field: effects.field(state) });
            playPresentation.setEndDayButton(infoControls.querySelector('[data-game-end-day]'));
            const hand = move('hand', '.hand');
            hand.querySelector('h2').remove();
            handPresentation.present(hand);
            move('stock', '.GameStockPane');
            move('discard', '.discard');
            const deck = hosts.get('deck').host;
            const title = document.createElement('h2');
            title.textContent = `デッキ ${state.deck.length}枚`;
            title.dataset.transferAnchor = 'deck';
            const note = document.createElement('p');
            note.textContent = '翌日の開始時に4枚ドローします。';
            deck.append(title, note);
            const info = hosts.get('info').host;
            for (const [selector, label] of [['.shipped', '出荷済み作品を確認'], ['.GameLogsPane', '進行記録を確認']]) {
                const content = board.querySelector(selector);
                content.hidden = false;
                const dialog = document.createElement('dialog');
                dialog.className = 'GameInspection';
                dialog.setAttribute('aria-label', label);
                const close = document.createElement('button'); close.tabIndex = -1;
                close.className = 'Button texture-raised'; close.textContent = '閉じる';
                close.addEventListener('click', () => dialog.close());
                dialog.append(close, content); board.append(dialog);
                const open = document.createElement('button'); open.tabIndex = -1;
                open.className = 'Button texture-raised'; open.textContent = label;
                open.addEventListener('click', () => dialog.showModal()); info.append(open);
            }
            board.querySelector('.GameTabs').remove();
            board.querySelector('.GameWorkspace').remove();
        },
        dispose() {
            effects.cancel();
            clear(); unsubscribe();
            handPresentation.dispose();
            palettePresentation.dispose();
            playPresentation.dispose();
            for (const { object } of hosts.values()) object.area.remove(object);
        },
    };
}

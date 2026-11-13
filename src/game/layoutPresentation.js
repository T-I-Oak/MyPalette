import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { createHandPresentation } from './handPresentation.js';
import { createPlayPresentation } from './playPresentation.js';
import { createPalettePresentation } from './palettePresentation.js';
import { createStockPresentation } from './stockPresentation.js';
import { createCardScene } from './cardScene.js';
import { createCardSceneTimeline } from './cardSceneTimeline.js';
import { createInfoPresentation } from './infoPresentation.js';
import { createFlyerMotion } from './flyerMotion.js';
import './layoutGame.css';

export function createLayoutPresentation(screen, resultGraphics) {
    const hosts = new Map();
    for (const [id, area] of screen.areas) {
        const host = document.createElement('div'); host.className = 'GameAreaHost'; host.dataset.gameArea = id;
        host.setAttribute('aria-label', area.name);
        const object = new MoveObject(`game:${id}`, host);
        area.setSlot(object.id, { x: 0, y: 0, width: area.logicalWidth, height: area.logicalHeight }); area.place(object, object.id);
        hosts.set(id, { host, object });
    }
    const hand = createHandPresentation(screen.areas.get('hand'), hosts.get('hand').host);
    const stock = createStockPresentation(screen.areas.get('stock'), hosts.get('stock').host);
    const palette = createPalettePresentation(screen.areas.get('palette'), hosts.get('palette').host, () => screen.render(), resultGraphics);
    const play = createPlayPresentation(screen.areas.get('play'), hosts.get('play').host, () => screen.render());
    const infoArea = screen.areas.get('info');
    const info = createInfoPresentation(infoArea, hosts.get('info').host);
    const infoLabel = infoArea.fixedLayer.querySelector('.LayoutAreaName');
    infoLabel.hidden = true;
    const cards = createCardScene(screen, play); play.bindScene(cards);
    let renderGame, stockChoice;
    const flyer = createFlyerMotion(screen, palette, info);
    const timeline = createCardSceneTimeline(screen, cards, play, palette, flyer, info, () => renderGame());
    function counts() {
        if (!cards.display) return;
        for (const [id, label] of [['deck', 'デッキ'], ['discard', '捨て札']]) {
            const area = screen.areas.get(id), name = `${label} ${cards.counts[id]}枚`;
            area.name = name; area.fixedLayer.querySelector('.LayoutAreaName').textContent = name;
            area.canvas.setAttribute('aria-label', name);
        }
        for (const grade of ['A', 'B', 'C']) {
            const label = hosts.get('stock').host.querySelector(`[data-stock-grade="${grade}"] h3`);
            if (label) label.textContent = `グレード${grade} ${cards.counts.stocks[grade]}枚`;
        }
    }
    cards.onDraw(counts);
    const unsubscribe = screen.subscribe(() => {
        for (const [id, { object }] of hosts) {
            const area = screen.areas.get(id); area.setSlot(object.id, { x: 0, y: 0, width: area.logicalWidth, height: area.logicalHeight });
        }
        info.update(); hand.update(); stock.update(); palette.update(); play.update(); cards.update();
    });
    function clear() {
        hand.clear(); stock.clear(); palette.clear(); play.clear();
        for (const [id, { host }] of hosts) {
            if (id === 'palette' || id === 'info') continue;
            releasePaintingIcons(host); host.replaceChildren();
        }
    }
    return {
        cards, play,
        initialize: (definitions, state) => cards.initialize(definitions, state),
        cardComponent: cards.component,
        setAchievable: cards.achievable,
        clear,
        reset() { timeline.cancel(); cards.reset(); play.reset(); palette.reset(); info.reset(); },
        searchFaces: palette.searchFaces,
        beginAction(action) { timeline.begin(action); },
        hand: () => cards.display.hand,
        field: () => cards.display.field,
        stock: () => cards.display,
        hasAnimation: timeline.hasWork,
        async animate(state, render, completeAchievement, resumeRecycle, resumeDayEnd) {
            renderGame = render;
            await timeline.run(state, completeAchievement, resumeRecycle, resumeDayEnd);
        },
        cancelEffects: timeline.cancel,
        async recover(state, render) {
            timeline.cancel(); cards.busy = true; cards.restoreVisibility(); play.dropCanvases(); cards.adopt(state); render();
            await cards.move(state, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300, 'recovery');
            cards.busy = false; cards.update();
        },
        present(board, state, actions) {
            const move = (id, selector) => {
                const node = board.querySelector(selector); node.hidden = false; hosts.get(id).host.append(node); return node;
            };
            info.present(state);
            const status = board.querySelector('.GameStatus');
            const infoControls = board.querySelector('.GameControls');
            palette.present(move('palette', '.GameDicePane'), state, actions);
            play.present(move('play', '.field'), { ...state, field: cards.display.field });
            play.setEndDayButton(infoControls.querySelector('[data-game-end-day]'));
            const gameActions = document.createElement('div'); gameActions.className = 'PlaySessionActions';
            gameActions.append(...status.querySelectorAll(':scope > .GameAnimationNotice'));
            const handSection = move('hand', '.hand'); handSection.querySelector('h2').remove(); hand.present(handSection);
            stock.present(move('stock', '.GameStockPane'), { ...state, stocks: cards.display.stocks, public: cards.display.public }, actions);
            const choice = actions.stockSelection ? JSON.stringify(state.pending) : null;
            if (choice && choice !== stockChoice) screen.openPanel(); stockChoice = choice;
            board.querySelector('.discard').remove();
            play.setSessionActions(gameActions);
            status.remove();
            infoControls.remove();
            board.querySelector('.GameTabs').remove(); board.querySelector('.GameWorkspace').remove();
            cards.inspect(actions.inspectCard); counts(); cards.update(); cards.draw();
        },
        dispose() {
            timeline.cancel(); clear(); unsubscribe(); cards.dispose(); hand.dispose(); stock.dispose(); palette.dispose(); play.dispose();
            infoLabel.hidden = false;
            for (const { object } of hosts.values()) object.area.remove(object);
        },
    };
}

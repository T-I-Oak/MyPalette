import {
    MoveArea, MoveObject, createDomTransitionSurface, createMoveManager,
} from '../ui/areaTransition/index.js';

const cardAreas = ['deck', 'hand', 'field', 'discard', 'shipped'];
const leftEdgeAreas = new Set(['field', 'discard', 'shipped']);
const reducedMotion = '(prefers-reduced-motion: reduce)';

export function cardLocations(state) {
    const entries = cardAreas.flatMap(area => state[area].map(card => [card.id, area]));
    entries.push(...Object.values(state.stocks).flat().map(card => [card.id, 'stock']));
    return new Map(entries);
}

export function changedCardAreas(before, after) {
    return [...after].flatMap(([id, to]) => {
        const from = before.get(id);
        if (!from || from === to) return [];
        // A recycled card is drawn from the deck after the discard pile is shuffled.
        return [{ id, from: from === 'discard' && to === 'hand' ? 'deck' : from, to }];
    });
}

function bounds(node) {
    const { x, y, width, height } = node.getBoundingClientRect();
    return width && height ? { x, y, width, height } : null;
}

function capture(node) {
    const rect = bounds(node);
    if (!rect) return null;
    const element = node.cloneNode(true);
    const canvases = element.querySelectorAll('canvas');
    node.querySelectorAll('canvas').forEach((canvas, index) => {
        if (canvas.width && canvas.height) canvases[index].getContext('2d').drawImage(canvas, 0, 0);
    });
    element.removeAttribute('data-card-id');
    element.removeAttribute('data-die-id');
    element.classList.add('GameTransferPiece');
    return { rect, element };
}

export function offscreenCardRect(area, { y, width, height }, viewportWidth) {
    const x = leftEdgeAreas.has(area) ? -width : viewportWidth;
    return { x: area === 'stock' ? x + width : x, y, width, height };
}

export function createGameAreaTransitions(root, board) {
    const document = root.ownerDocument;
    const window = document.defaultView;
    const host = document.createElement('div');
    host.className = 'GameTransferLayer';
    root.append(host);
    const dom = createDomTransitionSurface(host);
    const active = new Map();
    const controller = new AbortController();
    let lastFrame;
    const surface = {
        ...dom,
        // The board owns the stationary elements and their grid layout.
        renderInArea() {},
        removeFromArea() {},
        scheduleFrame(callback) {
            dom.scheduleFrame(time => {
                if (time !== lastFrame) {
                    lastFrame = time;
                    for (const transfer of active.values()) updateTarget(transfer);
                }
                callback(time);
            });
        },
    };
    const manager = createMoveManager(surface);
    const areas = new Map([...cardAreas, 'stock', 'candidates', 'dice'].map(id => [
        id, new MoveArea(id, surface),
    ]));

    function find(area, id) {
        const attribute = area === 'dice' ? 'dieId' : 'cardId';
        const selector = area === 'dice' ? '[data-die-id]' : '[data-card-id]';
        return [...board.querySelectorAll(`[data-pane="${area}"] ${selector}`)]
            .find(node => node.dataset[attribute] === id);
    }

    function updateTarget(transfer) {
        const { id, to, key, origin } = transfer;
        const node = find(to, id);
        const target = node ? bounds(node) : anchorBounds(to);
        if (node) node.classList.add('GameTransferTarget');
        areas.get(to).setSlot(key, target ?? offscreenCardRect(to, origin, window.innerWidth));
    }

    function anchorBounds(area) {
        const anchor = board.querySelector(`[data-transfer-anchor="${area}"]`);
        return anchor ? bounds(anchor) : null;
    }

    function play({ id, from, to, source }) {
        const node = find(to, id);
        if (window.matchMedia(reducedMotion).matches) return null;
        const visual = source?.element ? source : node && capture(node);
        if (!visual) return null;
        const key = `${from === 'candidates' ? 'die' : 'card'}:${id}`;
        const origin = source?.rect ?? offscreenCardRect(from, visual.rect, window.innerWidth);
        const object = new MoveObject(key, visual.element);
        object.element.dataset.gameTransfer = key;
        object.element.dataset.transferFrom = from;
        object.element.dataset.transferTo = to;
        const sourceArea = areas.get(from);
        const targetArea = areas.get(to);
        sourceArea.setSlot(key, origin);
        sourceArea.place(object, key);
        const transfer = { id, to, key, origin };
        active.set(key, transfer);
        updateTarget(transfer);
        return manager.move({
            object, from: sourceArea, to: targetArea, slot: key, durationMs: 280,
            signal: controller.signal,
        }).finally(() => {
            active.delete(key);
            find(to, id)?.classList.remove('GameTransferTarget');
            object.area?.remove(object);
            sourceArea.deleteSlot(key);
            targetArea.deleteSlot(key);
        });
    }

    return {
        captureCard: (area, id) => {
            const node = find(area, id);
            if (node) return capture(node);
            const rect = anchorBounds(area);
            return rect ? { rect } : null;
        },
        captureCandidate: capture,
        play,
        refresh() {
            for (const transfer of active.values()) updateTarget(transfer);
        },
        dispose() {
            controller.abort();
            host.remove();
        },
    };
}

import { Card } from './Card.js';
import { layoutDeck } from './deckLayout.js';
import { stockMetrics as m } from './stockLayout.js';
import './deck.css';

export function createDeckPresentation(area, host) {
    host.classList.add('DeckArea');
    const title = area.fixedLayer.querySelector('.LayoutAreaName');
    title.dataset.transferAnchor = 'deck';
    const placements = new Map();
    let cards = [], override = null;
    function placementFor(id) {
        if (!placements.has(id)) placements.set(id,
            { x: Math.random() * 2 - 1, y: (Math.random() * 2 - 1) * .45, angle: Math.random() * 3 - 1.5 });
        return placements.get(id);
    }
    function update() {
        const shown = override ?? cards;
        const name = `デッキ ${shown.length}枚`;
        title.textContent = name; area.name = name;
        area.canvas.setAttribute('aria-label', name); host.setAttribute('aria-label', name);
        const slot = layoutDeck(area.logicalWidth, area.logicalHeight);
        for (const node of host.children) {
            const index = shown.findIndex(card => card.id === node.dataset.deckCardId);
            node.style.left = `${slot.x}px`;
            node.style.top = `${slot.y - (shown.length - 1 - index) * m.thickness}px`;
        }
    }
    function draw() {
        host.replaceChildren();
        const shown = override ?? cards;
        for (let index = shown.length - 1; index >= 0; index--) {
            const card = shown[index];
            const component = new Card(card.id);
            component.setPresentation('deck', placementFor(card.id)); component.setBack();
            component.element.dataset.deckCardId = card.id;
            component.element.style.zIndex = String(shown.length - index);
            host.append(component.element);
        }
        update();
    }
    return { update, placementFor,
        present(state) { cards = state.deck; draw(); },
        show(value) { override = value; draw(); },
        reset() { cards = []; override = null; placements.clear(); draw(); },
        finish() { override = null; draw(); },
    };
}

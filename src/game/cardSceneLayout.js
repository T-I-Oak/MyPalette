import { layoutHand } from './handLayout.js';
import { layoutStock, stockMetrics as m } from './stockLayout.js';
import { layoutDeck, discardScatter } from './deckLayout.js';
import { shippedRect } from './infoLayout.js';

export const cardZones = ['deck', 'hand', 'field', 'discard', 'shipped'];
export function cardSceneSnapshot(state) {
    return Object.fromEntries([...cardZones, 'stocks', 'public'].map(key => [key, structuredClone(state[key])]));
}
export function locateSceneCards(state) {
    const result = new Map();
    for (const zone of cardZones) state[zone].forEach((card, index) => result.set(card.id, { ...card, area: zone, index }));
    for (const [grade, cards] of Object.entries(state.stocks)) cards.forEach((card, index) => result.set(card.id, { ...card, area: 'stock', grade, index }));
    return result;
}
export function scatteredPlacement(area, random = Math.random) {
    const range = area === 'discard' ? discardScatter : { x: 1, y: area === 'stock' || area === 'deck' ? .45 : 1, angle: 1.5 };
    return area === 'field' || area === 'shipped' ? { x: 0, y: 0, angle: 0 }
        : { x: (random() * 2 - 1) * range.x, y: (random() * 2 - 1) * range.y, angle: (random() * 2 - 1) * range.angle };
}
export function placementMatrix(value) {
    return new DOMMatrix().translate(m.cardWidth / 2, m.cardHeight / 2).translate(value.x, value.y)
        .rotate(value.angle).translate(-m.cardWidth / 2, -m.cardHeight / 2);
}
export function sceneCardPose(screen, state, card, placement, play) {
    const { area, id, index, grade } = card;
    if (area === 'field') return { matrix: play.cardMatrix(id), flip: 0, z: 100 + index };
    if (area === 'shipped') {
        const owner = screen.areas.get('info');
        const rect = owner.readScreenRect(shippedRect(owner.logicalWidth, owner.logicalHeight, index, state.shipped.length));
        return { matrix: new DOMMatrix().translate(rect.x, rect.y).scale(rect.height / m.cardHeight).toFloat64Array(), flip: 0, z: 500 + index };
    }
    const owner = screen.areas.get(area);
    let slot, flip = 0, z = index;
    if (area === 'hand') slot = layoutHand(owner.logicalWidth, owner.logicalHeight, state.hand.length)[index];
    else if (area === 'stock') {
        slot = { ...layoutStock(owner.logicalWidth, owner.logicalHeight)[['A', 'B', 'C'].indexOf(grade)] };
        slot.y -= (state.stocks[grade].length - 1 - index) * m.thickness;
        flip = state.public[grade] === id ? 0 : 180; z = state.stocks[grade].length - index;
    } else {
        slot = layoutDeck(owner.logicalWidth, owner.logicalHeight);
        slot.y -= (area === 'deck' ? state.deck.length - 1 - index : index) * m.thickness;
        flip = area === 'deck' ? 180 : 0; z = area === 'deck' ? state.deck.length - index : index;
    }
    const rect = owner.readScreenRect({ ...slot, width: m.cardWidth, height: m.cardHeight });
    return { matrix: new DOMMatrix().translate(rect.x, rect.y).scale(rect.width / m.cardWidth)
        .multiply(placementMatrix(placement)).toFloat64Array(), flip, z: 100 + z };
}

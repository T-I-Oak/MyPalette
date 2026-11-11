import { stockMetrics as m } from './stockLayout.js';

// Reserve the larger discard scatter in both piles, including all 45 cards.
export const discardScatter = Object.freeze({ x: 24, y: 8, angle: 10 });
const angle = discardScatter.angle * Math.PI / 180;
export const pileEnvelope = Object.freeze({
    width: m.cardWidth * Math.cos(angle) + m.cardHeight * Math.sin(angle) + 2 * discardScatter.x,
    height: m.cardHeight * Math.cos(angle) + m.cardWidth * Math.sin(angle) + 2 * discardScatter.y,
});
export const deckStandardSize = Object.freeze({
    width: Math.ceil(pileEnvelope.width + 2 * m.bottomPadding),
    height: Math.ceil(pileEnvelope.height + 44 * m.thickness + m.lift + 2 * m.bottomPadding),
});
export function layoutDeck(width, height) {
    return { x: (width - m.cardWidth) / 2,
        y: (height - deckStandardSize.height) / 2 + m.bottomPadding + m.lift + 44 * m.thickness + (pileEnvelope.height - m.cardHeight) / 2 };
}

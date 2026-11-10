import { stockMetrics as m } from './stockLayout.js';

// All 45 cards can reach the deck. Reserve their thickness so the pile never changes scale with its count.
export const deckStandardSize = Object.freeze({
    width: Math.ceil(m.envelopeWidth + 2 * m.bottomPadding),
    height: Math.ceil(m.envelopeHeight + 44 * m.thickness + m.lift + 2 * m.bottomPadding),
});
export function layoutDeck(width, height) {
    return { x: (width - m.cardWidth) / 2,
        y: (height - deckStandardSize.height) / 2 + m.bottomPadding + m.lift + 44 * m.thickness };
}

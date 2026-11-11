import { layoutDeck } from './deckLayout.js';
import { stockMetrics as m } from './stockLayout.js';

export const recycleTiming = Object.freeze({ spread: 420, gather: 420, transfer: 420 });
export const sineProgress = progress => (1 - Math.cos(Math.PI * progress)) / 2;

// index 0 is the card that was on top of the discard pile.
export function recycleFrame({ width, height, count, index, placement }, time) {
    const slot = layoutDeck(width, height);
    const layer = count - 1 - index;
    const spreadX = count === 1 ? slot.x : m.bottomPadding + index * (width - 2 * m.bottomPadding) / (count - 1) - m.cardWidth / 2;
    const first = Math.min(1, Math.max(0, time / recycleTiming.spread));
    const second = Math.min(1, Math.max(0, (time - recycleTiming.spread) / recycleTiming.gather));
    const x = time <= recycleTiming.spread
        ? slot.x + (spreadX - slot.x) * sineProgress(first)
        : spreadX + (slot.x - spreadX) * sineProgress(second);
    return { x, y: slot.y - layer * m.thickness, flip: 90 * (first + second),
        placement: { x: placement.x * (1 - sineProgress(first)), y: placement.y * (1 - first), angle: placement.angle * (1 - first) } };
}

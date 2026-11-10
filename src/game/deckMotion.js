import { stockTiming } from './stockMotion.js';

export const deckTiming = Object.freeze({ lift: stockTiming.lift, flip: stockTiming.flip, flight: 420,
    interval: stockTiming.lift + stockTiming.flip + stockTiming.stagger });

export function planDeckDraws(before, events) {
    let deck = structuredClone(before);
    const plan = [];
    for (const event of events) {
        if (event.kind === 'deal' || event.kind === 'recycle') deck = structuredClone(event.cards);
        else {
            plan.push({ card: { ...event.card }, deck: structuredClone(deck) });
            deck.shift();
        }
    }
    return plan;
}

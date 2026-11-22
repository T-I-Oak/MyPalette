import { stockTiming } from './stockMotion.js';

export const deckTiming = Object.freeze({ lift: stockTiming.lift, flip: stockTiming.flip, flight: 420,
    interval: stockTiming.lift + stockTiming.flip + stockTiming.stagger });

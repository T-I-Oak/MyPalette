import { matchingDice } from './goals.js';

// Derive from this render's state; no attention flag survives a day or game change.
export function endDayAttention(game, waiting = false) {
    const s = game.state;
    if (waiting || s.phase !== 'play' || s.pending || s.achievement || s.rollRequest ||
        s.recycleRequest || s.dayEndRequest || s.rerolls !== 0) return false;
    if (s.field.some(card => card.step < 3 && matchingDice(game.step(card).goals, s.dice) !== null)) return false;
    return s.hand.length === 1 || !s.hand.some(card => {
        const step = game.step(card);
        return step.playEffects.length > 0 || matchingDice(step.goals, s.dice) !== null;
    });
}

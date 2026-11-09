import { Game } from './engine.js';

export function createGameSession(settings, { random = Math.random, onCandidateAcquired, manualStartRoll = false, manualRolls = manualStartRoll, manualDayStart = false } = {}) {
    const game = new Game(settings, random, { onCandidateAcquired, manualRolls, manualDayStart });
    const listeners = new Set();
    const publish = () => { for (const listener of listeners) listener(game); };
    return {
        get game() { return game; },
        dispatch(action) { action(game); publish(); },
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    };
}

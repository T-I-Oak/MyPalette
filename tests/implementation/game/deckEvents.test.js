import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGameSession } from '../../../src/game/session.js';
import { deckTiming } from '../../../src/game/deckMotion.js';

const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url)));
test('初日の7枚受け入れと4枚ドローを実際の順序・stepで記録する', () => {
    const session = createGameSession(settings, { random: () => .4, manualDayStart: true, manualRolls: true });
    const original = structuredClone(session.game.state.stocks.A.slice(0, 7));
    session.dispatch(game => game.beginDay());
    const events = session.game.deckEvents;
    assert.deepEqual(events[0], { kind: 'deal', cards: original });
    assert.deepEqual(events.slice(1).map(event => event.card), original.slice(0, 4));
    assert.ok(deckTiming.interval >= deckTiming.lift + deckTiming.flip);
    session.dispatch(() => {});
    assert.deepEqual(session.game.deckEvents, []);
});

test('途中枯渇は抽選済みの再構成順を記録し、不足枚数を捏造しない', () => {
    const session = createGameSession(settings, { random: () => .4, manualDayStart: true });
    const state = session.game.state;
    state.deck = [{ id: 'A1', step: 1 }];
    state.discard = [{ id: 'A2', step: 2 }, { id: 'A3', step: 0 }];
    session.dispatch(game => game.draw(5));
    const events = session.game.deckEvents;
    assert.deepEqual(events.map(event => event.kind), ['draw', 'recycle', 'draw', 'draw']);
    assert.deepEqual(events.filter(event => event.kind === 'draw').map(event => event.card), state.hand);
    assert.deepEqual(events[1].cards, state.hand.slice(1));
    assert.deepEqual(state.deck, []);
    session.dispatch(game => game.draw(4));
    assert.deepEqual(session.game.deckEvents, []);
});

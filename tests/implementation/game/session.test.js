import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGameSession } from '../../../src/game/session.js';
const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url)));

test('all subscribers observe the same game after actions; inspection is read only', () => {
    const session = createGameSession(settings, { random: () => .4 });
    const updates = [];
    session.subscribe(game => updates.push(game));
    const before = structuredClone(session.game.state);
    assert.equal(session.game.state.hand.length, 4);
    assert.deepEqual(session.game.state, before);
    session.dispatch(game => game.reroll());
    assert.equal(updates[0], session.game);
    assert.equal(session.game.state.rerolls, 0);
});

test('pending effects enforce engine constraints and restart isolates old state and tasks', () => {
    const session = createGameSession(settings, { random: () => .4 });
    session.dispatch(game => game.run(game.effects([{ type: 'changeColor', color: 'red' }])));
    const old = session.game;
    assert.throws(() => session.dispatch(game => game.endDay()));
    session.dispatch(game => game.choose([game.state.dice[0].id]));
    assert.equal(old.state.pending, null);
    const replay = createGameSession(settings, { random: () => .4 });
    assert.notEqual(replay.game, old);
    assert.equal(replay.game.state.day, 1);
    old.state.credit = 0;
    assert.equal(replay.game.state.credit, 3);
});

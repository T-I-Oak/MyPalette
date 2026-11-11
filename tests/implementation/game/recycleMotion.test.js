import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../../src/game/engine.js';
import { recycleFrame, recycleTiming } from '../../../src/game/recycleMotion.js';

const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url)));

test('空デッキで必要になってから待機し、Step3再開時だけシャッフルする', () => {
    let calls = 0;
    const game = new Game(settings, () => { calls++; return .4; }, { manualDayStart: true, manualRecycle: true });
    const s = game.state;
    s.deck = [{ id: 'A01', step: 1 }];
    s.discard = [{ id: 'A02', step: 2 }, { id: 'A03', step: 0 }];
    const discard = structuredClone(s.discard), baseline = calls;
    game.deckEvents = [];
    game.run(game.drawCards(4));
    assert.equal(s.hand.length, 1);
    assert.deepEqual(game.deckEvents.map(event => event.kind), ['draw']);
    assert.deepEqual(s.discard, discard);
    assert.equal(calls, baseline);
    assert.equal(s.pending, null);
    const id = s.recycleRequest.id;
    game.completeRecycle(id);
    assert.ok(calls > baseline);
    assert.equal(s.recycleRequest, null);
    assert.equal(s.hand.length, 3);
    assert.deepEqual(s.discard, []);
    assert.deepEqual(game.deckEvents.map(event => event.kind), ['draw', 'recycle', 'draw', 'draw']);
    assert.throws(() => game.completeRecycle(id));
});

test('デッキが残る場合や両山が空の場合は再構成待機を作らない', () => {
    const game = new Game(settings, () => .4, { manualDayStart: true, manualRecycle: true });
    game.state.deck = [{ id: 'A01', step: 0 }];
    game.run(game.drawCards(1));
    assert.equal(game.state.recycleRequest, null);
    game.run(game.drawCards(1));
    assert.equal(game.state.recycleRequest, null);
    assert.equal(game.task, null);
});

test('全カード同時の横移動はサイン補間、薄い面を経て裏面になり、ずれを解消する', () => {
    const input = { width: 454, height: 609, count: 4, index: 0, placement: { x: 24, y: 8, angle: 10 } };
    const start = recycleFrame(input, 0);
    const edge = recycleFrame(input, recycleTiming.spread);
    const stacked = recycleFrame(input, recycleTiming.spread + recycleTiming.gather);
    assert.equal(start.flip, 0);
    assert.equal(edge.flip, 90);
    assert.equal(stacked.flip, 180);
    assert.deepEqual(stacked.placement, { x: 0, y: 0, angle: 0 });
    const next = recycleFrame({ ...input, index: 1 }, recycleTiming.spread + recycleTiming.gather);
    assert.equal(next.x, stacked.x);
    assert.equal(next.y - stacked.y, 1.5);
    const quarter = recycleFrame(input, recycleTiming.spread / 4);
    assert.ok(Math.abs((quarter.x - start.x) / (edge.x - start.x) - (1 - Math.cos(Math.PI / 4)) / 2) < 1e-9);
});

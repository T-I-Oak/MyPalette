import assert from 'node:assert/strict';
import test from 'node:test';
import { cardLocations, changedCardAreas, offscreenCardRect } from '../../../src/game/areaTransitions.js';

test('hidden piles enter from the right and discard exits to the left at the same height', () => {
    const rect = { x: 120, y: 30, width: 80, height: 100 };
    const right = { ...rect, x: 390 };
    assert.deepEqual(offscreenCardRect('stock', rect, 390), { ...right, x: 470 });
    assert.deepEqual(offscreenCardRect('deck', rect, 390), right);
    assert.deepEqual(offscreenCardRect('discard', rect, 390), { ...rect, x: -80 });
});

test('card presentation tracks the evaluation board areas and draws recycled cards from the deck', () => {
    const cards = (...ids) => ids.map(id => ({ id }));
    const before = cardLocations({
        deck: cards('deck'), hand: cards('play', 'return'), field: cards('discard'),
        discard: cards('recycled'), shipped: [], stocks: { A: cards('stock') },
    });
    const after = cardLocations({
        deck: [], hand: cards('deck', 'stock', 'recycled'), field: cards('play'),
        discard: cards('discard'), shipped: [], stocks: { A: cards('return') },
    });
    assert.deepEqual(changedCardAreas(before, after), [
        { id: 'deck', from: 'deck', to: 'hand' },
        { id: 'stock', from: 'stock', to: 'hand' },
        { id: 'recycled', from: 'deck', to: 'hand' },
        { id: 'play', from: 'hand', to: 'field' },
        { id: 'discard', from: 'field', to: 'discard' },
        { id: 'return', from: 'hand', to: 'stock' },
    ]);
});

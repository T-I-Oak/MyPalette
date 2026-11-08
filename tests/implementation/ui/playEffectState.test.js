import test from 'node:test';
import assert from 'node:assert/strict';
import { beginPlayEffect, effectField } from '../../../src/game/playEffectState.js';

test('達成済みのカードを元の位置で表示にだけ保持する', () => {
    const state = { field: [{ id: 'A01', step: 0 }, { id: 'A02', step: 2 }] };
    const effect = beginPlayEffect({ kind: 'achieve', id: 'A02' }, state);
    const after = { field: [{ id: 'A01', step: 0 }] };
    assert.deepEqual(effectField(after, effect), state.field);
    assert.equal(after.field.length, 1);
    effect.card.step = 3;
    assert.equal(effectField(after, effect)[1].step, 3);
    assert.equal(state.field[1].step, 2);
});

test('効果選択中も同じ作品を二重に表示しない', () => {
    const state = { field: [{ id: 'A01', step: 1 }] };
    const effect = beginPlayEffect({ kind: 'achieve', id: 'A01' }, state);
    assert.equal(effectField(state, effect).length, 1);
    assert.deepEqual(effectField(state, null), state.field);
});

test('着手時は増えた実際のfieldを使い、イーゼルだけ先に表示する', () => {
    const state = { hand: [{ id: 'A01', step: 0 }], field: [] };
    const effect = beginPlayEffect({ kind: 'play', id: 'A01' }, state);
    assert.equal(effect.stage, 'empty');
    assert.deepEqual(effectField({ field: state.hand }, effect), state.hand);
});

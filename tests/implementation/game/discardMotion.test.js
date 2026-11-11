import test from 'node:test';
import assert from 'node:assert/strict';
import { planDiscardTransfers } from '../../../src/game/discardMotion.js';

test('日末は捨て札に加わった順で手札・制作中からの移動だけを計画する', () => {
    const before = { hand: [{ id: 'A01', step: 0 }], field: [{ id: 'B01', step: 1 }], stocks: {}, discard: [{ id: 'C01', step: 0 }] };
    const after = { discard: [...before.discard, { id: 'A02', step: 0 }, ...before.hand, ...before.field] };
    assert.deepEqual(planDiscardTransfers(before, after), [
        { id: 'A01', step: 0, from: 'hand', index: 2 },
        { id: 'B01', step: 1, from: 'field', index: 3 },
    ]);
    assert.equal(before.hand.length, 1);
});

test('出荷・デッキへの再構成は捨て札への移動対象に含めない', () => {
    assert.deepEqual(planDiscardTransfers({ hand: [], field: [{ id: 'A01', step: 2 }], stocks: {}, discard: [{ id: 'B01', step: 0 }] },
        { discard: [{ id: 'C01', step: 0 }] }), []);
});

test('効果・発注のストック取得と同時の日末回収を、捨て札の順に計画する', () => {
    const before = { hand: [{ id: 'A01', step: 1 }], field: [],
        stocks: { A: [{ id: 'A02', step: 0 }], B: [{ id: 'B01', step: 0 }] } };
    assert.deepEqual(planDiscardTransfers(before, { discard: [{ id: 'B01', step: 0 }, ...before.hand] }), [
        { id: 'B01', step: 0, from: 'stock', index: 0 },
        { id: 'A01', step: 1, from: 'hand', index: 1 },
    ]);
    assert.deepEqual(planDiscardTransfers(before, { discard: [] }), []);
});

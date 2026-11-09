import test from 'node:test';
import assert from 'node:assert/strict';
import { planStockHandTransfers } from '../../../src/game/stockHandMotion.js';

test('手札交換の返却と取得をカードIDで追跡し、デッキのドローを含めない', () => {
    const before = { hand: [{ id: 'A1' }, { id: 'B1' }], stocks: { A: [{ id: 'A2' }], B: [], C: [] } };
    const returned = structuredClone(before);returned.hand.shift();returned.stocks.A.push({ id: 'A1', step: 0 });
    assert.deepEqual(planStockHandTransfers(before, returned), [{ id: 'A1', grade: 'A', from: 'hand', to: 'stock' }]);
    const acquired = structuredClone(returned);acquired.hand.push(acquired.stocks.A.shift());
    assert.deepEqual(planStockHandTransfers(returned, acquired), [{ id: 'A2', grade: 'A', from: 'stock', to: 'hand' }]);
    acquired.hand.push({ id: 'C9' });
    assert.deepEqual(planStockHandTransfers(returned, acquired), [{ id: 'A2', grade: 'A', from: 'stock', to: 'hand' }]);
    assert.deepEqual(planStockHandTransfers(before, before), []);
    assert.deepEqual(planStockHandTransfers({ ...returned, phase: 'awaitingStart' }, acquired), [], '初日のデッキ経由の配布は手札交換と区別');
});

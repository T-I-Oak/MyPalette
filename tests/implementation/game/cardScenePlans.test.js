import test from 'node:test';
import assert from 'node:assert/strict';
import { relocateSceneCards, sceneChanges, closingStockCards } from '../../../src/game/cardScenePlans.js';
import { cardSceneSnapshot } from '../../../src/game/cardSceneLayout.js';

function assertSceneCards(state, ids) {
    const all = [...['deck', 'hand', 'field', 'discard', 'shipped'].flatMap(area => state[area]), ...Object.values(state.stocks).flat()].map(card => card.id);
    if (all.length !== ids.length || new Set(all).size !== all.length || ids.some(id => !all.includes(id))) {
        throw new Error('Every physical card must have exactly one location');
    }
}

const initial = () => ({ hand: [{ id: 'A01', step: 0 }], field: [{ id: 'A02', step: 1 }, { id: 'A03', step: 0 }],
    deck: [], discard: [], shipped: [], stocks: { A: [{ id: 'A04', step: 0 }] }, public: { A: 'A04' } });

test('達成カードを同じIDで捨て札へ移し、残りのfieldを複製しない', () => {
    const before = initial(), actual = cardSceneSnapshot(before);
    actual.field.shift(); actual.discard.push({ id: 'A02', step: 2 });
    const result = relocateSceneCards(before, actual, ['A02']);
    assert.deepEqual(result.field, [{ id: 'A03', step: 0 }]);
    assert.deepEqual(result.discard, [{ id: 'A02', step: 2 }]);
    assertSceneCards(result, ['A01', 'A02', 'A03', 'A04']);
    assert.equal(before.field[0].step, 1);
});

test('後続のゲーム状態が進んでも表示のスナップショットを保持する', () => {
    const actual = initial(), display = cardSceneSnapshot(actual);
    actual.hand.splice(0); actual.field.push({ id: 'A01', step: 0 });
    assert.equal(display.hand.length, 1);
    assert.deepEqual(sceneChanges(display, actual), [{ id: 'A01', from: 'hand', to: 'field' }]);
    const result = relocateSceneCards(display, actual, ['A01']);
    assert.equal(result.field.length, 3);
    assert.equal(result.hand.length, 0);
    assert.equal(display.hand.length, 1);
});

test('ストック取得の到着先を確定しても、次の公開は別の動作として保持する', () => {
    const before = initial(), actual = cardSceneSnapshot(before);
    actual.stocks.A.shift(); actual.discard.push({ id: 'A04', step: 0 }); actual.public.A = null;
    const result = relocateSceneCards(before, actual, ['A04']);
    assert.equal(result.public.A, null);
    assert.deepEqual(result.discard, actual.discard);
    assert.equal(before.public.A, 'A04');
});

test('出荷後もカードを同じIDで一つ保持する', () => {
    const before = initial(), actual = cardSceneSnapshot(before);
    actual.field.shift(); actual.shipped.push({ id: 'A02', step: 3 });
    const result = relocateSceneCards(before, actual, ['A02']);
    assertSceneCards(result, ['A01', 'A02', 'A03', 'A04']);
    assert.deepEqual(result.shipped, [{ id: 'A02', step: 3 }]);
    assert.deepEqual(result.field, [{ id: 'A03', step: 0 }]);
});

test('1枚だけのストックでも、日末は公開カードを連続して裏返す対象にする', () => {
    const before = initial(), actual = cardSceneSnapshot(before); actual.public.A = null;
    assert.deepEqual(closingStockCards(before, actual), [{ id: 'A04', grade: 'A' }]);
});

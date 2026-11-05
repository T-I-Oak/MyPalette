import test from 'node:test';
import assert from 'node:assert/strict';
import { cardDifficulty } from '../../src/cardDifficulty.js';

test('難易度は各ステップの期待試行回数の合計', () => {
    assert.equal(cardDifficulty([.8, .5, .25]), 7.25);
    assert.equal(cardDifficulty([1, 1, 1]), 3);
    assert.equal(cardDifficulty([.0001, 1, 1]), 10002);
});
test('未設定を補完せず、達成率0なら達成不可となる', () => {
    assert.equal(cardDifficulty([.8, null, .25]), null);
    assert.equal(cardDifficulty([0, .5, .25]), Infinity);
});

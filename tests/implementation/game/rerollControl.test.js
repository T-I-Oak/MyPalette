import test from 'node:test';
import assert from 'node:assert/strict';
import { createRerollControl, needsRerollConfirmation } from '../../../src/game/rerollControl.js';

test('最後の手札だけが達成可能なら確認を省略し、制作中に達成可能なカードがあれば確認する', () => {
    const card = (id, color = 'red', step = 0) => ({ id, step, goals: [{ color }] });
    const game = { state: { hand: [], field: [], dice: [
        { id: 'd1', current: 0, used: false, faces: [{ color: 'red', material: 'brush' }] },
    ] }, step: card => card };
    const cases = [
        { hand: [card('h')], field: [], expected: false },
        { hand: [card('h')], field: [card('f', 'blue')], expected: false },
        { hand: [card('h')], field: [card('f')], expected: true },
        { hand: [card('h', 'blue')], field: [card('f')], expected: true },
        { hand: [card('h'), card('h2', 'blue')], field: [], expected: true },
        { hand: [], field: [card('f')], expected: true },
        { hand: [card('h', 'blue')], field: [], expected: false },
        { hand: [card('h')], field: [card('f', 'red', 3)], expected: false },
    ];
    for (const { hand, field, expected } of cases) {
        Object.assign(game.state, { hand, field });
        assert.equal(needsRerollConfirmation(game), expected, JSON.stringify({ hand, field }));
    }
});

function setup() {
    let allowed = true, achievable = true, answer, count = 0, target;
    const control = createRerollControl({
        canReroll: () => allowed, hasAchievable: () => achievable,
        confirm: callback => { answer = callback; return () => {}; },
        execute: id => { count++; target = id; },
    });
    return { control, allow: value => allowed = value, achievable: value => achievable = value,
        answer: value => answer(value), result: () => ({ count, target }) };
}
test('確認待ち・戻るでは実行せず、再確認の実行は1回だけ', () => {
    const s = setup(); s.control.request('d1'); s.control.request('d2');
    assert.equal(s.result().count, 0); s.answer(false); assert.equal(s.result().count, 0);
    s.control.request('d1'); s.answer(true); s.answer(true);
    assert.deepEqual(s.result(), { count: 1, target: 'd1' });
});
test('達成可能なしの全リロールは直接実行する', () => {
    const s = setup(); s.achievable(false); s.control.request();
    assert.deepEqual(s.result(), { count: 1, target: undefined });
});
test('開始時・確認後の無効条件と破棄後は実行しない', () => {
    const s = setup(); s.allow(false); s.control.request(); assert.equal(s.result().count, 0);
    s.allow(true); s.control.request(); s.allow(false); s.answer(true); assert.equal(s.result().count, 0);
    s.allow(true); s.control.request(); s.control.dispose(); s.answer(true); s.control.request();
    assert.equal(s.result().count, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { creditAtRisk, flyerCounts, flyerIconWidth, iconRunWidth, infoFormats, infoStandardSize, shippedRect } from '../../../src/game/infoLayout.js';

test('日末に減る信用は使用済み・特殊面・未確定のダイスを除いて求める', () => {
    const normal = { current: 0, faces: [{ special: null }] };
    const excluded = [{ ...normal, used: true }, { ...normal, current: null }, { current: 0, faces: [{ special: 'draw' }] }];
    const state = { phase: 'play', credit: 3, dice: [...Array(4).fill(normal), ...excluded] };
    assert.equal(creditAtRisk(state), 2);
    assert.equal(creditAtRisk({ ...state, credit: 1 }), 1);
    assert.equal(creditAtRisk({ ...state, dice: [normal, ...excluded] }), 0);
    assert.equal(creditAtRisk({ ...state, phase: 'awaitingStart' }), 0);
    assert.equal(creditAtRisk({ ...state, rollRequest: {} }), 0);
});

test('チラシは横幅に応じて未作成のみ、完成済みのみ、両方の順で集約する', () => {
    const compactFlyerWidth = 2 * iconRunWidth(999, true, flyerIconWidth) + iconRunWidth(1, false, flyerIconWidth) + 6;
    const fixed = infoStandardSize.width - compactFlyerWidth;
    const state = { credit: 10, flyers: 8, progress: 1, orderCost: 14 };
    assert.deepEqual(flyerCounts(state), [8, 1, 5]);
    for (const [available, credit, completed, missing] of [
        [300, false, false, false],
        [250, true, false, true],
        [200, true, true, false],
        [165, true, true, true],
    ]) {
        assert.deepEqual(infoFormats(state, fixed + available), { credit, completed, missing });
    }
    assert.deepEqual(flyerCounts({ ...state, progress: 0 }), [8, 0, 6]);
    assert.deepEqual(flyerCounts({ ...state, flyers: 15 }), [15, 1, 0]);
    assert.equal(iconRunWidth(10_000, true), iconRunWidth(999, true));
});

test('出荷済みカンバスは最新の作品を右端に揃えて2枚分の幅に収める', () => {
    const { width, height } = infoStandardSize;
    const right = shippedRect(width, height, 0, 1);
    const left = shippedRect(width, height, 0, 2);
    assert.ok(Math.abs(right.x + right.width - (width - 6)) < 1e-9);
    assert.ok(Math.abs(left.x + left.width + 4 - right.x) < 1e-9);
    assert.deepEqual(shippedRect(width, height, 1, 2), right);
    assert.deepEqual(shippedRect(width, height, 0, 3), left);
    assert.deepEqual(shippedRect(width, height, 2, 3), right);
    assert.ok(Math.abs(shippedRect(width, height, 1, 3).x - (left.x + right.x) / 2) < 1e-9);
});

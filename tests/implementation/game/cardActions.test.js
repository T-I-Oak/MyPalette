import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardActions } from '../../../src/game/cardActions.js';

test('表示後の所属変更・通知・終了と古い操作の再実行を拒否する', () => {
    let enabled = true, area = 'hand', calls = 0;
    const actions = createCardActions(() => [{ id: 'play', label: '場にプレイ', visible: area === 'hand', enabled, execute() { calls++; area = 'field'; } }]);
    const play = actions.forCard('A01')[0];
    enabled = false;
    assert.equal(play.run(), false);
    enabled = true;
    assert.equal(play.run(), true);
    assert.equal(play.run(), false);
    assert.equal(calls, 1);
});

test('同期的な再入と同じ定義の二重実行を拒否し、次の取得は新しい定義で扱う', () => {
    let calls = 0, nested;
    const actions = createCardActions(() => [{ id: 'acquire', label: '取得', visible: true, enabled: true, execute() { calls++; nested = action.run(); } }]);
    const action = actions.forCard('A01')[0];
    assert.equal(action.run(), true);
    assert.equal(nested, false);
    assert.equal(action.run(), false);
    assert.equal(actions.forCard('A02')[0].run(), true);
    assert.equal(calls, 2);
});

test('有効状態を再取得し、操作のないカードも同じ経路で返す', () => {
    let enabled = false;
    const actions = createCardActions(id => id === 'A01' ? [{ id: 'achieve', label: '達成', visible: true, enabled, execute() {} }] : []);
    assert.equal(actions.forCard('A01')[0].enabled, false);
    enabled = true;
    assert.equal(actions.forCard('A01')[0].enabled, true);
    assert.deepEqual(actions.forCard('B01'), []);
});

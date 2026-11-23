import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameCardActions } from '../../../src/game/gameCardActions.js';

function setup() {
    const s = { phase: 'play', hand: [{ id: 'A01', step: 0 }, { id: 'A02', step: 0 }], field: [],
        stocks: { A: [{ id: 'A03', step: 0 }] }, public: { A: 'A03' }, dice: [], pending: null };
    let blocked = false, selected = [], calls = [];
    const game = { state: s, step: () => ({ goals: [{ color: 'yellow' }] }),
        play: id => calls.push(['play', id]), choose: ids => calls.push(['choose', ids]), achieve: (id, dice) => calls.push(['achieve', id, dice]) };
    const actions = createGameCardActions({ game, blocked: () => blocked, selection: () => selected, act: fn => fn(), animated: false });
    return { s, actions, calls, block: value => { blocked = value; }, select: ids => { selected = ids; } };
}
test('手札のプレイは通知・演出・終了・所属変更後に拒否する', () => {
    const x = setup(), action = x.actions.forCard('A01')[0];
    x.block(true); assert.equal(action.run(), false);
    x.block(false); x.s.phase = 'finished'; assert.equal(action.run(), false);
    x.s.phase = 'play'; assert.equal(action.run(), true);
    assert.deepEqual(x.calls, [['play', 'A01']]);
    const stale = x.actions.forCard('A01')[0]; x.s.hand.shift(); assert.equal(stale.run(), false);
});
test('取得は現在の公開カードと選択要求に限定し、連続取得は新しい要求を使用する', () => {
    const x = setup(); x.s.pending = { kind: 'stock', options: [{ id: 'A03' }] };
    const old = x.actions.forCard('A03')[0];
    x.s.pending = { kind: 'stock', options: [{ id: 'A03' }] };
    assert.equal(old.run(), false);
    const next = x.actions.forCard('A03')[0];
    x.s.public.A = null; assert.equal(next.run(), false);
    x.s.public.A = 'A03'; assert.equal(next.run(), true);
    assert.deepEqual(x.calls, [['choose', ['A03']]]);
});
test('達成は選択ダイスと現在のステップに照合し、古い選択を実行しない', () => {
    const x = setup(); x.s.field = [x.s.hand.shift()];
    x.s.dice = [{ id: 'D1', used: false, current: 0, faces: [{ color: 'yellow' }] }];
    assert.equal(x.actions.forCard('A01')[0].enabled, false);
    x.select(['D1']); const achieve = x.actions.forCard('A01')[0];
    x.select([]); assert.equal(achieve.run(), false);
    x.select(['D1']); assert.equal(achieve.run(), true);
    assert.deepEqual(x.calls, [['achieve', 'A01', ['D1']]]);
});

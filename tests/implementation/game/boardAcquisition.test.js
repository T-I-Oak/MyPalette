import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoardAcquisition } from '../../../src/game/boardAcquisition.js';

function setup(mode = 'B', open = false) {
    let revision = 0;
    const calls = [];
    const screen = {
        get panelState() { return { mode, open, manualRevision: revision }; },
        openPanel() { open = true; calls.push('open'); },
        closePanel() { open = false; calls.push('close'); },
    };
    return { manager: createBoardAcquisition(screen), calls,
        manual() { revision++; open = !open; }, mode(value) { mode = value; } };
}
const stock = { kind: 'stock' }, handReturn = { kind: 'handReturn' };
const update = (s, pending, ready = true, waiting = false) => s.manager.update({ pending, phase: 'play' }, { ready, waiting });

test('連続取得・交換の選択再描画と通知・移動待ちでは閉じず、完了後に閉じる', () => {
    const s = setup();
    update(s, stock); update(s, stock, false, true); update(s, stock);
    update(s, handReturn, false, true); update(s, handReturn); update(s, stock);
    update(s, null, false, true);
    assert.deepEqual(s.calls, ['open']);
    update(s, null); update(s, null);
    assert.deepEqual(s.calls, ['open', 'close']);
});
test('手動で開いたボードと途中で閉じて開いたボードは閉じない', () => {
    for (const initiallyOpen of [true, false]) {
        const s = setup('B', initiallyOpen);
        update(s, stock);
        if (!initiallyOpen) { s.manual(); s.manual(); }
        update(s, stock, false, true); update(s, stock); update(s, null);
        assert.deepEqual(s.calls, initiallyOpen ? [] : ['open']);
    }
});
test('手動クローズを連続選択で上書きせず、次の操作では自動開閉できる', () => {
    const s = setup(); update(s, stock); s.manual();
    update(s, handReturn); update(s, stock); update(s, null);
    assert.deepEqual(s.calls, ['open']);
    update(s, stock); update(s, null);
    assert.deepEqual(s.calls, ['open', 'open', 'close']);
});
test('Aでは開閉せず、Bへ切り替えた選択は開き、Aに戻した完了では閉じない', () => {
    const s = setup('A'); update(s, stock);
    assert.deepEqual(s.calls, []);
    s.mode('B'); update(s, stock);
    s.mode('A'); update(s, null);
    assert.deepEqual(s.calls, ['open']);
});
test('対象なし・選択待ち・リセット・終了では不要な開閉をしない', () => {
    const s = setup(); update(s, null); update(s, stock, false, true);
    assert.deepEqual(s.calls, []);
    update(s, stock); s.manager.reset(); update(s, null);
    assert.deepEqual(s.calls, ['open']);
    s.manual(); update(s, stock);
    s.manager.update({ phase: 'finished', pending: null }, { ready: true, waiting: false });
    assert.deepEqual(s.calls, ['open', 'open']);
});

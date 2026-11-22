import test from 'node:test';
import assert from 'node:assert/strict';
import { createDayStartFlow } from '../../../src/game/dayStartFlow.js';

test('中央で翌日へ進め、帰着後に一度だけ朝を開始する', async () => {
    const state = { phase: 'betweenDays', day: 1 };
    const calls = [];
    let finish;
    const flow = createDayStartFlow({
        state,
        present: async (initial, change) => { calls.push(initial); change(); await new Promise(resolve => { finish = resolve; }); },
        advance: () => { calls.push('date'); state.day++; state.phase = 'awaitingStart'; },
        begin: () => { calls.push('morning'); state.phase = 'start'; },
    });
    const running = flow.start();
    await flow.start();
    assert.deepEqual(calls, [false, 'date']);
    finish(); await running;
    assert.deepEqual(calls, [false, 'date', 'morning']);
    await flow.start();
    assert.equal(calls.length, 3);
});

test('初日は日付を進めず、破棄後には朝を開始しない', async () => {
    const state = { phase: 'awaitingStart', day: 1 };
    let finish, began = 0;
    const flow = createDayStartFlow({ state,
        present: async (initial, change, signal) => {
            assert.equal(initial, true); change();
            await new Promise(resolve => { finish = resolve; signal.addEventListener('abort', resolve); });
        },
        advance: () => assert.fail('初日の日付更新'), begin: () => began++,
    });
    const running = flow.start(); flow.dispose(); finish(); await running;
    assert.equal(began, 0);
    await flow.start(); assert.equal(began, 0);
});

test('ゲーム終了時には演出も翌日も開始しない', async () => {
    const flow = createDayStartFlow({ state: { phase: 'finished' },
        present: () => assert.fail(), advance: () => assert.fail(), begin: () => assert.fail() });
    await flow.start();
});

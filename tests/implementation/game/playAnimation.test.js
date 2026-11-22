import test from 'node:test';
import assert from 'node:assert/strict';
import { animateProgress } from '../../../src/game/playAnimation.js';

function frames(t) {
    const callbacks = new Map();
    let id = 0;
    t.mock.method(globalThis, 'requestAnimationFrame', callback => { callbacks.set(++id, callback); return id; });
    t.mock.method(globalThis, 'cancelAnimationFrame', key => callbacks.delete(key));
    return time => {
        const [key, callback] = callbacks.entries().next().value;
        callbacks.delete(key); callback(time);
    };
}

globalThis.requestAnimationFrame ??= () => {};
globalThis.cancelAnimationFrame ??= () => {};

test('初期描画が700ms遅れても拡大の中間フレームを省略しない', async t => {
    const tick = frames(t), values = [], controller = new AbortController();
    const running = animateProgress(520, value => values.push(value), controller.signal, { maxFrameTime: 1000 / 30 });
    tick(0); tick(700);
    assert.ok(values[1] > 0 && values[1] < .1);
    for (let time = 720; values.at(-1) < 1; time += 20) tick(time);
    assert.equal(await running, true);
    assert.ok(values.some(value => value > .4 && value < .6));
});

test('通常の演出は従来の経過時間で進め、制限中も破棄できる', async t => {
    const tick = frames(t), values = [];
    const running = animateProgress(520, value => values.push(value), new AbortController().signal);
    tick(0); tick(700);
    assert.deepEqual(values, [0, 1]);
    assert.equal(await running, true);
    const controller = new AbortController();
    const interrupted = animateProgress(520, () => {}, controller.signal, { maxFrameTime: 1000 / 30 });
    tick(0); controller.abort();
    assert.equal(await interrupted, false);
});

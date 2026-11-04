import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DiceGroup } from '../../../src/dice/DiceGroup.js';
const faces = Array.from({ length: 6 }, () => ({ color: 'blue', material: 'pastel' }));
const add = (group, id) => group.add({ id, faces });

test('群は全対象の停止を待ち、順序とIDを維持する', async () => {
    const group = new DiceGroup();
    const a = add(group, 'a'), b = add(group, 'b'), c = add(group, 'c');
    const promise = group.roll(['b', 'a']);
    assert.equal(c.state, 'ready');
    b.settle(4);
    await Promise.resolve();
    assert.equal(group.rolling, true);
    a.settle(1);
    assert.deepEqual((await promise).map(result => [result.id, result.index]), [['b', 4], ['a', 1]]);
    assert.equal(group.rolling, false);
    group.dispose();
});
test('対象検証は全件を開始前に行い、消費済み・重複・存在しないIDを拒否', async () => {
    const group = new DiceGroup();
    const a = add(group, 'a'), b = add(group, 'b');
    b.setConsumed(true);
    await assert.rejects(group.roll(['a', 'b']));
    await assert.rejects(group.roll(['a', 'a']));
    await assert.rejects(group.roll(['unknown']));
    assert.equal(a.state, 'ready');
    assert.throws(() => add(group, 'a'));
    const pending = group.roll(['a']);
    await assert.rejects(group.roll(['a']));
    group.remove('a');
    assert.equal((await pending)[0].status, 'cancelled');
    group.dispose();
});
test('物理シミュレーションで停止し、上面・返却結果が一致する', async () => {
    const group = new DiceGroup({ random: () => .37 });
    add(group, 'a'); add(group, 'b');
    const pending = group.roll();
    for (let i = 0; i < 3600 && group.dice.some(die => die.state === 'rolling'); i++) group.step(1 / 60);
    const results = await pending;
    for (const result of results) {
        assert.equal(result.status, 'settled');
        assert.equal(result.index, group.get(result.id).top.index);
        assert.ok(group.get(result.id).top.alignment > .99);
    }
    assert.ok(group.collisions > 0);
    group.dispose();
    assert.equal(group.world.bodies.length, 0);
});
test('破棄は群の待機を解決し、全対象と物理資源を解放する', async () => {
    const group = new DiceGroup();
    add(group, 'a'); add(group, 'b');
    const pending = group.roll();
    group.dispose();
    assert.ok((await pending).every(result => result.status === 'cancelled'));
    assert.equal(group.dice.length, 0);
    assert.throws(() => add(group, 'c'), /disposed/);
});
test('12個の繰り返しロールと対象外の姿勢・結果保持', async () => {
    let seed = 729;
    const group = new DiceGroup({ random: () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; } });
    for (let i = 0; i < 12; i++) add(group, `die-${i}`);
    for (let round = 0; round < 4; round++) {
        const targets = round === 0 ? group.dice : group.dice.slice(0, 8);
        const excluded = group.dice.slice(8).map(die => ({ result: die.result, position: die.body.position.clone(), quaternion: die.body.quaternion.clone() }));
        const pending = group.roll(targets.map(die => die.id));
        for (let i = 0; i < 3600 && targets.some(die => die.state === 'rolling'); i++) group.step(1 / 60);
        const results = await pending;
        assert.ok(results.every(result => result.status === 'settled'), JSON.stringify(results));
        for (const die of targets) assert.equal(die.current, die.top.index);
        if (round > 0) group.dice.slice(8).forEach((die, i) => {
            assert.deepEqual(die.result, excluded[i].result);
            assert.deepEqual(die.body.position, excluded[i].position);
            assert.deepEqual(die.body.quaternion, excluded[i].quaternion);
        });
    }
    group.dispose();
});

test('停止したダイスはprepare単体で空中へ戻り、回転して再ロールできる', async () => {
    const group = new DiceGroup({ random: () => .37 });
    const die = add(group, 'prepare');
    async function finishRoll() {
        const pending = die.roll();
        for (let i = 0; i < 3600 && die.state === 'rolling'; i++) group.step(1 / 60);
        assert.equal((await pending).status, 'settled');
    }
    try {
        await finishRoll();
        assert.ok(die.body.position.y < .8);
        const { x, z } = die.body.position;
        die.prepare();
        assert.equal(die.result, null);
        assert.equal(die.state, 'ready');
        assert.equal(die.body.position.y, 2.5);
        assert.equal(die.body.position.x, x); assert.equal(die.body.position.z, z);
        const before = die.body.quaternion.clone();
        for (let i = 0; i < 60; i++) {
            group.step(1 / 60);
            assert.ok(die.body.position.y - Math.sqrt(3) / 2 > 0);
        }
        assert.notDeepEqual(die.body.quaternion, before);
        await finishRoll();
        assert.equal(die.result.index, die.top.index);
    } finally { group.dispose(); }
});

test('初期の4列3行は固定配置で、注入した乱数を消費しない', () => {
    let calls = 0;
    const a = new DiceGroup({ random: () => { calls++; return 0; } });
    const b = new DiceGroup({ random: () => { calls++; return .99; } });
    try {
        for (let i=0;i<12;i++) { add(a,String(i)); add(b,String(i)); }
        assert.equal(calls,0);
        assert.deepEqual(a.dice.map(d=>d.body.position),b.dice.map(d=>d.body.position));
        assert.ok(Math.abs(a.get('1').body.position.x-a.get('0').body.position.x-4)<1e-9);
        assert.ok(Math.abs(a.get('4').body.position.z-a.get('0').body.position.z-2.5)<1e-9);
        assert.ok(a.dice.every(d=>d.body.position.y===2.5));
    } finally { a.dispose(); b.dispose(); }
});

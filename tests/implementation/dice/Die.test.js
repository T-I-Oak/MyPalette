import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Vec3 } from 'cannon-es';
import { createDieGeometry } from '../../../src/dice/geometry.js';
import { Die } from '../../../src/dice/Die.js';
import { topFace, FACE_NORMALS } from '../../../src/dice/orientation.js';

const faces = Array.from({ length: 6 }, () => ({ color: 'yellow', material: 'brush' }));
test('描画ライブラリの6マテリアル順が上面判定用の法線と一致する', () => {
    const geometry = createDieGeometry();
    geometry.groups.forEach(({ start, count, materialIndex }) => {
        const normal = geometry.attributes.normal;
        const mean = [0, 0, 0];
        for (let vertex = start; vertex < start + count; vertex++) {
            mean[0] += normal.getX(vertex); mean[1] += normal.getY(vertex); mean[2] += normal.getZ(vertex);
        }
        const length = Math.hypot(...mean);
        mean.forEach((value, axis) => assert.ok(Math.abs(value / length - FACE_NORMALS[materialIndex][axis]) < 1e-6));
    });
    geometry.dispose();
});
test('各ローカル面を上に向けた姿勢と面インデックスが一致する', () => {
    FACE_NORMALS.forEach((normal, index) => {
        const q = new Quaternion().setFromVectors(new Vec3(...normal), new Vec3(0, 1, 0));
        const top = topFace(q);
        assert.equal(top.index, index);
        assert.ok(top.alignment > .999);
    });
});
test('面はコピーして保持し、確定結果は面変更に追従する', () => {
    const die = new Die({ id: 'a', faces });
    faces[0].color = 'red';
    assert.equal(die.faces[0].color, 'yellow');
    die.begin();
    assert.equal(die.result, null);
    const pending = die.pending;
    die.settle(2);
    die.setFace(2, { special: 'fame1' });
    assert.deepEqual(die.result.face, { special: 'fame1' });
    return pending.then(result => assert.equal(result.index, 2));
});
test('ロール中の再操作は禁止し、破棄は待機中の結果を中止で解決する', async () => {
    const die = new Die({ id: 'a', faces });
    die.begin();
    const pending = die.pending;
    assert.throws(() => die.begin(), /rolling/);
    assert.throws(() => die.setFace(0, { special: 'draw1' }), /rolling/);
    die.dispose();
    assert.deepEqual(await pending, { id: 'a', status: 'cancelled' });
    assert.equal(die.state, 'disposed');
    assert.throws(() => die.prepare(), /disposed/);
});
test('6面、色、画材、特殊面、所持期間を検証する', () => {
    assert.throws(() => new Die({ id: 'a', faces: [] }));
    assert.throws(() => new Die({ id: 'a', faces, lifetime: 'invalid' }));
    const die = new Die({ id: 'b', faces });
    assert.throws(() => die.setFace(6, { special: 'fame1' }));
    assert.throws(() => die.setFace(0, { special: 'unknown' }));
    assert.throws(() => die.setFace(0, { color: 'pink', material: 'brush' }));
    die.setConsumed(true);
    assert.throws(() => die.begin(), /consumed/);
    die.setConsumed(false);
    die.begin(); die.settle(0);
    die.prepare();
    assert.equal(die.result, null);
    assert.equal(die.state, 'ready');
});

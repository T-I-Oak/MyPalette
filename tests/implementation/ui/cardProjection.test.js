import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { cardPlaneMatrix, createPaintingCamera } from '../../../src/game/easel/paintingView.js';

test('CSS射影変換の四隅が3D平面の四隅の投影と一致する', () => {
    const camera = createPaintingCamera(400 / 640);
    camera.setViewOffset(400, 760, 0, 50, 400, 640); camera.updateMatrixWorld();
    for (const angle of [-.25, 0, .25]) {
        const tray = new THREE.Object3D();
        tray.position.set(0, .71, .2775); tray.rotation.set(-.2, angle, 0); tray.updateMatrixWorld();
        const matrix = new THREE.Matrix4().fromArray(cardPlaneMatrix(tray, camera, 400, 640, 294, 414));
        for (const [x, y] of [[0, 0], [294, 0], [294, 414], [0, 414]]) {
            const expected = tray.localToWorld(new THREE.Vector3((x / 294 - .5) * 1.16, .0275 + (414 - y) * 1.16 / 294, .079)).project(camera);
            const actual = new THREE.Vector3(x, y, 0).applyMatrix4(matrix);
            assert.ok(Math.abs(actual.x - (expected.x + 1) * 200) < 1e-8);
            assert.ok(Math.abs(actual.y - (1 - expected.y) * 320) < 1e-8);
        }
    }
});

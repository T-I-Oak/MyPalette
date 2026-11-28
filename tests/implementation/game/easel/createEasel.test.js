import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createEasel } from '../../../../src/game/easel/createEasel.js';
import { canvasPlacement } from '../../../../src/game/easel/canvasPlacement.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);
function bounds(mesh) {
    const half = new THREE.Vector3(mesh.geometry.parameters.width, mesh.geometry.parameters.height, mesh.geometry.parameters.depth).multiplyScalar(.5);
    return { min: mesh.position.clone().sub(half), max: mesh.position.clone().add(half) };
}

test('固定寸法のカンバスが上下で接し、押さえ・ブロック・つまみが支柱につながる', t => {
    const previous = globalThis.document;
    globalThis.document = { createElement: () => ({ getContext: () => ({
        fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
    }) }) };
    const easel = createEasel();
    t.after(() => { easel.dispose(); globalThis.document = previous; });
    const find = name => easel.object.getObjectByName(name);
    const placement = canvasPlacement(1536, 1024), object = new THREE.Group();
    easel.mountCanvas({ object, placement });
    const lip = bounds(find('top-clamp-lip')), block = bounds(find('top-clamp-block'));
    const mast = bounds(find('center-mast')), tray = bounds(find('tray-shelf'));
    near(object.position.y - placement.height / 2, tray.max.y);
    near(lip.min.y, placement.top);
    near(block.min.y, lip.max.y);
    // The lip reaches the flat top inside the .008 rounded border and covers the front edge.
    assert.ok(lip.min.z < placement.center[2] - placement.depth / 2 + .008);
    assert.ok(lip.max.z > placement.center[2] + placement.depth / 2);
    assert.ok(block.min.z < mast.max.z && block.max.z > mast.max.z);
    assert.ok(mast.max.y > block.max.y);
    near(find('clamp-knob').position.y, find('top-clamp-block').position.y);
    near(find('clamp-knob').position.z - .035 / 2, block.max.z);
    for (const [x, y, scale] of [[.15, -.45, .7], [-.1, .45, 1.3]]) {
        easel.object.rotation.set(x, y, 0); easel.object.scale.setScalar(scale);
        const top = object.localToWorld(new THREE.Vector3(0, placement.height / 2, 0));
        const contact = find('top-clamp-lip').parent.localToWorld(new THREE.Vector3(0, lip.min.y, placement.center[2]));
        near(top.distanceTo(contact), 0);
    }
    const positions = () => ['top-clamp-lip', 'top-clamp-block', 'clamp-knob', 'center-mast'].map(name => find(name).position.toArray());
    const before = positions();
    object.removeFromParent();
    easel.mountCanvas({ object, placement });
    assert.deepEqual(positions(), before);
});

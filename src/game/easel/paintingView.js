import * as THREE from 'three';
import { paintingFacing } from '../playLayout.js';

export function createPaintingCamera(aspect) {
    const camera = new THREE.PerspectiveCamera(36, aspect, .05, 30);
    camera.position.set(2.6, 1.9, 4); camera.lookAt(0, 1.25, -.12);
    return camera;
}

export function orientPainting(easel, centerX, areaWidth, id) {
    const facing = paintingFacing(centerX, areaWidth);
    const jitter = ((id.charCodeAt(0) + Number(id.slice(1))) % 5 - 2) * .003;
    easel.object.rotation.y = Math.atan2(2.6, 4) + facing + jitter;
    easel.object.rotation.x = THREE.MathUtils.degToRad(12) - Math.atan2(.65, Math.hypot(2.6, 4) / Math.cos(facing)) + jitter;
}

export function cardPlaneMatrix(tray, camera, width, height, cardWidth, cardHeight) {
    const worldWidth = 1.16, unit = worldWidth / cardWidth;
    const local = new THREE.Matrix4().makeTranslation(-worldWidth / 2, .0275 + cardHeight * unit, .079)
        .multiply(new THREE.Matrix4().makeScale(unit, -unit, 1));
    return projectPlane(tray, camera, width, height, local);
}

export function canvasPlaneMatrix(painting, camera, width, height, faceWidth, faceHeight) {
    const { width: w, height: h, depth } = painting.placement;
    const local = new THREE.Matrix4().makeTranslation(-w / 2, h / 2, depth / 2)
        .multiply(new THREE.Matrix4().makeScale(w / faceWidth, -h / faceHeight, 1));
    return projectPlane(painting.object, camera, width, height, local);
}

function projectPlane(object, camera, width, height, local) {
    object.updateWorldMatrix(true, false); camera.updateMatrixWorld();
    const clip = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
        .multiply(object.matrixWorld).multiply(local).elements;
    const result = new THREE.Matrix4().elements;
    const normalize = clip[15];
    for (const column of [0, 1, 3]) {
        const offset = column * 4;
        result[offset] = (clip[offset] + clip[offset + 3]) * width / 2 / normalize;
        result[offset + 1] = (clip[offset + 3] - clip[offset + 1]) * height / 2 / normalize;
        result[offset + 2] = 0; result[offset + 3] = clip[offset + 3] / normalize;
    }
    return result;
}

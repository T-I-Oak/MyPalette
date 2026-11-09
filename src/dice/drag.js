import * as THREE from 'three';
import { dragPosition } from './dragPosition.js';

function pointerRay(clientX, clientY, canvas, camera) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    camera.updateMatrixWorld();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1,
        1 - (clientY - rect.top) / rect.height * 2), camera);
    return ray;
}
export function pointerOnPlane(x, y, canvas, camera, height) {
    return pointerRay(x, y, canvas, camera)?.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 1, 0), -height), new THREE.Vector3()) ?? null;
}

export function createDiceDrag(scene, { onTap = () => {}, now = () => performance.now() } = {}) {
    const { container, group, camera, visuals } = scene, canvas = scene.renderer.domElement;
    let active = null;
    container.classList.add('DiceDraggable');
    function pick(event) {
        const result = event.target.closest?.('.DiceResult');
        if (result && group.items.has(result.dataset.dieId)) return group.get(result.dataset.dieId);
        const ray = pointerRay(event.clientX, event.clientY, canvas, camera);
        if (!ray) return null;
        const entries = [...visuals.entries()];
        for (const [, visual] of entries) visual.mesh.updateWorldMatrix(true, false);
        const hit = ray.intersectObjects(entries.map(([, visual]) => visual.mesh), false)[0];
        const id = hit && entries.find(([, visual]) => visual.mesh === hit.object)?.[0];
        return id && group.items.has(id) ? group.get(id) : null;
    }
    function finish() {
        const previous = active; active = null;
        container.classList.remove('state-dragging');
        if (previous && container.hasPointerCapture(previous.pointerId)) container.releasePointerCapture(previous.pointerId);
    }
    function down(event) {
        if (active || scene.interactionLocked || group.rolling || event.button !== 0 || event.isPrimary === false) return;
        const die = pick(event);
        if (!die || !['ready', 'settled'].includes(die.state)) return;
        const point = pointerOnPlane(event.clientX, event.clientY, canvas, camera, die.body.position.y);
        if (!point) return;
        active = { id: die.id, pointerId: event.pointerId, height: die.body.position.y,
            startX: event.clientX, startY: event.clientY, started: now(), moved: false,
            dx: die.body.position.x - point.x, dz: die.body.position.z - point.z };
        container.setPointerCapture(event.pointerId);
        container.classList.add('state-dragging'); event.preventDefault();
    }
    function move(event) {
        if (!active || active.pointerId !== event.pointerId) return;
        if (scene.interactionLocked || group.rolling || !group.items.has(active.id)) { finish(); return; }
        const die = group.get(active.id);
        if (!['ready', 'settled'].includes(die.state)) { finish(); return; }
        if (Math.hypot(event.clientX-active.startX, event.clientY-active.startY) >= 6) active.moved = true;
        if (!active.moved) return;
        const point = pointerOnPlane(event.clientX, event.clientY, canvas, camera, active.height);
        if (!point) return;
        die.setPosition(dragPosition(group, die, { x: point.x + active.dx, y: die.body.position.y, z: point.z + active.dz }));
        event.preventDefault();
    }
    function up(event) {
        if (active?.pointerId !== event.pointerId) return;
        const tap = active;
        finish();
        if (!group.rolling && group.items.has(tap.id) && !tap.moved && now()-tap.started < 550 &&
            Math.hypot(event.clientX-tap.startX,event.clientY-tap.startY) < 6) onTap(tap.id);
    }
    function cancel(event) { if (active?.pointerId === event.pointerId) finish(); }
    function nativeDrag(event) { event.preventDefault(); }
    const events = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: cancel,
        lostpointercapture: cancel, dragstart: nativeDrag };
    for (const [type, listener] of Object.entries(events)) container.addEventListener(type, listener);
    return {
        cancel: finish,
        dispose() {
            finish();
            for (const [type, listener] of Object.entries(events)) container.removeEventListener(type, listener);
            container.classList.remove('DiceDraggable');
        },
    };
}

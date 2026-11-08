import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasPlacement } from './canvasPlacement.js';

export function createPaintingCanvas(image) {
    const placement = canvasPlacement(image.width, image.height);
    const weave = document.createElement('canvas'); weave.width = 128; weave.height = 128;
    const context = weave.getContext('2d');
    context.fillStyle = '#999999'; context.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 4) {
        context.fillStyle = '#bbbbbb'; context.fillRect(i, 0, 1, 128);
        context.fillStyle = '#777777'; context.fillRect(0, i, 128, 1);
    }
    const fabric = new THREE.CanvasTexture(weave);
    fabric.wrapS = fabric.wrapT = THREE.RepeatWrapping; fabric.repeat.set(7, 5);
    const painting = new THREE.Texture(image); painting.colorSpace = THREE.SRGBColorSpace; painting.needsUpdate = true;
    const edge = new THREE.MeshStandardMaterial({ color: 0xe5dcc8, roughness: .95, bumpMap: fabric, bumpScale: .0015 });
    const face = new THREE.MeshStandardMaterial({ map: painting, roughness: .9, bumpMap: fabric, bumpScale: .0007 });
    const geometry = new RoundedBoxGeometry(placement.width, placement.height, placement.depth, 4, .008);
    const positions = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    // Project the complete image across the front, including its rounded border.
    const front = geometry.groups.find(group => group.materialIndex === 4);
    for (let i = front.start; i < front.start + front.count; i++) {
        uv.setXY(i, positions.getX(i) / placement.width + .5, positions.getY(i) / placement.height + .5);
    }
    uv.needsUpdate = true;
    const object = new THREE.Group(); object.name = 'painting-canvas';
    const body = new THREE.Mesh(geometry, [edge, edge, edge, edge, face, edge]);
    body.castShadow = true; body.receiveShadow = true; object.add(body);
    const pinGeometry = new THREE.CylinderGeometry(.009, .009, .004, 20);
    const pinMaterial = new THREE.MeshStandardMaterial({ color: 0x806139, metalness: .75, roughness: .4 });
    function pin(x, y, side) {
        const head = new THREE.Mesh(pinGeometry, pinMaterial);
        head.name = 'canvas-pin'; head.position.set(x, y, -.002);
        if (side) head.rotation.z = Math.PI / 2;
        head.castShadow = true; object.add(head);
    }
    for (let i = 0; i < 4; i++) {
        const y = placement.height * (-.4 + i * .8 / 3);
        pin(-placement.width / 2, y, true); pin(placement.width / 2, y, true);
    }
    for (let i = 0; i < 6; i++) {
        const x = placement.width * (-.42 + i * .84 / 5);
        pin(x, -placement.height / 2, false); pin(x, placement.height / 2, false);
    }
    return {
        object, placement,
        setImage(image) { painting.image = image; painting.needsUpdate = true; },
        dispose() { object.removeFromParent(); geometry.dispose(); pinGeometry.dispose(); pinMaterial.dispose(); edge.dispose(); face.dispose(); fabric.dispose(); painting.dispose(); },
    };
}

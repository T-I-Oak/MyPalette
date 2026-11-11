import * as THREE from 'three';

// Local +Z faces the painter; the front assembly leans away from them.
export function createEasel() {
    const easel = new THREE.Group();
    easel.name = 'easel';
    const grain = document.createElement('canvas');
    grain.width = 128; grain.height = 512;
    const context = grain.getContext('2d');
    context.fillStyle = '#bb8752'; context.fillRect(0, 0, 128, 512);
    for (let x = 0; x < 128; x++) {
        const shade = Math.sin(x * 1.7) * .08 + Math.sin(x * .31) * .06;
        context.strokeStyle = shade > 0 ? `rgba(255,222,164,${shade})` : `rgba(69,34,14,${-shade})`;
        context.beginPath(); context.moveTo(x, 0);
        for (let y = 0; y <= 512; y += 8) context.lineTo(x + Math.sin(y * .018 + x * .2) * 1.6, y);
        context.stroke();
    }
    const texture = new THREE.CanvasTexture(grain);
    texture.colorSpace = THREE.SRGBColorSpace;
    const wood = new THREE.MeshStandardMaterial({ map: texture, roughness: .76 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x796341, metalness: .7, roughness: .38 });
    function bar(parent, name, size, position, material = wood) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
        mesh.name = name; mesh.position.set(...position);
        mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh);
        return mesh;
    }
    function beam(parent, name, from, to, width, depth) {
        const start = new THREE.Vector3(...from), end = new THREE.Vector3(...to);
        const mesh = bar(parent, name, [width, start.distanceTo(end), depth], start.clone().add(end).multiplyScalar(.5).toArray());
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
        return mesh;
    }
    const front = new THREE.Group();
    front.rotation.x = -THREE.MathUtils.degToRad(12);
    easel.add(front);
    beam(front, 'left-leg', [-.57, .018, .13], [-.18, 1.76, .13], .085, .09);
    beam(front, 'right-leg', [.57, .018, .13], [.18, 1.76, .13], .085, .09);
    bar(front, 'lower-brace', [1.01, .075, .075], [0, .43, .13]);
    bar(front, 'upper-brace', [.61, .075, .075], [0, 1.58, .13]);
    bar(front, 'center-mast', [.09, 1.41, .08], [0, 1.165, .2]);
    bar(front, 'tray-back', [1.28, .13, .065], [0, .79, .22]);
    bar(front, 'tray-shelf', [1.34, .055, .15], [0, .71, .2775]);
    bar(front, 'tray-lip', [1.34, .055, .025], [0, .705, .3525]);
    bar(front, 'top-clamp-block', [.16, .075, .055], [0, 1.79, .235]);
    bar(front, 'top-clamp-lip', [.18, .018, .09], [0, 1.735, .2725]);
    const frontRotation = new THREE.Matrix4().makeRotationX(front.rotation.x);
    const hinge = new THREE.Vector3(0, 1.64, .13).applyMatrix4(frontRotation);
    const rearFoot = new THREE.Vector3(0, .035, -.83);
    beam(easel, 'rear-leg', rearFoot.toArray(), hinge.toArray(), .085, .09);
    const braceFront = new THREE.Vector3(0, .43, .13).applyMatrix4(frontRotation);
    const braceRear = rearFoot.clone().lerp(hinge, (braceFront.y - rearFoot.y) / (hinge.y - rearFoot.y));
    beam(easel, 'spreader', braceRear.toArray(), braceFront.toArray(), .035, .035);
    for (const [name, y, z] of [['tray-knob', .70, .375], ['clamp-knob', 1.81, .27]]) {
        const knob = new THREE.Mesh(new THREE.CylinderGeometry(.026, .026, .035, 20), metal);
        knob.name = name; knob.rotation.x = Math.PI / 2; knob.position.set(0, y, z);
        knob.castShadow = true; front.add(knob);
    }
    return {
        object: easel,
        mountCanvas(canvas) {
            const { object, placement } = canvas;
            object.position.set(...placement.center);
            front.add(object);
        },
        dispose() {
            easel.traverse(node => { if (node.isMesh) node.geometry.dispose(); });
            wood.dispose(); metal.dispose(); texture.dispose();
        },
    };
}

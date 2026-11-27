import * as THREE from 'three';
import { createDieGeometry } from '../dice/geometry.js';
import { faceCanvas } from '../dice/icons.js';
import { listOrientation } from './diceListState.js';

// One renderer is shared by every row; copies remain static until game state changes.
export function createDiceListPreview() {
    const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
    renderer.setSize(144, 144); renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1.9,1.9,1.9,-1.9,.1,30);
    camera.position.set(4,6,5); camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight('#fffaf0','#677970',2.7));
    const light = new THREE.DirectionalLight('#fff5de',3.4); light.position.set(-4,12,5); scene.add(light);
    const geometry = createDieGeometry();
    return {
        draw(die, canvas) {
            const materials = die.faces.map(face => {
                const texture = new THREE.CanvasTexture(faceCanvas(face,die.lifetime,128));
                texture.colorSpace = THREE.SRGBColorSpace;
                return new THREE.MeshStandardMaterial({map:texture,roughness:.65,color:die.used?'#8c9690':'#ffffff'});
            });
            const mesh = new THREE.Mesh(geometry,materials);
            const orientation = listOrientation(die.current);
            if (orientation) mesh.quaternion.copy(orientation);
            scene.add(mesh); renderer.render(scene,camera);
            canvas.width = 144; canvas.height = 144;
            canvas.getContext('2d').drawImage(renderer.domElement,0,0);
            scene.remove(mesh);
            materials.forEach(material => { material.map.dispose(); material.dispose(); });
        },
        dispose() { geometry.dispose(); renderer.dispose(); renderer.forceContextLoss(); },
    };
}

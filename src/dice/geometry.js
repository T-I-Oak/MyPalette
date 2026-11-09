import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createDieGeometry() {
    return new RoundedBoxGeometry(2, 2, 2, 4, .28);
}

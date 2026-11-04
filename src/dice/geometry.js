import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createDieGeometry() {
    return new RoundedBoxGeometry(1, 1, 1, 4, .14);
}

import { Vec3 } from 'cannon-es';

// Three.js BoxGeometry の materialIndex と同順。
export const FACE_NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
export function topFace(quaternion) {
    const heights = FACE_NORMALS.map(normal => quaternion.vmult(new Vec3(...normal)).y);
    const alignment = Math.max(...heights);
    return { index: heights.indexOf(alignment), alignment };
}

import {COLORS,MATERIALS} from '../effectCatalog.js';

export function validateFaceCondition(condition) {
    if(!condition || typeof condition!=='object' || Array.isArray(condition)) throw new Error('Invalid face search condition');
    const keys=Object.keys(condition);
    if(!keys.length || keys.some(key=>!['material','color'].includes(key))) throw new Error('Specify material, color, or both');
    if('material' in condition && !MATERIALS.includes(condition.material)) throw new Error('Invalid material');
    if('color' in condition && !COLORS.includes(condition.color)) throw new Error('Invalid color');
    return Object.freeze({...condition});
}
export function findMatchingFaces(faces, condition) {
    const query=validateFaceCondition(condition);
    return faces.flatMap((face,index)=>!face.special && Object.entries(query).every(([key,value])=>face[key]===value)?[index]:[]);
}

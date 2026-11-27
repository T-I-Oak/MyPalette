import { Quaternion, Vector3 } from 'three';
import { FACE_NORMALS } from '../dice/orientation.js';
import { findMatchingFaces, validateFaceCondition } from '../dice/faceConditions.js';
import { FACE_SEARCH_DURATION } from '../dice/FaceSearch.js';

export function listOrientation(current) {
    if (current === null) return null;
    return new Quaternion().setFromUnitVectors(new Vector3(...FACE_NORMALS[current]), new Vector3(0, 1, 0));
}
export function clampListPosition(position, size, viewport) {
    return { x:Math.max(0, Math.min(position.x, viewport.width - size.width)),
        y:Math.max(0, Math.min(position.y, viewport.height - size.height)) };
}
export function resizeListBounds(start, delta, direction, viewport, minHeight) {
    const clamp=(value,min,max)=>Math.max(Math.min(min,max),Math.min(max,value));
    const right=start.x+start.width, bottom=start.y+start.height;
    const horizontal=direction.includes('w')?-1:direction.includes('e')?1:0;
    const vertical=direction.includes('n')?-1:direction.includes('s')?1:0;
    const width=horizontal ? clamp(start.width+delta.x*horizontal,Math.min(300,viewport.width*.4),
        Math.min(viewport.width-16,horizontal<0?right:viewport.width-start.x-8)) : start.width;
    const height=vertical ? clamp(start.height+delta.y*vertical,minHeight,
        Math.min(viewport.height-16,vertical<0?bottom:viewport.height-start.y-8)) : start.height;
    return {x:horizontal<0?right-width:start.x,y:vertical<0?bottom-height:start.y,width,height};
}
export class DiceListState {
    visible = false;
    condition = null;
    until = 0;
    constructor({now=()=>performance.now()}={}) { this.now = now; }
    open() { if (!this.visible) { this.visible = true; this.condition = null; } }
    close() { this.visible = false; this.condition = null; this.until = 0; }
    search(condition) {
        if (!this.visible) return;
        this.condition = validateFaceCondition(condition); this.until = this.now() + FACE_SEARCH_DURATION;
    }
    get remaining() { return Math.max(0,this.until-this.now()); }
    matches(die) { return this.condition && this.remaining > 0 ? findMatchingFaces(die.faces, this.condition) : []; }
}

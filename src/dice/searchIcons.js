import {goalIconCanvas} from '../icons/render.js';
import {drawGlyphText} from './glyphs.js';
import {validateFaceCondition} from './faceConditions.js';
import {describeSearchCondition} from './searchMessages.js';

export const describeCondition=describeSearchCondition;
export function conditionCanvas(condition,size=96) {
    const query=validateFaceCondition(condition);
    const canvas=goalIconCanvas(query,size);
    canvas.className='DiceConditionIcon';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',describeCondition(query));
    return canvas;
}
export function countCanvas(count) {
    const canvas=document.createElement('canvas');canvas.width=96;canvas.height=80;canvas.className='DiceSearchCount';
    canvas.setAttribute('aria-hidden','true');const ctx=canvas.getContext('2d');ctx.scale(2,2);
    drawGlyphText(ctx,`×${count}`,24,20,28,'#303e3b');return canvas;
}

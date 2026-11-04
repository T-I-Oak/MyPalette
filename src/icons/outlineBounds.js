import { measureGlyphText } from './glyphs.js';

const cache = new Map();
// Measure alpha at four samples per icon unit, including strokes and white outlines.
export function measuredOutline(node, draw) {
    const { role, ...shape } = node;
    const key=JSON.stringify(shape);
    if(cache.has(key))return cache.get(key);
    const canvas=document.createElement('canvas');
    const span=Math.max(132,node.value?measureGlyphText(node.value,29)+32:132);
    canvas.width=Math.ceil(span*4);canvas.height=132*4;
    const originX=canvas.width/8-50,originY=16;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.scale(4,4);ctx.translate(originX,originY);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=3;ctx.strokeStyle='#394b47';ctx.fillStyle='#fff';
    draw(ctx,node);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]){
        left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if(right<0)throw new Error(`Empty icon outline: ${node.kind}`);
    const bounds=[left/4-originX,top/4-originY,(right+1)/4-originX,(bottom+1)/4-originY];
    cache.set(key,bounds);return bounds;
}

import { materialSymbol, specialSymbol } from '../icons/symbols.js';
export { INKS, LETTERS, materialSymbol, specialSymbol, drawCardDrawIcon } from '../icons/symbols.js';

function renderFaceCanvas(face, lifetime, size, background) {
    const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.scale(size / 100, size / 100);
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, 100, 100); }
    ctx.save(); ctx.translate(7, 7); ctx.scale(.86, .86);
    if (face.special) specialSymbol(ctx, face.special);
    else materialSymbol(ctx, face.material, face.color, lifetime);
    ctx.restore(); return canvas;
}
export function faceCanvas(face, lifetime = 'permanent', size = 256) {
    return renderFaceCanvas(face,lifetime,size,lifetime==='temporary'?'#98d5ed':'#fffaf0');
}
export function specialIconCanvas(special, size = 256) {
    return renderFaceCanvas({special},'permanent',size,null);
}

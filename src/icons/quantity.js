import { drawGlyphText } from './glyphs.js';

// Quantity is one unit: symbols are stacked above the value on the same center line.
export function drawQuantity(ctx, { value, arrows = [] }) {
    const rows = arrows.length === 2 ? [33,47,75] : arrows.length === 1 ? [40,71] : [50];
    // Outline the complete arrow group before painting either foreground.
    arrows.forEach((arrow,index)=>drawGlyphText(ctx,arrow,50,rows[index],24,'#303e3b','#fff','outline'));
    arrows.forEach((arrow,index)=>drawGlyphText(ctx,arrow,50,rows[index],24,'#303e3b'));
    drawGlyphText(ctx,value,50,rows.at(-1),23,'#303e3b','#fff');
}



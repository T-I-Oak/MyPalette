import { SPECIAL_FACE_EFFECTS, COLOR_PAIR_COLORS } from '../effectCatalog.js';
import { drawGlyphText } from './glyphs.js';
import { effectIconPlan, faceEffectIconPlan } from './iconPlan.js';
import { measuredOutline } from './outlineBounds.js';
import { compositionLayout } from './compositionLayout.js';
import { drawQuantity } from './quantity.js';
import { drawFameIcon } from './laurel.js';

export const INKS = { orange: '#e67d23', yellow: '#dbb61e', green: '#339966', blue: '#397ccb', purple: '#9256b2', red: '#d94b51' };
export const LETTERS = { orange: 'O', yellow: 'Y', green: 'G', blue: 'B', purple: 'P', red: 'R' };
const SHAPES = {
    brush: 'M50 5 C43 25 18 41 18 63 C18 102 82 102 82 63 C82 41 57 25 50 5 Z',
    pastel: 'M30 19 Q32 15 37 15 L90 15 Q98 15 94 24 L70 81 Q68 85 63 85 L10 85 Q2 85 6 76 Z',
    airbrush: 'M62 35 A28 28 0 1 1 6 35 A28 28 0 1 1 62 35 Z M94 35 A28 28 0 1 1 38 35 A28 28 0 1 1 94 35 Z M78 63 A28 28 0 1 1 22 63 A28 28 0 1 1 78 63 Z',
};
function text(ctx, value, x, y, size = 25, color = '#303e3b', outline = false) {
    drawGlyphText(ctx, value, x, y, size, color, outline);
}
export function materialSymbol(ctx, material, color, lifetime = 'permanent') {
    const path = new Path2D(SHAPES[material]);
    const ink = color ? INKS[color] : '#394b47';
    ctx.fillStyle = lifetime === 'temporary' ? '#ffffff' : ink;
    ctx.strokeStyle = ink; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    if (material === 'airbrush' && lifetime === 'temporary') {
        ctx.lineWidth = 8; ctx.stroke(path); ctx.fill(path);
    } else {
        ctx.fill(path);
        if (material !== 'airbrush') ctx.stroke(path);
    }
    const letterY = { brush: 62, pastel: 51, airbrush: 47 }[material];
    if (color) text(ctx, LETTERS[color], 50, letterY, 48,
        lifetime === 'temporary' ? ink : '#fff', true);
}
export function hexagon(ctx) {
    ctx.beginPath(); ctx.moveTo(50, 8); ctx.lineTo(85, 28); ctx.lineTo(85, 69);
    ctx.lineTo(50, 90); ctx.lineTo(15, 69); ctx.lineTo(15, 28); ctx.closePath();
}
export function diceY(ctx) {
    ctx.beginPath(); ctx.moveTo(15, 28); ctx.lineTo(50, 49); ctx.lineTo(85, 28);
    ctx.moveTo(50, 49); ctx.lineTo(50, 90); ctx.stroke();
}
export function cloudBrackets(ctx) {
    ctx.beginPath(); ctx.moveTo(9, 25); ctx.bezierCurveTo(-5, 24, -5, 43, 3, 49);
    ctx.bezierCurveTo(-6, 57, -3, 76, 9, 75);
    ctx.moveTo(91, 25); ctx.bezierCurveTo(105, 24, 105, 43, 97, 49);
    ctx.bezierCurveTo(106, 57, 103, 76, 91, 75); ctx.stroke();
}
export function reroll(ctx) {
    const center = { x: 38, y: 53 }, tilt = -.25;
    ctx.save(); ctx.translate(center.x, center.y); ctx.rotate(tilt); ctx.scale(.44, .44); ctx.translate(-50, -49);
    hexagon(ctx); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke(); diceY(ctx); ctx.restore();
    const direction = Math.atan2(28 - 49, 85 - 50) + tilt;
    const waveCenter = { x: center.x + Math.cos(direction) * 16, y: center.y + Math.sin(direction) * 16 };
    ctx.save(); ctx.lineWidth = 2;
    for (const radius of [6, 10]) {
        ctx.beginPath(); ctx.arc(waveCenter.x, waveCenter.y, radius, direction - .85, direction + .85); ctx.stroke();
    }
    ctx.restore();
}
export function rerollTicket(ctx) {
    const outline = new Path2D('M5 25 H73 C73 26.65 74.35 28 76 28 C77.65 28 79 26.65 79 25 H95 Q98 25 98 28 V72 Q98 75 95 75 H79 C79 73.35 77.65 72 76 72 C74.35 72 73 73.35 73 75 H5 Q2 75 2 72 V28 Q2 25 5 25 Z');
    ctx.save(); ctx.fillStyle = '#f2ce79'; ctx.fill(outline); ctx.restore(); ctx.stroke(outline);
    ctx.save(); ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y = 35; y < 68; y += 8) { ctx.moveTo(76, y); ctx.lineTo(76, y + 3); }
    ctx.stroke(); ctx.restore();
    reroll(ctx);
}
export function drawCardDrawIcon(ctx, count) {
    if (!Number.isSafeInteger(count) || count < 1) throw new Error('Draw count must be a positive safe integer');
    const drawPart = (context,node) => {
        if(node.kind==='hand'){context.save();context.translate(19,-1);drawHandSymbol(context);context.restore();}
        else drawQuantity(context,node);
    };
    const layout = compositionLayout(effectIconPlan({type: 'drawCards', count}).nodes,node=>measuredOutline(node,drawPart));
    const fit = Math.min(1, 100 / layout.width);
    ctx.save(); ctx.translate((100-layout.width*fit)/2, 50-50*fit); ctx.scale(fit,fit);
    for (const slot of layout.slots) {
        ctx.save(); ctx.translate(slot.x,slot.y); ctx.scale(slot.scale,slot.scale);
        drawPart(ctx,slot.node);
        ctx.restore();
    }
    ctx.restore();
}
export function specialSymbol(ctx, special) {
    const effect = SPECIAL_FACE_EFFECTS[special];
    ctx.strokeStyle = '#394b47'; ctx.fillStyle = '#fff'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    if (effect.type === 'changeFame') {
        drawFameIcon(ctx, effect.amount);
    } else if (effect.type === 'drawCards') {
        drawCardDrawIcon(ctx, effect.count);
    } else {
        drawAcquisitionSymbol(ctx, effect);
    }
}

export function drawDieSymbol(ctx, effect = {}) {
    ctx.save(); ctx.strokeStyle = '#394b47'; ctx.fillStyle = effect.baseColor ?? '#fff'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
        hexagon(ctx); ctx.fill();
        if (effect.colors) {
            ctx.save(); hexagon(ctx); ctx.clip();
            const colors = COLOR_PAIR_COLORS[effect.colors];
            colors.forEach((color, i) => {
                ctx.fillStyle = INKS[color]; ctx.fillRect(15 + i * 35, 5, 35, 90);
                text(ctx, LETTERS[color], 33 + i * 35, 50, 27, '#fff', true);
            }); ctx.restore();
        } else if (effect.material) {
            ctx.save(); ctx.translate(21, 19); ctx.scale(.58, .58); materialSymbol(ctx, effect.material); ctx.restore();
        } else {
            diceY(ctx);
        }
        hexagon(ctx); ctx.stroke();
        if (effect.lifetime === 'temporary') cloudBrackets(ctx);
    ctx.restore();
}

export function drawHandSymbol(ctx) {
    ctx.save(); ctx.strokeStyle = '#394b47'; ctx.lineWidth = 3;
    for (const angle of [-.45, 0, .45]) {
        ctx.save(); ctx.translate(31, 71); ctx.rotate(angle); ctx.fillStyle = '#fff';
        drawCardSymbol(ctx); ctx.restore();
    }
    ctx.restore();
}

// A single portrait card, anchored at the center of its lower edge.
export const CARD_WIDTH = 22;
export const CARD_HEIGHT = 42;
export function drawCardSymbol(ctx) {
    ctx.fillRect(-CARD_WIDTH / 2, -CARD_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
    ctx.strokeRect(-CARD_WIDTH / 2, -CARD_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
}
export function drawStockSymbol(ctx) {
    ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#394b47'; ctx.lineWidth = 3;
    for (const offset of [12, 8, 4, 0]) {
        ctx.save();
        ctx.transform(27 / CARD_WIDTH, 14 / CARD_WIDTH, -30 / CARD_HEIGHT, 24 / CARD_HEIGHT, 35.5, 57 + offset);
        ctx.beginPath(); ctx.rect(-CARD_WIDTH / 2, -CARD_HEIGHT, CARD_WIDTH, CARD_HEIGHT);
        ctx.restore();
        // Stroke the projected path after restoring the transform: the same uniform line as the hand.
        ctx.fill(); ctx.stroke();
    }
    ctx.restore();
}

// A die face uses the same acquisition parts, fitted together into its square.
export function drawAcquisitionSymbol(ctx, effect) {
    const drawPart = (context,node) => {
        if(node.kind==='die') drawDieSymbol(context,node);
        else if(node.kind==='ticket') rerollTicket(context);
        else if(node.kind==='quantity') drawGlyphText(context,node.value,50,50,29,'#394b47','#fff');
        else throw new Error(`Unexpected acquisition part: ${node.kind}`);
    };
    // The face itself identifies a single acquisition; cards retain the full ×1 plan.
    const nodes=faceEffectIconPlan(effect).nodes;
    const layout=compositionLayout(nodes,node=>measuredOutline(node,drawPart));
    const fit=Math.min(1,100/layout.width);
    ctx.save();ctx.translate((100-layout.width*fit)/2,50-50*fit);ctx.scale(fit,fit);
    for(const slot of layout.slots){
        ctx.save();ctx.translate(slot.x,slot.y);ctx.scale(slot.scale,slot.scale);drawPart(ctx,slot.node);ctx.restore();
    }
    ctx.restore();
}

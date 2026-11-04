import { drawGlyphText, measureGlyphText } from './glyphs.js';

function leaf(ctx, baseX, baseY, tipX, tipY, width) {
    const dx = tipX - baseX, dy = tipY - baseY, length = Math.hypot(dx, dy);
    const nx = -dy / length * width, ny = dx / length * width;
    const middleX = (baseX + tipX) / 2, middleY = (baseY + tipY) / 2;
    ctx.beginPath(); ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(middleX + nx, middleY + ny, tipX, tipY);
    ctx.quadraticCurveTo(middleX - nx, middleY - ny, baseX, baseY);
    ctx.fill();
}

export function drawLaurel(ctx) {
    ctx.save(); ctx.fillStyle = '#51724c'; ctx.strokeStyle = '#51724c'; ctx.lineWidth = 2.5;
    const point = (radius, degrees) => [50 + radius * Math.cos(degrees * Math.PI / 180), 50 + radius * Math.sin(degrees * Math.PI / 180)];
    for (const mirror of [false, true]) {
        ctx.save();
        if (mirror) { ctx.translate(100, 0); ctx.scale(-1, 1); }
        ctx.beginPath(); ctx.arc(50, 50, 36, 94 * Math.PI / 180, 258 * Math.PI / 180); ctx.stroke();
        for (const angle of [105, 132, 158, 184, 210, 236, 252]) leaf(ctx, ...point(36, angle), ...point(44, angle + 17), 4.5);
        for (const angle of [112, 141, 170, 199, 228]) leaf(ctx, ...point(36, angle), ...point(27, angle + 16), 3.5);
        ctx.restore();
    }
    ctx.restore();
}

export function drawFameIcon(ctx, amount) {
    if (!Number.isSafeInteger(amount) || amount === 0) throw new Error('Fame amount must be a nonzero safe integer');
    drawLaurel(ctx);
    const value = amount > 0 ? `+${amount}` : `−${Math.abs(amount)}`;
    const size = Math.min(30, 70 / measureGlyphText(value, 1));
    drawGlyphText(ctx, value, 50, 50, size, amount < 0 ? '#d94b51' : '#303e3b', '#ffffff');
}

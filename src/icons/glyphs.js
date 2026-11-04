const GLYPHS = {
    O: { width: 40, filled: true, path: 'M20 2 C7 2 2 10 2 25 C2 40 7 48 20 48 C33 48 38 40 38 25 C38 10 33 2 20 2 Z M20 11 C27 11 29 15 29 25 C29 35 27 39 20 39 C13 39 11 35 11 25 C11 15 13 11 20 11 Z' },
    Y: { width: 40, filled: true, path: 'M1 2 H12 L20 19 L28 2 H39 L25 29 V48 H15 V29 Z' },
    G: { width: 40, filled: true, path: 'M36 10 L30 17 C28 12 25 10 20 10 C12 10 10 17 10 25 C10 34 13 40 21 40 C25 40 28 39 30 37 V30 H20 V22 H38 V41 C33 47 28 48 20 48 C7 48 2 39 2 25 C2 10 8 2 20 2 C28 2 33 5 36 10 Z' },
    B: { width: 40, filled: true, path: 'M5 2 H21 C41 2 42 20 30 25 C44 31 41 48 22 48 H5 Z M14 10 V21 H21 C30 21 30 10 21 10 Z M14 29 V40 H22 C32 40 32 29 22 29 Z' },
    P: { width: 40, filled: true, path: 'M5 48 V2 H21 C43 2 43 29 21 29 H14 V48 Z M14 10 V21 H21 C31 21 31 10 21 10 Z' },
    R: { width: 40, filled: true, path: 'M5 48 V2 H21 C42 2 43 22 29 28 L40 48 H29 L17 29 H14 V48 Z M14 10 V21 H21 C31 21 31 10 21 10 Z' },
    '+': { width: 36, path: 'M18 11 V39 M4 25 H32' },
    '1': { width: 26, path: 'M4 14 L14 6 V44 M3 44 H25' },
    '0': { width: 34, path: 'M17 6 C7 6 5 14 5 25 C5 36 7 44 17 44 C27 44 29 36 29 25 C29 14 27 6 17 6 Z' },
    '2': { width: 34, path: 'M5 14 C8 2 30 3 29 16 C29 23 21 27 16 32 L5 44 H30' },
    '3': { width: 34, path: 'M5 10 C15 2 29 6 29 15 C29 22 23 25 16 25 M16 25 C34 25 34 44 18 44 C12 44 8 42 5 39' },
    '4': { width: 34, path: 'M25 44 V6 L4 32 H31' },
    '5': { width: 34, path: 'M29 6 H7 V24 C32 17 36 43 18 44 C12 44 8 42 5 39' },
    '6': { width: 34, path: 'M28 9 C12 -2 4 17 5 31 C6 49 30 48 30 32 C30 18 9 19 5 30' },
    '7': { width: 34, path: 'M4 6 H30 L12 44' },
    '8': { width: 34, path: 'M17 25 C1 24 2 6 17 6 C32 6 33 24 17 25 C0 25 0 44 17 44 C34 44 34 25 17 25 Z' },
    '9': { width: 34, path: 'M6 41 C22 52 30 33 29 19 C28 1 4 2 4 18 C4 32 25 31 29 20' },
    '−': { width: 36, path: 'M4 25 H32' },
    '×': { width: 36, path: 'M7 14 L29 36 M29 14 L7 36' },
    '→': { width: 46, path: 'M4 25 H41 L26 10 M41 25 L26 40' },
    '←': { width: 46, path: 'M42 25 H5 L20 10 M5 25 L20 40' },
};

export function measureGlyphText(value, size) {
    const width = [...value].reduce((sum, character) => sum + GLYPHS[character].width, 0) + (value.length - 1) * 4;
    return width * size / 50;
}

export function drawGlyphText(ctx, value, x, y, size, color, outline = false, pass = 'all') {
    const glyphs = [...value].map(character => GLYPHS[character]);
    const width = measureGlyphText(value, 50);
    const scale = size / 50;
    ctx.save(); ctx.translate(x - width * scale / 2, y - size / 2); ctx.scale(scale, scale);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const glyph of glyphs) {
        const path = new Path2D(glyph.path);
        if (outline) {
            ctx.lineWidth = glyph.filled ? 2.5 : typeof outline === 'string' ? 14 : 10.5;
            ctx.strokeStyle = typeof outline === 'string' ? outline : '#46514b'; ctx.stroke(path);
        }
        if (pass !== 'outline') {
            if (glyph.filled) { ctx.fillStyle = color; ctx.fill(path, 'evenodd'); }
            else { ctx.lineWidth = 8; ctx.strokeStyle = color; ctx.stroke(path); }
        }
        ctx.translate(glyph.width + 4, 0);
    }
    ctx.restore();
}

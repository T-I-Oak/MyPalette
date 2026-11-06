export function readTransform({ x, y, scale }) {
    if (![x, y, scale].every(Number.isFinite) || scale <= 0) {
        throw new RangeError('Expected a finite origin and a positive scale');
    }
    return Object.freeze({ x, y, scale });
}

export function readRect({ x, y, width, height }) {
    if (![x, y, width, height].every(Number.isFinite) || width < 0 || height < 0) {
        throw new RangeError('Expected a finite rectangle with non-negative dimensions');
    }
    return Object.freeze({ x, y, width, height });
}

export function transformRect(rect, { x, y, scale }) {
    return {
        x: x + rect.x * scale,
        y: y + rect.y * scale,
        width: rect.width * scale,
        height: rect.height * scale,
    };
}

export function interpolateRect(from, to, progress) {
    const interpolate = key => from[key] + (to[key] - from[key]) * progress;
    return {
        x: interpolate('x'),
        y: interpolate('y'),
        width: interpolate('width'),
        height: interpolate('height'),
    };
}

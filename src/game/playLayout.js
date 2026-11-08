export const playMetrics = Object.freeze({ width: 400, height: 640 });
export const playOffsets = Object.freeze({ topLeftOffset: { x: 0, y: 0 }, bottomRightOffset: { x: 0, y: 18 } });
export function playStandardSize(count) {
    return { width: playMetrics.width * Math.max(1, count), height: playMetrics.height };
}
export function layoutPlay(count, width = count * playMetrics.width, height = playMetrics.height) {
    const left = (width - count * playMetrics.width) / 2;
    const top = (height - playMetrics.height) / 2;
    return Array.from({ length: count }, (_, index) => ({ x: left + index * playMetrics.width, y: top }));
}
export function playButtonCenter(slot, areaScale, fixedScale, leftOffset) {
    return leftOffset + (slot.x + playMetrics.width / 2) * areaScale / fixedScale;
}

export function paintingFacing(centerX, areaWidth) {
    const playerDistance = 2000;
    return Math.atan2(areaWidth / 2 - centerX, playerDistance);
}

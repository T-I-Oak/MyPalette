const cardWidth = 294;
const cardHeight = 414;
const angle = 1.5 * Math.PI / 180;
const envelopeWidth = cardWidth * Math.cos(angle) + cardHeight * Math.sin(angle) + 2;
const envelopeHeight = cardHeight * Math.cos(angle) + cardWidth * Math.sin(angle) + 2;
const padding = 22;
const gap = 12;

export const handMetrics = Object.freeze({ cardWidth, cardHeight, envelopeWidth, envelopeHeight, padding, gap });
export const handStandardSize = Object.freeze({
    width: Math.ceil(padding * 2 + envelopeWidth * 4 + gap * 3),
    height: Math.ceil(padding * 2 + envelopeHeight),
});
export const handOffsets = Object.freeze({ topLeftOffset: { x: 0, y: 0 }, bottomRightOffset: { x: 0, y: 40 } });

export function layoutHand(width, height, count) {
    const available = width - padding * 2 - envelopeWidth;
    const interval = count > 1 ? Math.min(envelopeWidth + gap, available / (count - 1)) : 0;
    const rowWidth = envelopeWidth + Math.max(0, count - 1) * interval;
    const x = (width - rowWidth) / 2 + (envelopeWidth - cardWidth) / 2;
    const y = padding + (envelopeHeight - cardHeight) / 2;
    return Array.from({ length: count }, (_, index) => ({ x: x + interval * index, y }));
}

export function handButtonCenter(slot, areaScale, fixedScale, leftOffset) {
    return leftOffset + (slot.x + cardWidth / 2) * areaScale / fixedScale;
}

export function handActionPosition(matrix, frame, bottomOffset) {
    const slot = layoutHand(frame.logicalWidth, frame.logicalHeight, 1)[0];
    const centerY = frame.drawRect.y + (slot.y + cardHeight / 2) * frame.scale;
    return {
        x: (matrix[12] + matrix[0] * cardWidth / 2 + matrix[4] * cardHeight / 2) / frame.fixedScale,
        y: (matrix[13] + matrix[1] * cardWidth / 2 + matrix[5] * cardHeight / 2
            + frame.rect.y + frame.rect.height - bottomOffset * frame.fixedScale - centerY) / frame.fixedScale,
    };
}

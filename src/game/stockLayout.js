const cardWidth = 294;
const cardHeight = 414;
const angle = 1.5 * Math.PI / 180;
const envelopeWidth = cardWidth * Math.cos(angle) + cardHeight * Math.sin(angle) + 2;
const envelopeHeight = cardHeight * Math.cos(angle) + cardWidth * Math.sin(angle) + 0.9;
const maxCards = 15;
const thickness = 1.5;
const stackHeight = (maxCards - 1) * thickness;
const padding = 4;
const bottomPadding = 22;
const gap = 32;
const maxGap = 64;
const lift = 24;
const labelHeight = 48;
const labelGap = 4;

export const stockMetrics = Object.freeze({ cardWidth, cardHeight, envelopeWidth, envelopeHeight, maxCards, thickness, stackHeight, padding, bottomPadding, gap, maxGap, lift, labelHeight, labelGap });
export const stockStandardSize = Object.freeze({
    width: Math.ceil(envelopeWidth * 3 + gap * 2 + padding * 2),
    height: Math.ceil(envelopeHeight + stackHeight + lift + labelHeight + labelGap + padding + bottomPadding),
});
export const stockOffsets = Object.freeze({ topLeftOffset: { x: 0, y: 36 }, bottomRightOffset: { x: 0, y: 40 } });

export function layoutStock(width, height) {
    const actualGap = Math.min(maxGap, Math.max(gap, (width - padding * 2 - envelopeWidth * 3) / 2));
    const interval = envelopeWidth + actualGap;
    const left = (width - (envelopeWidth * 3 + actualGap * 2)) / 2 + (envelopeWidth - cardWidth) / 2;
    const top = (height - (envelopeHeight + stackHeight + lift + labelHeight + labelGap) - padding - bottomPadding) / 2 + padding + lift + labelHeight + labelGap;
    return ['A', 'B', 'C'].map((grade, index) => ({
        grade,
        x: left + index * interval,
        y: top + (envelopeHeight - cardHeight) / 2 + stackHeight,
        labelY: top - lift - labelGap - labelHeight,
    }));
}

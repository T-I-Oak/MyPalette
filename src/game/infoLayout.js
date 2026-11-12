import { stockMetrics } from './stockLayout.js';
import { currentFace } from './dice.js';

const padding = 6;
const gap = 8;
const rowHeight = 24;
export const flyerImageSize = { width: 880, height: 1240 };
export const flyerReserveDuration = 320;
export const flyerReserveCycles = 3;
export const flyerFiles = Object.freeze({
    missing: 'flyer-blank.png', partial: 'flyer-in-progress.png', completed: 'flyer-completed.png',
});
export const flyerIconWidth = rowHeight * flyerImageSize.width / flyerImageSize.height;
const height = rowHeight * 2 + 4;
export const logoSize = { width: 498, height: 161 };
const logoWidth = height * logoSize.width / logoSize.height;
export const infoDayWidth = 66;
const faceHeight = stockMetrics.cardHeight;
const faceWidth = faceHeight * 1.5;
const thickness = 24;
const perspective = 1250;
const angle = 32;
const radians = angle * Math.PI / 180;
const sin = Math.sin(radians);
const cos = Math.cos(radians);
const edgeWidth = thickness * sin / (1 + thickness * cos / perspective);
const projectedWidth = edgeWidth + faceWidth * cos / (1 + faceWidth * sin / perspective);
export const shippedCanvas = { faceWidth, faceHeight, thickness, perspective, angle, edgeWidth, projectedWidth };
const artworkWidth = height * projectedWidth / faceHeight;
const artworkSpace = artworkWidth * 2 + 4;
const fixedWidth = padding * 2 + gap * 3 + logoWidth + infoDayWidth + artworkSpace;

const iconGap = 3;
const standardCompactCount = 999;
export const compactCountCharacters = `x ${standardCompactCount}`.length;
export function iconRunWidth(count, compact, iconWidth = rowHeight) {
    if (!count) return 0;
    return compact ? iconWidth + iconGap + 10 * Math.min(compactCountCharacters, `x ${count}`.length)
        : count * (iconWidth + iconGap) - iconGap;
}

export function flyerCounts(state) {
    const partial = Number(state.progress > 0);
    return [state.flyers, partial, Math.max(0, state.orderCost - state.flyers - partial)];
}

export function creditAtRisk(state) {
    if (state.phase !== 'play' || state.pending || state.achievement || state.rollRequest || state.recycleRequest) return 0;
    const unused = state.dice.filter(die => {
        const face = currentFace(die);
        return !die.used && face && !face.special;
    }).length;
    return Math.min(state.credit, Math.max(0, unused - 2));
}

function flyerWidth(counts, completed, missing) {
    return iconRunWidth(counts[0], completed, flyerIconWidth) + iconRunWidth(counts[1], false, flyerIconWidth)
        + iconRunWidth(counts[2], missing, flyerIconWidth)
        + iconGap * Math.max(0, counts.filter(Boolean).length - 1);
}

const standardCreditWidth = iconRunWidth(standardCompactCount, true);
const standardFlyerWidth = flyerWidth([standardCompactCount, 1, standardCompactCount], true, true);
export const infoStandardSize = Object.freeze({
    width: fixedWidth + Math.max(standardCreditWidth, standardFlyerWidth),
    height: height + padding * 2,
});

export function infoFormats(state, width) {
    const available = width - fixedWidth + 1e-6;
    const counts = flyerCounts(state);
    const [completed, missing] = [[false, false], [false, true], [true, false], [true, true]]
        .find(([first, last]) => flyerWidth(counts, first, last) <= available) ?? [true, true];
    return { credit: iconRunWidth(state.credit, false) > available, completed, missing };
}

export function shippedRect(width, logicalHeight, index, count) {
    const shift = count > 1 ? (artworkSpace - artworkWidth) * (count - 1 - index) / (count - 1) : 0;
    return { x: width - padding - artworkWidth - shift, y: (logicalHeight - height) / 2, width: artworkWidth, height };
}

import { handStandardSize, handOffsets } from '../../game/handLayout.js';

const panelWidthRatio = 0.85;
const panelHeightRatio = 0.6;

export const areaDefinitions = Object.freeze({
    info: { name: '情報表示エリア', width: 600, height: 300 },
    play: { name: 'プレイエリア', width: 600, height: 300 },
    palette: { name: 'パレットエリア', width: 600, height: 200 },
    stock: { name: 'ストックエリア', width: 600, height: 200 },
    discard: { name: '捨て札エリア', width: 300, height: 200 },
    deck: { name: 'デッキエリア', width: 300, height: 200 },
    hand: { name: '手札', ...handStandardSize, ...handOffsets },
});

export function fitArea(rect, standard, visible = true, fixedScale = 1) {
    const topLeft = standard.topLeftOffset ?? { x: 0, y: 0 };
    const bottomRight = standard.bottomRightOffset ?? { x: 0, y: 0 };
    if (!Number.isFinite(fixedScale) || fixedScale <= 0
        || ![topLeft.x, topLeft.y, bottomRight.x, bottomRight.y].every(value => Number.isFinite(value) && value >= 0)) {
        throw new RangeError('Expected positive fixed scale and nonnegative offsets');
    }
    const drawRect = {
        x: rect.x + topLeft.x * fixedScale, y: rect.y + topLeft.y * fixedScale,
        width: Math.max(0, rect.width - (topLeft.x + bottomRight.x) * fixedScale),
        height: Math.max(0, rect.height - (topLeft.y + bottomRight.y) * fixedScale),
    };
    const drawable = drawRect.width > 0 && drawRect.height > 0;
    const scale = drawable ? Math.min(drawRect.width / standard.width, drawRect.height / standard.height) : 1;
    return { rect, drawRect, drawable, fixedScale, scale,
        logicalWidth: drawable ? drawRect.width / scale : 0,
        logicalHeight: drawable ? drawRect.height / scale : 0, visible };
}

export class ScreenLayout {
    constructor(definitions = areaDefinitions) {
        this.definitions = definitions;
        this.fixedScale = 1;
        this.minimumHeight = 240;
    }

    calculate(width, height, panelProgress = 0) {
        if (![width, height].every(value => Number.isFinite(value) && value > 0)) {
            throw new RangeError('Expected positive display dimensions');
        }
        if (!Number.isFinite(panelProgress) || panelProgress < 0 || panelProgress > 1) {
            throw new RangeError('Expected panel progress between zero and one');
        }
        const mode = width >= height ? 'A' : 'B';
        height = Math.max(height, this.minimumHeight * this.fixedScale);
        const areas = {};
        const put = (id, x, y, w, h, visible = true) => {
            areas[id] = fitArea({ x, y, width: w, height: h }, this.definitions[id], visible, this.fixedScale);
        };
        if (mode === 'A') {
            const w = width / 2;
            const h = height / 6;
            put('info', 0, 0, w, h);
            put('play', 0, h, w, h * 3);
            put('palette', 0, h * 4, w, h * 2);
            put('stock', w, 0, w, h * 2);
            put('discard', w, h * 2, w / 2, h * 2);
            put('deck', w * 1.5, h * 2, w / 2, h * 2);
            put('hand', w, h * 4, w, h * 2);
        } else {
            const h = height / 8;
            put('info', 0, 0, width, h);
            put('play', 0, h, width, h * 3);
            put('palette', 0, h * 4, width, h * 2);
            put('hand', 0, h * 6, width, h * 2);
            const panelWidth = width * panelWidthRatio;
            const panelHeight = height * panelHeightRatio;
            const x = width - panelWidth * panelProgress;
            const y = h;
            put('stock', x, y, panelWidth, panelHeight / 2, panelProgress > 0);
            put('discard', x, y + panelHeight / 2, panelWidth / 2, panelHeight / 2, panelProgress > 0);
            put('deck', x + panelWidth / 2, y + panelHeight / 2, panelWidth / 2, panelHeight / 2, panelProgress > 0);
        }
        return { mode, areas, width, height };
    }
}

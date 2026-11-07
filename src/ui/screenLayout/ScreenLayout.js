const panelWidthRatio = 0.85;
const panelHeightRatio = 0.6;

export const areaDefinitions = Object.freeze({
    info: { name: '情報表示エリア', width: 600, height: 100 },
    play: { name: 'プレイエリア', width: 600, height: 300 },
    palette: { name: 'パレットエリア', width: 600, height: 200 },
    stock: { name: 'ストックエリア', width: 600, height: 200 },
    discard: { name: '捨て札エリア', width: 300, height: 200 },
    deck: { name: 'デッキエリア', width: 300, height: 200 },
    hand: { name: '手札エリア', width: 600, height: 200 },
});

export function fitArea(rect, standard, visible = true) {
    const scale = Math.min(rect.width / standard.width, rect.height / standard.height);
    return { rect, scale, logicalWidth: rect.width / scale, logicalHeight: rect.height / scale, visible };
}

export class ScreenLayout {
    calculate(width, height, panelProgress = 0) {
        if (![width, height].every(value => Number.isFinite(value) && value > 0)) {
            throw new RangeError('Expected positive display dimensions');
        }
        if (!Number.isFinite(panelProgress) || panelProgress < 0 || panelProgress > 1) {
            throw new RangeError('Expected panel progress between zero and one');
        }
        const mode = width >= height ? 'A' : 'B';
        const areas = {};
        const put = (id, x, y, w, h, visible = true) => {
            areas[id] = fitArea({ x, y, width: w, height: h }, areaDefinitions[id], visible);
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
        return { mode, areas };
    }
}

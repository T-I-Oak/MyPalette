import { FIELD_WIDTH, FIELD_DEPTH, FIELD_VIEW_COSINE, fieldCenterVertices } from './field.js';
import { READY_HEIGHT } from './readyHeight.js';

export const paletteMetrics = Object.freeze({ pixelsPerUnit: 20, padding: 8 });
const projectedHeight = FIELD_DEPTH * FIELD_VIEW_COSINE;
const viewSine = Math.sqrt(1 - FIELD_VIEW_COSINE ** 2);
export const paletteDieTop = -Math.min(...fieldCenterVertices().map(point=>point.z))*FIELD_VIEW_COSINE +
    READY_HEIGHT * viewSine + Math.sqrt(3);
export function paletteSizeForScale(scale=1) {
    const top=-Math.min(...fieldCenterVertices(undefined,scale).map(point=>point.z))*FIELD_VIEW_COSINE+READY_HEIGHT*viewSine+Math.sqrt(3);
    return {
        width:Math.ceil(FIELD_WIDTH*scale*paletteMetrics.pixelsPerUnit+paletteMetrics.padding*2),
        height:Math.ceil((projectedHeight*scale/2+Math.max(projectedHeight*scale/2,top))*paletteMetrics.pixelsPerUnit+paletteMetrics.padding*2),
    };
}
export const paletteStandardSize = Object.freeze(paletteSizeForScale());

export function paletteCameraBounds(width, height,scale=1) {
    const unit = paletteMetrics.pixelsPerUnit;
    const bottom = -projectedHeight*scale / 2 - paletteMetrics.padding / unit;
    return { left: -width / unit / 2, right: width / unit / 2, bottom, top: bottom + height / unit };
}

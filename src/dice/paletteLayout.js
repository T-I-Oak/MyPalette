import { FIELD_WIDTH, FIELD_DEPTH, FIELD_VIEW_COSINE, fieldCenterVertices } from './field.js';
import { READY_HEIGHT } from './pose.js';

export const paletteMetrics = Object.freeze({ pixelsPerUnit: 20, padding: 8 });
const projectedHeight = FIELD_DEPTH * FIELD_VIEW_COSINE;
const viewSine = Math.sqrt(1 - FIELD_VIEW_COSINE ** 2);
export const paletteDieTop = -Math.min(...fieldCenterVertices().map(point=>point.z))*FIELD_VIEW_COSINE +
    READY_HEIGHT * viewSine + Math.sqrt(3);
export const paletteStandardSize = Object.freeze({
    width: Math.ceil(FIELD_WIDTH * paletteMetrics.pixelsPerUnit + paletteMetrics.padding * 2),
    height: Math.ceil((projectedHeight/2 + Math.max(projectedHeight/2,paletteDieTop)) * paletteMetrics.pixelsPerUnit + paletteMetrics.padding * 2),
});

export function paletteCameraBounds(width, height) {
    const unit = paletteMetrics.pixelsPerUnit;
    const bottom = -projectedHeight / 2 - paletteMetrics.padding / unit;
    return { left: -width / unit / 2, right: width / unit / 2, bottom, top: bottom + height / unit };
}

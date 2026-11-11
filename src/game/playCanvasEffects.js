import { createPaintingCanvas } from './easel/createPaintingCanvas.js';

export function mountEffectCanvas(entry, image) {
    entry.painting?.dispose(); entry.painting = createPaintingCanvas(image); entry.easel.mountCanvas(entry.painting);
}

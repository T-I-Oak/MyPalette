import { omitArtworkImages } from '../artworkComparison.js';

async function loadImage(id, step) {
    const image = new Image();
    image.src = `${import.meta.env.BASE_URL}assets/paintings/${id}-${step}.png`;
    await image.decode();
    return image;
}

export async function paintingPreview(id, step) {
    const source = omitArtworkImages ? null : await loadImage(id, step === 0 ? 1 : step);
    const canvas = document.createElement('canvas');
    const width = 1536, height = 1024;
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fffef9'; context.fillRect(0, 0, width, height);
    if (source && step > 0) context.drawImage(source, 0, 0, width, height);
    return canvas;
}

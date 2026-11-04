import { MATERIALS } from '../effectCatalog.js';
import { INKS, specialIconCanvas } from './icons.js';
import { colorizeGrayscale } from './colorizeGrayscale.js';

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`画材画像を読み込めません: ${url}`));
        image.src = url;
    });
}
export async function loadResultGraphics() {
    const entries = await Promise.all(MATERIALS.map(async material => [material, await Promise.all(
        ['grayscale', 'fixed'].map(layer => loadImage(`${import.meta.env.BASE_URL}assets/dice/${material}_${layer}.png`)))]));
    const assets = Object.fromEntries(entries), cache = new Map();
    return {
        get(face) {
            const key = JSON.stringify(face);
            if (cache.has(key)) return cache.get(key);
            let canvas;
            if (face.special) canvas = specialIconCanvas(face.special);
            else {
                const [gray, fixed] = assets[face.material];
                canvas = document.createElement('canvas'); canvas.width = gray.naturalWidth; canvas.height = gray.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(gray, 0, 0);
                const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
                colorizeGrayscale(pixels.data, INKS[face.color]);
                ctx.putImageData(pixels, 0, 0);
                ctx.drawImage(fixed, 0, 0, canvas.width, canvas.height);
            }
            const url = canvas.toDataURL(); cache.set(key, url); return url;
        },
        dispose() { cache.clear(); }
    };
}

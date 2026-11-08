import { Card } from './Card.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { createPaintingCanvas } from './easel/createPaintingCanvas.js';
import { animateProgress, achievementTiming } from './playAnimation.js';

export function mountEffectCanvas(entry, image) {
    entry.painting?.dispose(); entry.painting = createPaintingCanvas(image); entry.easel.mountCanvas(entry.painting);
}

export function createPlayCanvasEffects(find, update) {
    return {
        async fadeOut(id, image, signal) {
            const entry = find(id); mountEffectCanvas(entry, image); update();
            await animateProgress(achievementTiming.fade, progress => { entry.info.style.opacity = String(1 - progress); }, signal);
        },
        async repaint(id, before, after, signal) {
            const entry = find(id), image = document.createElement('canvas');
            image.width = after.width; image.height = after.height;
            const context = image.getContext('2d'); entry.painting.setImage(image);
            await animateProgress(520, progress => {
                context.globalAlpha = 1; context.clearRect(0, 0, image.width, image.height);
                context.drawImage(before, 0, 0, image.width, image.height);
                context.globalAlpha = progress; context.drawImage(after, 0, 0, image.width, image.height);
                entry.painting.setImage(image); update();
            }, signal);
        },
        async fadeIn(id, definition, step, signal) {
            const entry = find(id), source = entry.info.querySelector('.PaintingCard');
            const card = new Card(id); card.setPresentation('field', { x: 0, y: 0, angle: 0 });
            card.setFace(definition, step, step, () => {});
            releasePaintingIcons(source); source.replaceWith(card.element); update();
            await animateProgress(achievementTiming.fade, progress => { entry.info.style.opacity = String(progress); }, signal);
            if (signal.aborted) return;
            entry.painting.dispose(); entry.painting = null; update();
        },
        empty(id) {
            const entry = find(id); entry.info.style.opacity = '0';
            entry.painting?.dispose(); entry.painting = null; update();
        },
    };
}

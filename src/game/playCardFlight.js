import { MoveArea, MoveObject, createMoveManager } from '../ui/areaTransition/index.js';

export function captureHandCard(root, id) {
    const source = root.querySelector(`[data-game-area="hand"] .PaintingCard[data-card-id="${id}"]`);
    const element = source.cloneNode(true);
    const copies = element.querySelectorAll('canvas');
    source.querySelectorAll('canvas').forEach((canvas, index) => {
        if (canvas.width && canvas.height) copies[index].getContext('2d').drawImage(canvas, 0, 0);
    });
    element.removeAttribute('data-card-id'); element.classList.add('PlayFlyingCard');
    for (const name of ['--painting-x', '--painting-y', '--painting-tilt']) element.style.setProperty(name, name.endsWith('tilt') ? '0deg' : '0px');
    const rect = source.getBoundingClientRect();
    return { element, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
}

export async function flyHandCard(screen, capture, target, signal) {
    const surface = screen.surface;
    const key = 'play-flight';
    let progress = 0;
    const readTarget = () => {
        const rect = target.getBoundingClientRect(), origin = surface.readViewportTransform();
        return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
    };
    const movingSurface = {
        ...surface, renderInArea() {}, removeFromArea() {},
        renderMoving(object, rect) { surface.renderMoving(object, rect, rect.width / 294); },
        scheduleFrame(callback) {
            surface.scheduleFrame(time => { destination.setSlot(key, readTarget()); callback(time); });
        },
    };
    const source = new MoveArea('play-flight-source', movingSurface), destination = new MoveArea('play-flight-target', movingSurface);
    const origin = surface.readViewportTransform();
    const object = new MoveObject(key, capture.element);
    object.onMoveFrame = frame => { progress = frame.progress; };
    object.render = ({ viewportRect, scale }) => {
        const pair = target.parentElement.getBoundingClientRect();
        const pairScale = pair.width / 400;
        const projected = new DOMMatrix(getComputedStyle(target).transform);
        const correction = new DOMMatrix().scale(1 / scale).translate(pair.x - viewportRect.x, pair.y - viewportRect.y)
            .scale(pairScale).multiply(projected);
        const end = correction.toFloat64Array(), identity = new DOMMatrix().toFloat64Array();
        const matrix = Array.from(end, (value, index) => identity[index] + (value - identity[index]) * progress);
        object.element.style.transform = `matrix3d(${matrix.join(',')})`;
        object.element.style.transformOrigin = '0 0';
    };
    source.setSlot(key, { ...capture.rect, x: capture.rect.x - origin.x, y: capture.rect.y - origin.y });
    source.place(object, key); destination.setSlot(key, readTarget());
    try {
        await createMoveManager(movingSurface).move({ object, from: source, to: destination, slot: key, durationMs: 420, signal });
    } finally {
        surface.removeMoving(object); object.area?.remove(object);
        source.deleteSlot(key); destination.deleteSlot(key);
    }
}

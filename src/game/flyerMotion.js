import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { trace } from './startupTrace.js';
import { diagonalReveal } from './achievementMotion.js';
import { flyMaterials } from './achievementMaterials.js';
import { flyerFiles, flyerImageSize } from './infoLayout.js';
import { animateProgress } from './playAnimation.js';

const stages = ['missing', 'partial', 'completed'];
const transferDuration = 520;

async function loadFlyer(kind) {
    const image = new Image();
    image.src = `${import.meta.env.BASE_URL}assets/${flyerFiles[kind]}`;
    image.alt = '';
    await image.decode();
    return image;
}

export function createFlyerMotion(screen, palette, info) {
    const playArea = screen.areas.get('play');
    let active;
    function workRect() {
        const frame = playArea.canvas.getBoundingClientRect();
        const ratio = flyerImageSize.width / flyerImageSize.height;
        const height = Math.min(frame.height * .58, frame.width * .46 / ratio), width = height * ratio;
        return { x: frame.x + (frame.width - width) / 2, y: frame.y + (frame.height - height) / 2, width, height };
    }
    function draw(object, rect) { screen.surface.renderMoving(object, rect, 1); }
    function transfer(object, from, to, signal, stage) {
        return animateProgress(transferDuration, amount => {
            const start = from(), end = to(), progress = amount * amount * (3 - 2 * amount);
            draw(object, Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, start[key] + (end[key] - start[key]) * progress])));
        }, signal, stage);
    }
    function clear() {
        if (!active) return;
        screen.surface.removeMoving(active);
        active = undefined;
        info.releaseFlyer();
    }
    return {
        clear,
        async work(state, request, signal) {
            const kind = stages[request.step], nextKind = stages[request.step + 1];
            const detail = { day: state.day, dieId: request.dieId, kind, nextKind };
            trace('flyer-decode-start', detail);
            const [next, sourceImage] = await Promise.all([loadFlyer(nextKind), active ? null : loadFlyer(kind)]);
            trace('flyer-decode-complete', detail);
            if (signal.aborted) return;
            if (!active) {
                const sheet = document.createElement('div');
                sheet.className = 'FlyerWork';
                sheet.dataset.flyerStage = kind;
                sheet.append(sourceImage);
                active = new MoveObject('flyer-work', sheet);
                const source = info.holdFlyer(state, kind);
                draw(active, source());
                if (!await transfer(active, source, workRect, signal, 'flyer-work')) return;
            }
            const object = active;
            object.element.append(next);
            next.style.clipPath = 'polygon(0 0, 0 0, 0 0)';
            palette.beginAchievement([request.dieId]);
            await flyMaterials(screen, palette, {
                diceIds: [request.dieId],
                corners() {
                    const { x, y, width, height } = workRect();
                    return [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }];
                },
                onOrbit(progress) {
                    draw(object, workRect());
                    const points = diagonalReveal(progress).map(([x, y]) => `${100 * x}% ${100 * y}%`);
                    next.style.clipPath = `polygon(${points.join(', ')})`;
                },
            }, signal);
            if (signal.aborted) return;
            next.style.clipPath = '';
            object.element.replaceChildren(next);
            object.element.dataset.flyerStage = nextKind;
        },
        async returnToInfo(state, request, signal) {
            const target = info.flyerTarget(state, stages[request.step]);
            try { await transfer(active, workRect, target.read, signal, 'flyer-return'); }
            finally { target.dispose(); }
        },
    };
}

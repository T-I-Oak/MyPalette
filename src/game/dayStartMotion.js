import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { animateProgress } from './playAnimation.js';

const timing = { move: 520, hold: 480, reducedHold: 220, scale: 3 };
const initialMaxFrameTime = 1000 / 30;

export function createDayStartMotion(screen, area, day) {
    return async (initial, changeDay, signal) => {
        const placeholder = document.createElement('div');
        placeholder.style.cssText = `flex:none;width:${day.offsetWidth}px;height:${day.offsetHeight}px`;
        day.before(placeholder);
        const object = new MoveObject('day-start', day);
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const home = () => placeholder.getBoundingClientRect();
        function draw(amount, expansion = amount) {
            const from = home();
            const bounds = area.canvas.closest('.LayoutContent').getBoundingClientRect();
            const scale = area.layoutFrame.scale * (1 + expansion * (timing.scale - 1));
            const width = day.offsetWidth * scale, height = day.offsetHeight * scale;
            const x = from.x + ((bounds.x + bounds.width / 2 - width / 2) - from.x) * amount;
            const y = from.y + ((bounds.y + bounds.height / 2 - height / 2) - from.y) * amount;
            screen.surface.renderMoving(object, { x, y, width, height }, scale);
        }
        const move = (from, to, centered = false) => animateProgress(timing.move, progress => {
            const eased = progress * progress * (3 - 2 * progress);
            const amount = from + (to - from) * eased;
            draw(centered ? 1 : amount, amount);
        }, signal, centered ? { maxFrameTime: initialMaxFrameTime } : undefined);
        day.dataset.dayStart = initial ? 'initial' : 'next';
        let restored = false;
        const restore = () => {
            if (restored) return;
            restored = true;
            screen.surface.removeMoving(object);
            placeholder.replaceWith(day);
            delete day.dataset.dayStart;
        };
        signal.addEventListener('abort', restore, { once: true });
        try {
            if (!reduced) {
                draw(initial ? 1 : 0, 0);
                if (!await move(0, 1, initial)) return;
            }
            if (signal.aborted) return;
            changeDay();
            if (!await animateProgress(reduced ? timing.reducedHold : timing.hold, () => { if (!reduced) draw(1); }, signal)) return;
            if (!reduced) await move(1, 0);
        } finally {
            signal.removeEventListener('abort', restore);
            restore();
        }
    };
}

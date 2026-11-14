import { currentTraceAction, trace } from './startupTrace.js';

export const achievementTiming = Object.freeze({ fade: 900 });

export function animateProgress(duration, draw, signal, stage, recordFrame) {
    const action = currentTraceAction();
    return new Promise((resolve, reject) => {
        if (signal.aborted) { resolve(false); return; }
        let start, frame;
        let frameNumber = 0;
        const cleanup = () => signal.removeEventListener('abort', abort);
        const abort = () => { cancelAnimationFrame(frame); cleanup(); resolve(false); };
        function tick(time) {
            try {
                const first = start === undefined;
                start ??= time;
                const progress = duration === 0 ? 1 : Math.min(1, (time - start) / duration);
                frameNumber++;
                recordFrame?.('enter', { frame: frameNumber, progress });
                const boundary = stage && (first || progress === 1);
                const data = boundary ? { stage, first, last: progress === 1 } : undefined;
                const entry = boundary ? trace('frame-start', data, action) : undefined;
                draw(progress, frameNumber);
                recordFrame?.('drawn', { frame: frameNumber });
                if (boundary) trace('frame-end', { ...data, start: entry }, action);
                if (progress === 1) { cleanup(); resolve(true); }
                else {
                    frame = requestAnimationFrame(tick);
                    recordFrame?.('queued', { frame: frameNumber + 1 });
                }
            } catch (error) { cleanup(); reject(error); }
        }
        signal.addEventListener('abort', abort, { once: true });
        frame = requestAnimationFrame(tick);
        recordFrame?.('queued', { frame: 1 });
        if (stage) trace('frame-queued', { stage }, action);
    });
}

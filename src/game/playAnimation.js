export const achievementTiming = Object.freeze({ fade: 900 });

export function animateProgress(duration, draw, signal) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) { resolve(false); return; }
        let start, frame;
        const cleanup = () => signal.removeEventListener('abort', abort);
        const abort = () => { cancelAnimationFrame(frame); cleanup(); resolve(false); };
        function tick(time) {
            try {
                start ??= time;
                const progress = duration === 0 ? 1 : Math.min(1, (time - start) / duration);
                draw(progress);
                if (progress === 1) { cleanup(); resolve(true); }
                else frame = requestAnimationFrame(tick);
            } catch (error) { cleanup(); reject(error); }
        }
        signal.addEventListener('abort', abort, { once: true });
        frame = requestAnimationFrame(tick);
    });
}

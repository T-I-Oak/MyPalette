export const achievementTiming = Object.freeze({ fade: 900 });

export function animateProgress(duration, draw, signal, { maxFrameTime = Infinity } = {}) {
    return new Promise((resolve, reject) => {
        if (signal.aborted) { resolve(false); return; }
        let previous, frame, elapsed = 0;
        const cleanup = () => signal.removeEventListener('abort', abort);
        const abort = () => { cancelAnimationFrame(frame); cleanup(); resolve(false); };
        function tick(time) {
            try {
                if (previous !== undefined) elapsed += Math.min(time - previous, maxFrameTime);
                previous = time;
                const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
                draw(progress);
                if (progress === 1) { cleanup(); resolve(true); }
                else frame = requestAnimationFrame(tick);
            } catch (error) { cleanup(); reject(error); }
        }
        signal.addEventListener('abort', abort, { once: true });
        frame = requestAnimationFrame(tick);
    });
}

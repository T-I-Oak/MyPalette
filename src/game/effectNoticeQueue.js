export const EFFECT_NOTICE_MS = 3000;

export function createEffectNoticeQueue({ show, hide, idle, schedule = setTimeout, cancel = clearTimeout }) {
    const pending = [];
    let active = null, timer = null, paused = false, disposed = false;
    function start() {
        if (disposed || paused || active || !pending.length) return;
        active = pending.shift(); show(active);
        timer = schedule(() => {
            timer = null; hide(); active = null;
            start();
            if (!active && !pending.length) idle();
        }, EFFECT_NOTICE_MS);
    }
    return {
        get busy() { return !!active || pending.length > 0; },
        enqueue(events) { if (!disposed) { pending.push(...events); start(); } },
        pause(value) { paused = value; start(); },
        dispose() {
            disposed = true;
            if (timer !== null) cancel(timer);
            timer = null; pending.length = 0; active = null; hide();
        },
    };
}

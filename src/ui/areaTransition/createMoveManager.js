import { interpolateRect, transformRect } from './geometry.js';

export function createMoveManager(surface) {
    const active = new Set();

    async function move({ object, from, to, slot, durationMs, signal }) {
        if (from === to || !Number.isFinite(durationMs) || durationMs < 0) {
            return { status: 'rejected', reason: 'invalid-request' };
        }
        if (active.has(object.id)) return { status: 'rejected', reason: 'already-moving' };
        if (signal?.aborted) return { status: 'cancelled' };
        const departure = from.reserveDeparture(object);
        if (!departure) return { status: 'rejected', reason: 'source-unavailable' };
        const arrival = to.reserveArrival(object, slot);
        if (!arrival) {
            departure.release();
            return { status: 'rejected', reason: 'slot-unavailable' };
        }

        active.add(object.id);
        try {
            return await animate({ surface, object, from, to, departure, arrival, durationMs, signal });
        } finally {
            arrival.release();
            departure.release();
            active.delete(object.id);
        }
    }

    return { move };
}

function animate({ surface, object, from, to, departure, arrival, durationMs, signal }) {
    let startMs;
    let sourceRect;
    let progress = 0;
    let movingDrawn = false;

    function clearMoving() {
        if (!movingDrawn) return;
        surface.removeMoving(object);
        movingDrawn = false;
    }

    return new Promise((resolve, reject) => {
        function frame(nowMs) {
            try {
                if (signal?.aborted) {
                    if (startMs !== undefined) {
                        clearMoving();
                        departure.restore();
                        object.onMoveFrame({ phase: 'cancelled', progress });
                        from.renderObject(object);
                    }
                    resolve({ status: 'cancelled' });
                    return;
                }

                if (startMs === undefined) {
                    sourceRect = transformRect(departure.readLocalRect(), from.readTransform());
                    surface.clearFocus(object);
                    departure.detach();
                    startMs = nowMs;
                    object.onMoveFrame({ phase: 'started', progress: 0 });
                } else {
                    progress = Math.min((nowMs - startMs) / durationMs, 1);
                    if (progress < 1) object.onMoveFrame({ phase: 'moving', progress });
                }

                if (durationMs === 0 || progress === 1) {
                    clearMoving();
                    arrival.attach();
                    object.onMoveFrame({ phase: 'arrived', progress: 1 });
                    to.renderObject(object);
                    resolve({ status: 'arrived' });
                    return;
                }

                const target = transformRect(arrival.readLocalRect(), to.readTransform());
                const current = interpolateRect(sourceRect, target, progress);
                movingDrawn = true;
                surface.renderMoving(object, transformRect(current, surface.readViewportTransform()));
                surface.scheduleFrame(frame);
            } catch (error) {
                try {
                    clearMoving();
                    if (object.area === null) {
                        departure.restore();
                        from.renderObject(object);
                    }
                } catch (cleanupError) {
                    reject(new AggregateError([error, cleanupError], 'Could not restore the move'));
                    return;
                }
                reject(error);
            }
        }

        surface.scheduleFrame(frame);
    });
}

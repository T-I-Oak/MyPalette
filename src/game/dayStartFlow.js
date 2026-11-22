export function createDayStartFlow({ state, present, advance, begin }) {
    const controller = new AbortController();
    let running = false;
    return {
        async start() {
            if (running || controller.signal.aborted || !['awaitingStart', 'betweenDays'].includes(state.phase)) return;
            running = true;
            const initial = state.phase === 'awaitingStart';
            try {
                await present(initial, () => {
                    if (!initial && !controller.signal.aborted) advance();
                }, controller.signal);
                if (!controller.signal.aborted && state.phase === 'awaitingStart') begin();
            } finally { running = false; }
        },
        dispose() { controller.abort(); },
    };
}

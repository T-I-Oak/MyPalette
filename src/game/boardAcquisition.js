export function createBoardAcquisition(screen) {
    let session;
    return {
        reset() { session = undefined; },
        update(state, { ready, waiting }) {
            if (state.phase === 'finished') { session = undefined; return; }
            const panel = screen.panelState;
            const selecting = ['stock', 'handReturn'].includes(state.pending?.kind);
            if (session && panel.manualRevision !== session.revision) session.manual = true;
            if (selecting && ready && panel.mode === 'B' && !session) {
                session = { revision: panel.manualRevision, manual: false, opened: !panel.open };
                if (session.opened) screen.openPanel();
            }
            // A pending request survives redraws and animation/notice locks.
            if (!session || state.pending || waiting) return;
            const close = session.opened && !session.manual && panel.mode === 'B';
            session = undefined;
            if (close) screen.closePanel();
        },
    };
}

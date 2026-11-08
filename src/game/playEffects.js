import { beginPlayEffect, effectField } from './playEffectState.js';
import { captureHandCard, flyHandCard } from './playCardFlight.js';
import { paintingPreview } from './easel/paintingPreview.js';
import { animateProgress, achievementTiming } from './playAnimation.js';

export function createPlayEffects(screen, host, play, root) {
    let effect = null, controller = new AbortController(), definitions;
    function stage(value) {
        effect.stage = value; host.dataset.playEffect = value;
        const pair = host.querySelector(`[data-painting-id="${effect.id}"]`);
        if (pair) pair.dataset.effect = value;
    }
    function cancel() {
        controller.abort(); controller = new AbortController(); effect = null;
        play.setEffect(null); delete host.dataset.playEffect;
    }
    return {
        cancel,
        field: state => effectField(state, effect),
        begin(action, state, cards) {
            if (!action || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            definitions = cards; effect = beginPlayEffect(action, state); play.setEffect(effect);
            host.dataset.playEffect = effect.stage;
            if (action.kind === 'play') effect.source = captureHandCard(root, effect.id);
        },
        hasWork(state) {
            return !!effect && (effect.kind === 'play' || effect.stage === 'card'
                || !state.field.some(card => card.id === effect.id));
        },
        hideDestination(board) {
            if (!effect || effect.kind !== 'achieve' || effect.showDestination) return;
            for (const node of board.querySelectorAll(`.discard .PaintingCard[data-card-id="${effect.id}"], .shipped .PaintingCard[data-card-id="${effect.id}"]`)) {
                node.closest('.GameCardSlot').hidden = true;
            }
        },
        async run(state, render, completeAchievement) {
            const current = effect, signal = controller.signal;
            const pause = duration => animateProgress(duration, () => {}, signal);
            if (current.kind === 'play') {
                stage('empty'); if (!await pause(100)) return;
                stage('moving'); await flyHandCard(screen, current.source, play.cardTarget(current.id), signal);
                if (signal.aborted) return;
                stage('card'); play.cardTarget(current.id).style.opacity = '1';
                await pause(80);
            } else {
                if (current.stage === 'card') {
                    current.images = await Promise.all([paintingPreview(current.id, current.card.step), paintingPreview(current.id, Math.min(3, current.card.step + 1))]);
                    if (signal.aborted) return;
                    stage('canvas'); await play.fadeOut(current.id, current.images[0], signal);
                    if (!await pause(achievementTiming.beforeRepaint)) return;
                    stage('repaint'); await play.repaint(current.id, current.images[0], current.images[1], signal);
                    if (signal.aborted) return;
                    stage('effects'); current.image = current.images[1];
                    completeAchievement();
                }
                if (state.field.some(card => card.id === current.id)) return;
                const next = [...state.discard, ...state.shipped].find(card => card.id === current.id);
                current.card.step = next.step;
                stage('next-card'); await play.fadeIn(current.id, definitions[current.id], next.step, signal);
                if (!await pause(160)) return;
                stage('empty'); current.showDestination = true; play.empty(current.id); render();
                if (!await pause(160)) return;
            }
            if (signal.aborted) return;
            effect = null; play.setEffect(null); delete host.dataset.playEffect; render();
        },
    };
}

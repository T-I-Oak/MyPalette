import { trace } from './startupTrace.js';
import { cardSceneSnapshot } from './cardSceneLayout.js';
import { relocateSceneCards, sceneChanges, closingStockCards } from './cardScenePlans.js';
import { deckTiming } from './deckMotion.js';
import { stockTiming } from './stockMotion.js';
import { recycleFrame, recycleTiming, sineProgress } from './recycleMotion.js';
import { stockMetrics as m } from './stockLayout.js';
import { paintingPreview } from './easel/paintingPreview.js';
import { flyMaterials } from './achievementMaterials.js';
import { materialTiming } from './achievementMotion.js';
import { flyerReserveCycles, flyerReserveDuration } from './infoLayout.js';
import { animateProgress } from './playAnimation.js';
import { animateCreditLoss } from './creditLossMotion.js';

const clamp = value => Math.min(1, Math.max(0, value));

export function createCardSceneTimeline(screen, cards, play, palette, flyer, info, refresh) {
    const root = screen.areas.get('play').canvas.closest('.LayoutContent');
    let action, records = [], enabled = true, controller = new AbortController();
    function prepare(target) { cards.adopt(target); refresh(); }
    async function move(target, duration, name, options) {
        const signal = controller.signal;
        if (signal.aborted) return;
        root.dataset.cardSceneMotion = name; prepare(target);
        await cards.move(target, enabled ? duration : 0, name, options);
        if (!signal.aborted) refresh();
    }
    async function reveal(actual) {
        const target = cardSceneSnapshot(cards.display), ids = [];
        for (const [grade, id] of Object.entries(actual.public)) {
            if (id && target.public[grade] !== id) { target.public[grade] = id; ids.push(id); }
        }
        if (!ids.length) return;
        const delay = id => ['A', 'B', 'C'].indexOf(id[0]) * stockTiming.stagger;
        const duration = 720 + Math.max(...ids.map(delay));
        await move(target, duration, 'stock-reveal', {
            progressFor: (id, p) => ids.includes(id) ? clamp((p * duration - delay(id) - 180) / 360) : p,
            frame(id, progress, pose) {
                if (!ids.includes(id)) return;
                const area = screen.areas.get('stock');
                const time = progress * duration - delay(id), up = clamp(time / 180), settle = clamp((time - 540) / 180);
                const matrix = [...pose.matrix]; matrix[13] -= m.lift * (up - settle) * area.layoutFrame.scale;
                return { ...pose, matrix, z: up > 0 && settle < 1 ? 10000 : pose.z };
            },
        });
    }
    async function rotateStocks(actual) {
        const signal = controller.signal, target = cardSceneSnapshot(cards.display);
        const closingCards = closingStockCards(target, actual), ids = closingCards.map(card => card.id), grades = closingCards.map(card => card.grade);
        if (!ids.length) return;
        const delay = id => grades.includes(id[0]) ? ['A', 'B', 'C'].indexOf(id[0]) * stockTiming.stagger : 0;
        const maxDelay = Math.max(...ids.map(delay)), closing = 540 + maxDelay;
        for (const grade of grades) target.public[grade] = null;
        await move(target, closing, 'stock-close', {
            progressFor: (id, p) => ids.includes(id) ? clamp((p * closing - delay(id) - 180) / 360) : p,
            frame(id, p, pose) {
                if (!ids.includes(id)) return;
                const matrix = [...pose.matrix]; matrix[13] -= m.lift * clamp((p * closing - delay(id)) / 180) * screen.areas.get('stock').layoutFrame.scale;
                return { ...pose, matrix, z: 10000 };
            },
        });
        if (signal.aborted) return;
        target.stocks = structuredClone(actual.stocks);
        const duration = 700 + maxDelay;
        await move(target, duration, 'stock-rotate', {
            progressFor(id, p) {
                if (!grades.includes(id[0])) return p;
                const time = p * duration - delay(id);
                return ids.includes(id) ? clamp((time - 260) / 180) : clamp(time / 260);
            },
            frame(id, p, pose) {
                if (!ids.includes(id)) return;
                const time = p * duration - delay(id), matrix = [...pose.matrix];
                matrix[12] -= m.cardWidth * (clamp(time / 260) - clamp((time - 440) / 260)) * screen.areas.get('stock').layoutFrame.scale;
                return { ...pose, matrix, z: time < 440 ? 10000 : pose.z };
            },
        });
    }
    async function returnToStock(actual, ids) {
        const target = relocateSceneCards(cards.display, actual, ids), held = cardSceneSnapshot(cards.display);
        const signal = controller.signal;
        await move(held, 540, 'hand-return-flip', {
            pose: id => ids.includes(id) ? { ...cards.poseFor(id, held), flip: 180 } : undefined,
            progressFor: (id, p) => ids.includes(id) ? clamp((p * 540 - 180) / 360) : p,
            frame(id, p, pose) {
                if (!ids.includes(id)) return;
                const matrix = [...pose.matrix]; matrix[13] -= m.lift * clamp(p * 540 / 180) * screen.areas.get('hand').layoutFrame.scale;
                return { ...pose, matrix, z: 10000 };
            },
        });
        if (signal.aborted) return;
        const insertion = (id, lift) => {
            if (!ids.includes(id)) return;
            const pose = cards.poseFor(id, target), matrix = [...pose.matrix], scale = screen.areas.get('stock').layoutFrame.scale;
            matrix[12] -= m.cardWidth * scale; matrix[13] -= lift * scale;
            return { ...pose, matrix, flip: 180, z: 10000 };
        };
        const transit = id => ids.includes(id) ? 'transit' : undefined;
        await move(target, 420, 'hand-return-flight', { pose: id => insertion(id, m.lift), departure: id => ids.includes(id), areaOnArrival: transit });
        if (signal.aborted) return;
        await move(target, 180, 'hand-return-lower', { pose: id => insertion(id, 0), areaOnArrival: transit });
        if (signal.aborted) return;
        await move(target, 260, 'hand-return-insert');
    }
    async function draws(events) {
        const drawn = events.filter(event => event.kind === 'draw').map(event => event.card);
        if (!drawn.length) return;
        const target = cardSceneSnapshot(cards.display), ids = drawn.map(card => card.id);
        target.deck = target.deck.filter(card => !ids.includes(card.id)); target.hand.push(...structuredClone(drawn));
        const duration = (drawn.length - 1) * deckTiming.interval + deckTiming.lift + deckTiming.flip + deckTiming.flight;
        await move(target, duration, 'draw', {
            departure: (id, p) => ids.includes(id) && p * duration >= ids.indexOf(id) * deckTiming.interval,
            progressFor(id, progress) {
                const index = ids.indexOf(id), time = progress * duration - Math.max(0, index) * deckTiming.interval;
                return clamp((time - deckTiming.lift - deckTiming.flip) / deckTiming.flight);
            },
            frame(id, progress, pose) {
                const index = ids.indexOf(id);
                if (index < 0) return;
                const time = progress * duration - index * deckTiming.interval;
                const flight = clamp((time - deckTiming.lift - deckTiming.flip) / deckTiming.flight);
                const matrix = [...pose.matrix]; matrix[13] -= m.lift * clamp(time / deckTiming.lift) * (1 - flight) * screen.areas.get('deck').layoutFrame.scale;
                return { matrix, flip: 180 * (1 - clamp((time - deckTiming.lift) / deckTiming.flip)), z: 10000 + drawn.length - index };
            },
        });
    }
    async function reconcile(state, events) {
        const signal = controller.signal;
        const actual = cardSceneSnapshot(state);
        const deal = events.find(event => event.kind === 'deal');
        if (deal) {
            const target = relocateSceneCards(cards.display, { ...actual, deck: deal.cards, hand: cards.display.hand }, deal.cards.map(card => card.id));
            const ids = deal.cards.map(card => card.id), duration = stockTiming.deal + (ids.length - 1) * stockTiming.dealStagger;
            const sourceZ = new Map(ids.map(id => [id, cards.model.get(id).pose.z]));
            await move(target, duration, 'initial-deal', {
                departure: (id, p) => ids.includes(id) && p * duration > ids.indexOf(id) * stockTiming.dealStagger,
                progressFor: (id, p) => ids.includes(id) ? clamp((p * duration - ids.indexOf(id) * stockTiming.dealStagger) / stockTiming.deal) : p,
                frame(id, progress, pose) {
                    const index = ids.indexOf(id);
                    if (index < 0) return;
                    const time = progress * duration - index * stockTiming.dealStagger;
                    return { ...pose, z: time <= 0 ? sourceZ.get(id) : time < stockTiming.deal ? 10000 + ids.length - index : pose.z };
                },
            });
        }
        if (signal.aborted) return;
        const changes = sceneChanges(cards.display, actual).filter(item => item.from !== 'deck' && item.from !== 'discard');
        if (changes.length) {
            const returns = changes.filter(item => item.to === 'stock').map(item => item.id);
            if (returns.length) await returnToStock(actual, returns);
            if (signal.aborted) return;
            const remaining = changes.filter(item => !returns.includes(item.id));
            const target = relocateSceneCards(cards.display, actual, remaining.map(item => item.id));
            const cleanup = remaining.some(item => ['hand', 'field'].includes(item.from) && item.to === 'discard');
            const stockHand = remaining.filter(item => item.from === 'stock' && item.to === 'hand').map(item => item.id);
            if (remaining.length) await move(target, cleanup ? 300 : stockHand.length ? 600 : 520, cleanup ? 'day-cleanup' : 'stock-transfer', stockHand.length ? {
                progressFor: (id, p) => stockHand.includes(id) || target.hand.some(c => c.id === id) ? clamp((p * 600 - 180) / 420) : p,
                frame(id, p, pose) {
                    if (!stockHand.includes(id)) return;
                    const matrix = [...pose.matrix]; matrix[13] -= m.lift * clamp(p * 600 / 180) * (1 - clamp((p * 600 - 180) / 420)) * screen.areas.get('stock').layoutFrame.scale;
                    return { ...pose, matrix, z: 10000 };
                },
            } : undefined);
        }
        if (signal.aborted) return;
        if (['awaitingStart', 'betweenDays'].includes(state.phase) || state.dayEndRequest?.kind === 'cleanup') {
            const intermediate = cardSceneSnapshot(cards.display);
            for (const change of changes.filter(item => item.from === 'stock' && item.to === 'discard')) {
                const grade = change.id[0];
                intermediate.public[grade] = intermediate.stocks[grade][0]?.id ?? null;
            }
            await reveal(intermediate);
            if (signal.aborted) return;
        }
        await rotateStocks(actual);
        if (signal.aborted) return;
        await reveal(actual);
        if (signal.aborted) return;
        await draws(events);
    }
    async function recycle(state, resume) {
        const signal = controller.signal;
        const source = [...cards.display.discard].reverse(), count = source.length;
        const held = cardSceneSnapshot(cards.display);
        const owner = screen.areas.get('discard');
        const pose = (id, time) => {
            const index = source.findIndex(card => card.id === id); if (index < 0) return;
            const frame = recycleFrame({ width: owner.logicalWidth, height: owner.logicalHeight, count, index, placement: cards.placement(id, 'discard') }, time);
            const rect = owner.readScreenRect({ ...frame, width: m.cardWidth, height: m.cardHeight });
            const matrix = new DOMMatrix().translate(rect.x, rect.y).scale(rect.width / m.cardWidth);
            return { matrix: matrix.toFloat64Array(), flip: frame.flip, z: 10000 + count - index };
        };
        await move(held, recycleTiming.spread, 'recycle-spread', { pose: id => pose(id, recycleTiming.spread), ease: sineProgress });
        if (signal.aborted) return [];
        await move(held, recycleTiming.gather, 'recycle-gather', { pose: id => pose(id, recycleTiming.spread + recycleTiming.gather), ease: sineProgress });
        if (signal.aborted) return [];
        const next = resume(state.recycleRequest.id);
        const shuffled = next.find(event => event.kind === 'recycle').cards;
        const target = cardSceneSnapshot(held); target.discard = []; target.deck = structuredClone(shuffled);
        await move(target, recycleTiming.transfer, 'recycle-transfer', { departure: id => source.some(card => card.id === id) });
        return next;
    }
    return {
        begin(value) { controller.abort(); controller = new AbortController(); action = value; enabled = !matchMedia('(prefers-reduced-motion: reduce)').matches; if (enabled && value?.kind === 'achieve') palette.beginAchievement(value.diceIds); },
        hasWork(state, events) {
            records = structuredClone(events);
            const changed = JSON.stringify(cards.display) !== JSON.stringify(cardSceneSnapshot(state));
            const work = Boolean(state.achievement || state.recycleRequest || state.dayEndRequest || state.phase === 'betweenDays' || changed);
            cards.busy = work;
            if (!work) cards.adopt(state);
            return work;
        },
        async run(state, completeAchievement, resumeRecycle, resumeDayEnd) {
            const signal = controller.signal;
            try {
                if (state.phase === 'start') {
                    root.dataset.cardSceneMotion = 'day-ready';
                    await palette.waitReady(signal);
                    if (signal.aborted) return;
                }
                if (action?.kind === 'play') {
                    const target = relocateSceneCards(cards.display, cardSceneSnapshot(state), [action.id]);
                    await move(target, 420, 'play');
                    if (signal.aborted) return;
                }
                if (state.achievement) {
                    const id = state.achievement.id, card = cards.display.field.find(item => item.id === id), nextStep = card.step + 1;
                    root.dataset.cardSceneMotion = 'achievement-canvas';
                    const images = await Promise.all([paintingPreview(id, card.step), paintingPreview(id, card.step + 1)]);
                    palette.beginAchievement(action.diceIds);
                    await play.fadeOut(id, images[0], signal);
                    if (signal.aborted) return;
                    await Promise.all([flyMaterials(screen, palette, { diceIds: action.diceIds, corners: () => play.canvasCorners(id) }, signal),
                        play.repaint(id, images[0], images[1], signal, Math.max(520, materialTiming.outbound + materialTiming.orbit + Math.max(0, action.diceIds.length - 1) * materialTiming.stagger))]);
                    if (signal.aborted) return;
                    const target = cardSceneSnapshot(cards.display), destination = nextStep === 3 ? 'shipped' : 'discard';
                    target.field = target.field.filter(item => item.id !== id);
                    target[destination].push({ id, step: nextStep });
                    if (destination === 'shipped') {
                        await move(target, 520, 'achievement-shipment', {
                            shipment: { id, image: images[1] }, ease: sineProgress,
                            departure: (cardId, progress) => cardId === id && progress > 0,
                        });
                    } else {
                        await play.fadeIn(id, null, nextStep, signal);
                        if (signal.aborted) return;
                        await move(target, 520, 'achievement-transfer');
                    }
                    if (signal.aborted) return;
                    palette.endAchievement(); records = completeAchievement();
                }
                await reconcile(state, records);
                while (!signal.aborted && (state.dayEndRequest || state.recycleRequest)) {
                    let dayEndDetail;
                    if (state.dayEndRequest) {
                        const request = state.dayEndRequest;
                        dayEndDetail = { day: state.day, request, animated: enabled };
                        trace('day-end-start', { ...dayEndDetail, play: play.resourceCounts(), palette: palette.resourceCounts() });
                        if (enabled && request.kind === 'work') {
                            root.dataset.cardSceneMotion = 'flyer-work';
                            await flyer.work(state, request, signal);
                        } else if (enabled && request.kind === 'return') {
                            root.dataset.cardSceneMotion = 'flyer-return';
                            await flyer.returnToInfo(state, request, signal);
                        } else if (enabled && request.kind === 'reserve') {
                            root.dataset.cardSceneMotion = 'flyer-reserve';
                            await animateProgress(flyerReserveDuration * flyerReserveCycles, () => {}, signal);
                        } else if (request.kind === 'credit') {
                            if (enabled) {
                                root.dataset.cardSceneMotion = 'credit-loss';
                                await animateCreditLoss(screen, palette, info, request.diceIds, state.credit, signal);
                            }
                            if (!signal.aborted) palette.hideCreditMaterials(request.diceIds);
                        }
                        if (signal.aborted) return;
                        records = resumeDayEnd(request);
                        if (request.kind === 'return') flyer.clear();
                        refresh();
                        if (request.kind === 'work') palette.endAchievement();
                    } else {
                        records = await recycle(state, resumeRecycle);
                    }
                    if (!signal.aborted) await reconcile(state, records);
                    if (!signal.aborted && dayEndDetail) {
                        trace('day-end-complete', { ...dayEndDetail, play: play.resourceCounts(), palette: palette.resourceCounts() });
                    }
                }
                if (!signal.aborted) { cards.adopt(state); cards.busy = false; cards.update(); }
            } finally { if (controller.signal === signal) delete root.dataset.cardSceneMotion; }
        },
        cancel() {
            controller.abort(); controller = new AbortController();
            flyer.clear(); info.clearCreditImpacts(); palette.endAchievement(); cards.cancel();
            delete root.dataset.cardSceneMotion;
        },
    };
}

export const stockTiming = Object.freeze({ stagger: 120, lift: 180, flip: 360, settle: 180, slide: 260, lower: 180, deal: 300, dealStagger: 90 });
const grades = ['A', 'B', 'C'];
export function stockSnapshot(state) {
    return { stocks: structuredClone(state.stocks), public: { ...state.public }, hand: structuredClone(state.hand), day: state.day, phase: state.phase };
}
export function planStockMotion(before, after) {
    return grades.map((grade, index) => {
        const old = before.stocks[grade], next = after.stocks[grade];
        const deal = before.day === 1 && !before.public.A && grade === 'A' && old.length === 15 && next.length === 8
            ? old.slice(0, 7).map(card => card.id) : [];
        const removed = old.filter(card => !next.some(item => item.id === card.id)).map(card => card.id);
        const rotationId = next.at(-1)?.id;
        const rotate = before.public[grade] && !after.public[grade] && old.some(card => card.id === rotationId);
        const reveal = after.public[grade] !== before.public[grade] && after.public[grade];
        const replenish = rotate && rotationId !== before.public[grade] ? rotationId : null;
        return { grade, delay: index * stockTiming.stagger, deal, removed: deal.length ? [] : removed,
            replenish, rotate: rotate ? rotationId : null,
            reveal: reveal || null, before: old, after: next };
    }).filter(plan => plan.deal.length || plan.rotate || plan.reveal || plan.removed.length);
}
export const clampProgress = (time, start, duration) => Math.max(0, Math.min(1, (time - start) / duration));

export function stockDealDepth(count, index, time, dealCount) {
    const departing = index < dealCount && time > index * stockTiming.dealStagger;
    return count - index + (departing ? dealCount : 0);
}

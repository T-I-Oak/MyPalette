export const discardTiming = Object.freeze({ flight: 520, cleanup: 300 });

export function planDiscardTransfers(before, after) {
    const areas = { hand: before.hand, field: before.field, stock: Object.values(before.stocks).flat() };
    return after.discard.flatMap((card, index) => {
        const from = ['hand', 'field', 'stock'].find(area => areas[area].some(item => item.id === card.id));
        return from ? [{ ...card, from, index }] : [];
    });
}

export function planStockHandTransfers(before, after) {
    if (before.phase === 'awaitingStart' || before.phase === 'betweenDays') return [];
    const transfers = [];
    for (const [grade, cards] of Object.entries(after.stocks)) {
        for (const card of cards) {
            if (before.hand.some(item => item.id === card.id)) transfers.push({ id: card.id, grade, from: 'hand', to: 'stock' });
        }
    }
    for (const card of after.hand) {
        const grade = Object.keys(before.stocks).find(key => before.stocks[key].some(item => item.id === card.id));
        if (grade) transfers.push({ id: card.id, grade, from: 'stock', to: 'hand' });
    }
    return transfers;
}

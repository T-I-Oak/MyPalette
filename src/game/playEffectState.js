export function beginPlayEffect(action, state) {
    const zone = action.kind === 'play' ? state.hand : state.field;
    const index = zone.findIndex(card => card.id === action.id);
    return { kind: action.kind, id: action.id, card: { ...zone[index] },
        index: action.kind === 'play' ? state.field.length : index,
        stage: action.kind === 'play' ? 'empty' : 'card', images: null, showDestination: false };
}

export function effectField(state, effect) {
    if (!effect || effect.kind !== 'achieve') return state.field;
    const cards = state.field.filter(card => card.id !== effect.id);
    cards.splice(effect.index, 0, effect.card);
    return cards;
}

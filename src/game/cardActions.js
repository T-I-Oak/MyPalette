export function onCardSurfaceClick(node, run, options) {
    node.addEventListener('click', event => {
        if (!event.target.closest('button, .CardIcon')) run();
    }, options);
}

export function createCardActions(provide) {
    let running = false;
    return {
        forCard(cardId) {
            return provide(cardId).map(definition => {
                let consumed = false;
                return { ...definition, run() {
                    const current = provide(cardId).find(action => action.id === definition.id);
                    if (running || consumed || !current?.visible || !current.enabled || current.context !== definition.context) return false;
                    consumed = true; running = true;
                    try { current.execute(); } finally { running = false; }
                    return true;
                } };
            });
        },
    };
}

export function cardActionButton(action) {
    const button = document.createElement('button');
    button.type = 'button'; button.tabIndex = -1;
    button.className = 'Button texture-raised'; button.dataset.gameAction = '';
    button.updateCardAction = next => {
        action = next;
        button.textContent = action.label; button.hidden = !action.visible; button.disabled = !action.enabled;
        button.setAttribute('aria-label', action.description || action.label);
    };
    button.updateCardAction(action);
    button.addEventListener('click', () => action.run());
    return button;
}

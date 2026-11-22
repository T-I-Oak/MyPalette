import { matchingDice } from './goals.js';

export function needsRerollConfirmation(game) {
    const { hand, field, dice } = game.state;
    const achievable = card => card.step < 3 && matchingDice(game.step(card).goals, dice);
    return field.some(achievable) || (hand.length > 1 && hand.some(achievable));
}

export function createRerollControl({ canReroll, hasAchievable, confirm, execute }) {
    let pending = null, disposed = false, close;
    return {
        request(id) {
            if (disposed || pending || !canReroll(id)) return;
            if (!hasAchievable()) { execute(id); return; }
            const token = pending = {};
            close = confirm(accepted => {
                if (disposed || pending !== token) return;
                pending = null; close = null;
                if (accepted && canReroll(id)) execute(id);
            });
        },
        dispose() { disposed = true; pending = null; close?.(); },
    };
}

export function mountRerollControl(root, game, blocked, execute) {
    return createRerollControl({
        canReroll(id) {
            const s = game.state;
            return !blocked() && s.phase === 'play' && !s.pending && !s.achievement &&
                !s.rollRequest && !s.recycleRequest && s.rerolls > 0 &&
                s.dice.some(die => !die.used && (id === undefined || die.id === id));
        },
        hasAchievable: () => needsRerollConfirmation(game),
        execute,
        confirm(answer) {
            const overlay = document.createElement('div'); overlay.className = 'RerollOverlay';
            const dialog = document.createElement('section');
            dialog.className = 'RerollConfirmation texture-floating';
            dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true');
            dialog.setAttribute('aria-label', '達成可能なカードがあります');
            const message = document.createElement('p'); message.textContent = '達成可能なカードがあります';
            const actions = document.createElement('div'); actions.className = 'RerollConfirmationActions';
            const background = [...root.children];
            const inert = background.map(node => node.inert);
            for (const node of background) node.inert = true;
            const close = () => {
                document.removeEventListener('keydown', onKey);
                overlay.remove();
                background.forEach((node, index) => { node.inert = inert[index]; });
            };
            const finish = accepted => { close(); answer(accepted); };
            for (const [label, accepted] of [['戻る', false], ['リロールする', true]]) {
                const button = document.createElement('button'); button.type = 'button'; button.tabIndex = -1;
                button.className = 'Button texture-raised'; button.textContent = label;
                button.addEventListener('click', () => finish(accepted)); actions.append(button);
            }
            function onKey(event) {
                if (event.key === 'Escape') { event.preventDefault(); finish(false); }
            }
            document.addEventListener('keydown', onKey);
            dialog.append(message, actions); overlay.append(dialog); root.append(overlay);
            return close;
        },
    });
}

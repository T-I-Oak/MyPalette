import { createCardActions } from './cardActions.js';
import { matchingDice, satisfiesSelection } from './goals.js';
import { cardMessages } from './cardMessages.js';

export function createGameCardActions({ game, blocked, selection, act, animated }) {
    return createCardActions(id => {
        const text = cardMessages();
        const s = game.state, hand = s.hand.find(card => card.id === id), field = s.field.find(card => card.id === id);
        const canPlay = s.phase === 'play' && !s.pending && !s.achievement && !s.rollRequest && !s.recycleRequest;
        const available = !blocked() && s.phase !== 'finished';
        const pending = s.pending;
        const option = pending?.options.some(option => option.id === id);
        if (hand) {
            if (pending?.kind === 'handReturn') return [{
                id: 'return', label: text.returnToStock, visible: true, enabled: available && option, context: pending,
                execute: () => act(() => game.choose([id])),
            }];
            return [{ id: 'play', label: text.startPainting, visible: true, enabled: available && canPlay && s.hand.length >= 2,
                context: hand,
                execute: () => act(() => game.play(id), null, { kind: 'play', id }),
            }];
        }
        if (field) return [{
            id: 'achieve', label: animated ? '達成' : '選択ダイスで達成', description: '選択ダイスで達成',
            context: JSON.stringify([field.step, selection()]),
            visible: !animated || canPlay && field.step < 3 && Boolean(matchingDice(game.step(field).goals, s.dice)),
            enabled: available && canPlay && field.step < 3 && satisfiesSelection(game.step(field).goals, s.dice, selection()),
            execute() {
                const diceIds = selection();
                act(() => {
                    if (animated && !matchMedia('(prefers-reduced-motion: reduce)').matches) game.beginAchievement(id, diceIds);
                    else game.achieve(id, diceIds);
                }, null, { kind: 'achieve', id, diceIds });
            },
        }];
        const grade = Object.keys(s.stocks).find(grade => s.stocks[grade].some(card => card.id === id));
        if (grade) return [{ id: 'acquire', label: '取得', context: pending,
            visible: pending?.kind === 'stock' && option && s.public[grade] === id,
            enabled: available && pending?.kind === 'stock' && option && s.public[grade] === id,
            execute: () => act(() => game.choose([id])),
        }];
        return [];
    });
}

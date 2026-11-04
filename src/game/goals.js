import { goalGroups } from '../goalGroups.js';
import { currentFace } from './dice.js';

function assign(goals, dice) {
    if (!goals.length) return [];
    const [goal, ...rest] = goals;
    for (const die of dice) {
        const face = currentFace(die);
        if (die.used || face.special || (!goal.color && !goal.material)) continue;
        if (goal.color && goal.color !== face.color) continue;
        if (goal.material && goal.material !== face.material) continue;
        const tail = assign(rest, dice.filter(other => other !== die));
        if (tail) return [die.id, ...tail];
    }
    return null;
}
export function matchingDice(goals, dice) {
    for (const group of goalGroups(goals)) {
        const match = assign(group, dice);
        if (match) return match;
    }
    return null;
}
export function satisfiesSelection(goals, dice, ids) {
    if (new Set(ids).size !== ids.length || ids.some(id => !dice.some(die => die.id === id))) return false;
    const selected = dice.filter(die => ids.includes(die.id));
    return goalGroups(goals).some(group => group.length === selected.length && assign(group, selected) !== null);
}

import { MATERIALS, COLORS } from './effectCatalog.js';
import { goalGroups } from './goalGroups.js';

const rank = (values, value) => value === null ? values.length : values.indexOf(value);
const compareGoal = (a, b) => rank(MATERIALS, a.material) - rank(MATERIALS, b.material)
    || rank(COLORS, a.color) - rank(COLORS, b.color);

export function sortGoals(goals) {
    const groups = goalGroups(goals).map(group => group.map(({ join, ...goal }) => goal).sort(compareGoal));
    groups.sort((a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            const comparison = compareGoal(a[i], b[i]);
            if (comparison) return comparison;
        }
        return a.length - b.length;
    });
    return groups.flatMap((group, index) => group.map((goal, i) => index > 0 && i === 0 ? { ...goal, join: 'or' } : goal));
}

export function sortDocumentGoals(document) {
    const sorted = structuredClone(document);
    for (const card of sorted.cards) for (const step of card.steps) step.goals = sortGoals(step.goals);
    return sorted;
}

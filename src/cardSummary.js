import { EFFECTS, displayLabel } from './effectCatalog.js';
import { goalGroups } from './goalGroups.js';

export function describeEffect(effect) {
    if (effect.type === null) return '効果未設定';
    const definition = EFFECTS.find(item => item.type === effect.type);
    const count = Object.hasOwn(effect, 'count') ? `(x${effect.count === null ? '未設定' : effect.count})` : '';
    const parameters = definition.fields.filter(field => field.name !== 'count').map(field => {
        const value = effect[field.name];
        if (value === null) return '未設定';
        if (field.name === 'amount' && value > 0) return `+${value}`;
        return displayLabel(value);
    });
    return [definition.label + count, ...parameters].join(' / ');
}

export function describeGoals(goals) {
    if (!goals.length) return '未設定';
    const groups = goalGroups(goals);
    return groups.map(group => {
        return group.map(goal => [goal.material, goal.color].filter(Boolean).map(displayLabel).join('＋') || '未設定').join(' ');
    }).join(' | ');
}

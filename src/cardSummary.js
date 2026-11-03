import { EFFECTS, displayLabel } from './effectCatalog.js';
import { goalGroups } from './goalGroups.js';

export function describeEffect(effect) {
    if (effect.type === null) return '効果未設定';
    const definition = EFFECTS.find(item => item.type === effect.type);
    return [definition.label, ...definition.fields.map(field => `${field.label}：${effect[field.name] === null ? '未設定' : displayLabel(effect[field.name])}`)].join(' / ');
}

export function describeGoals(goals) {
    if (!goals.length) return '未設定';
    const groups = goalGroups(goals);
    return groups.map(group => {
        return group.map(goal => [goal.material, goal.color].filter(Boolean).map(displayLabel).join('＋') || '未設定').join(' ');
    }).join(' | ');
}

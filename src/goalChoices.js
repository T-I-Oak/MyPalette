import { MATERIALS, COLORS, displayLabel } from './effectCatalog.js';

export function goalChoices(card, field) {
    const values = field === 'material' ? MATERIALS : COLORS;
    const metadata = field === 'material' ? card.metadata.materials : card.metadata.colors;
    return values.filter(value => metadata[value]);
}

export function goalMetadataIssues(card) {
    const issues = [];
    card.steps.forEach((step, index) => step.goals.forEach((goal, i) => {
        for (const field of ['material', 'color']) {
            if (goal[field] !== null && !goalChoices(card, field).includes(goal[field])) {
                issues.push(`ステップ${index} 目標${i + 1}：${displayLabel(goal[field])}はメタ対象外`);
            }
        }
    }));
    return issues;
}

import { COLOR_PAIR_COLORS } from './effectCatalog.js';
import { goalChoices } from './goalChoices.js';

export function effectChoices(card, field) {
    if (field.name === 'material' || field.name === 'color') return goalChoices(card, field.name);
    if (field.name === 'colors') return field.options.filter(pair => COLOR_PAIR_COLORS[pair].every(color => card.metadata.colors[color]));
    return field.options;
}

import { expandLanguageResource } from '../../../GameWorksOAK/src/lib/core/i18n.js';
import { EFFECTS, displayLabel } from '../effectCatalog.js';

const translated = (ja, en) => ({ 'lang-store': { ja, en } });
const english = {
    refreshDice: 'Refresh used dice', gainNormalDice: 'Gain standard dice', gainColorDice: 'Gain color dice',
    gainMaterialDice: 'Gain material dice', gainRerolls: 'Gain rerolls', reroll: 'Reroll immediately',
    changeColor: 'Change a die face color', changeMaterial: 'Change a die face material',
    changeSpecialFace: 'Change to a special face', discardDice: 'Discard dice', changeFame: 'Change fame',
    drawCards: 'Draw cards', gainStockCards: 'Gain cards from stock', changeCardStep: 'Change a hand card step',
    exchangeCards: 'Exchange cards', activateSpecialFaces: 'Activate visible special faces',
};
const resources = {
    goal: translated('目標', 'Goal'),
    play: translated('プレイ時効果', 'On play'),
    reward: translated('達成時効果', 'On completion'),
    steps: translated('制作ステップ', 'Painting steps'),
    or: translated('または', 'Or'),
    none: translated('なし', 'None'),
    effects: Object.fromEntries(EFFECTS.map(effect => [effect.type, translated(effect.label, english[effect.type])])),
    parameter: translated('{value}', '{value}'),
    quantity: translated('×{value}', '×{value}'),
    labels: Object.fromEntries(Object.entries({
        brush: 'Brush', pastel: 'Pastel', airbrush: 'Airbrush', orange: 'Orange', yellow: 'Yellow',
        green: 'Green', blue: 'Blue', purple: 'Purple', red: 'Red', temporary: 'Temporary', permanent: 'Permanent',
        red_green: 'Red / Green', orange_blue: 'Orange / Blue', yellow_purple: 'Yellow / Purple',
        fame1: 'Fame +1', draw1: 'Draw one card', reroll1: 'Gain one reroll', temporaryNormal1: 'One temporary standard die',
        temporaryRedGreen1: 'One temporary red / green die', temporaryOrangeBlue1: 'One temporary orange / blue die',
        temporaryYellowPurple1: 'One temporary yellow / purple die', temporaryBrush1: 'One temporary brush die',
        temporaryPastel1: 'One temporary pastel die', temporaryAirbrush1: 'One temporary airbrush die',
    }).map(([key, en]) => [key, translated(displayLabel(key), en)])),
};

export function cardMessages() {
    const text = expandLanguageResource(resources);
    const label = value => text.labels[value] ?? String(value);
    return {
        ...text,
        describeGoal: goal => [goal.material, goal.color].filter(Boolean).map(label).join(' · '),
        describeEffect(effect) {
            const fields = EFFECTS.find(item => item.type === effect.type).fields;
            const parameters = fields.map(({ name }) => {
                const value = effect[name];
                const template = name === 'count' ? text.quantity : text.parameter;
                return template.replace('{value}', name === 'amount' && value > 0 ? '+' + value : label(value));
            });
            return [text.effects[effect.type], ...parameters].join(' · ');
        },
    };
}

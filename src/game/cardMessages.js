import { expandLanguageResource } from '../../../GameWorksOAK/src/lib/core/i18n.js';
import { displayLabel } from '../effectCatalog.js';
import { effectDescriptionParts, effectDescriptionResources } from './effectDescriptions.js';

const translated = (ja, en) => ({ 'lang-store': { ja, en } });
const resources = {
    descriptions: effectDescriptionResources,
    effectNoticeTitle: translated('獲得効果', 'Gained effects'),
    startPainting: translated('着手', 'Start'),
    goal: translated('目標', 'Goal'),
    play: translated('プレイ時効果', 'On play'),
    reward: translated('達成時効果', 'On completion'),
    steps: translated('制作ステップ', 'Painting steps'),
    or: translated('または', 'Or'),
    none: translated('なし', 'None'),
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
    const parts = effect => effectDescriptionParts(effect, text.descriptions, label);
    const describe = effect => parts(effect).map(part => typeof part === 'string' ? part : describe(part.effect)).join('');
    return {
        ...text,
        describeGoal: goal => [goal.material, goal.color].filter(Boolean).map(label).join(' · '),
        effectParts: parts,
        describeEffect: describe,
    };
}

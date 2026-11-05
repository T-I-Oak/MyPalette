import { EFFECTS, SPECIAL_FACES, displayLabel } from './effectCatalog.js';

const diceAcquisitions = ['gainNormalDice', 'gainColorDice', 'gainMaterialDice'];
export const evaluationRows = EFFECTS.flatMap(effect => diceAcquisitions.includes(effect.type)
    ? ['temporary', 'permanent'].map(lifetime => ({key:`${effect.type}.${lifetime}`, label:`${effect.label}：${displayLabel(lifetime)}`}))
    : effect.type === 'changeSpecialFace'
    ? SPECIAL_FACES.map(face => ({key:`changeSpecialFace.${face}`, label:`${effect.label}：${displayLabel(face)}`}))
    : [{key:effect.type, label:effect.label}]);
export const evaluationTimings = [['playEffects', 'プレイ時効果'], ['achievementEffects', '達成時効果']];

export function createEvaluation() {
    return { stepMultipliers:[1,1,1], ...Object.fromEntries(evaluationTimings.map(([key]) =>
        [key, Object.fromEntries(evaluationRows.map(row => [row.key, 0]))])) };
}

export function evaluationIssues(settings) {
    const issues = [];
    const object = (value, keys, path) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) { issues.push(`${path}はオブジェクトで指定してください。`); return false; }
        if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value,key))) issues.push(`${path}の項目が不足、または未対応の項目があります。`);
        return true;
    };
    if (!object(settings, ['stepMultipliers', ...evaluationTimings.map(([key]) => key)], '評価設定')) return issues;
    if (!Array.isArray(settings.stepMultipliers) || settings.stepMultipliers.length !== 3 || settings.stepMultipliers.some(value => !Number.isFinite(value))) {
        issues.push('ステップ倍率は3件の有限な数値で指定してください。');
    }
    for (const [timing, label] of evaluationTimings) {
        if (object(settings[timing], evaluationRows.map(row => row.key), label)) {
            for (const row of evaluationRows) if (!Number.isFinite(settings[timing][row.key])) issues.push(`${label}：${row.label}は有限な数値で指定してください。`);
        }
    }
    return issues;
}
function assertEvaluation(settings) {
    const issues = evaluationIssues(settings);
    if (issues.length) { const error = new Error(issues.join('\n')); error.issues = issues; throw error; }
}
export function readEvaluation(text) {
    const settings = JSON.parse(text.replace(/^\uFEFF/, '')); assertEvaluation(settings); return settings;
}
export function serializeEvaluation(settings) {
    assertEvaluation(settings); return JSON.stringify(settings, null, 2);
}
export function cardEvaluation(card, settings) {
    let total = 0;
    for (const [index, step] of card.steps.entries()) {
        const multiplier = settings.stepMultipliers[index];
        if (multiplier === null) return null;
        let subtotal = 0;
        for (const [timing] of evaluationTimings) for (const effect of step[timing]) {
            if (effect.type === null || (effect.type === 'changeSpecialFace' && effect.face === null) || (diceAcquisitions.includes(effect.type) && effect.lifetime === null)) return null;
            const key = effect.type === 'changeSpecialFace' ? `${effect.type}.${effect.face}`
                : diceAcquisitions.includes(effect.type) ? `${effect.type}.${effect.lifetime}` : effect.type;
            const points = settings[timing][key];
            const quantity = Object.hasOwn(effect, 'count') ? effect.count : Object.hasOwn(effect, 'amount') ? effect.amount : 1;
            if (points === null || quantity === null) return null;
            subtotal += points * quantity;
        }
        total += subtotal * multiplier;
    }
    return total;
}

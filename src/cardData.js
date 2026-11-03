import { COLORS, MATERIALS, EFFECTS, displayLabel } from './effectCatalog.js';
import { INITIAL_CARDS } from './initialCards.js';
import { sortDocumentGoals } from './goalOrdering.js';

export const CARD_IDS = ['A', 'B', 'C'].flatMap(grade =>
    Array.from({ length: 15 }, (_, i) => `${grade}${String(i + 1).padStart(2, '0')}`));

export function createDocument() {
    return {
        cards: CARD_IDS.map((id, i) => ({
            id, name: INITIAL_CARDS[i][0],
            metadata: {
                materials: Object.fromEntries(MATERIALS.map(value => [value, INITIAL_CARDS[i][1].includes(displayLabel(value))])),
                colors: Object.fromEntries(COLORS.map(value => [value, INITIAL_CARDS[i][2].includes(displayLabel(value))])),
            },
            steps: Array.from({ length: 3 }, () => ({ goals: [], playEffects: [], achievementEffects: [] })),
        })),
    };
}

export function validateDocument(data) {
    const errors = [];
    const issue = (path, reason) => errors.push({ path, reason });
    const object = (value, keys, path, optional = []) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            issue(path, 'オブジェクトで指定してください。'); return false;
        }
        for (const key of keys) if (!Object.hasOwn(value, key)) issue(`${path}.${key}`, '項目がありません。');
        for (const key of Object.keys(value)) if (!keys.includes(key) && !optional.includes(key)) issue(`${path}.${key}`, '未対応の項目です。');
        return true;
    };
    const array = (value, path) => {
        if (Array.isArray(value)) return true;
        issue(path, '配列で指定してください。'); return false;
    };
    const effects = (items, path) => {
        if (!array(items, path)) return;
        items.forEach((effect, i) => {
            const at = `${path}[${i + 1}]`;
            if (effect?.type === null) { object(effect, ['type'], at); return; }
            const def = EFFECTS.find(item => item.type === effect?.type);
            if (!def) { issue(at, '未対応の効果です。'); return; }
            if (!object(effect, ['type', ...def.fields.map(field => field.name)], at)) return;
            for (const field of def.fields) {
                const value = effect[field.name];
                // nullは制作途中の未設定値。値が入力された場合は規則を適用する。
                if (value === null) continue;
                if (field.options && !field.options.includes(value)) issue(`${at}.${field.name}`, `${field.label}の選択値が不正です。`);
                if (field.integer && (!Number.isSafeInteger(value) || (field.min && value < field.min) || (field.nonzero && value === 0))) {
                    issue(`${at}.${field.name}`, `${field.label}は${field.min ? '1以上の' : '0以外の'}安全な整数で指定してください。`);
                }
            }
        });
    };
    if (!object(data, ['cards'], 'データ')) return errors;
    if (!array(data.cards, 'cards')) return errors;
    if (data.cards.length !== CARD_IDS.length) issue('cards', '45枚のカードが必要です。');
    const seen = new Set();
    data.cards.forEach((card, i) => {
        const path = CARD_IDS.includes(card?.id) ? card.id : `cards[${i + 1}]`;
        if (!object(card, ['id', 'name', 'metadata', 'steps'], path)) return;
        if (!CARD_IDS.includes(card.id)) issue(`${path}.id`, 'IDはA01～A15／B01～B15／C01～C15です。');
        if (seen.has(card.id)) issue(`${path}.id`, 'IDが重複しています。');
        seen.add(card.id);
        if (typeof card.name !== 'string') issue(`${path}.name`, 'カード名は文字列で指定してください。');
        if (object(card.metadata, ['materials', 'colors'], `${path}.metadata`)) {
            for (const [key, values] of [['materials', MATERIALS], ['colors', COLORS]]) {
                const at = `${path}.metadata.${key}`;
                if (object(card.metadata[key], values, at)) for (const value of values) {
                    if (typeof card.metadata[key][value] !== 'boolean') issue(`${at}.${value}`, '使用有無はtrue／falseで指定してください。');
                }
            }
        }
        if (!array(card.steps, `${path}.steps`)) return;
        if (card.steps.length !== 3) issue(`${path}.steps`, 'ステップ0～2の3件が必要です。');
        card.steps.forEach((step, n) => {
            const at = `${path} ステップ${n}`;
            if (!object(step, ['goals', 'playEffects', 'achievementEffects'], at)) return;
            if (array(step.goals, `${at} 達成目標`)) step.goals.forEach((goal, j) => {
                const goalPath = `${at} 達成目標[${j + 1}]`;
                if (!object(goal, ['color', 'material'], goalPath, ['join'])) return;
                if (Object.hasOwn(goal, 'join') && !['and', 'or'].includes(goal.join)) issue(goalPath, '結合はand／orで指定してください。');
                if (j === 0 && goal.join === 'or') issue(goalPath, '先頭の目標にはORを指定できません。');
                if (goal.color !== null && !COLORS.includes(goal.color)) issue(goalPath, '色の選択値が不正です。');
                if (goal.material !== null && !MATERIALS.includes(goal.material)) issue(goalPath, '画材の選択値が不正です。');
            });
            effects(step.playEffects, `${at} プレイ時効果`);
            effects(step.achievementEffects, `${at} 達成時効果`);
        });
    });
    for (const id of CARD_IDS) if (!seen.has(id)) issue(id, 'カードがありません。');
    return errors;
}

export class DocumentValidationError extends Error {
    constructor(issues) {
        super(issues.map(({ path, reason }) => `${path}: ${reason}`).join('\n'));
        this.issues = issues;
    }
}

export function serializeDocument(document) {
    const issues = validateDocument(document);
    if (issues.length) throw new DocumentValidationError(issues);
    return JSON.stringify(sortDocumentGoals(document), null, 2);
}

export function readDocument(json) {
    const document = JSON.parse(json.replace(/^\uFEFF/, ''));
    const issues = validateDocument(document);
    if (issues.length) throw new DocumentValidationError(issues);
    return document;
}

export function draftIssues(card) {
    const issues = [];
    if (!card.name.trim()) issues.push('カード名が未設定');
    card.steps.forEach((step, n) => {
        if (!step.goals.length) issues.push(`ステップ${n}の目標が未設定`);
        if (step.goals.some(goal => goal.color === null && goal.material === null)) issues.push(`ステップ${n}に未設定の目標あり`);
        for (const key of ['playEffects', 'achievementEffects']) {
            if (step[key].some(effect => Object.values(effect).includes(null))) issues.push(`ステップ${n}の効果パラメータが未設定`);
        }
    });
    return issues;
}

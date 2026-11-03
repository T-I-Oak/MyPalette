// 効果のパラメータ定義はフォームと検証で共有する。
export const MATERIALS = ['brush', 'pastel', 'airbrush'];
export const COLORS = ['orange', 'yellow', 'green', 'blue', 'purple', 'red'];
export const COLOR_PAIR_COLORS = {
    red_green: ['red', 'green'], orange_blue: ['orange', 'blue'], yellow_purple: ['yellow', 'purple'],
};
export const COLOR_PAIRS = Object.keys(COLOR_PAIR_COLORS);
export const LABELS = {
    and: 'AND', or: 'OR',
    brush: '絵筆', pastel: 'パステル', airbrush: 'エアブラシ',
    orange: '橙', yellow: '黄', green: '緑', blue: '青', purple: '紫', red: '赤',
    red_green: '赤・緑', orange_blue: '橙・青', yellow_purple: '黄・紫',
    permanent: '永続', temporary: '一時',
    fame1: '名声値＋1', temporaryNormal1: '通常構成の一時ダイス×1', draw1: 'カードのドロー＋1', reroll1: 'リロール権の獲得×1',
    temporaryRedGreen1: '赤・緑の一時ダイス×1', temporaryOrangeBlue1: '橙・青の一時ダイス×1', temporaryYellowPurple1: '黄・紫の一時ダイス×1',
    temporaryBrush1: '絵筆の一時ダイス×1', temporaryPastel1: 'パステルの一時ダイス×1', temporaryAirbrush1: 'エアブラシの一時ダイス×1',
};
export const displayLabel = value => LABELS[value] ?? String(value);
export const SPECIAL_FACES = [
    'fame1', 'temporaryNormal1', 'temporaryRedGreen1', 'temporaryOrangeBlue1', 'temporaryYellowPurple1',
    'temporaryBrush1', 'temporaryPastel1', 'temporaryAirbrush1', 'draw1', 'reroll1',
];
export const SPECIAL_FACE_EFFECTS = {
    fame1: { type: 'changeFame', amount: 1 }, draw1: { type: 'drawCards', count: 1 }, reroll1: { type: 'gainRerolls', count: 1 },
    temporaryNormal1: { type: 'gainNormalDice', count: 1, lifetime: 'temporary' },
    ...Object.fromEntries(SPECIAL_FACES.slice(2, 5).map((id, i) => [id, { type: 'gainColorDice', count: 1, lifetime: 'temporary', colors: COLOR_PAIRS[i] }])),
    ...Object.fromEntries(SPECIAL_FACES.slice(5, 8).map((id, i) => [id, { type: 'gainMaterialDice', count: 1, lifetime: 'temporary', material: MATERIALS[i] }])),
};

const quantity = { name: 'count', label: '個数・回数', integer: true, min: 1 };
const pair = { name: 'colors', label: '補色', options: COLOR_PAIRS };
const color = { name: 'color', label: '色', options: COLORS };
const material = { name: 'material', label: '画材', options: MATERIALS };
const lifetime = { name: 'lifetime', label: '所持期間', options: ['permanent', 'temporary'] };

export const EFFECTS = [
    { type: 'gainNormalDice', label: '通常ダイス獲得', fields: [quantity, lifetime] },
    { type: 'gainColorDice', label: '色指定ダイス獲得', fields: [quantity, lifetime, pair] },
    { type: 'gainMaterialDice', label: '画材指定ダイス獲得', fields: [quantity, lifetime, material] },
    { type: 'gainRerolls', label: 'リロール権獲得', fields: [quantity] },
    { type: 'reroll', label: '即時リロール', fields: [] },
    { type: 'changeColor', label: 'ダイス面の色変更', fields: [color] },
    { type: 'changeMaterial', label: 'ダイス面の画材変更', fields: [material] },
    { type: 'changeSpecialFace', label: '特殊面への変更', fields: [
        { name: 'face', label: '特殊面', options: SPECIAL_FACES },
    ] },
    { type: 'discardDice', label: 'ダイスの破棄', fields: [quantity] },
    { type: 'changeFame', label: '名声値変更', fields: [
        { name: 'amount', label: '増減値（0以外）', integer: true, nonzero: true },
    ] },
    { type: 'drawCards', label: 'カードのドロー', fields: [quantity] },
    { type: 'gainStockCards', label: 'ストックからカード獲得', fields: [quantity] },
    { type: 'changeCardStep', label: '手札カードのステップ変更', fields: [
        { name: 'step', label: '変更後のステップ', options: [0, 1, 2] },
    ] },
    { type: 'exchangeCards', label: '手札交換', fields: [quantity] },
    { type: 'activateSpecialFaces', label: '現在出ている特殊面の効果を即時に得る', fields: [] },
];

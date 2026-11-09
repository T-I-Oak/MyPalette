import { SPECIAL_FACE_EFFECTS } from '../effectCatalog.js';

const templates = {
    refreshDice: ['使用済みのダイスをすべて未使用に戻す。', 'Make all used dice unused again.'],
    gainNormalDice: ['{lifetime}ダイスを3個の候補から選んで獲得する。', 'Choose and gain a {lifetime} die from three candidates.'],
    gainColorDice: ['{colors}の{lifetime}ダイスを獲得する。', 'Gain {lifetime} {colors} dice.'],
    gainMaterialDice: ['{material}の{lifetime}ダイスを獲得する。', 'Gain {lifetime} {material} dice.'],
    gainRerolls: ['リロール権を獲得する。', 'Gain reroll tickets.'],
    reroll: ['1個以上の未使用ダイスを選択して振りなおす。', 'Select one or more unused dice and reroll them.'],
    changeColor: ['未使用ダイスを選択し、現在の面の色を{color}に変更する。', 'Select an unused die and change its current face color to {color}.'],
    changeMaterial: ['未使用ダイスを選択し、現在の面の画材を{material}に変更する。', 'Select an unused die and change its current face material to {material}.'],
    changeSpecialFace: ['未使用ダイスを選択し、現在の面を{face}に変更する。', 'Select an unused die and change its current face to {face}.'],
    discardDice: ['未使用ダイスを選択して破棄する。', 'Select unused dice and discard them.'],
    increaseFame: ['名声値を増やす。', 'Increase fame.'],
    decreaseFame: ['名声値を減らす。', 'Decrease fame.'],
    drawCards: ['デッキからカードを引いて手札に加える。', 'Draw cards from the deck into your hand.'],
    gainStockCards: ['ストックの公開カードを選択して捨て札に加える。', 'Select revealed stock cards and add them to the discard pile.'],
    changeCardStep: ['手札のカードを選択し、ステップを{step}に変更する。', 'Select a card in your hand and change its step to {step}.'],
    exchangeCards: ['手札のカードを選択し、ステップを0に戻してストックに戻す。その後、ストックの公開カードを選択して手札に加える。', 'Select a card in your hand, reset its step to 0 and return it to stock. Then select a revealed stock card and add it to your hand.'],
    activateSpecialFaces: ['未使用ダイスに現在出ている特殊面の効果をすべて得る。', 'Gain all effects of special faces currently showing on unused dice.'],
};

export const effectDescriptionResources = Object.fromEntries(Object.entries(templates)
    .map(([key, [ja, en]]) => [key, { 'lang-store': { ja, en } }]));

// Inline effects use the same definition as top-level effects, including special faces.
export function effectDescriptionParts(effect, text, label) {
    const key = effect.type === 'changeFame' ? effect.amount > 0 ? 'increaseFame' : 'decreaseFame' : effect.type;
    return text[key].split(/(\{\w+\})/).filter(Boolean).map(part => {
        if (!part.startsWith('{')) return part;
        const field = part.slice(1, -1);
        return field === 'face' ? { effect: { ...SPECIAL_FACE_EFFECTS[effect.face] } } : label(effect[field]);
    });
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument } from '../../src/cardData.js';
import { EFFECTS } from '../../src/effectCatalog.js';
import { effectChoices } from '../../src/effectChoices.js';

const field = name => EFFECTS.flatMap(effect => effect.fields).find(field => field.name === name);
test('効果の画材・単色はメタに含まれる候補だけを返す', () => {
    const card = createDocument().cards.find(card => card.id === 'B10');
    assert.deepEqual(effectChoices(card, field('material')), ['brush', 'airbrush']);
    assert.deepEqual(effectChoices(card, field('color')), ['green', 'blue', 'red']);
    card.metadata.colors.red = false;
    assert.deepEqual(effectChoices(card, field('color')), ['green', 'blue']);
});
test('補色は2色とも含まれる組だけを選べ、候補なしでも既存設定を変更しない', () => {
    const card = createDocument().cards[0];
    card.steps[0].playEffects = [{type:'gainColorDice', count:1, lifetime:'temporary', colors:'red_green'}];
    for (const color of Object.keys(card.metadata.colors)) card.metadata.colors[color] = false;
    card.metadata.colors.red = true;
    assert.deepEqual(effectChoices(card, field('colors')), []);
    card.metadata.colors.green = true;
    assert.deepEqual(effectChoices(card, field('colors')), ['red_green']);
    card.metadata.colors.green = false;
    assert.deepEqual(effectChoices(card, field('colors')), []);
    assert.equal(card.steps[0].playEffects[0].colors, 'red_green');
});
test('所持期間・ステップ・特殊面の候補は元の定義を維持する', () => {
    const card = createDocument().cards[0];
    for (const name of ['lifetime', 'step', 'face']) assert.deepEqual(effectChoices(card, field(name)), field(name).options);
});

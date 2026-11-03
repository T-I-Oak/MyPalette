import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, readDocument, serializeDocument, validateDocument } from '../../src/cardData.js';
import { SPECIAL_FACE_EFFECTS, COLOR_PAIR_COLORS, SPECIAL_FACES } from '../../src/effectCatalog.js';
import { describeEffect } from '../../src/cardSummary.js';

test('ゲーム用属性は固定コードで保存し、名前以外に表示ラベルを含めない', () => {
    const document = createDocument();
    document.cards[0].steps[0].goals = [{color:'red', material:'brush'}];
    document.cards[0].steps[0].playEffects = [{type:'gainColorDice',count:2,lifetime:'temporary',colors:'orange_blue'}];
    assert.deepEqual(Object.keys(document), ['cards']);
    assert.deepEqual(readDocument(serializeDocument(document)), document);
    const codes = structuredClone(document); for (const card of codes.cards) card.name = '';
    assert.equal(/[^\x00-\x7f]/.test(JSON.stringify(codes)), false);
    document.cards[0].steps[0].goals[0].color = '赤';
    assert.ok(validateDocument(document).length);
});

test('補色IDと特殊面IDはゲーム用の構造化された定義へ解決できる', () => {
    assert.deepEqual(COLOR_PAIR_COLORS.orange_blue, ['orange','blue']);
    assert.equal(Object.keys(SPECIAL_FACE_EFFECTS).length, 10);
    assert.deepEqual(SPECIAL_FACE_EFFECTS.temporaryBrush1, {type:'gainMaterialDice',count:1,lifetime:'temporary',material:'brush'});
    assert.ok(SPECIAL_FACES.includes('reroll1'));
    assert.deepEqual(SPECIAL_FACE_EFFECTS.reroll1,{type:'gainRerolls',count:1});
    const data=createDocument(); data.cards[0].steps[0].achievementEffects=[{type:'changeSpecialFace',face:'reroll1'}];
    assert.deepEqual(readDocument(serializeDocument(data)),data);
    assert.ok(describeEffect(data.cards[0].steps[0].achievementEffects[0]).includes('リロール権の獲得×1'));
});

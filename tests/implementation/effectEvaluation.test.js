import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvaluation, evaluationRows, cardEvaluation, readEvaluation, serializeEvaluation } from '../../src/effectEvaluation.js';
import { createDocument } from '../../src/cardData.js';

test('効果別と特殊面別にプレイ時・達成時を独立設定し、小数を保存する', () => {
    const settings = createEvaluation();
    assert.equal(evaluationRows.length, 28);
    settings.playEffects.drawCards = 1.25;
    settings.achievementEffects.drawCards = 2.5;
    settings.playEffects['changeSpecialFace.fame1'] = -.75;
    settings.stepMultipliers = [.5, 1.25, 2];
    assert.deepEqual(readEvaluation(serializeEvaluation(settings)), settings);
    assert.throws(() => readEvaluation('{}'));
    assert.throws(() => readEvaluation(JSON.stringify({...settings, stepMultipliers:[1,null,1]})));
    assert.throws(() => serializeEvaluation({...settings, extra:1}));
});

test('通常・色指定・画材指定の獲得を一時／永続と時機で分け、数量倍する', () => {
    const card = createDocument().cards[0], settings = createEvaluation();
    for (const type of ['gainNormalDice', 'gainColorDice', 'gainMaterialDice']) {
        settings.playEffects[`${type}.temporary`] = 1.25;
        settings.playEffects[`${type}.permanent`] = 4;
        settings.achievementEffects[`${type}.temporary`] = 2;
        settings.achievementEffects[`${type}.permanent`] = 5.5;
        card.steps[0].playEffects = [{type, lifetime:'temporary', count:2}, {type, lifetime:'permanent', count:3}];
        card.steps[0].achievementEffects = [{type, lifetime:'temporary', count:4}, {type, lifetime:'permanent', count:2}];
        assert.equal(cardEvaluation(card, settings), 2.5 + 12 + 8 + 11);
        card.steps[0].playEffects[0].lifetime = null;
        assert.equal(cardEvaluation(card, settings), null);
    }
    assert.deepEqual(readEvaluation(serializeEvaluation(settings)), settings);
});
test('各ステップの時機別点に数量と符号付き名声量を掛け、ステップ倍率を掛けて合計する', () => {
    const card = createDocument().cards[0], settings = createEvaluation();
    settings.playEffects.drawCards = 1.5;
    settings.achievementEffects.changeFame = 2;
    settings.playEffects['changeSpecialFace.fame1'] = 4.25;
    settings.playEffects['changeSpecialFace.draw1'] = 8;
    settings.achievementEffects.refreshDice = 3;
    settings.stepMultipliers = [.5, 1.5, 2];
    card.steps[0].playEffects = [{type:'drawCards',count:2}];
    card.steps[0].achievementEffects = [{type:'changeFame',amount:-3}];
    card.steps[1].playEffects = [{type:'changeSpecialFace',face:'fame1'}];
    card.steps[2].achievementEffects = [{type:'refreshDice'}];
    assert.equal(cardEvaluation(card, settings), (3-6)*.5 + 4.25*1.5 + 3*2);
});
test('空の効果は0点、未設定の効果・数量・評価点・倍率は0で補完しない', () => {
    const card = createDocument().cards[0], settings = createEvaluation();
    assert.equal(cardEvaluation(card, settings), 0);
    card.steps[0].playEffects = [{type:null}]; assert.equal(cardEvaluation(card, settings), null);
    card.steps[0].playEffects = [{type:'drawCards',count:null}]; assert.equal(cardEvaluation(card, settings), null);
    card.steps[0].playEffects = [{type:'drawCards',count:2}];
    settings.playEffects.drawCards = null; assert.equal(cardEvaluation(card, settings), null);
    settings.playEffects.drawCards = 1; settings.stepMultipliers[1] = null;
    assert.equal(cardEvaluation(card, settings), null);
});

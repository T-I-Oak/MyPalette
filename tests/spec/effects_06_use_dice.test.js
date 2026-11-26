import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, serializeDocument, readDocument, validateDocument } from '../../src/cardData.js';
import { describeEffect } from '../../src/cardSummary.js';

test('06.5 使用済みにする個数を保存し、日本語の一覧にも表示する', () => {
    const data=createDocument();
    data.cards[0].steps[0].achievementEffects=[{type:'useDie',count:3}];
    assert.deepEqual(readDocument(serializeDocument(data)),data);
    assert.ok(describeEffect(data.cards[0].steps[0].achievementEffects[0]).includes('3'));
});

test('06.5 旧効果IDを拒否し、保存済み6件の個数を維持する', async () => {
    const data=createDocument();
    data.cards[0].steps[0].playEffects=[{type:'discardDice',count:1}];
    assert.ok(validateDocument(data).length);
    const { readFileSync } = await import('node:fs');
    const saved=readDocument(readFileSync(new URL('../../public/data/cards.json',import.meta.url),'utf8'));
    const effects=saved.cards.flatMap(card=>card.steps.flatMap(step=>[...step.playEffects,...step.achievementEffects]));
    assert.deepEqual(effects.filter(effect=>effect.type==='useDie'),Array.from({length:6},()=>({type:'useDie',count:1})));
    assert.equal(effects.some(effect=>effect.type==='discardDice'),false);
});

test('06.5 個数は未設定または1以上の安全な整数とする', () => {
    for (const count of [null,1,2,10]) {
        const data=createDocument(); data.cards[0].steps[0].playEffects=[{type:'useDie',count}];
        assert.deepEqual(validateDocument(data),[]);
    }
    for (const count of [undefined,0,-1,1.5,'2',Number.MAX_SAFE_INTEGER+1]) {
        const data=createDocument(); data.cards[0].steps[0].playEffects=[{type:'useDie',count}];
        assert.ok(validateDocument(data).length);
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument } from '../../src/cardData.js';
import { goalChoices, goalMetadataIssues } from '../../src/goalChoices.js';

test('目標の候補はメタで使用ありの画材・色だけを定義順で返す', () => {
    const card = createDocument().cards.find(card=>card.id==='B10');
    assert.deepEqual(goalChoices(card,'material'),['brush','airbrush']);
    assert.deepEqual(goalChoices(card,'color'),['green','blue','red']);
    card.metadata.materials.pastel=true;
    assert.deepEqual(goalChoices(card,'material'),['brush','pastel','airbrush']);
});

test('メタの選択を外すと候補から除外し、既存目標は変更せず不一致を検出する', () => {
    const card=createDocument().cards[0];
    card.steps[0].goals=[{material:'brush',color:'yellow'}];
    assert.deepEqual(goalMetadataIssues(card),[]);
    card.metadata.materials.brush=false;
    card.metadata.colors.yellow=false;
    assert.deepEqual(goalChoices(card,'material'),[]);
    assert.deepEqual(goalChoices(card,'color'),[]);
    assert.equal(goalMetadataIssues(card).length,2);
    assert.deepEqual(card.steps[0].goals,[{material:'brush',color:'yellow'}]);
});

test('OR内の目標も照合し、未指定は不一致としない', () => {
    const card=createDocument().cards[0];
    card.steps[2].goals=[{material:null,color:'yellow'},{material:'pastel',color:null,join:'or'}];
    assert.deepEqual(goalMetadataIssues(card),['ステップ2 目標2：パステルはメタ対象外']);
});

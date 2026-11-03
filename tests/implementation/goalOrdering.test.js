import test from 'node:test';
import assert from 'node:assert/strict';
import { sortGoals, sortDocumentGoals } from '../../src/goalOrdering.js';
import { MATERIALS, COLORS } from '../../src/effectCatalog.js';
import { goalGroups } from '../../src/goalGroups.js';
import { createDocument, readDocument, serializeDocument } from '../../src/cardData.js';
import { goalProbability } from '../../src/goalProbability.js';

test('画材を第1キー、色を第2キーとし、未指定を各キーの末尾に置く', () => {
    const expected = [...MATERIALS,null].flatMap(material => [...COLORS,null].map(color => ({material,color})));
    const input = [...expected].reverse();
    assert.deepEqual(sortGoals(input), expected);
    assert.deepEqual(input, [...expected].reverse());
});

test('ANDブロック内を先に並べ替え、ORブロックを辞書順・短い接頭辞優先で並べる', () => {
    const input = [
        {material:'pastel',color:'red'}, {material:'brush',color:'blue'},
        {material:'brush',color:'blue',join:'or'},
        {material:null,color:'orange',join:'or'},
        {material:'brush',color:'orange',join:'or'},
    ];
    assert.deepEqual(sortGoals(input), [
        {material:'brush',color:'orange'},
        {material:'brush',color:'blue',join:'or'},
        {material:'brush',color:'blue',join:'or'}, {material:'pastel',color:'red'},
        {material:null,color:'orange',join:'or'},
    ]);
    assert.deepEqual(sortGoals(sortGoals(input)), sortGoals(input));
    assert.deepEqual(goalGroups(sortGoals(input)).map(group=>group.length),[1,1,2,1]);
});

test('保存時に全カード・全ステップを並べ替え、元の編集状態と効果順を変更しない', () => {
    const data = createDocument();
    for (const card of data.cards) for (const step of card.steps) {
        step.goals=[{material:null,color:'red'},{material:'brush',color:null}];
        step.playEffects=[{type:'drawCards',count:2},{type:'discardDice',count:1}];
    }
    const before=structuredClone(data);
    const saved=readDocument(serializeDocument(data));
    assert.deepEqual(saved,sortDocumentGoals(data));
    assert.deepEqual(data,before);
    for (const card of saved.cards) for (const step of card.steps) {
        assert.equal(step.goals[0].material,'brush');
        assert.deepEqual(step.playEffects,[{type:'drawCards',count:2},{type:'discardDice',count:1}]);
    }
});

test('ソートは重複目標・ORの意味・達成確率を保持する', () => {
    const goals=[{material:'pastel',color:null},{material:null,color:'red'},{material:null,color:'red'}, {material:'brush',color:'orange',join:'or'},{material:'brush',color:'orange'}];
    const sorted=sortGoals(goals);
    assert.equal(sorted.length,goals.length);
    for(const n of [2,3,4]) assert.ok(Math.abs(goalProbability(goals,n)-goalProbability(sorted,n))<1e-10);
    assert.deepEqual(sortGoals([]),[]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { describeEffect, describeGoals } from '../../src/cardSummary.js';

test('一覧の効果説明に補色・期間・個数と未設定を表示する', () => {
    const result = describeEffect({ type: 'gainColorDice', colors: 'orange_blue', lifetime: 'temporary', count: 2 });
    for (const value of ['橙・青', '一時', '2']) assert.ok(result.includes(value));
    assert.ok(describeEffect({ type: 'changeMaterial', material: null }).includes('未設定'));
});

test('一覧の目標は重複を保ち画材、色の順に表示する', () => {
    assert.equal(describeGoals([{ color: 'red', material: null }, { color: null, material: 'brush' }, { color: 'blue', material: 'pastel' }]), '赤 絵筆 パステル＋青');
    assert.equal(describeGoals([]), '未設定');
});

test('ANDの組を縦棒のORで区切って表示する', () => {
    assert.equal(describeGoals([
        {material:'brush',color:null}, {material:null,color:'red'},
        {material:'pastel',color:null,join:'or'}, {material:null,color:'blue'},
    ]), '絵筆 赤 | パステル 青');
});

test('追加直後で種類未指定の効果を一覧に表示できる', () => {
    assert.equal(describeEffect({type:null}), '効果未設定');
});

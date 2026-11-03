import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, validateDocument, serializeDocument, readDocument, draftIssues } from '../../src/cardData.js';
import { EFFECTS, SPECIAL_FACES } from '../../src/effectCatalog.js';

test('45枚の制作途中データを保存・復元できる', () => {
    const data = createDocument();
    assert.equal(data.cards.length, 45);
    assert.equal(data.cards[44].id, 'C15');
    data.cards[0].name = '朝のアトリエ <作品>';
    data.cards[0].steps[0].goals = [{ color: 'red', material: 'brush' }, { color: null, material: 'pastel' }];
    assert.deepEqual(validateDocument(data), []);
    assert.deepEqual(readDocument(serializeDocument(data)), data);
});

test('未設定の目標・効果パラメータと任意のカード順を保持する', () => {
    const data = createDocument();
    data.cards[0].name = '';
    data.cards[0].steps[0].goals.push({ color: null, material: null });
    data.cards[0].steps[0].playEffects.push({ type: 'gainColorDice', count: null, lifetime: null, colors: null });
    data.cards.reverse();
    assert.deepEqual(readDocument('\uFEFF' + serializeDocument(data)), data);
});

test('整数・列挙値・構造の境界を検証し、不正データで例外を起こさない', () => {
    for (const value of [null, [], false, 3, 'text', { cards: [null] }]) assert.ok(validateDocument(value).length);
    for (const count of [-1, 0, .5, Number.MAX_SAFE_INTEGER + 1, '1', undefined, NaN]) {
        const data = createDocument();
        data.cards[0].steps[0].playEffects.push({ type: 'drawCards', count });
        assert.ok(validateDocument(data).length);
    }
    const data = createDocument();
    data.cards[0].steps[0].achievementEffects = [
        { type: 'gainColorDice', count: 1, lifetime: 'temporary', colors: 'red_blue' },
        { type: 'changeCardStep', step: 3 },
        { type: 'changeSpecialFace', face: '名声値＋2' },
    ];
    assert.equal(validateDocument(data).length, 3);
});

test('全種類の効果と10種類の特殊面のパラメータを保持する', () => {
    const data = createDocument();
    data.cards[0].steps[0].playEffects = EFFECTS.map(def => Object.fromEntries([
        ['type', def.type], ...def.fields.map(field => [field.name, field.options?.[0] ?? 1]),
    ]));
    for (const face of SPECIAL_FACES) data.cards[0].steps[0].achievementEffects.push({ type: 'changeSpecialFace', face });
    assert.equal(SPECIAL_FACES.length, 10);
    assert.deepEqual(readDocument(serializeDocument(data)), data);
});

test('箇所と理由を含む入力エラーを検出する', () => {
    const data = createDocument();
    data.cards[0].steps[1].playEffects = [{ type: 'drawCards', count: 0 }];
    data.cards[0].steps[1].goals = [{ color: '黒', material: null }];
    const errors = validateDocument(data);
    assert.ok(errors.some(e => e.path.includes('A01') && e.path.includes('ステップ1') && e.reason.includes('1以上')));
    assert.ok(errors.some(e => e.reason.includes('色')));
});

test('IDの重複・欠落、形式違い、未知の項目、効果パラメータの欠落を拒否する', () => {
    const cases = [
        d => { d.unexpected = true; },
        d => { d.cards.pop(); },
        d => { d.cards[1].id = 'A01'; },
        d => { d.cards[0].unexpected = true; },
        d => { d.cards[0].steps[0].playEffects = [{ type: 'drawCards' }]; },
        d => { d.cards[0].steps[0].playEffects = [{ type: 'unknown' }]; },
        d => { d.cards[0].steps[0].playEffects = [{ type: 'changeFame', amount: 0 }]; },
        d => { d.cards[0].steps[0].goals = [{ color: null, material: 3 }]; },
    ];
    for (const mutate of cases) {
        const data = createDocument(); mutate(data);
        assert.ok(validateDocument(data).length);
        assert.throws(() => readDocument(JSON.stringify(data)));
    }
});

test('目標のAND・ORの結合を保持してソートし、不正な演算子を拒否する', () => {
    const data=createDocument();
    data.cards[0].steps[0].goals=[{material:'brush',color:null},{material:null,color:'red',join:'and'},{material:'pastel',color:null,join:'or'},{material:null,color:'blue'}];
    const saved=readDocument(serializeDocument(data));
    assert.deepEqual(saved.cards[0].steps[0].goals,[{material:'brush',color:null},{material:null,color:'red'},{material:'pastel',color:null,join:'or'},{material:null,color:'blue'}]);
    data.cards[0].steps[0].goals[1].join='xor';
    assert.ok(validateDocument(data).length);
    data.cards[0].steps[0].goals[1].join='and';
    data.cards[0].steps[0].goals[0].join='or';
    assert.ok(validateDocument(data).length);
});

test('追加直後の未設定効果を保存・復元でき、種類を変えた後の残存パラメータは拒否する', () => {
    const data=createDocument();
    data.cards[0].steps[0].playEffects=[{type:null},{type:'drawCards',count:null}];
    data.cards[0].steps[0].achievementEffects=[{type:null}];
    assert.deepEqual(readDocument(serializeDocument(data)),data);
    data.cards[0].steps[0].playEffects[0].count=2;
    assert.ok(validateDocument(data).length);
});

test('提供メタ情報と各グレード15枚を初期表示用データに持つ', () => {
    const { cards } = createDocument();
    for (const grade of ['A', 'B', 'C']) assert.equal(cards.filter(c => c.id[0] === grade).length, 15);
    const attributes = id => {
        const card = cards.find(c => c.id === id);
        return [card.name, Object.keys(card.metadata.materials).filter(k => card.metadata.materials[k]), Object.keys(card.metadata.colors).filter(k => card.metadata.colors[k])];
    };
    assert.deepEqual(attributes('A01'), ['レモンのある静物', ['brush'], ['yellow']]);
    assert.deepEqual(attributes('A03'), ['赤毛の少女', ['brush'], ['orange', 'green']]);
    assert.deepEqual(attributes('B09'), ['星空のサーカス', ['brush', 'pastel'], ['orange', 'blue', 'purple', 'red']]);
    assert.deepEqual(attributes('C14'), ['硝子職人の工房', ['brush', 'pastel', 'airbrush'], ['orange', 'yellow', 'red']]);
    assert.deepEqual(attributes('C15'), ['光の継承', ['brush', 'pastel', 'airbrush'], ['orange', 'yellow', 'green', 'blue', 'purple', 'red']]);
});

test('目標3形態・重複条件・効果の順番を保存して復元する', () => {
    const data = createDocument();
    const card = data.cards[0];
    assert.equal(card.steps.length, 3);
    card.steps[0].goals = [
        { color: 'red', material: null }, { color: null, material: 'brush' },
        { color: 'yellow', material: 'pastel' }, { color: 'yellow', material: 'pastel' },
    ];
    card.steps[0].playEffects = [{ type: 'discardDice', count: 1 }, { type: 'drawCards', count: 2 }];
    card.steps[0].achievementEffects = [{ type: 'changeFame', amount: -1 }];
    const saved=readDocument(serializeDocument(data));
    assert.deepEqual(saved.cards[0].steps[0].goals,[{color:null,material:'brush'},{color:'yellow',material:'pastel'},{color:'yellow',material:'pastel'},{color:'red',material:null}]);
    assert.deepEqual(saved.cards[0].steps[0].playEffects,card.steps[0].playEffects);
    assert.deepEqual(saved.cards[0].steps[0].achievementEffects,card.steps[0].achievementEffects);
    assert.equal(draftIssues(card).length, 2);
    card.steps[1].goals = [{ color: 'green', material: null }];
    card.steps[2].goals = [{ color: null, material: 'airbrush' }];
    assert.deepEqual(draftIssues(card), []);
});

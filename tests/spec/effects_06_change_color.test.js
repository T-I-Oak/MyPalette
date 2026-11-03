import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, readDocument, serializeDocument, validateDocument } from '../../src/cardData.js';
import { COLORS, displayLabel } from '../../src/effectCatalog.js';
import { describeEffect } from '../../src/cardSummary.js';

test('06.4.2 色変更は6色を個別指定し、メタの目標候補に依存せず保存・表示できる', () => {
    for (const color of COLORS) {
        const data=createDocument();
        data.cards[0].steps[0].playEffects=[{type:'changeColor',color}];
        assert.deepEqual(readDocument(serializeDocument(data)),data);
        assert.ok(describeEffect(data.cards[0].steps[0].playEffects[0]).includes(displayLabel(color)));
    }
});

test('06.4.2 単色未設定は制作途中として許可し、補色指定・未知の色・項目欠落は拒否する', () => {
    const data=createDocument();
    data.cards[0].steps[0].playEffects=[{type:'changeColor',color:null}];
    assert.deepEqual(validateDocument(data),[]);
    for(const effect of [{type:'changeColor',colors:'red_green'},{type:'changeColor',color:'red_green'},{type:'changeColor',color:'black'},{type:'changeColor'}]) {
        data.cards[0].steps[0].playEffects=[effect]; assert.ok(validateDocument(data).length);
    }
});

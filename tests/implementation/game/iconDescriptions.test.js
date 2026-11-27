import test from 'node:test';
import assert from 'node:assert/strict';
import { describeNormalFace, iconDescriptionResources } from '../../../src/game/iconDescriptions.js';

test('normal face descriptions identify materials and colors without prescribing their use', () => {
    for (const language of ['ja', 'en']) {
        const resolve = value => value['lang-store'] ? value['lang-store'][language]
            : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolve(entry)]));
        const text = resolve(iconDescriptionResources);
        const material = language === 'ja' ? '絵筆' : 'Brush';
        assert.equal(describeNormalFace({ material: 'brush' }, text, () => material),
            language === 'ja' ? 'いずれかの色の絵筆。' : 'Brush of any color.');
        assert.equal(describeNormalFace({ color: 'yellow' }, text, () => material),
            language === 'ja' ? 'いずれかの黄色の画材。' : 'Any yellow painting material.');
        assert.equal(describeNormalFace({ material: 'brush', color: 'yellow' }, text, () => material),
            language === 'ja' ? '黄色の絵筆。' : 'yellow Brush.');
        for (const color of Object.keys(text.colors)) {
            assert.ok(!describeNormalFace({ material: 'brush', color }, text, () => material).includes('undefined'));
        }
    }
});

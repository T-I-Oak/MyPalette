import test from 'node:test';
import assert from 'node:assert/strict';
import { cardSceneLayer } from '../../../src/game/cardSceneLayer.js';

test('他カードの演出中も場に留まるカードはボードの背面を維持する', () => {
    assert.equal(cardSceneLayer('field', false), 'main');
    assert.equal(cardSceneLayer('stock', false), 'panel');
    assert.equal(cardSceneLayer('field', true), 'moving');
    assert.equal(cardSceneLayer('hand', false), 'main');
});

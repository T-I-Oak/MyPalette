import test from 'node:test';
import assert from 'node:assert/strict';
import { CardSceneState, identityPose } from '../../../src/game/cardSceneState.js';

test('全IDを一度だけ登録し、待機・移動・完了で同じ個体を維持する', () => {
    const scene = new CardSceneState(['A01', 'A02']);
    const card = scene.get('A01');
    const target = identityPose(); target.matrix[12] = 100;
    scene.begin(new Map([['A01', () => target]]), 'draw');
    assert.equal(card.pose.matrix[12], 0);
    scene.sample(.5);
    assert.equal(card.pose.matrix[12], 50);
    assert.equal(card.owner, 'draw');
    scene.sample(1); scene.finish();
    assert.equal(scene.get('A01'), card);
    assert.equal(card.pose.matrix[12], 100);
    assert.equal(scene.get('A02').pose.matrix[12], 0);
});

test('移動途中からの再計画と、動的な到着位置を連続した姿勢で扱う', () => {
    const scene = new CardSceneState(['A01']);
    let target = identityPose(); target.matrix[12] = 100;
    scene.begin(new Map([['A01', () => target]]), 'move');scene.sample(.5);
    scene.interrupt();
    assert.equal(scene.get('A01').pose.matrix[12], 50);
    target = identityPose(); target.matrix[12] = 200;
    scene.begin(new Map([['A01', () => target]]), 'replan');scene.sample(0);
    assert.equal(scene.get('A01').pose.matrix[12], 50);
    scene.sample(.5);assert.equal(scene.get('A01').pose.matrix[12], 125);
    target.matrix[12] = 300;
    scene.sample(1);scene.finish();
    assert.equal(scene.get('A01').pose.matrix[12], 300);
});

test('透明度を表示状態として保持し、指定値をそのまま描画へ渡す', () => {
    const scene = new CardSceneState(['A01']);
    scene.opacity('A01', .5);
    assert.equal(scene.get('A01').opacity, .5);
    scene.opacity('A01', 1);
    assert.equal(scene.get('A01').opacity, 1);
});

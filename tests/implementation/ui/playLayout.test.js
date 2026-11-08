import test from 'node:test';
import assert from 'node:assert/strict';
import { playMetrics, playStandardSize, layoutPlay, playButtonCenter, paintingFacing } from '../../../src/game/playLayout.js';
import { fitArea } from '../../../src/ui/screenLayout/ScreenLayout.js';

test('作品1組の寸法をN個並べて標準描画寸法にする', () => {
    for (const count of [1, 2, 3, 8]) {
        assert.deepEqual(playStandardSize(count), { width: playMetrics.width * count, height: playMetrics.height });
        assert.deepEqual(layoutPlay(count).map(slot => slot.x), Array.from({ length: count }, (_, i) => i * playMetrics.width));
    }
    assert.deepEqual(layoutPlay(0), []);
    assert.ok(playStandardSize(0).width > 0);
});

test('枚数が増えたら領域全体の同じ倍率で収め、各組の縦横比を維持する', () => {
    let previous = Infinity;
    for (const count of [1, 2, 3, 8]) {
        const frame = fitArea({ x: 0, y: 0, width: 600, height: 300 }, playStandardSize(count));
        assert.ok(frame.scale <= previous); previous = frame.scale;
        assert.ok(playMetrics.width * count * frame.scale <= 600 + 1e-9);
        assert.ok(playMetrics.height * frame.scale <= 300 + 1e-9);
    }
});

test('達成ボタンの中心は論理中心を固定倍率層へ変換する', () => {
    const slot = layoutPlay(2)[1];
    assert.equal(playButtonCenter(slot, .5, 2, 0), (slot.x + playMetrics.width / 2) * .5 / 2);
});

test('余った論理領域の中央へ作品群を配置する', () => {
    const slots = layoutPlay(2, 1200, 900);
    assert.equal(slots[0].x, (1200 - playMetrics.width * 2) / 2);
    assert.equal(slots[0].y, (900 - playMetrics.height) / 2);
    assert.equal((slots[0].x + slots[1].x + playMetrics.width) / 2, 600);
});

test('向きはエリア内の中央と各作品の位置から幾何的に求める', () => {
    assert.equal(paintingFacing(600, 1200), 0);
    const left = paintingFacing(200, 1200), right = paintingFacing(1000, 1200);
    assert.ok(left > 0); assert.equal(left, -right);
    assert.ok(Math.abs(Math.tan(left) * 2000 - 400) < 1e-9);
    assert.ok(paintingFacing(400, 1200) < left);
    assert.equal(paintingFacing(300, 1000), paintingFacing(200, 800));
});

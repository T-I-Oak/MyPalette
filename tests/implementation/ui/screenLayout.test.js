import test from 'node:test';
import assert from 'node:assert/strict';
import { ScreenLayout, fitArea } from '../../../src/ui/screenLayout/ScreenLayout.js';

test('正方形を境界としてA/Bを切り替え、指定比率で分割する', () => {
    const layout = new ScreenLayout();
    const a = layout.calculate(1200, 600);
    assert.equal(a.mode, 'A');
    assert.deepEqual(a.areas.play.rect, { x: 0, y: 100, width: 600, height: 300 });
    assert.deepEqual(a.areas.deck.rect, { x: 900, y: 200, width: 300, height: 200 });
    assert.equal(layout.calculate(600, 600).mode, 'A');
    const b = layout.calculate(400, 800);
    assert.equal(b.mode, 'B');
    assert.deepEqual(b.areas.hand.rect, { x: 0, y: 600, width: 400, height: 200 });
    assert.equal(Object.keys(b.areas).length, 7);
});

test('標準寸法を下回らない論理寸法と等方倍率を返す', () => {
    for (const [width, height, scale, logicalWidth, logicalHeight] of [
        [200, 100, 0.5, 400, 200], [100, 200, 0.25, 400, 800], [800, 200, 1, 800, 200],
    ]) {
        const area = fitArea({ x: 4, y: 8, width, height }, { width: 400, height: 200 });
        assert.equal(area.scale, scale);
        assert.equal(area.logicalWidth, logicalWidth);
        assert.equal(area.logicalHeight, logicalHeight);
    }
});

test('パネルの途中位置も計算しメイン4エリアを固定する', () => {
    const layout = new ScreenLayout();
    const closed = layout.calculate(400, 800, 0);
    const half = layout.calculate(400, 800, 0.5);
    const open = layout.calculate(400, 800, 1);
    for (const id of ['info', 'play', 'palette', 'hand']) {
        assert.deepEqual(closed.areas[id], open.areas[id]);
    }
    assert.equal(closed.areas.stock.rect.x, 400);
    assert.equal(closed.areas.stock.rect.y, closed.areas.play.rect.y);
    assert.equal(open.areas.stock.rect.y, open.areas.play.rect.y);
    assert.equal(closed.areas.stock.visible, false);
    assert.equal(half.areas.stock.visible, true);
    assert.equal(half.areas.stock.rect.x, (400 + open.areas.stock.rect.x) / 2);
});

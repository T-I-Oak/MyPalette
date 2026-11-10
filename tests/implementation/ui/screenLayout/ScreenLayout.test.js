import test from 'node:test';
import assert from 'node:assert/strict';
import { ScreenLayout, fitArea } from '../../../../src/ui/screenLayout/ScreenLayout.js';

test('固定倍率を掛けた両端オフセットを除いてから描画倍率を計算する', () => {
    const frame = fitArea({ x: 100, y: 200, width: 640, height: 300 }, {
        width: 600, height: 200,
        topLeftOffset: { x: 10, y: 20 }, bottomRightOffset: { x: 10, y: 30 },
    }, true, 2);
    assert.deepEqual(frame.rect, { x: 100, y: 200, width: 640, height: 300 });
    assert.deepEqual(frame.drawRect, { x: 120, y: 240, width: 600, height: 200 });
    assert.equal(frame.scale, 1);
    assert.equal(frame.fixedScale, 2);
    assert.equal(frame.logicalWidth, 600);
    assert.equal(frame.logicalHeight, 200);
});

test('オフセットが領域を使い切っても停止せず、領域が戻れば描画を再開できる', () => {
    const standard = { width: 600, height: 200, topLeftOffset: { x: 0, y: 20 } };
    for (const height of [10, 20]) {
        const frame = fitArea({ x: 0, y: 0, width: 100, height }, standard);
        assert.equal(frame.drawable, false);
        assert.equal(frame.drawRect.height, 0);
        assert.equal(frame.logicalHeight, 0);
        assert.ok(Number.isFinite(frame.scale) && frame.scale > 0);
        assert.equal(frame.visible, true);
    }
    assert.equal(fitArea({ x: 0, y: 0, width: 100, height: 100 }, standard).drawable, true);
});

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

test('低い画面でも最低レイアウト高さと有効な手札座標を維持する', () => {
    const layout = new ScreenLayout();
    for (const fixedScale of [1, 2]) {
        layout.fixedScale = fixedScale;
        const frame = layout.calculate(1200, 40);
        assert.equal(frame.height, 240 * fixedScale);
        assert.equal(frame.mode, 'A');
        assert.equal(frame.areas.hand.drawable, true);
        assert.ok(frame.areas.hand.logicalHeight >= 200);
        assert.ok(frame.areas.hand.drawRect.y > 40);
    }
});

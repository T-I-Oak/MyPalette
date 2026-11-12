import test from 'node:test';
import assert from 'node:assert/strict';
import { CanvasArea } from '../../../../src/ui/screenLayout/CanvasArea.js';
import { ScreenLayout, areaDefinitions } from '../../../../src/ui/screenLayout/ScreenLayout.js';
import { MoveObject } from '../../../../src/ui/areaTransition/MoveObject.js';

class DrawingArea extends CanvasArea {
    draw() { this.drawCount = (this.drawCount ?? 0) + 1; }
}

test('低い画面でも縮小後の描画領域を表示枠内に確保する', () => {
    const canvas = { style: {}, width: 0, height: 0 };
    const area = new DrawingArea('hand', {}, areaDefinitions.hand, canvas);
    const layout = new ScreenLayout();
    area.applyLayout(layout.calculate(1200, 40).areas.hand, 1);
    assert.equal(canvas.hidden, false);
    assert.equal(area.drawCount, 1);
    assert.ok(area.logicalHeight >= 200);
    assert.ok(area.readTransform().y + parseFloat(canvas.style.height) <= 40);
    area.applyLayout(layout.calculate(1200, 700).areas.hand, 1);
    assert.equal(canvas.hidden, false);
    assert.equal(area.drawCount, 2);
    assert.ok(area.logicalHeight > 0);
});

test('固定倍率層へエリア側が描画でき、表示矩形と開閉だけが追従する', () => {
    const children = [];
    const fixedLayer = {
        style: {},
        ownerDocument: { createElement: () => ({}) },
        append: node => children.push(node),
    };
    const canvas = { style: {}, width: 0, height: 0 };
    const area = new DrawingArea('stock', {}, areaDefinitions.stock, canvas, fixedLayer);
    assert.equal(area.fixedLayer, fixedLayer);
    assert.equal(children[0].textContent, areaDefinitions.stock.name);
    const custom = { textContent: 'エリア内部の情報' };
    area.fixedLayer.append(custom);
    const layout = new ScreenLayout();
    const fixedScale = 400 / 540;
    for (const progress of [0, 0.5, 1]) {
        const frame = layout.calculate(400, 800, progress).areas.stock;
        area.applyLayout(frame, 2);
        assert.deepEqual(fixedLayer.style, {
            left: `${frame.rect.x}px`, top: `${frame.rect.y}px`,
            width: `${frame.rect.width / fixedScale}px`, height: `${frame.rect.height / fixedScale}px`,
            transform: `scale(${fixedScale})`, transformOrigin: 'top left',
        });
        assert.equal(fixedLayer.hidden, !frame.visible);
        assert.equal(fixedLayer.inert, !frame.visible);
        assert.equal(children[1], custom);
    }
});

test('非表示とスライド中の座標が移動エリアにも同期する', () => {
    const rendered = [];
    const surface = {
        readViewportTransform: () => ({ x: 0, y: 0, scale: 1 }),
        renderInArea: (_, rect) => rendered.push(rect),
        removeFromArea() {},
    };
    const canvas = { style: {}, width: 0, height: 0 };
    const area = new DrawingArea('stock', surface, areaDefinitions.stock, canvas);
    const layout = new ScreenLayout();
    const local = { x: 20, y: 10, width: 80, height: 60 };
    area.setSlot('piece', local);
    area.place(new MoveObject('piece'), 'piece');
    for (const progress of [0, 0.25, 0.5, 1, 0]) {
        const frame = layout.calculate(400, 800, progress).areas.stock;
        area.applyLayout(frame, 2);
        const rect = area.readScreenRect(local);
        assert.equal(rect.x, frame.rect.x + local.x * frame.scale);
        assert.equal(rect.width, local.width * frame.scale);
        assert.equal(canvas.hidden, progress === 0);
        if (progress > 0) assert.deepEqual(rendered.at(-1), rect);
        else assert.ok(rect.x >= 400);
    }
});

test('表示寸法とDPRでバッファーを更新し、位置だけの変更は再描画しない', () => {
    const canvas = { style: {}, width: 0, height: 0 };
    const area = new DrawingArea('play', {}, areaDefinitions.play, canvas);
    const layout = new ScreenLayout();
    const frame = layout.calculate(1200, 600).areas.play;
    area.applyLayout(frame, 1);
    assert.deepEqual([canvas.width, canvas.height], [600, 300]);
    area.applyLayout(frame, 2);
    assert.deepEqual([canvas.width, canvas.height], [1200, 600]);
    assert.equal(area.drawCount, 2);
    area.applyLayout({ ...frame, rect: { ...frame.rect, x: 50 }, drawRect: { ...frame.drawRect, x: 50 } }, 2);
    assert.equal(area.drawCount, 2);
    assert.equal(area.readTransform().x, 50);
    area.applyLayout(layout.calculate(600, 600).areas.play, 2);
    assert.deepEqual([canvas.width, canvas.height], [600, 600]);
    assert.equal(area.logicalHeight, 600);
    assert.equal(area.drawCount, 3);
});

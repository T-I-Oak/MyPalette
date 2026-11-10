import test from 'node:test';
import assert from 'node:assert/strict';
import { createDomTransitionSurface } from '../../../../src/ui/areaTransition/createDomTransitionSurface.js';

function documentFixture() {
    const document = { defaultView: {}, createElement: () => new Element() };
    class Element {
        constructor() { this.style = {}; this.children = []; this.ownerDocument = document; }
        append(...nodes) { for (const node of nodes) this.insertBefore(node, null); }
        appendChild(node) { this.append(node); }
        insertBefore(node, before) {
            node.remove();
            this.children.splice(before ? this.children.indexOf(before) : this.children.length, 0, node);
            node.parentNode = this;
        }
        remove() {
            if (this.parentNode) this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
            this.parentNode = null;
        }
    }
    return document;
}

const rect = { x: 10, y: 20, width: 100, height: 60 };

test('スクロールする描画ルートでは画面座標をルート内座標へ戻す', () => {
    const document = documentFixture();
    const root = document.createElement();
    const surface = createDomTransitionSurface(root, { x: 0, y: -80, scale: 1 }, { relativeToRoot: true });
    const object = { element: document.createElement(), render() {} };
    surface.renderInArea(object, { x: 10, y: 20, width: 100, height: 60 }, true, { id: 'hand' });
    assert.equal(object.element.parentNode.style.top, '100px');
    assert.equal(object.element.parentNode.parentNode.style.position, 'absolute');
});

test('スクロール通知より前でも現在の原点を取得して描画座標を補正する', () => {
    const document = documentFixture();
    const root = document.createElement();
    let y = 0;
    const surface = createDomTransitionSurface(root, undefined, {
        relativeToRoot: true, viewportTransformFor: () => ({ x: 0, y, scale: 1 }),
    });
    y = -100;
    assert.equal(surface.readViewportTransform().y, -100);
    const object = { element: document.createElement(), render() {} };
    surface.renderInArea(object, rect, true, { id: 'hand' });
    assert.equal(object.element.parentNode.style.top, '120px');
});

test('既定の描画面は所属層より後ろのDOM順に移動層を維持する', () => {
    const document = documentFixture();
    const root = document.createElement();
    const surface = createDomTransitionSurface(root);
    const object = { element: document.createElement(), render() {} };
    surface.renderInArea(object, rect, true, { id: 'hand' });
    const areaLayer = object.element.parentNode.parentNode;
    surface.renderMoving(object, rect);
    const movingLayer = object.element.parentNode.parentNode;
    assert.deepEqual(root.children, [areaLayer, movingLayer]);
    assert.equal(object.element.parentNode.inert, true);
});

test('所属先ごとの描画ホストを選び、移動と除去を同じ描画面で扱う', () => {
    const document = documentFixture();
    const root = document.createElement();
    const main = document.createElement();
    const panel = document.createElement();
    const moving = document.createElement();
    const surface = createDomTransitionSurface(root, { x: 0, y: 0, scale: 1 }, {
        areaRootFor: area => area.id === 'stock' ? panel : main, transitionRoot: moving,
    });
    const object = { element: document.createElement(), render() {} };
    const area = { id: 'stock' };
    surface.renderInArea(object, rect, true, area);
    assert.equal(object.element.parentNode.parentNode.parentNode, panel);
    surface.removeFromArea(object, area);
    assert.equal(panel.children[0].children.length, 0);
    surface.renderMoving(object, rect);
    assert.equal(object.element.parentNode.parentNode.parentNode, moving);
    surface.removeMoving(object);
    assert.equal(moving.children[0].children.length, 0);
    surface.renderInArea(object, rect, true, { id: 'hand' });
    assert.equal(object.element.parentNode.parentNode.parentNode, main);
    assert.equal(object.element.parentNode.inert, false);
});

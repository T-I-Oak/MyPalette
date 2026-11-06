import assert from 'node:assert/strict';
import test from 'node:test';
import { MoveArea, MoveObject, createMoveManager } from '../../../src/ui/areaTransition/index.js';

const rect = (x, y, width, height) => ({ x, y, width, height });
const transform = (x, y, scale) => ({ x, y, scale });

function setup() {
    const frames = [];
    const drawn = new Map();
    const events = [];
    const viewport = { transform: transform(0, 0, 0.5) };
    const render = (object, viewportRect, interactive, layer) => {
        const context = { viewportRect, interactive, layer };
        drawn.set(object, context);
        object.render(context);
    };
    const surface = {
        readViewportTransform: () => viewport.transform,
        scheduleFrame: callback => frames.push(callback),
        clearFocus: () => events.push('blur'),
        renderInArea: (object, bounds, interactive) => render(object, bounds, interactive, 'area'),
        removeFromArea: object => drawn.delete(object),
        renderMoving: (object, bounds) => render(object, bounds, false, 'transition'),
        removeMoving: object => drawn.delete(object),
    };
    const deck = new MoveArea('deck', surface, transform(-300, 100, 1));
    deck.setPresentation({ visible: false, interactive: false });
    deck.setSlot('top', rect(0, 0, 100, 120));
    const hand = new MoveArea('hand', surface, transform(200, 100, 2));
    hand.setSlot('first', rect(0, 0, 100, 120));
    const object = new MoveObject('piece');
    object.onMoveFrame = frame => events.push(frame.phase);
    assert.equal(deck.place(object, 'top'), true);
    const manager = createMoveManager(surface);
    const request = { object, from: deck, to: hand, slot: 'first', durationMs: 100 };
    const tick = time => frames.splice(0).forEach(callback => callback(time));
    return { deck, hand, drawn, events, manager, object, request, tick, viewport };
}

test('public API moves a generic object from an offscreen area to a differently scaled area', async () => {
    const { deck, hand, drawn, events, manager, object, request, tick, viewport } = setup();
    assert.equal(drawn.has(object), false);
    const pending = manager.move(request);
    assert.equal(object.area, deck);
    tick(0);
    assert.equal(object.area, null);
    assert.deepEqual(drawn.get(object), {
        viewportRect: rect(-150, 50, 50, 60), interactive: false, layer: 'transition',
    });
    tick(50);
    assert.deepEqual(drawn.get(object).viewportRect, rect(-25, 50, 75, 90));
    hand.setSlot('first', rect(10, 5, 100, 120));
    viewport.transform = transform(10, 20, 1);
    tick(100);
    assert.deepEqual(await pending, { status: 'arrived' });
    assert.equal(object.area, hand);
    assert.deepEqual(drawn.get(object), {
        viewportRect: rect(230, 130, 200, 240), interactive: true, layer: 'area',
    });
    assert.deepEqual(events, ['blur', 'started', 'moving', 'arrived']);
});

test('cancellation restores the source and releases both reservations', async () => {
    const { deck, hand, drawn, events, manager, object, request, tick } = setup();
    const controller = new AbortController();
    const pending = manager.move({ ...request, signal: controller.signal });
    assert.deepEqual(await manager.move(request), { status: 'rejected', reason: 'already-moving' });
    tick(0);
    assert.equal(deck.place(new MoveObject('other'), 'top'), false);
    assert.equal(hand.place(new MoveObject('other'), 'first'), false);
    assert.equal(hand.place(object, 'first'), false);
    controller.abort();
    tick(20);
    assert.deepEqual(await pending, { status: 'cancelled' });
    assert.equal(object.area, deck);
    assert.equal(drawn.has(object), false);
    assert.deepEqual(events, ['blur', 'started', 'cancelled']);
    const retry = manager.move({ ...request, durationMs: 0 });
    tick(25);
    assert.deepEqual(await retry, { status: 'arrived' });
    assert.equal(object.area, hand);
});

test('an unavailable destination preserves the source and releases it for retry', async () => {
    const { deck, hand, manager, object, request, tick } = setup();
    const occupant = new MoveObject('occupant');
    assert.equal(hand.place(occupant, 'first'), true);
    assert.deepEqual(await manager.move(request), { status: 'rejected', reason: 'slot-unavailable' });
    assert.equal(object.area, deck);
    assert.equal(hand.remove(occupant), true);
    const pending = manager.move({ ...request, durationMs: 0 });
    tick(0);
    assert.deepEqual(await pending, { status: 'arrived' });
});

test('cancelling before the first frame leaves a visible source interactive', async () => {
    const { deck, hand, drawn, events, manager, object, request, tick } = setup();
    deck.setPresentation({ visible: true, interactive: true });
    const controller = new AbortController();
    const pending = manager.move({ ...request, signal: controller.signal });
    controller.abort();
    tick(0);
    assert.deepEqual(await pending, { status: 'cancelled' });
    assert.equal(object.area, deck);
    assert.equal(drawn.get(object).interactive, true);
    assert.deepEqual(events, []);
    assert.equal(hand.place(new MoveObject('other'), 'first'), true);
});

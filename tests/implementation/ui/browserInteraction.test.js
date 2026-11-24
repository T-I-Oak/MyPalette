import test from 'node:test';
import assert from 'node:assert/strict';
import { preventBrowserZoom } from '../../../src/ui/browserInteraction.js';

function dispatch(surface, type, touches = 0) {
    const event = new Event(type, { cancelable: true });
    Object.defineProperty(event, 'touches', { value: Array(touches).fill({}) });
    surface.dispatchEvent(event);
    return event.defaultPrevented;
}

test('zoom gestures are canceled while taps, scrolling and clicks remain available', () => {
    const surface = new EventTarget();
    const dispose = preventBrowserZoom(surface);
    for (const type of ['touchstart', 'touchmove']) {
        assert.equal(dispatch(surface, type, 2), true);
        assert.equal(dispatch(surface, type, 3), true);
        assert.equal(dispatch(surface, type, 1), false);
    }
    for (const type of ['gesturestart', 'gesturechange', 'dblclick']) {
        assert.equal(dispatch(surface, type), true);
    }
    for (let tap = 0; tap < 3; tap++) {
        for (const type of ['touchstart', 'touchmove', 'touchend', 'click']) {
            assert.equal(dispatch(surface, type, type === 'touchend' ? 0 : 1), false);
        }
    }
    assert.equal(dispatch(surface, 'touchcancel'), false);
    dispose();
});

test('disposal and re-registration do not leave zoom handlers behind', () => {
    const surface = new EventTarget();
    const dispose = preventBrowserZoom(surface);
    dispose();
    for (const type of ['touchstart', 'touchmove', 'gesturestart', 'gesturechange', 'dblclick']) {
        assert.equal(dispatch(surface, type, 2), false);
    }
    const disposeAgain = preventBrowserZoom(surface);
    assert.equal(dispatch(surface, 'touchstart', 2), true);
    disposeAgain();
    assert.equal(dispatch(surface, 'gesturechange'), false);
});

export function preventBrowserZoom(surface) {
    const cancel = event => event.preventDefault();
    const cancelPinch = event => {
        if (event.touches.length > 1) event.preventDefault();
    };
    const handlers = [
        ['touchstart', cancelPinch],
        ['touchmove', cancelPinch],
        ['gesturestart', cancel],
        ['gesturechange', cancel],
        ['dblclick', cancel],
    ];
    const options = { passive: false, capture: true };
    for (const [type, handler] of handlers) surface.addEventListener(type, handler, options);
    return () => {
        for (const [type, handler] of handlers) surface.removeEventListener(type, handler, options);
    };
}

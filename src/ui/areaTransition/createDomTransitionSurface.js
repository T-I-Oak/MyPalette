import { readTransform } from './geometry.js';

export function createDomTransitionSurface(root, initialTransform = { x: 0, y: 0, scale: 1 }) {
    const document = root.ownerDocument;
    const window = document.defaultView;
    const mounts = new Map();
    let transform = readTransform(initialTransform);

    const areaLayer = createLayer();
    const transitionLayer = createLayer();
    root.append(areaLayer, transitionLayer);

    function createLayer() {
        const layer = document.createElement('div');
        Object.assign(layer.style, {
            position: 'fixed',
            inset: '0',
            overflow: 'hidden',
            pointerEvents: 'none',
        });
        return layer;
    }

    function render(object, viewportRect, interactive, layer, scale) {
        let wrapper = mounts.get(object);
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.style.position = 'absolute';
            wrapper.style.transformOrigin = 'top left';
            wrapper.appendChild(object.element);
            mounts.set(object, wrapper);
        }
        const { x, y, width, height } = viewportRect;
        Object.assign(wrapper.style, {
            left: `${x}px`,
            top: `${y}px`,
            width: `${width / scale}px`,
            height: `${height / scale}px`,
            transform: `scale(${scale})`,
            pointerEvents: interactive ? 'auto' : 'none',
        });
        wrapper.inert = !interactive;
        const parent = layer === 'area' ? areaLayer : transitionLayer;
        if (wrapper.parentNode !== parent) parent.appendChild(wrapper);
        object.render({ layer, viewportRect, interactive, scale });
    }

    function remove(object, layer) {
        const wrapper = mounts.get(object);
        if (wrapper?.parentNode !== layer) return;
        wrapper.remove();
        mounts.delete(object);
    }

    return {
        readViewportTransform: () => transform,
        setViewportTransform(nextTransform) {
            transform = readTransform(nextTransform);
        },
        clearFocus(object) {
            const focused = document.activeElement;
            if (object.element.contains(focused)) focused.blur();
        },
        scheduleFrame: callback => window.requestAnimationFrame(callback),
        renderInArea: (object, rect, interactive, area, scale = 1) => render(object, rect, interactive, 'area', scale),
        removeFromArea: object => remove(object, areaLayer),
        renderMoving: (object, rect, scale = 1) => render(object, rect, false, 'transition', scale),
        removeMoving: object => remove(object, transitionLayer),
    };
}

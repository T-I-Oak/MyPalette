import { ScreenLayout, areaDefinitions } from './ScreenLayout.js';
import { CanvasArea } from './CanvasArea.js';
import { createDomTransitionSurface } from '../areaTransition/index.js';

export function createLayoutScreen(viewport, button) {
    const root = document.createElement('div');
    root.className = 'LayoutContent';
    viewport.append(root);
    root.append(button);
    // Layout coordinates are CSS pixels; the transition surface applies no extra screen scale.
    function createLayer(className) {
        const layer = document.createElement('div');
        layer.className = `LayoutComponentLayer ${className}`;
        root.append(layer);
        return layer;
    }
    const mainLayer = createLayer('LayoutMainLayer');
    const mainFixedLayer = createLayer('LayoutMainFixedLayer');
    const panelLayer = createLayer('LayoutPanelLayer');
    const panelFixedLayer = createLayer('LayoutPanelFixedLayer');
    const movingLayer = createLayer('LayoutMovingLayer');
    const panelAreas = new Set(['stock', 'discard', 'deck']);
    const surface = createDomTransitionSurface(root, { x: 0, y: 0, scale: 1 }, {
        areaRootFor: area => panelAreas.has(area.id) ? panelLayer : mainLayer,
        transitionRoot: movingLayer,
        relativeToRoot: true,
        viewportTransformFor: () => {
            const { x, y } = root.getBoundingClientRect();
            return { x, y, scale: 1 };
        },
    });
    const areas = new Map(Object.entries(areaDefinitions).map(([id, definition]) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'LayoutArea';
        canvas.dataset.area = id;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', definition.name);
        root.append(canvas);
        const fixedLayer = document.createElement('div');
        fixedLayer.className = 'LayoutAreaFixed';
        fixedLayer.dataset.area = id;
        (panelAreas.has(id) ? panelFixedLayer : mainFixedLayer).append(fixedLayer);
        return [id, new CanvasArea(id, surface, definition, canvas, fixedLayer)];
    }));
    const layout = new ScreenLayout();
    const listeners = new Set();
    let progress = 0;
    let target = 0;
    let animation = 0;
    let lastTime;
    const durationMs = 260;

    function render() {
        const width = viewport.clientWidth;
        const height = viewport.getBoundingClientRect().height;
        if (!width || !height) return;
        layout.definitions = Object.fromEntries([...areas].map(([id, area]) => [id, area.getLayoutRequirements()]));
        const frame = layout.calculate(width, height, progress);
        root.style.height = `${frame.height}px`;
        viewport.dataset.layout = frame.mode;
        root.dataset.layout = frame.mode;
        for (const [id, area] of areas) area.applyLayout(frame.areas[id], window.devicePixelRatio);
        for (const listener of listeners) listener(frame);
        button.hidden = frame.mode === 'A';
        button.style.right = `${width - frame.areas.stock.rect.x}px`;
        button.style.top = `${frame.areas.stock.rect.y}px`;
        button.setAttribute('aria-expanded', String(target === 1));
        button.setAttribute('aria-label', target === 1 ? 'サイドパネルを閉じる' : 'サイドパネルを開く');
    }

    function tick(time) {
        const delta = lastTime === undefined ? 0 : (time - lastTime) / durationMs;
        lastTime = time;
        progress = target > progress ? Math.min(target, progress + delta) : Math.max(target, progress - delta);
        render();
        animation = progress === target ? 0 : requestAnimationFrame(tick);
    }

    button.addEventListener('click', () => {
        target = target === 1 ? 0 : 1;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            cancelAnimationFrame(animation);
            animation = 0;
            progress = target;
            render();
        } else if (!animation) {
            lastTime = undefined;
            animation = requestAnimationFrame(tick);
        }
    });
    new ResizeObserver(render).observe(viewport);
    viewport.addEventListener('scroll', render, { passive: true });
    // Resolution can change without any change to the CSS display size.
    let pixelRatio = window.devicePixelRatio;
    function watchResolution() {
        if (pixelRatio !== window.devicePixelRatio) {
            pixelRatio = window.devicePixelRatio;
            render();
        }
        requestAnimationFrame(watchResolution);
    }
    requestAnimationFrame(watchResolution);
    render();
    return { areas, surface, render,
        setFixedScale(scale) {
            if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('Expected positive fixed scale');
            layout.fixedScale = scale;
            render();
        },
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); } };
}

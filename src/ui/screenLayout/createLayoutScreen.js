import { ScreenLayout, areaDefinitions } from './ScreenLayout.js';
import { CanvasArea } from './CanvasArea.js';
import { createDomTransitionSurface } from '../areaTransition/index.js';

export function createLayoutScreen(root, button) {
    const layout = new ScreenLayout();
    // Layout coordinates are CSS pixels; the transition surface applies no extra screen scale.
    function createLayer(className) {
        const layer = document.createElement('div');
        layer.className = `LayoutComponentLayer ${className}`;
        root.append(layer);
        return layer;
    }
    const mainLayer = createLayer('LayoutMainLayer');
    const panelLayer = createLayer('LayoutPanelLayer');
    const movingLayer = createLayer('LayoutMovingLayer');
    const panelAreas = new Set(['stock', 'discard', 'deck']);
    const surface = createDomTransitionSurface(root, { x: 0, y: 0, scale: 1 }, {
        areaRootFor: area => panelAreas.has(area.id) ? panelLayer : mainLayer,
        transitionRoot: movingLayer,
    });
    const areas = new Map(Object.entries(areaDefinitions).map(([id, definition]) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'LayoutArea';
        canvas.dataset.area = id;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', definition.name);
        root.append(canvas);
        return [id, new CanvasArea(id, surface, definition, canvas)];
    }));
    let progress = 0;
    let target = 0;
    let animation = 0;
    let lastTime;
    const durationMs = 260;

    function render() {
        const { width, height } = root.getBoundingClientRect();
        if (!width || !height) return;
        const frame = layout.calculate(width, height, progress);
        root.dataset.layout = frame.mode;
        for (const [id, area] of areas) area.applyLayout(frame.areas[id], window.devicePixelRatio);
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
    new ResizeObserver(render).observe(root);
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
    return { areas, surface, render };
}

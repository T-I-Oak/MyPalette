import { ScreenLayout, areaDefinitions } from './ScreenLayout.js';
import { CanvasArea } from './CanvasArea.js';
import { createDomTransitionSurface } from '../areaTransition/index.js';
import { trace } from '../../game/startupTrace.js';

export function createLayoutScreen(viewport, button) {
    const root = document.createElement('div');
    root.className = 'LayoutContent';
    viewport.append(root);
    root.append(button);
    const floor = document.createElement('div');
    floor.className = 'LayoutAtelierFloor';
    floor.setAttribute('aria-hidden', 'true');
    root.prepend(floor);
    const board = document.createElement('div');
    board.className = 'LayoutCorkBoard';
    board.setAttribute('aria-hidden', 'true');
    root.append(board);
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
        const area = new CanvasArea(id, surface, definition, canvas, fixedLayer);
        if (panelAreas.has(id)) {
            fixedLayer.firstElementChild.classList.replace('texture-text-outline', 'texture-sticky-note');
        }
        return [id, area];
    }));
    const layout = new ScreenLayout();
    const listeners = new Set();
    let progress = 0;
    let target = 0;
    let animation = 0;
    let lastTime;
    const durationMs = 260;

    let lastSize;
    function render(source = 'game', record = true) {
        const width = viewport.clientWidth;
        const height = viewport.getBoundingClientRect().height;
        if (!width || !height) return;
        const size = { width, height, pixelRatio: window.devicePixelRatio };
        const changed = !lastSize || Object.keys(size).some(key => size[key] !== lastSize[key]);
        const start = record ? trace('layout-start', { source, ...(changed && { before: lastSize, after: size }) }) : undefined;
        if (record) lastSize = size;
        layout.definitions = Object.fromEntries([...areas].map(([id, area]) => [id, area.getLayoutRequirements()]));
        const frame = layout.calculate(width, height, progress);
        root.style.height = `${frame.height}px`;
        viewport.dataset.layout = frame.mode;
        root.dataset.layout = frame.mode;
        const play = frame.areas.play.drawRect;
        root.style.setProperty('--atelier-floor-y', `${play.y + play.height * 0.57}px`);
        root.style.setProperty('--atelier-image-width', `${Math.max(width, frame.height * 1672 / 941)}px`);
        const { rect: stock, visible: boardVisible } = frame.areas.stock;
        const deck = frame.areas.deck.rect;
        Object.assign(board.style, {
            left: `${stock.x}px`, top: `${stock.y}px`,
            width: `${stock.width}px`, height: `${deck.y + deck.height - stock.y}px`,
        });
        board.hidden = !boardVisible;
        for (const [id, area] of areas) area.applyLayout(frame.areas[id], window.devicePixelRatio);
        for (const listener of listeners) listener(frame);
        button.hidden = frame.mode === 'A';
        button.style.right = `${width - stock.x}px`;
        button.style.top = `${stock.y}px`;
        button.setAttribute('aria-expanded', String(target === 1));
        button.setAttribute('aria-label', target === 1 ? 'サイドパネルを閉じる' : 'サイドパネルを開く');
        if (record) trace('layout-end', { source, start });
    }

    function tick(time) {
        const first = lastTime === undefined;
        const delta = lastTime === undefined ? 0 : (time - lastTime) / durationMs;
        lastTime = time;
        progress = target > progress ? Math.min(target, progress + delta) : Math.max(target, progress - delta);
        render('panel', first || progress === target);
        animation = progress === target ? 0 : requestAnimationFrame(tick);
    }

    button.addEventListener('click', () => {
        target = target === 1 ? 0 : 1;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            cancelAnimationFrame(animation);
            animation = 0;
            progress = target;
            render('panel');
        } else if (!animation) {
            lastTime = undefined;
            animation = requestAnimationFrame(tick);
        }
    });
    new ResizeObserver(() => render('resize-observer')).observe(viewport);
    viewport.addEventListener('scroll', () => render('scroll'), { passive: true });
    // Resolution can change without any change to the CSS display size.
    let pixelRatio = window.devicePixelRatio;
    function watchResolution() {
        if (pixelRatio !== window.devicePixelRatio) {
            pixelRatio = window.devicePixelRatio;
            render('pixel-ratio');
        }
        requestAnimationFrame(watchResolution);
    }
    requestAnimationFrame(watchResolution);
    render('startup');
    return { areas, surface, render,
        openPanel() { if (target !== 1) button.click(); },
        setFixedScale(scale) {
            if (!Number.isFinite(scale) || scale <= 0) throw new RangeError('Expected positive fixed scale');
            layout.fixedScale = scale;
            render('fixed-scale');
        },
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); } };
}

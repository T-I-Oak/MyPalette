import { Card } from './Card.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { CardSceneState } from './cardSceneState.js';
import { cardSceneSnapshot, locateSceneCards, scatteredPlacement, sceneCardPose } from './cardSceneLayout.js';
import { animateProgress } from './playAnimation.js';
import { shippedCanvas } from './infoLayout.js';
import './cardScene.css';

function createShippedArtwork(id, wrapper, image) {
    const { faceWidth, faceHeight, thickness, perspective, angle, edgeWidth, projectedWidth } = shippedCanvas;
    wrapper.style.setProperty('--shipped-width', `${projectedWidth}px`);
    wrapper.style.setProperty('--shipped-height', `${faceHeight}px`);
    const canvas = document.createElement('div');
    canvas.className = 'SceneShippedCanvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.width = `${faceWidth}px`;
    canvas.style.setProperty('--shipped-edge', `${edgeWidth}px`);
    canvas.style.setProperty('--shipped-angle', `${angle}deg`);
    canvas.style.setProperty('--shipped-perspective', `${perspective}px`);
    canvas.style.setProperty('--shipped-thickness', `${thickness}px`);
    if (!image) {
        image = document.createElement('img');
        image.alt = '';
        image.draggable = false;
        image.src = `${import.meta.env.BASE_URL}assets/paintings/${id}-3.png`;
    }
    image.className = 'SceneShippedArtwork';
    canvas.append(image);
    return canvas;
}

export function createCardScene(screen, play) {
    const root = screen.areas.get('deck').canvas.closest('.LayoutContent');
    const layers = new Map(['main', 'panel', 'moving'].map(name => {
        const layer = document.createElement('div'); layer.className = `CardSceneLayer ${name}`;
        root.append(layer); return [name, layer];
    }));
    let model, definitions, display, initialized = false, busy = false, inspector, afterDraw, activeShipment, controller = new AbortController();
    const locationCache = new WeakMap();
    const cards = new Map(), placements = new Map(), content = new Map(), selected = new Map();
    function placement(id, area) {
        const key = `${area}:${id}`;
        if (!placements.has(key)) placements.set(key, scatteredPlacement(area));
        return placements.get(key);
    }
    function refreshContent(id, step) {
        const component = cards.get(id).component;
        const key = JSON.stringify([definitions[id], step]);
        if (content.get(id) === key) return;
        releasePaintingIcons(component.element);
        const remembered = selected.get(id);
        component.setFace(definitions[id], step, remembered?.current === step ? remembered.selected : step,
            value => selected.set(id, { current: step, selected: value }));
        component.element.dataset.sceneCard = id;
        component.element.setAttribute('aria-haspopup', 'dialog');
        content.set(id, key);
    }
    function poseFor(id, state = display) {
        if (!locationCache.has(state)) locationCache.set(state, locateSceneCards(state));
        const location = locationCache.get(state).get(id);
        return sceneCardPose(screen, state, location, placement(id, location.area), play);
    }
    function draw() {
        if (!initialized) return;
        const locations = locateSceneCards(display);
        for (const [id, entry] of cards) {
            const record = model.get(id), where = locations.get(id);
            if (where.area === 'field' && record.area === 'field' || root.dataset.cardSceneMotion === 'achievement-canvas') record.pose = poseFor(id);
            refreshContent(id, where.step);
            entry.component.element.classList.toggle('state-achievable', entry.achievable && ['hand', 'field'].includes(record.area) && record.area === where.area);
            const layer = model.motion ? 'moving' : ['stock', 'discard', 'deck'].includes(where.area) ? 'panel' : 'main';
            if (entry.wrapper.parentNode !== layers.get(layer)) layers.get(layer).append(entry.wrapper);
            if (entry.component.element.parentNode !== entry.wrapper) entry.wrapper.append(entry.component.element);
            entry.wrapper.dataset.sceneArea = where.area;
            const flying = activeShipment?.id === id;
            const shipped = flying || record.area === 'shipped' && where.area === 'shipped';
            entry.wrapper.classList.toggle('SceneShippedPainting', shipped);
            if (shipped && !entry.artwork) entry.artwork = createShippedArtwork(id, entry.wrapper);
            if (shipped) {
                if (flying) entry.artwork.style.setProperty('--shipment-progress', activeShipment.progress);
                else entry.artwork.style.removeProperty('--shipment-progress');
                if (entry.artwork.parentNode !== entry.component.element) entry.component.element.append(entry.artwork);
            }
            entry.wrapper.style.transform = `matrix3d(${Array.from(record.pose.matrix).join(',')})`;
            entry.wrapper.style.zIndex = String(record.pose.z);
            entry.wrapper.style.opacity = String(record.opacity);
            entry.wrapper.style.pointerEvents = !busy && where.area !== 'deck' && record.pose.flip % 360 === 0 ? 'auto' : 'none';
            entry.component.element.dataset.cardArea = where.area;
            entry.component.element.classList.toggle('texture-ground-shadow', where.area === 'hand');
            const back = Math.cos(record.pose.flip * Math.PI / 180) < 0;
            entry.component.element.dataset.sceneBack = String(back);
            entry.wrapper.inert = busy || back;
            entry.component.element.querySelector('.PaintingFront').setAttribute('aria-hidden', String(back));
            entry.component.element.setAttribute('aria-label', back ? '裏向きのカード' : definitions[id].name + (entry.component.element.classList.contains('state-achievable') ? '・達成可能' : ''));
            entry.wrapper.setAttribute('aria-hidden', String(back || where.area === 'discard' && where.index !== display.discard.length - 1));
            if (where.area === 'deck') entry.component.element.dataset.deckCardId = id; else delete entry.component.element.dataset.deckCardId;
            if (where.area === 'stock') entry.component.element.dataset.stockCardId = id; else delete entry.component.element.dataset.stockCardId;
            const faces = entry.component.element.querySelector('.PaintingFaces');
            faces.style.setProperty('--painting-flip', `${record.pose.flip}deg`);
            faces.inert = ['discard', 'shipped'].includes(where.area);
            entry.component.render({ scale: Math.max(.01, Math.hypot(record.pose.matrix[0], record.pose.matrix[1])) });
            entry.wrapper.dataset.motion = record.owner ?? '';
            entry.wrapper.dataset.sceneCurrentArea = record.area;
        }
        afterDraw?.();
    }
    return {
        get counts() {
            const value = { deck: 0, hand: 0, field: 0, discard: 0, shipped: 0, transit: 0, stocks: { A: 0, B: 0, C: 0 } };
            if (model) for (const card of model.cards.values()) { if (card.area === 'stock') value.stocks[card.grade]++; else value[card.area]++; }
            return value;
        },
        onDraw(callback) { afterDraw = callback; },
        get model() { return model; },
        get display() { return display; },
        get busy() { return busy; },
        set busy(value) { busy = value; draw(); },
        initialize(value, state) {
            definitions = value; display = cardSceneSnapshot(state);
            model = new CardSceneState(Object.keys(value));
            for (const [id, location] of locateSceneCards(display)) { model.get(id).area = location.area; model.get(id).grade = location.grade; }
            for (const id of Object.keys(value)) {
                const component = new Card(id), wrapper = document.createElement('div');
                wrapper.className = 'CardSceneCard'; wrapper.dataset.sceneId = id;
                component.element.onclick = event => {
                    if (busy) return;
                    const area = locateSceneCards(display).get(id).area;
                    if (area === 'discard' || !event.target.closest('button, .CardIcon')) inspector(id, component.element);
                };
                wrapper.append(component.element); layers.get('main').append(wrapper); cards.set(id, { component, wrapper, achievable: false });
            }
            initialized = true;
        },
        component: id => cards.get(id).component,
        achievable(id, value) { cards.get(id).achievable = value; },
        inspect(callback) { inspector = callback; },
        placement, poseFor, draw,
        showStep(id, step) {
            const where = locateSceneCards(display).get(id), list = where.area === 'stock' ? display.stocks[where.grade] : display[where.area];
            list.find(card => card.id === id).step = step; draw();
        },
        opacity(id, value) { model.opacity(id, value); draw(); },
        adopt(state) { display = cardSceneSnapshot(state); },
        update() {
            if (!initialized) return;
            if (busy || model.motion) { draw(); return; }
            const locations = locateSceneCards(display);
            for (const id of cards.keys()) { model.get(id).pose = poseFor(id); model.get(id).area = locations.get(id).area; model.get(id).grade = locations.get(id).grade; }
            draw();
        },
        async move(state, duration, owner, options = {}) {
            const signal = controller.signal, activeModel = model;
            const shipment = options.shipment;
            const previous = new Map([...activeModel.cards].map(([id, record]) => [id, { area: record.area, grade: record.grade }]));
            display = cardSceneSnapshot(state);
            const next = locateSceneCards(display);
            const attached = [...cards.keys()].filter(id => previous.get(id).area === 'field' && next.get(id).area === 'field');
            const targets = new Map([...cards.keys()].map(id => [id, () => {
                const pose = options.pose?.(id) ?? poseFor(id);
                return next.get(id).area === 'field' && previous.get(id).area !== 'field'
                    ? { ...pose, matrix: play.cardDestinationMatrix(id) } : pose;
            }]));
            play.begin();
            if (shipment) {
                const { id, image } = shipment, entry = cards.get(id), record = activeModel.get(id);
                entry.artwork = createShippedArtwork(id, entry.wrapper, image);
                record.pose = { ...record.pose, matrix: play.shipmentMatrix(id) };
                record.opacity = 1;
                activeShipment = { id, progress: 0 };
            }
            activeModel.begin(targets, owner);
            try {
                if (shipment) {
                    draw();
                    play.releaseCanvas(shipment.id);
                }
                const complete = await animateProgress(duration, progress => {
                    play.sample(progress);
                    activeModel.sample(options.progressFor ? id => options.progressFor(id, progress) : options.ease ? options.ease(progress) : progress);
                    if (shipment) activeShipment.progress = options.ease?.(progress) ?? progress;
                    for (const id of cards.keys()) {
                        const custom = options.frame?.(id, progress, activeModel.get(id).pose);
                        if (custom) activeModel.get(id).pose = custom;
                    }
                    for (const id of attached) activeModel.get(id).pose = poseFor(id);
                    for (const [id, where] of next) {
                        const amount = options.progressFor ? options.progressFor(id, progress) : options.ease ? options.ease(progress) : progress;
                        const record = activeModel.get(id), from = previous.get(id);
                        const arrived = amount >= 1;
                        record.area = arrived ? options.areaOnArrival?.(id) ?? where.area : from.area !== where.area && options.departure?.(id, progress) ? 'transit' : from.area;
                        record.grade = arrived ? where.grade : from.grade;
                    }
                    draw();
                }, signal);
                if (complete) { activeModel.interrupt(); play.finish(); for (const [id, where] of next) { activeModel.get(id).area = options.areaOnArrival?.(id) ?? where.area; activeModel.get(id).grade = where.grade; } }
            } finally {
                if (shipment && activeShipment?.id === shipment.id) activeShipment = undefined;
                activeModel.interrupt(); draw();
            }
        },
        cancel() { controller.abort(); controller = new AbortController(); model?.interrupt(); },
        restoreVisibility() { for (const record of model.cards.values()) record.opacity = 1; draw(); },
        reset() {
            controller.abort(); controller = new AbortController();
            for (const { component, wrapper } of cards.values()) { releasePaintingIcons(component.element); wrapper.remove(); }
            cards.clear(); content.clear(); placements.clear(); selected.clear(); initialized = false; busy = false; model = null; activeShipment = undefined;
        },
        dispose() { this.reset(); for (const layer of layers.values()) layer.remove(); },
    };
}

import * as THREE from 'three';
import { createEasel } from './easel/createEasel.js';
import { createPaintingCamera, cardPlaneMatrix, orientPainting } from './easel/paintingView.js';
import { playMetrics, playOffsets, playStandardSize, layoutPlay, playButtonCenter } from './playLayout.js';
import './easel/paintingInfo.css';
import './play.css';
import { createPlayCanvasEffects, mountEffectCanvas } from './playCanvasEffects.js';

export function createPlayPresentation(area, host, relayout) {
    host.classList.add('PlayArea');
    area.topLeftOffset = playOffsets.topLeftOffset; area.bottomRightOffset = playOffsets.bottomRightOffset;
    const areaName = area.fixedLayer.querySelector('.LayoutAreaName');
    areaName.hidden = true;
    const controls = document.createElement('div'); controls.className = 'PlayFixedActions'; area.fixedLayer.append(controls);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0, 0); renderer.domElement.className = 'PlayPaintingSurface';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff5e2, 0x74695c, 2.4));
    const light = new THREE.DirectionalLight(0xffefd7, 3.2); light.position.set(-3, 5, 4); scene.add(light);
    const camera = createPaintingCamera(playMetrics.width / playMetrics.height);
    camera.setViewOffset(playMetrics.width, 760, 0, 50, playMetrics.width, playMetrics.height);
    let entries = [], row, effect = null;
    const find = id => entries.find(entry => entry.id === id);
    const canvasEffects = createPlayCanvasEffects(find, update);
    function update() {
        const width = area.logicalWidth, height = area.logicalHeight, frame = area.layoutFrame;
        controls.style.top = `${frame.rect.height / frame.fixedScale - area.bottomRightOffset.y}px`;
        const slots = layoutPlay(entries.length, width, height);
        for (const [index, entry] of entries.entries()) {
            entry.slot = slots[index];
            orientPainting(entry.easel, entry.slot.x + playMetrics.width / 2, width, entry.id);
            entry.pair.style.left = `${entry.slot.x}px`; entry.pair.style.top = `${entry.slot.y}px`;
            entry.actions.style.left = `${playButtonCenter(entry.slot, frame.scale, frame.fixedScale, area.topLeftOffset.x)}px`;
            entry.actions.style.maxWidth = `${Math.max(1, playMetrics.width * frame.scale / frame.fixedScale - 4)}px`;
        }
        if (!width || !height) return;
        renderer.setPixelRatio(devicePixelRatio * frame.scale); renderer.setSize(width, height, false);
        renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
        for (const entry of entries) {
            const x = entry.slot.x, y = height - entry.slot.y - playMetrics.height;
            renderer.setViewport(x, y, playMetrics.width, playMetrics.height);
            renderer.setScissor(x, Math.max(0, y), playMetrics.width, Math.min(height, playMetrics.height));
            entry.easel.object.visible = true; renderer.render(scene, camera);
            const matrix = cardPlaneMatrix(entry.easel.object.getObjectByName('tray-shelf'), camera,
                playMetrics.width, playMetrics.height, entry.info.offsetWidth, entry.info.offsetHeight);
            entry.info.style.transform = `matrix3d(${matrix.join(',')})`;
            entry.easel.object.visible = false;
        }
    }
    function clear() {
        for (const entry of entries) {
            entry.painting?.dispose();
            entry.easel.object.removeFromParent(); entry.easel.dispose();
        }
        entries = []; controls.replaceChildren(); row?.remove(); row = null; renderer.domElement.remove();
    }
    return {
        update, clear,
        ...canvasEffects,
        setEffect(value) { effect = value; },
        cardTarget(id) { return find(id).info; },
        present(section, state) {
            const size = playStandardSize(state.field.length);
            area.standardWidth = size.width; area.standardHeight = size.height;
            row = document.createElement('div'); row.className = 'PlayPaintings';
            const cards = [...section.querySelectorAll('.GameCardAreaContent > .GameCardSlot')], slots = layoutPlay(cards.length);
            for (const [index, card] of state.field.entries()) {
                const slot = slots[index], pair = document.createElement('article'); pair.className = 'PlayPainting'; pair.dataset.paintingId = card.id;
                if (effect?.id === card.id) pair.dataset.effect = effect.stage;
                pair.style.left = `${slot.x}px`; pair.style.width = `${playMetrics.width}px`; pair.style.height = `${playMetrics.height}px`;
                const info = document.createElement('div'); info.className = 'PlayCard';
                const source = cards[index], face = source.querySelector('.PaintingCard');
                face.style.setProperty('--painting-x', '0px'); face.style.setProperty('--painting-y', '0px'); face.style.setProperty('--painting-tilt', '0deg');
                const actions = source.querySelector('.GameCardActions'); actions.dataset.cardId = card.id; controls.append(actions);
                info.append(source);
                const viewport = document.createElement('button'); viewport.type = 'button'; viewport.className = 'PlayPaintingViewport';
                viewport.setAttribute('aria-label', `${card.id}のイーゼル・カードを拡大`);
                viewport.addEventListener('click', () => face.click()); pair.append(viewport, info); row.append(pair);
                const easel = createEasel();
                easel.object.visible = false; scene.add(easel.object);
                const entry = { easel, viewport, info, actions, slot, pair, id: card.id }; entries.push(entry);
                if (effect?.id === card.id && effect.stage !== 'card') {
                    info.style.opacity = '0';
                    if (['canvas', 'repaint', 'effects'].includes(effect.stage) && effect.images) mountEffectCanvas(entry, effect.image || effect.images[0]);
                }
            }
            host.append(renderer.domElement, row); section.remove(); relayout();
        },
        dispose() { clear(); controls.remove(); renderer.dispose(); areaName.hidden = false; },
    };
}

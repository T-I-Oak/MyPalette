import * as THREE from 'three';
import { traceWebGL } from './startupTrace.js';
import { createEasel } from './easel/createEasel.js';
import { createPaintingCamera, cardPlaneMatrix, canvasPlaneMatrix, orientPainting } from './easel/paintingView.js';
import { shippedCanvas } from './infoLayout.js';
import { playMetrics, playOffsets, playStandardSize, layoutPlay, paintingFacing } from './playLayout.js';
import { mountEffectCanvas } from './playCanvasEffects.js';
import { animateProgress, achievementTiming } from './playAnimation.js';
import { diagonalReveal } from './achievementMotion.js';
import './play.css';

export function createPlayPresentation(area, host, relayout) {
    host.classList.add('PlayArea');
    area.topLeftOffset = playOffsets.topLeftOffset; area.bottomRightOffset = playOffsets.bottomRightOffset;
    const name = area.fixedLayer.querySelector('.LayoutAreaName'); name.hidden = true;
    const root = area.canvas.closest('.LayoutContent');
    const controls = document.createElement('div'); controls.className = 'PlayFixedActions'; area.fixedLayer.append(controls);
    const endDay = document.createElement('div'); endDay.className = 'PlayEndDayAction';
    root.querySelector('.LayoutCorkBoard').before(endDay);
    const layer = document.createElement('div'); layer.className = 'PersistentEaselLayer'; root.append(layer);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    traceWebGL(renderer.domElement, 'play');
    renderer.setClearColor(0, 0); renderer.domElement.className = 'PlayPaintingSurface'; layer.append(renderer.domElement);
    const row = document.createElement('div'); row.className = 'PlayPaintings'; layer.append(row);
    const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xfff5e2, 0x74695c, 2.4));
    const light = new THREE.DirectionalLight(0xffefd7, 3.2); light.position.set(-3, 5, 4); scene.add(light);
    const camera = createPaintingCamera(playMetrics.width / playMetrics.height);
    camera.setViewOffset(playMetrics.width, 760, 0, 50, playMetrics.width, playMetrics.height);
    const entries = new Map();
    let order = [], cards, motion = false;
    let renderWidth = 0, renderHeight = 0;
    const find = id => entries.get(id);
    function target(id) {
        const index = order.indexOf(id), count = order.length;
        if (index < 0) { const current = find(id).frame; return { ...current, x: -current.width - 40 }; }
        const slot = layoutPlay(count, area.logicalWidth, area.logicalHeight)[index];
        return { ...area.readScreenRect({ ...slot, width: playMetrics.width, height: playMetrics.height }), facing: paintingFacing(slot.x + playMetrics.width / 2, area.logicalWidth) };
    }
    function render() {
        const width = root.clientWidth, height = root.clientHeight;
        if (!width || !height) return;
        if (renderWidth !== width || renderHeight !== height) {
            renderer.setSize(width, height, false); renderWidth = width; renderHeight = height;
        }
        renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
        for (const entry of entries.values()) {
            const f = entry.frame;
            const localCenter = area.logicalWidth / 2 - Math.tan(f.facing) * 2000;
            orientPainting(entry.easel, localCenter, area.logicalWidth, entry.id);
            renderer.setViewport(f.x, height - f.y - f.height, f.width, f.height);
            renderer.setScissor(Math.max(0, f.x), Math.max(0, height - f.y - f.height), Math.max(0, Math.min(width - f.x, f.width)), Math.max(0, Math.min(height, f.height)));
            if (f.x < width && f.x + f.width > 0 && f.y < height && f.y + f.height > 0) {
                entry.easel.object.visible = true; renderer.render(scene, camera); entry.easel.object.visible = false;
            }
            entry.matrix = cardPlaneMatrix(entry.easel.object.getObjectByName('tray-shelf'), camera, playMetrics.width, playMetrics.height, 294, 414);
            entry.pair.style.transform = `translate(${f.x}px,${f.y}px) scale(${f.width / playMetrics.width})`;
            entry.info.style.transform = `matrix3d(${entry.matrix.join(',')})`;
            if (entry.actions) {
                const frame = area.layoutFrame;
                entry.actions.style.left = `${(f.x + f.width / 2 - frame.rect.x) / frame.fixedScale}px`;
                entry.actions.style.maxWidth = `${Math.max(1, f.width / frame.fixedScale - 4)}px`;
            }
        }
        controls.style.top = `${area.layoutFrame.rect.height / area.layoutFrame.fixedScale - area.bottomRightOffset.y}px`;
        const frame = area.layoutFrame;
        const actionWidth = frame.rect.width / frame.fixedScale;
        Object.assign(endDay.style, {
            left: `${frame.rect.x + (frame.rect.width - actionWidth) / 2}px`, top: `${frame.rect.y}px`,
            width: `${actionWidth}px`, transform: `scale(${frame.fixedScale})`,
        });
    }
    function update() {
        if (!motion) for (const [id, entry] of entries) entry.frame = target(id);
        render();
    }
    function removeEntry(entry) {
        entry.painting?.dispose(); entry.easel.object.removeFromParent(); entry.easel.dispose();
        entry.pair.remove(); entry.actions?.remove(); entries.delete(entry.id);
    }
    function sample(progress) {
        for (const [id, entry] of entries) {
            const to = target(id), from = entry.from;
            entry.frame = Object.fromEntries(['x', 'y', 'width', 'height', 'facing'].map(key => [key, from[key] + (to[key] - from[key]) * progress]));
        }
        render();
    }
    return {
        resourceCounts: () => ({ ...renderer.info.memory, activeEasels: order.length, retainedEasels: entries.size - order.length }),
        bindScene(value) { cards = value; },
        update,
        begin() { motion = true; for (const entry of entries.values()) entry.from = { ...entry.frame }; },
        sample,
        finish() { sample(1); for (const entry of entries.values()) if (!order.includes(entry.id)) { entry.pair.dataset.retired = ''; entry.actions?.remove(); entry.actions = null; } motion = false; },
        dropCanvases() { for (const entry of entries.values()) { entry.painting?.dispose(); entry.painting = null; } render(); },
        clear() { controls.replaceChildren(); endDay.replaceChildren(); },
        reset() { for (const entry of [...entries.values()]) removeEntry(entry); order = []; motion = false; render(); },
        setEndDayButton(button) { endDay.replaceChildren(); if (button) endDay.append(button); },
        setSessionActions(actions) { endDay.append(actions); },
        cardTarget(id) { return find(id).info; },
        cardMatrix(id) {
            const entry = find(id), f = entry.frame;
            return new DOMMatrix().translate(f.x, f.y).scale(f.width / playMetrics.width).multiply(new DOMMatrix(entry.matrix)).toFloat64Array();
        },
        cardDestinationMatrix(id) {
            const entry = find(id), f = target(id);
            orientPainting(entry.easel, area.logicalWidth / 2 - Math.tan(f.facing) * 2000, area.logicalWidth, id);
            const matrix = cardPlaneMatrix(entry.easel.object.getObjectByName('tray-shelf'), camera, playMetrics.width, playMetrics.height, 294, 414);
            const result = new DOMMatrix().translate(f.x, f.y).scale(f.width / playMetrics.width).multiply(new DOMMatrix(matrix)).toFloat64Array();
            orientPainting(entry.easel, area.logicalWidth / 2 - Math.tan(entry.frame.facing) * 2000, area.logicalWidth, id);
            entry.easel.object.updateWorldMatrix(true, true);
            return result;
        },
        present(section, state) {
            const next = state.field.map(card => card.id), changed = JSON.stringify(next) !== JSON.stringify(order);
            order = next;
            const size = playStandardSize(order.length); area.standardWidth = size.width; area.standardHeight = size.height;
            const slots = [...section.querySelectorAll('.GameCardAreaContent > .GameCardSlot')];
            for (const [index, card] of state.field.entries()) {
                let entry = find(card.id);
                if (!entry) {
                    const pair = document.createElement('article'); pair.className = 'PlayPainting texture-easel-shadow'; pair.dataset.paintingId = card.id;
                    const info = document.createElement('div'); info.className = 'PlayCard';
                    const viewport = document.createElement('button'); viewport.type = 'button'; viewport.tabIndex = -1; viewport.className = 'PlayPaintingViewport';
                    viewport.setAttribute('aria-label', `${card.id}のイーゼル・カードを拡大`);
                    viewport.onclick = () => cards.component(card.id).element.click();
                    pair.append(viewport, info); row.append(pair);
                    const easel = createEasel(); easel.object.visible = false; scene.add(easel.object);
                    const endpoint = targetForNew(index, order.length);
                    entry = { id: card.id, easel, pair, info, frame: { ...endpoint, x: root.clientWidth + 40 } };
                    entries.set(card.id, entry);
                } else if (entry.pair.hasAttribute('data-retired')) {
                    entry.frame = { ...targetForNew(index, order.length), x: root.clientWidth + 40 };
                }
                delete entry.pair.dataset.retired;
                const slot = slots[index]; entry.info.replaceChildren(slot);
                const actions = slot.querySelector('.GameCardActions'); actions.dataset.cardId = card.id;
                entry.actions?.remove(); entry.actions = actions; controls.append(actions);
            }
            section.remove();
            if (changed) motion = true;
            relayout(); render();
        },
        async fadeOut(id, image, signal) {
            const entry = find(id); mountEffectCanvas(entry, image); render();
            await animateProgress(achievementTiming.fade, progress => cards.opacity(id, 1 - progress), signal);
        },
        async repaint(id, before, after, signal, duration = 520) {
            const entry = find(id), image = document.createElement('canvas'); image.width = after.width; image.height = after.height;
            const context = image.getContext('2d'); entry.painting.setImage(image);
            await animateProgress(duration, progress => {
                context.clearRect(0, 0, image.width, image.height); context.drawImage(before, 0, 0, image.width, image.height);
                context.save(); context.beginPath(); diagonalReveal(progress).forEach(([x,y],index) => index ? context.lineTo(x*image.width,y*image.height) : context.moveTo(x*image.width,y*image.height));
                context.closePath(); context.clip(); context.drawImage(after, 0, 0, image.width, image.height); context.restore();
                entry.painting.setImage(image); render();
            }, signal);
        },
        async fadeIn(id, definition, step, signal) {
            cards.showStep(id, step);
            await animateProgress(achievementTiming.fade, progress => cards.opacity(id, progress), signal);
            if (!signal.aborted) this.releaseCanvas(id);
        },
        releaseCanvas(id) {
            const entry = find(id);
            entry.painting.dispose(); entry.painting = null; render();
        },
        shipmentMatrix(id) {
            const { painting, frame } = find(id);
            const local = canvasPlaneMatrix(painting, camera, playMetrics.width, playMetrics.height, shippedCanvas.faceWidth, shippedCanvas.faceHeight);
            return new DOMMatrix().translate(frame.x, frame.y).scale(frame.width / playMetrics.width)
                .multiply(new DOMMatrix(local)).toFloat64Array();
        },
        canvasCorners(id) {
            const entry = find(id), painting = entry.painting, origin = root.getBoundingClientRect();
            painting.object.updateWorldMatrix(true, true); camera.updateMatrixWorld();
            const { width, height, depth } = painting.placement, f = entry.frame;
            return [[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y]) => {
                const point = painting.object.localToWorld(new THREE.Vector3(x*width/2,y*height/2,depth/2)).project(camera);
                return { x: origin.x + f.x + (point.x+1)*f.width/2, y: origin.y + f.y + (1-point.y)*f.height/2 };
            });
        },
        dispose() { this.reset(); controls.remove(); endDay.remove(); renderer.dispose(); layer.remove(); name.hidden = false; },
    };
    function targetForNew(index, count) {
        const slot = layoutPlay(count, area.logicalWidth, area.logicalHeight)[index];
        return { ...area.readScreenRect({ ...slot, width: playMetrics.width, height: playMetrics.height }), facing: paintingFacing(slot.x + playMetrics.width / 2, area.logicalWidth) };
    }
}

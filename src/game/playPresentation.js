import { shippedCanvas } from './infoLayout.js';
import { playMetrics, playOffsets, playStandardSize, layoutPlay } from './playLayout.js';
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
    const row = document.createElement('div'); row.className = 'PlayPaintings'; layer.append(row);
    const entries = new Map();
    let order = [], cards, motion = false;
    const find = id => entries.get(id);
    function target(id) {
        const index = order.indexOf(id), count = order.length;
        if (index < 0) { const current = find(id).frame; return { ...current, x: -current.width - 40 }; }
        const slot = layoutPlay(count, area.logicalWidth, area.logicalHeight)[index];
        return { ...area.readScreenRect({ ...slot, width: playMetrics.width, height: playMetrics.height }) };
    }
    function matrix(frame) {
        const scale = frame.width / playMetrics.width;
        return new DOMMatrix().translate(frame.x + 53 * scale, frame.y + 113 * scale).scale(scale).toFloat64Array();
    }
    function render() {
        for (const entry of entries.values()) {
            const f = entry.frame;
            entry.pair.style.transform = `translate(${f.x}px,${f.y}px) scale(${f.width / playMetrics.width})`;
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
        entry.painting?.remove();
        entry.pair.remove(); entry.actions?.remove(); entries.delete(entry.id);
    }
    function sample(progress) {
        for (const [id, entry] of entries) {
            const to = target(id), from = entry.from;
            entry.frame = Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, from[key] + (to[key] - from[key]) * progress]));
        }
        render();
    }
    return {
        resourceCounts: () => ({ mode: 'dom', activeCards: order.length }),
        bindScene(value) { cards = value; },
        update,
        begin() { motion = true; for (const entry of entries.values()) entry.from = { ...entry.frame }; },
        sample,
        finish() { sample(1); for (const entry of entries.values()) if (!order.includes(entry.id)) { entry.pair.dataset.retired = ''; entry.actions?.remove(); entry.actions = null; } motion = false; },
        dropCanvases() { for (const entry of entries.values()) { entry.painting?.remove(); entry.painting = null; } render(); },
        clear() { controls.replaceChildren(); endDay.replaceChildren(); },
        reset() { for (const entry of [...entries.values()]) removeEntry(entry); order = []; motion = false; render(); },
        setEndDayButton(button) { endDay.replaceChildren(); if (button) endDay.append(button); },
        setSessionActions(actions) { endDay.append(actions); },
        cardTarget(id) { return find(id).info; },
        cardMatrix(id) { return matrix(find(id).frame); },
        cardDestinationMatrix(id) { return matrix(target(id)); },
        present(section, state) {
            const next = state.field.map(card => card.id), changed = JSON.stringify(next) !== JSON.stringify(order);
            order = next;
            const size = playStandardSize(order.length); area.standardWidth = size.width; area.standardHeight = size.height;
            const slots = [...section.querySelectorAll('.GameCardAreaContent > .GameCardSlot')];
            for (const [index, card] of state.field.entries()) {
                let entry = find(card.id);
                if (!entry) {
                    const pair = document.createElement('article'); pair.className = 'PlayPainting PlayFlatPainting'; pair.dataset.paintingId = card.id;
                    const info = document.createElement('div'); info.className = 'PlayCard';
                    const viewport = document.createElement('button'); viewport.type = 'button'; viewport.tabIndex = -1; viewport.className = 'PlayPaintingViewport';
                    viewport.setAttribute('aria-label', `${card.id}のイーゼル・カードを拡大`);
                    viewport.onclick = () => cards.component(card.id).element.click();
                    pair.append(viewport, info); row.append(pair);
                    const endpoint = targetForNew(index, order.length);
                    entry = { id: card.id, pair, info, frame: { ...endpoint, x: root.clientWidth + 40 } };
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
            const entry = find(id); entry.painting?.remove();
            entry.painting = image; image.className = 'PlayFlatArtwork'; entry.pair.append(image);
            await animateProgress(achievementTiming.fade, progress => cards.opacity(id, 1 - progress), signal);
        },
        async repaint(id, before, after, signal, duration = 520) {
            const entry = find(id), image = document.createElement('canvas'); image.width = after.width; image.height = after.height;
            const context = image.getContext('2d'); image.className = 'PlayFlatArtwork'; entry.painting.replaceWith(image); entry.painting = image;
            await animateProgress(duration, progress => {
                context.clearRect(0, 0, image.width, image.height); context.drawImage(before, 0, 0, image.width, image.height);
                context.save(); context.beginPath(); diagonalReveal(progress).forEach(([x,y],index) => index ? context.lineTo(x*image.width,y*image.height) : context.moveTo(x*image.width,y*image.height));
                context.closePath(); context.clip(); context.drawImage(after, 0, 0, image.width, image.height); context.restore();
            }, signal);
        },
        async fadeIn(id, definition, step, signal) {
            cards.showStep(id, step);
            await animateProgress(achievementTiming.fade, progress => cards.opacity(id, progress), signal);
            if (!signal.aborted) this.releaseCanvas(id);
        },
        releaseCanvas(id) {
            const entry = find(id);
            entry.painting.remove(); entry.painting = null; render();
        },
        shipmentMatrix(id) {
            const { frame } = find(id);
            return new DOMMatrix(matrix(frame)).scale(294 / shippedCanvas.faceWidth, 414 / shippedCanvas.faceHeight).toFloat64Array();
        },
        canvasCorners(id) {
            const { painting } = find(id), rect = painting.getBoundingClientRect();
            return [[rect.left, rect.bottom], [rect.right, rect.bottom], [rect.right, rect.top], [rect.left, rect.top]]
                .map(([x, y]) => ({ x, y }));
        },
        dispose() { this.reset(); controls.remove(); endDay.remove(); layer.remove(); name.hidden = false; },
    };
    function targetForNew(index, count) {
        const slot = layoutPlay(count, area.logicalWidth, area.logicalHeight)[index];
        return { ...area.readScreenRect({ ...slot, width: playMetrics.width, height: playMetrics.height }) };
    }
}

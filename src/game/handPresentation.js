import { layoutHand, handActionPosition, handMetrics } from './handLayout.js';
import './hand.css';

export function createHandPresentation(area, host, scene) {
    host.classList.add('HandArea');
    area.fixedLayer.querySelector('.LayoutAreaName').hidden = true;
    const controls = document.createElement('div');
    controls.className = 'HandFixedActions';
    area.canvas.closest('.LayoutContent').append(controls);
    let cards = [];
    const actions = new Map();

    function follow() {
        if (!scene.model) return;
        const frame = area.layoutFrame;
        controls.style.transform = `scale(${frame.fixedScale})`;
        controls.inert = scene.busy;
        const handIds = new Set(scene.display.hand.map(card => card.id));
        for (const [id, action] of actions) {
            const record = scene.model.get(id);
            if (!handIds.has(id)) {
                action.remove(); actions.delete(id); continue;
            }
            const position = handActionPosition(record.pose.matrix, frame, area.bottomRightOffset.y);
            action.style.left = `${position.x}px`;
            action.style.top = `${position.y}px`;
            action.style.zIndex = String(record.pose.z);
        }
    }
    function update() {
        const frame = area.layoutFrame;
        const slots = layoutHand(area.logicalWidth, area.logicalHeight, cards.length);
        for (const [index, card] of cards.entries()) {
            const slot = slots[index];
            card.style.left = `${slot.x}px`;
            card.style.top = `${slot.y}px`;
            const interval = slots.length > 1 ? slots[1].x - slots[0].x : handMetrics.envelopeWidth;
            actions.get(card.dataset.cardId).style.maxWidth = `${Math.max(1, interval * frame.scale / frame.fixedScale - 4)}px`;
        }
        follow();
    }
    return {
        present(section) {
            cards = [...section.querySelectorAll('.GameHandCards > .GameCardSlot')]
                .filter(card => card.querySelector('.GameCardActions').childElementCount);
            for (const card of cards) {
                const id = card.dataset.cardId, action = card.querySelector('.GameCardActions');
                action.dataset.cardId = id;
                actions.set(id, action);
                controls.append(action);
                host.append(card);
            }
            section.remove();
            update();
        },
        update, follow,
        clear() {
            cards = [];
            actions.clear(); controls.replaceChildren();
        },
        dispose() { controls.remove(); },
    };
}

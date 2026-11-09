import { layoutHand, handButtonCenter, handMetrics } from './handLayout.js';
import { cardMessages } from './cardMessages.js';
import './hand.css';

export function createHandPresentation(area, host) {
    host.classList.add('HandArea');
    const controls = document.createElement('div');
    controls.className = 'HandFixedActions';
    area.fixedLayer.append(controls);
    let cards = [];
    let actions = [];

    function update() {
        const frame = area.layoutFrame;
        const slots = layoutHand(area.logicalWidth, area.logicalHeight, cards.length);
        for (const [index, card] of cards.entries()) {
            const slot = slots[index];
            card.style.left = `${slot.x}px`;
            card.style.top = `${slot.y}px`;
            actions[index].style.left = `${handButtonCenter(slot, frame.scale, frame.fixedScale, area.topLeftOffset.x)}px`;
            const nextInterval = slots.length > 1 ? slots[1].x - slots[0].x : handMetrics.envelopeWidth;
            actions[index].style.maxWidth = `${Math.max(1, nextInterval * frame.scale / frame.fixedScale - 4)}px`;
        }
        controls.style.top = `${frame.rect.height / frame.fixedScale - area.bottomRightOffset.y}px`;
    }

    return {
        present(section) {
            cards = [...section.querySelectorAll('.GameHandCards > .GameCardSlot')];
            actions = cards.map(card => card.querySelector('.GameCardActions'));
            for (const [index, card] of cards.entries()) {
                actions[index].dataset.cardId = card.querySelector('.PaintingCard').dataset.cardId;
                const button=actions[index].querySelector('button');
                button.textContent = button.dataset.handReturn ? cardMessages().returnToStock : cardMessages().startPainting;
                host.append(card);
                controls.append(actions[index]);
            }
            section.remove();
            update();
        },
        update,
        clear() {
            cards = [];
            actions = [];
            controls.replaceChildren();
        },
        dispose() { controls.remove(); },
    };
}

import { Card } from '../Card.js';
import { showCardDetail } from '../cardDetail.js';
import { releasePaintingIcons } from '../../cardIcons.js';
import '../view.css';
import './paintingInfo.css';

export function createPaintingInfo(host, { onAchieve }) {
    const panel = document.createElement('div'); panel.className = 'PaintingInfo';
    host.append(panel);
    let definition, currentStep, selectedStep, achievable, disabled;
    let source, actions, dialog;
    function cardSlot(compact) {
        const slot = document.createElement('div'); slot.className = 'GameCardSlot';
        const card = new Card(definition.id);
        card.setPresentation('field', { x: 0, y: 0, angle: 0 });
        card.setFace(definition, currentStep, selectedStep, value => { selectedStep = value; });
        card.element.classList.toggle('PaintingCardCompact', compact);
        card.element.classList.toggle('state-achievable', achievable);
        const buttons = document.createElement('div'); buttons.className = 'GameCardActions';
        slot.append(card.element, buttons); return slot;
    }
    function openDetail() {
        if (dialog?.open) return;
        dialog = showCardDetail({ root: host, label: definition.name,
            createDetail: () => cardSlot(false), source, sourceActions: actions });
    }
    return {
        openDetail,
        update(value) {
            dialog?.close(); releasePaintingIcons(panel); panel.replaceChildren();
            ({ definition, currentStep, achievable, disabled } = value); selectedStep = currentStep;
            const slot = cardSlot(true); panel.append(slot);
            source = slot.querySelector('.PaintingCard'); actions = slot.querySelector('.GameCardActions');
            source.tabIndex = 0; source.setAttribute('aria-haspopup', 'dialog');
            source.setAttribute('aria-label', `${definition.name}のカードを拡大${achievable ? '・達成可能' : ''}`);
            source.addEventListener('click', event => { if (!event.target.closest('button, .CardIcon')) openDetail(); });
            source.addEventListener('keydown', event => {
                if (event.target === source && ['Enter', ' '].includes(event.key)) { event.preventDefault(); openDetail(); }
            });
            const button = document.createElement('button'); button.type = 'button';
            button.className = 'Button texture-raised'; button.textContent = '達成'; button.disabled = disabled;
            button.addEventListener('click', onAchieve);
            if (achievable) actions.append(button);
        },
        position(x, y) {
            panel.style.left = `${x}px`;
            panel.style.top = `${Math.max(panel.getBoundingClientRect().height + 10, y)}px`;
        },
        dispose() { dialog?.close(); releasePaintingIcons(panel); panel.remove(); },
    };
}

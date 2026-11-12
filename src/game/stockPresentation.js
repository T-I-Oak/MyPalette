import { layoutStock } from './stockLayout.js';
import './stock.css';

export function createStockPresentation(area, host) {
    host.classList.add('StockArea');
    let entries = [];
    const controls = document.createElement('div');
    controls.className = 'StockFixedActions';
    area.fixedLayer.append(controls);

    function update() {
        const slots = layoutStock(area.logicalWidth, area.logicalHeight);
        for (const [index, entry] of entries.entries()) {
            const slot = slots[index];
            entry.node.style.left = `${slot.x}px`;
            entry.node.style.top = `${slot.y}px`;
            entry.label.style.top = `${slot.labelY - slot.y}px`;
            if (entry.button) {
                const frame = area.layoutFrame;
                entry.action.style.left = `${(slot.x + 147) * frame.scale / frame.fixedScale}px`;
            }
        }
        controls.style.top = `${area.layoutFrame.rect.height / area.layoutFrame.fixedScale - area.bottomRightOffset.y}px`;
    }

    return {
        present(section, state, actions) {
            entries = [...section.querySelectorAll('[data-stock-grade]')].map(node => {
                const label = node.querySelector('h3');
                label.classList.add('texture-sticky-note');
                host.append(node);
                let button, action;
                const id = state.public[node.dataset.stockGrade];
                if (actions.stockSelection && state.pending.options.some(option => option.id === id)) {
                    button = document.createElement('button');button.type='button';button.tabIndex=-1;
                    button.className='Button texture-raised state-attention';button.textContent='取得';
                    button.dataset.gameAction='';button.dataset.stockAcquire=id;
                    button.setAttribute('aria-label', `グレード${node.dataset.stockGrade}の公開カードを取得`);
                    button.addEventListener('click',()=>actions.chooseStock(id));
                    action=document.createElement('div');action.className='StockAcquireSlot';
                    action.append(button);controls.append(action);
                }
                return { node, label, button, action };
            });
            section.remove();
            update();
        },
        update,
        clear() {
            entries = [];
            controls.replaceChildren();
        },
        dispose() { controls.remove(); },
    };
}

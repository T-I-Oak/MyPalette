import { releasePaintingIcons } from '../cardIcons.js';

export function showCardDetail({ root, label, createDetail, source, sourceActions }) {
    const dialog = document.createElement('dialog'); dialog.className = 'GameCardDetail';
    dialog.setAttribute('aria-label', label);
    const detail = createDetail();
    const face = detail.querySelector('.PaintingCard');
    const viewport = document.createElement('div'); viewport.className = 'GameCardDetailViewport';
    face.replaceWith(viewport); viewport.append(face);
    face.classList.toggle('state-achievable', source.classList.contains('state-achievable'));
    const actions = detail.querySelector('.GameCardActions');
    const close = () => dialog.close();
    face.addEventListener('click', event => { if (!event.target.closest('button, .CardIcon')) close(); });
    function actionButton(text, action, disabled = false) {
        const button = document.createElement('button'); button.type = 'button';
        button.className = 'Button texture-raised'; button.textContent = text; button.disabled = disabled;
        button.addEventListener('click', action); actions.append(button);
    }
    for (const action of sourceActions.querySelectorAll('button')) {
        if (action.hidden) continue;
        actionButton(action.textContent, () => { close(); action.click(); }, action.disabled);
    }
    actionButton('閉じる', close);
    dialog.addEventListener('close', () => {
        releasePaintingIcons(dialog); dialog.remove();
        const selectedTab = face.querySelector('[aria-selected="true"]');
        const sourceTab = [...source.querySelectorAll('[role="tab"]')].find(tab => tab.textContent === selectedTab?.textContent);
        if (source.isConnected && sourceTab?.getAttribute('aria-selected') !== 'true') sourceTab?.click();
    }, { once: true });
    dialog.append(detail); root.append(dialog); dialog.showModal();
    return dialog;
}

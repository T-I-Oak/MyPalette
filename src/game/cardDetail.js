import { releasePaintingIcons } from '../cardIcons.js';
import { cardActionButton } from './cardActions.js';

export function showCardDetail({ root, label, createDetail, source, actions, onClose }) {
    const overlay = document.createElement('div'); overlay.className = 'GameCardDetail';
    overlay.dataset.open = 'true'; overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', label);
    const detail = createDetail(Number(source.dataset.selectedStep)), face = detail.querySelector('.PaintingCard');
    const viewport = document.createElement('div'); viewport.className = 'GameCardDetailViewport';
    face.replaceWith(viewport); viewport.append(face);
    face.classList.toggle('state-achievable', source.classList.contains('state-achievable'));
    const actionSlot = detail.querySelector('.GameCardActions');
    const controller = new AbortController(), { signal } = controller;
    const host = source.closest('dialog[open]') || root;
    const background = [...host.children].map(node => [node, node.inert]);
    for (const [node] of background) node.inert = true;
    // A choice dialog remains in the top layer; its inspector must share that host.
    host.append(overlay); overlay.append(detail);
    let isOpen = true;
    function close() {
        if (!isOpen) return;
        isOpen = false; controller.abort();
        const selectedTab = face.querySelector('[aria-selected="true"]');
        const sourceTab = [...source.querySelectorAll('[role="tab"]')].find(tab => tab.textContent === selectedTab?.textContent);
        if (source.isConnected && sourceTab?.getAttribute('aria-selected') !== 'true') sourceTab?.click();
        releasePaintingIcons(overlay); overlay.remove();
        for (const [node, inert] of background) node.inert = inert;
        onClose();
    }
    function refresh() {
        if (!isOpen) return;
        actionSlot.replaceChildren();
        for (const action of actions()) {
            const button = cardActionButton({ ...action, run() { close(); return action.run(); } });
            actionSlot.append(button);
        }
        const button = document.createElement('button'); button.type = 'button'; button.tabIndex = -1;
        button.className = 'Button texture-raised'; button.textContent = '閉じる';
        button.addEventListener('click', close); actionSlot.append(button);
    }
    overlay.addEventListener('pointerdown', event => event.preventDefault(), { signal });
    overlay.addEventListener('click', event => { event.stopPropagation(); }, { signal });
    face.addEventListener('click', event => { if (!event.target.closest('button, .CardIcon')) close(); }, { signal });
    for (const type of ['keydown', 'keypress', 'keyup']) document.addEventListener(type, event => {
        event.preventDefault(); event.stopImmediatePropagation();
    }, { capture: true, signal });
    refresh();
    return { get isOpen() { return isOpen; }, close, refresh, element: overlay };
}

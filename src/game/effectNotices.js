import { effectBody, releasePaintingIcons } from '../cardIcons.js';
import { paintingBlock } from './paintingBlock.js';
import { cardMessages } from './cardMessages.js';
import { createEffectNoticeQueue } from './effectNoticeQueue.js';
import { specialNoticeEffects } from './specialNoticeEffects.js';
import './effectNotices.css';

export function createEffectNotices(root, idle) {
    const layer = document.createElement('div');
    layer.className = 'EffectNoticeLayer';
    layer.setAttribute('role', 'status'); layer.setAttribute('aria-live', 'polite');
    root.ownerDocument.body.append(layer);
    const hide = () => { releasePaintingIcons(layer); layer.replaceChildren(); };
    const queue = createEffectNoticeQueue({
        idle, hide,
        show(event) {
            const text = cardMessages();
            const group = document.createElement('div'); group.className = 'EffectNoticeGroup';
            const title = document.createElement('h2'); title.className = 'EffectNoticeTitle';
            title.textContent = text.effectNoticeTitle;
            const effects = event.timing === 'special' ? specialNoticeEffects(event.effects) : event.effects;
            const block = paintingBlock(event.timing, effectBody(effects),
                event.timing === 'special' ? '★' : text[event.timing]);
            block.classList.add('EffectNotice', 'texture-paper');
            block.dataset.noticeId = event.id;
            group.append(title, block);
            layer.append(group);
        },
    });
    return {
        get busy() { return queue.busy; },
        sync(state, moving) {
            queue.pause(moving);
            queue.enqueue(state.effectNotices.splice(0));
        },
        dispose() { queue.dispose(); layer.remove(); },
    };
}

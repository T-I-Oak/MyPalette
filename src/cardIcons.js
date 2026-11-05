import { effectIconCanvas, goalIconCanvas } from './icons/render.js';
import { faceCanvas } from './dice/icons.js';
import { describeEffect, describeGoals } from './cardSummary.js';
import './cardIcons.css';
import { EFFECTS } from './effectCatalog.js';

const el = (text, className) => {
    const node = document.createElement('span'); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
};
let tooltip;
let active;
function icon(value, description, render, edit) {
    const node = el(undefined, 'CardIcon'); node.tabIndex = 0;
    node.setAttribute('role', edit ? 'button' : 'img'); node.setAttribute('aria-label', description);
    if (edit) {
        node.classList.add('state-editable');
        node.addEventListener('click', edit);
        node.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); edit(); }
        });
    }
    // 描画失敗が設定フォームの生成・修正操作を中断しないよう、描画は別タスクで行う。
    queueMicrotask(() => {
        const canvas = render(value, 96); canvas.setAttribute('aria-hidden', 'true'); node.append(canvas);
    });
    const hide = () => { if (active === node) { tooltip.hidden = true; active = undefined; } };
    const show = () => {
        if (!tooltip) {
            tooltip = document.createElement('div'); tooltip.className = 'IconTooltip texture-paper';
            tooltip.setAttribute('role', 'tooltip'); document.body.append(tooltip);
        }
        (node.closest('dialog') || document.body).append(tooltip);
        active = node; tooltip.textContent = description; tooltip.hidden = false;
        const rect = node.getBoundingClientRect();
        tooltip.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - tooltip.offsetWidth - 8))}px`;
        tooltip.style.top = `${Math.max(8, rect.bottom + tooltip.offsetHeight + 12 < innerHeight ? rect.bottom + 6 : rect.top - tooltip.offsetHeight - 6)}px`;
    };
    node.addEventListener('mouseenter', show); node.addEventListener('focus', show);
    node.addEventListener('mouseleave', () => { if (document.activeElement !== node) hide(); });
    node.addEventListener('blur', hide);
    node.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    return node;
}
window.addEventListener('scroll', () => { if (tooltip) tooltip.hidden = true; }, true);
export function goalIcons(goals, edit) {
    const row = el(undefined, 'CardIconSequence');
    if (!goals.length) row.textContent = '目標なし';
    goals.forEach((goal, i) => {
        if (i && goal.join === 'or') row.append(el('|', 'IconConnector'));
        const value = Object.fromEntries(Object.entries({material: goal.material, color: goal.color}).filter(([, value]) => value !== null));
        row.append(icon(value, describeGoals([goal]), goalIconCanvas, edit && (() => edit(i))));
    });
    return row;
}
export function effectIcons(effects, edit) {
    const row = el(undefined, 'CardIconSequence');
    if (!effects.length) row.textContent = '効果なし';
    effects.forEach((effect, i) => row.append(icon(effect, describeEffect(effect), effectIconCanvas, edit && (() => edit(i)))));
    return row;
}
export function dieFaceIcon(face, lifetime, description) {
    return icon(face, description, (value, height) => faceCanvas(value, lifetime, height));
}
export function effectTypeIcon(type, variant, description) {
    const definition = EFFECTS.find(effect => effect.type === type);
    const example = Object.fromEntries([['type', type], ...definition.fields.map(field =>
        [field.name, ['face', 'lifetime'].includes(field.name) ? variant : field.options ? field.options[0] : 1])]);
    return icon(example, description, effectIconCanvas);
}

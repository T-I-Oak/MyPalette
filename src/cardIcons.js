import { drawIconPlan, effectIconCanvas, goalIconCanvas, iconAspect } from './icons/render.js';
import { effectIconPlan, goalIconPlan } from './icons/iconPlan.js';
import { faceCanvas } from './dice/icons.js';
import { describeEffect, describeGoals } from './cardSummary.js';
import './cardIcons.css';
import { EFFECTS } from './effectCatalog.js';
import { cardMessages } from './game/cardMessages.js';
import { createIconPopovers } from './iconPopovers.js';

const el = (text, className) => {
    const node = document.createElement('span'); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
};
let tooltip;
let active;
const effectPopovers = createIconPopovers({
    createPopup(effect) {
        const tip = document.createElement('div');
        tip.className = 'IconTooltip EffectDetails texture-paper';
        tip.setAttribute('role', 'tooltip'); tip.append(effectBody([effect]));
        return tip;
    },
    releasePopup: releasePaintingIcons,
});
function effectGraphic(effect, interactive = true) {
    const node = icon(effect, cardMessages().describeEffect(effect), effectIconCanvas, null, effectIconPlan(effect), false);
    if (interactive) effectPopovers.bind(node, effect);
    return node;
}
export function effectBody(effects) {
    const body = el(undefined, 'EffectBody');
    const text = cardMessages();
    for (const effect of effects) {
        const row = el(undefined, 'EffectBodyRow');
        const content = el(undefined, 'EffectBodyText');
        for (const part of text.effectParts(effect)) content.append(typeof part === 'string' ? part : effectGraphic(part.effect));
        row.append(effectGraphic(effect, false), content); body.append(row);
    }
    return body;
}
const paintingDrawers = new WeakMap();
const paintingPlans = new WeakMap();
const cardDrawings = new WeakMap();
function drawCardIcons(panel, scale) {
    const frames = [...panel.querySelectorAll('.PaintingIconFrame')];
    const boxes = frames.map(frame => {
        let x = 0, y = 0;
        for (let node = frame; node !== panel; node = node.offsetParent) {
            x += node.offsetLeft; y += node.offsetTop;
        }
        return { x, y, width: frame.offsetWidth, height: frame.offsetHeight };
    });
    if (!boxes.some(box => box.width && box.height)) return;
    const x = Math.min(...boxes.map(box => box.x)), y = Math.min(...boxes.map(box => box.y));
    const width = Math.max(...boxes.map(box => box.x + box.width)) - x;
    const height = Math.max(...boxes.map(box => box.y + box.height)) - y;
    const ratio = Math.min(2048 / Math.max(width, height), scale * devicePixelRatio);
    const pixelWidth = Math.max(1, Math.ceil(width * ratio)), pixelHeight = Math.max(1, Math.ceil(height * ratio));
    const signature = JSON.stringify([pixelWidth, pixelHeight, boxes]);
    let drawing = cardDrawings.get(panel);
    if (!drawing || drawing.canvas.parentNode !== panel) {
        const canvas = document.createElement('canvas');
        canvas.className = 'PaintingIconCanvas';
        canvas.setAttribute('aria-hidden', 'true');
        panel.append(canvas);
        drawing = { canvas };
        cardDrawings.set(panel, drawing);
    }
    if (signature === drawing.signature && frames.every((frame, index) => frame === drawing.frames[index])) return;
    const { canvas } = drawing;
    Object.assign(canvas.style, { left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px` });
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    boxes.forEach((box, index) => {
        if (box.width && box.height) drawIconPlan(ctx, paintingPlans.get(frames[index]),
            (box.x - x) * ratio, (box.y - y) * ratio, box.width * ratio, box.height * ratio);
    });
    drawing.signature = signature;
    drawing.frames = frames;
}
const paintingObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(entries => {
    const panels = new Map();
    for (const { target, contentRect } of entries) {
        const viewport = target.closest('.GameCardDetailViewport, .GameCardAreaContent, .GameChoice .GameGrid');
        const scale = viewport ? Number(getComputedStyle(viewport).zoom) || 1 : 1;
        const panel = target.closest('.PaintingPanel');
        if (panel) {
            if (contentRect.height && !target.closest('.CardSceneCard')) panels.set(panel, scale);
        } else paintingDrawers.get(target)?.(target, contentRect.height, scale);
    }
    for (const [panel, scale] of panels) drawCardIcons(panel, scale);
});
function icon(value, description, render, edit, plan, withTooltip = true) {
    const node = el(undefined, 'CardIcon');
    if (edit || !plan) node.tabIndex = edit ? -1 : 0;
    node.setAttribute('role', edit ? 'button' : 'img'); node.setAttribute('aria-label', description);
    if (edit) {
        node.classList.add('state-editable');
        node.addEventListener('click', edit);
        node.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); edit(); }
        });
    }
    // 描画失敗が設定フォームの生成・修正操作を中断しないよう、描画は別タスクで行う。
    if (plan) {
        const frame = el(undefined, 'PaintingIconFrame');
        const aspect = iconAspect(plan);
        frame.style.width = `calc(var(--painting-icon-size, 28px) * ${aspect})`;
        frame.style.aspectRatio = String(aspect);
        paintingPlans.set(frame, plan);
        paintingDrawers.set(frame, (target, height, scale) => {
            if (!height) return;
            const pixels = Math.max(16, Math.min(2048, Math.round(height * scale * window.devicePixelRatio)));
            if (pixels === target.firstElementChild?.height) return;
            const canvas = render(value, pixels);
            canvas.setAttribute('aria-hidden', 'true');
            target.replaceChildren(canvas);
        });
        node.append(frame);
        paintingObserver?.observe(frame);
    } else queueMicrotask(() => {
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
    if (!withTooltip) return node;
    node.addEventListener('mouseenter', show);
    if (plan) node.addEventListener('click', show);
    else node.addEventListener('focus', show);
    node.addEventListener('mouseleave', () => { if (document.activeElement !== node) hide(); });
    node.addEventListener('blur', hide);
    node.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
    return node;
}
window.addEventListener('scroll', () => { if (tooltip) tooltip.hidden = true; effectPopovers.clearHover(); }, true);
document.addEventListener('pointerdown', event => {
    effectPopovers.outside(event.target);
    if (active && !active.contains(event.target)) { tooltip.hidden = true; active = undefined; }
});
export function releasePaintingIcons(root) {
    effectPopovers.release(root);
    for (const frame of root.querySelectorAll('.PaintingIconFrame')) {
        if (active?.contains(frame)) { tooltip.hidden = true; active = undefined; }
        paintingObserver?.unobserve(frame);
    }
}
export function copyPaintingIconDrawers(source, destination) {
    const originals = source.querySelectorAll('.PaintingIconFrame');
    destination.querySelectorAll('.PaintingIconFrame').forEach((frame, index) => {
        paintingDrawers.set(frame, paintingDrawers.get(originals[index]));
        paintingPlans.set(frame, paintingPlans.get(originals[index]));
    });
}
export function drawPaintingIcons(root, scale) {
    for (const panel of root.querySelectorAll('.PaintingPanel')) drawCardIcons(panel, scale);
}
export function paintingIcons(values, kind, describe) {
    const row = el(undefined, 'CardIconSequence');
    for (const value of values) {
        if (kind === 'goal') {
            const condition = Object.fromEntries(Object.entries({ material: value.material, color: value.color })
                .filter(([, entry]) => entry !== null));
            const goal = icon(condition, describe(value), goalIconCanvas, null, goalIconPlan(condition));
            goal.dataset.goalCondition = JSON.stringify(condition);
            goal.setAttribute('role', 'button'); goal.tabIndex = -1;
            row.append(goal);
        } else {
            row.append(effectGraphic(value));
        }
    }
    return row;
}
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

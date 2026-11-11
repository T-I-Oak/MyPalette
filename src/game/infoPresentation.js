import { drawLaurel } from '../icons/laurel.js';
import { drawGlyphText, measureGlyphText } from '../icons/glyphs.js';
import { compactCountCharacters, creditAtRisk, flyerCounts, flyerFiles, flyerIconWidth, flyerImageSize, flyerReserveCycles, flyerReserveDuration, iconRunWidth, infoDayWidth, infoFormats, logoSize } from './infoLayout.js';
import './info.css';

function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function fameIcon(fame) {
    const canvas = element('canvas', 'InfoIcon');
    canvas.width = canvas.height = 100;
    const context = canvas.getContext('2d');
    const value = fame.toLocaleString('en-US', { useGrouping: false }).replace('-', '−');
    drawLaurel(context);
    drawGlyphText(context, value, 50, 50, Math.min(52, 56 / measureGlyphText(value, 1)), '#303e3b');
    return canvas;
}

function icon(kind) {
    const credit = kind === 'credit';
    const image = element('img', credit ? 'InfoIcon' : 'InfoFlyerIcon');
    image.src = `${import.meta.env.BASE_URL}assets/${credit ? 'icon-credit.webp' : flyerFiles[kind]}`;
    image.alt = '';
    if (!credit) {
        image.width = flyerImageSize.width;
        image.height = flyerImageSize.height;
    }
    image.draggable = false;
    return image;
}

function row(label, ...children) {
    const node = element('div', 'InfoRow');
    node.setAttribute('role', 'img');
    node.setAttribute('aria-label', label);
    node.append(...children);
    return node;
}

function animateIncrease(node, duration = 320) {
    node.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.35)', offset: .4 },
        { transform: 'scale(1)' },
    ], { duration, easing: 'ease-in-out' });
}

function run(kind, count, compact) {
    if (!count) return [];
    const node = element('span', 'InfoRun');
    node.style.width = `${iconRunWidth(count, compact, kind === 'credit' ? undefined : flyerIconWidth)}px`;
    for (let i = 0; i < (compact ? 1 : count); i++) node.append(icon(kind));
    if (kind !== 'credit') node.dataset.flyerKind = kind;
    if (compact) {
        const label = element('span', 'InfoCount', `x ${count}`);
        if (label.textContent.length > compactCountCharacters) {
            label.style.fontSize = `${16 * compactCountCharacters / label.textContent.length}px`;
        }
        node.append(label);
    }
    return [node];
}

function renderFlyers(node, value, width, source, ordering) {
    const { completed, missing } = infoFormats(value, width);
    const counts = flyerCounts(value);
    node.setAttribute('aria-label', `チラシ 完成済み ${counts[0]}枚、作成中 ${counts[1]}枚、未作成 ${counts[2]}枚`);
    node.replaceChildren(...run('completed', counts[0], completed),
        ...run('partial', counts[1], false), ...run('missing', counts[2], missing));
    if (source) node.querySelector(`[data-flyer-kind="${source}"] img`)?.classList.add('InfoFlyerSource');
    if (ordering) {
        const icons = node.querySelectorAll('[data-flyer-kind="completed"] img');
        for (const image of [...icons].slice(0, value.orderCost)) {
            image.style.animationDuration = `${flyerReserveDuration}ms`;
            image.style.animationIterationCount = String(flyerReserveCycles);
            image.classList.add('InfoFlyerOrdering');
        }
    }
}

function createCreditRow(reducedMotion) {
    const node = row('');
    node.classList.add('InfoCreditRow');
    let count, compact, icons, content, fading;
    const impacts = new Set();
    function target(index) { return compact ? content?.querySelector('.InfoCount') : icons?.[count - index - 1]; }
    function applyImpacts() {
        for (const index of impacts) target(index)?.classList.add('InfoCreditHit');
    }
    return {
        node,
        targetRect(index) { return target(index)?.getBoundingClientRect(); },
        impact(index) {
            impacts.add(index);
            applyImpacts();
        },
        clearImpacts() {
            impacts.clear();
            for (const item of node.querySelectorAll('.InfoCreditHit')) item.classList.remove('InfoCreditHit');
        },
        reset() {
            node.replaceChildren();
            count = undefined;
            impacts.clear();
        },
        update(value, abbreviated, risk) {
            if (value !== count || abbreviated !== compact) {
                if (value !== count) {
                    fading?.remove();
                    if (value < count && !impacts.size && (!compact || value === 0) && !reducedMotion.matches) {
                        fading = element('span', 'InfoRun InfoCreditFade');
                        fading.setAttribute('aria-hidden', 'true');
                        const lost = compact ? [...content.children] : icons.slice(value);
                        for (const item of lost) {
                            const copy = item.cloneNode(true);
                            copy.classList.remove('InfoCreditAtRisk');
                            fading.append(copy);
                        }
                        if (!compact) fading.style.left = `${iconRunWidth(value + 1, false) - iconRunWidth(1, false)}px`;
                        node.append(fading);
                        const effect = fading.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease-out' });
                        const layer = fading;
                        effect.finished.then(() => layer.remove(), () => layer.remove());
                    }
                    impacts.clear();
                }
                content?.remove();
                [content] = run('credit', value, abbreviated);
                if (content) node.prepend(content);
                icons = content ? [...content.querySelectorAll('img')] : [];
                if (value > count && !reducedMotion.matches) {
                    const gained = abbreviated ? [content.querySelector('.InfoCount')] : icons.slice(count);
                    for (const item of gained) animateIncrease(item);
                }
                count = value;
                compact = abbreviated;
                node.setAttribute('aria-label', `信用 ${count}`);
                applyImpacts();
            }
            const danger = risk > 0 && risk === count;
            for (const [index, image] of icons.entries()) {
                image.classList.toggle('InfoCreditAtRisk', compact ? danger : index >= count - risk);
                image.classList.toggle('InfoCreditDanger', danger);
            }
            if (risk) node.setAttribute('aria-description', danger ? '仕事を終了すると信用が0になります' : `仕事を終了すると信用が${risk}減ります`);
            else node.removeAttribute('aria-description');
        },
    };
}

export function createInfoPresentation(area, host) {
    const logo = element('img', 'InfoLogo');
    logo.src = `${import.meta.env.BASE_URL}assets/my-palette-logo.png`;
    logo.alt = 'My Palette';
    logo.width = logoSize.width;
    logo.height = logoSize.height;
    logo.draggable = false;
    const day = element('div', 'InfoRows InfoDay');
    day.style.width = `${infoDayWidth}px`;
    const dayLabel = element('div', 'InfoRow');
    const fameRow = row('');
    day.append(dayLabel, fameRow);
    const resources = element('div', 'InfoRows');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const creditRow = createCreditRow(reducedMotion);
    const flyerRow = row('');
    resources.classList.add('InfoResources');
    resources.append(creditRow.node, flyerRow);
    host.append(logo, day, resources);
    let state, signature, previousDay, previousFame, heldFlyers;
    function flyerRect(container, kind, last = false) {
        const images = container.querySelectorAll(`[data-flyer-kind="${kind}"] img`);
        const image = last ? images[images.length - 1] : images[0];
        if (image) return image.getBoundingClientRect();
        const rect = container.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: flyerIconWidth * area.layoutFrame.scale, height: rect.height };
    }
    return {
        creditTarget: creditRow.targetRect,
        impactCredit: creditRow.impact,
        clearCreditImpacts: creditRow.clearImpacts,
        reset() {
            state = undefined;
            heldFlyers = undefined;
            previousDay = previousFame = undefined;
            creditRow.reset();
        },
        holdFlyer(value, source) {
            const { flyers, progress, orderCost } = value;
            heldFlyers = { value: { flyers, progress, orderCost }, source };
            this.update();
            return () => flyerRect(flyerRow, source);
        },
        releaseFlyer() {
            heldFlyers = undefined;
            this.update();
        },
        flyerTarget(value, kind) {
            const probe = row('');
            probe.classList.add('InfoFlyerTarget');
            probe.setAttribute('aria-hidden', 'true');
            resources.append(probe);
            let width;
            return {
                read() {
                    if (width !== area.logicalWidth) {
                        width = area.logicalWidth;
                        renderFlyers(probe, value, width);
                    }
                    return flyerRect(probe, kind, true);
                },
                dispose() { probe.remove(); },
            };
        },
        present(value) {
            state = value;
            this.update();
        },
        update() {
            if (!state) return;
            if (state.day !== previousDay) {
                const label = element('span', '', `Day ${state.day}`);
                dayLabel.replaceChildren(label);
                if (state.day > previousDay && !reducedMotion.matches) animateIncrease(label, 480);
                previousDay = state.day;
            }
            if (state.fame !== previousFame) {
                const image = fameIcon(state.fame);
                fameRow.setAttribute('aria-label', `名声 ${state.fame}`);
                fameRow.replaceChildren(image);
                if (state.fame > previousFame && !reducedMotion.matches) animateIncrease(image);
                previousFame = state.fame;
            }
            const { credit } = infoFormats(state, area.logicalWidth);
            creditRow.update(state.credit, credit, creditAtRisk(state));
            const flyers = heldFlyers?.value ?? state;
            const ordering = state.dayEndRequest?.kind === 'reserve';
            const { completed, missing } = infoFormats(flyers, area.logicalWidth);
            const counts = flyerCounts(flyers);
            const next = JSON.stringify([...counts, completed, missing, heldFlyers?.source, ordering]);
            if (signature === next) return;
            signature = next;
            renderFlyers(flyerRow, flyers, area.logicalWidth, heldFlyers?.source, ordering);
        },
    };
}

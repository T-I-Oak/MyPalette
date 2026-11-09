import { MoveObject } from '../ui/areaTransition/index.js';
import { drawPaintingIcons, paintingIcons, releasePaintingIcons } from '../cardIcons.js';
import { goalGroups } from '../goalGroups.js';
import { cardMessages } from './cardMessages.js';
import { paintingBlock } from './paintingBlock.js';
import './card.css';

const make = (tag, className, text) => {
    const node = document.createElement(tag); if (tag === 'button') node.tabIndex = -1;
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
};
const artwork = (id, step, alt) => {
    const image = make('img', 'PaintingImage');
    image.src = `${import.meta.env.BASE_URL}assets/paintings/${id}-${step}.png`;
    image.alt = alt;
    image.draggable = false;
    return image;
};

function makeBack() {
    const back = make('div', 'PaintingBack');
    back.inert = true;
    back.innerHTML = '<svg viewBox="0 0 160 210" aria-hidden="true" fill="none" stroke="currentColor"><path d="M80 10 146 105 80 200 14 105Z M80 19 139 105 80 191 21 105Z"/><circle cx="80" cy="105" r="40"/><path stroke-width="2" d="M54 103c3-15 18-24 34-22 14 2 23 13 20 22-2 7-9 9-16 7-5-1-8 2-7 6 2 9-7 13-16 10-12-4-17-12-15-23Z"/><circle cx="93" cy="99" r="4"/><path d="M63 105h.1m4-10h.1m10-5h.1m10 1h.1" stroke-width="4" stroke-linecap="round"/></svg>';
    return back;
}

export class Card extends MoveObject {
    constructor(id, element = make('article', 'PaintingCard')) {
        super(id, element);
    }

    setPresentation(area, placement) {
        this.element.dataset.cardArea = area;
        this.element.classList.toggle('texture-ground-shadow', area === 'hand');
        const { x, y, angle } = placement;
        this.element.style.setProperty('--painting-x', x + 'px');
        this.element.style.setProperty('--painting-y', y + 'px');
        this.element.style.setProperty('--painting-tilt', angle + 'deg');
    }

    setBack() {
        this.element.classList.add('PaintingCardBackOnly');
        this.element.setAttribute('aria-hidden', 'true');
        this.element.replaceChildren(makeBack());
    }

    setFace(definition, currentStep, selectedStep, onSelect) {
        const text = cardMessages();
        const root = this.element;
        root.dataset.cardId = this.id;
        root.dataset.grade = this.id[0];
        const faces = make('div', 'PaintingFaces');
        const front = make('div', 'PaintingFront');
        const back = makeBack();

        const sheet = make('div', 'PaintingSheet');
        const header = make('div', 'PaintingName');
        const title = make('strong', 'PaintingTitle', definition.name);
        header.append(make('span', 'PaintingGrade', this.id[0]), title);
        queueMicrotask(() => {
            const available = title.clientWidth;
            const required = title.scrollWidth;
            if (available && required > available) {
                const size = parseFloat(getComputedStyle(title).fontSize);
                title.style.fontSize = (size * (available - 1) / required) + 'px';
            }
        });
        const art = make('div', 'PaintingArtwork');
        if (currentStep > 0) art.append(artwork(this.id, currentStep, definition.name));
        if (currentStep < 3) art.append(artwork(this.id, currentStep + 1, currentStep === 0 ? definition.name : ''));
        art.classList.toggle('state-incomplete', currentStep < 3);

        const tabs = make('div', 'PaintingTabs');
        tabs.setAttribute('role', 'tablist');
        tabs.setAttribute('aria-label', text.steps);
        const panel = make('div', 'PaintingPanel');
        panel.setAttribute('role', 'tabpanel');
        const labels = definition.steps.map((_, index) => 'Step ' + index);
        if (currentStep === 3) labels.push('Done');
        tabs.classList.toggle('has-completion', currentStep === 3);
        const buttons = labels.map((label, index) => {
            const tab = make('button', 'PaintingTab', label);
            tab.type = 'button';
            tab.setAttribute('role', 'tab');
            if (index === currentStep) tab.setAttribute('aria-current', 'step');
            tab.addEventListener('click', () => select(index));
            tabs.append(tab);
            return tab;
        });

        function block(kind, content) {
            return paintingBlock(kind, content, text[kind]);
        }
        function select(index) {
            releasePaintingIcons(panel);
            buttons.forEach((tab, i) => {
                tab.setAttribute('aria-selected', String(i === index));
            });
            panel.setAttribute('aria-label', buttons[index].textContent);
            panel.classList.toggle('state-current', index === currentStep);
            if (index === 3) {
                const completion = make('div', 'PaintingCompletion');
                const certificate = make('div', 'PaintingCertificate');
                const signature = make('span', 'PaintingAtelierSignature');
                signature.append(make('span', 'PaintingAtelierLabel', 'Atelier'), ' My Palette');
                certificate.append(
                    make('span', 'PaintingCertificateNumber', root.dataset.cardId),
                    make('strong', 'PaintingCertificateTitle', definition.name),
                    signature,
                );
                completion.append(certificate);
                panel.replaceChildren(completion);
                onSelect(index);
                return;
            }
            const step = definition.steps[index];
            const empty = () => {
                const node = make('span', 'PaintingEmpty', '—');
                node.setAttribute('aria-label', text.none);
                return node;
            };
            const groups = goalGroups(step.goals);
            const goals = make('div', 'PaintingGoals');
            goals.style.gridTemplateRows = groups.map(() => 'minmax(0, 1fr)').join(' 3px ');
            goals.style.setProperty('--goal-rows', groups.length || 1);
            groups.forEach((group, groupIndex) => {
                if (groupIndex) {
                    const separator = make('div', 'PaintingOr', 'or');
                    separator.setAttribute('aria-label', text.or);
                    goals.append(separator);
                }
                goals.append(paintingIcons(group, 'goal', text.describeGoal));
            });
            panel.replaceChildren(
                block('goal', groups.length ? goals : empty()),
                block('play', step.playEffects.length ? paintingIcons(step.playEffects, 'effect', text.describeEffect) : empty()),
                block('reward', step.achievementEffects.length ? paintingIcons(step.achievementEffects, 'effect', text.describeEffect) : empty()),
            );
            onSelect(index);
        }
        select(selectedStep);
        sheet.append(header, art, tabs, panel);
        front.append(sheet);
        faces.append(front, back);
        root.replaceChildren(faces);
    }

    setReveal(fromBack, toBack) {
        this.reveal = { fromBack, toBack };
    }

    render({ scale }) {
        drawPaintingIcons(this.element, scale);
    }

    onMoveFrame({ phase, progress }) {
        const faces = this.element.querySelector('.PaintingFaces');
        if (!faces || !this.reveal) return;
        const { fromBack, toBack } = this.reveal;
        const start = fromBack ? 180 : 0;
        const turns = fromBack === toBack ? 0 : 180;
        const angle = start + turns * (phase === 'cancelled' ? 0 : progress);
        faces.style.setProperty('--painting-flip', angle + 'deg');
    }
}

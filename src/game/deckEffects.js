import { Card } from './Card.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { animateProgress } from './playAnimation.js';
import { layoutDeck } from './deckLayout.js';
import { layoutHand } from './handLayout.js';
import { stockMetrics as m } from './stockLayout.js';
import { clampProgress as p } from './stockMotion.js';
import { deckTiming as t, planDeckDraws } from './deckMotion.js';
import { interpolateRect } from '../ui/areaTransition/geometry.js';

export function createDeckEffects(screen, presentation) {
    const deck = screen.areas.get('deck'), hand = screen.areas.get('hand');
    const root = deck.canvas.closest('.LayoutContent');
    let before = [], definitions, events = [], plan = [], actors = [], accepted = -1, shownCards = [];
    let controller = new AbortController(), enabled = false;
    function cancel() {
        controller.abort(); controller = new AbortController();
        for (const actor of actors) { screen.surface.removeMoving(actor); releasePaintingIcons(actor.element); }
        actors = []; events = []; plan = []; accepted = -1;
        root.classList.remove('state-deck-moving'); delete root.dataset.deckEffect;
        presentation.finish();
    }
    function rect(area, slot) {
        const value = area.readScreenRect({ ...slot, width: m.cardWidth, height: m.cardHeight });
        const origin = screen.surface.readViewportTransform();
        return { ...value, x: value.x + origin.x, y: value.y + origin.y };
    }
    function actorFor(card, fromDeck = true) {
        const component = new Card(card.id);
        component.setPresentation('deck', fromDeck ? presentation.placementFor(card.id) : { x: 0, y: 0, angle: 0 });
        component.setFace(definitions[card.id], card.step, card.step, () => {});
        component.element.dataset.deckMotionCard = card.id;
        const actor = component;
        const destination = root.querySelector(`.HandArea .PaintingCard[data-card-id="${card.id}"]`);
        actor.handPlacement = ['--painting-x', '--painting-y', '--painting-tilt']
            .map(name => ({ name, from: parseFloat(component.element.style.getPropertyValue(name)),
                value: parseFloat(destination.style.getPropertyValue(name)) }));
        actors.push(actor); return actor;
    }
    return {
        cancel,
        begin(state, cards) {
            cancel(); before = structuredClone(state.deck); definitions = cards;
            enabled = !matchMedia('(prefers-reduced-motion: reduce)').matches;
        },
        hasWork(records) {
            events = enabled ? structuredClone(records) : [];
            plan = planDeckDraws(before, events);
            shownCards = events.some(event => event.kind === 'deal') ? [] : before;
            return plan.length > 0;
        },
        present() {
            if (!plan.length) return;
            root.classList.add('state-deck-moving'); root.dataset.deckEffect = 'pending';
            presentation.show(shownCards);
        },
        acceptInitial(count) {
            const deal = events.find(event => event.kind === 'deal');
            if (deal && count !== accepted) {
                accepted = count; shownCards = deal.cards.slice(0, count); presentation.show(shownCards);
            }
        },
        async run(state) {
            if (!plan.length) return;
            const signal = controller.signal;
            root.dataset.deckEffect = 'running';
            const draws = plan.map((item, index) => ({ ...item, start: index * t.interval, actor: actorFor(item.card) }));
            const ids = new Set(draws.map(item => item.card.id));
            const retained = state.hand.filter(card => !ids.has(card.id)).map(card => ({ card, actor: actorFor(card, false) }));
            let shown = -1;
            try {
                await animateProgress((draws.length - 1) * t.interval + t.lift + t.flip + t.flight, progress => {
                    const time = progress * ((draws.length - 1) * t.interval + t.lift + t.flip + t.flight);
                    const started = draws.filter(item => time >= item.start).length;
                    if (started !== shown) {
                        shown = started; shownCards = draws[started - 1].deck.slice(1); presentation.show(shownCards);
                    }
                    const slots = layoutHand(hand.logicalWidth, hand.logicalHeight, state.hand.length);
                    for (const { card, actor } of retained) {
                        actor.element.dataset.cardArea = 'hand';
                        for (const { name, value } of actor.handPlacement) actor.element.style.setProperty(name,
                            value + (name.endsWith('tilt') ? 'deg' : 'px'));
                        actor.element.style.visibility = hand.layoutFrame.drawable ? '' : 'hidden';
                        const target = rect(hand, slots[state.hand.findIndex(item => item.id === card.id)]);
                        screen.surface.renderMoving(actor, target, target.width / m.cardWidth);
                    }
                    for (const item of draws) {
                        const { actor, start } = item;
                        if (time < start || !deck.layoutFrame.drawable || !hand.layoutFrame.drawable) {
                            actor.element.style.visibility = 'hidden'; continue;
                        }
                        actor.element.style.visibility = '';
                        const elapsed = time - start;
                        const slot = layoutDeck(deck.logicalWidth, deck.logicalHeight);
                        slot.y -= (item.deck.length - 1) * m.thickness + m.lift * p(elapsed, 0, t.lift);
                        const flight = p(elapsed, t.lift + t.flip, t.flight);
                        const destination = slots[state.hand.findIndex(card => card.id === item.card.id)];
                        const target = interpolateRect(rect(deck, slot), rect(hand, destination), flight);
                        actor.element.dataset.cardArea = flight === 1 ? 'hand' : 'deck';
                        for (const { name, from, value } of actor.handPlacement) actor.element.style.setProperty(name,
                            (from + (value - from) * flight) + (name.endsWith('tilt') ? 'deg' : 'px'));
                        actor.element.querySelector('.PaintingFaces').style.setProperty('--painting-flip', `${180 * (1 - p(elapsed, t.lift, t.flip))}deg`);
                        screen.surface.renderMoving(actor, target, target.width / m.cardWidth);
                        actor.element.parentElement.style.zIndex = String(100 + draws.length - draws.indexOf(item));
                    }
                }, signal);
            } finally { if (controller.signal === signal) cancel(); }
        },
    };
}

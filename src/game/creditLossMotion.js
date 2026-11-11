import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { animateProgress } from './playAnimation.js';

const flightDuration = 170;
const fragmentDuration = 180;
const fragmentCount = 6;

function center(rect) {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

async function scatter(surface, id, readTarget, signal) {
    const burst = document.createElement('div');
    burst.className = 'CreditFragments';
    const pieces = Array.from({ length: fragmentCount }, () => document.createElement('span'));
    burst.append(...pieces);
    const object = new MoveObject(`credit-fragments:${id}`, burst);
    try {
        await animateProgress(fragmentDuration, progress => {
            const rect = readTarget(), point = center(rect), size = rect.height;
            surface.renderMoving(object, { x: point.x - size / 2, y: point.y - size / 2, width: size, height: size });
            const spread = (1 - (1 - progress) ** 2) * size;
            for (const [index, piece] of pieces.entries()) {
                const angle = index * 2 * Math.PI / fragmentCount + .15;
                const distance = spread * (.65 + (index % 3) * .18);
                piece.style.width = piece.style.height = `${Math.max(2, size * .11)}px`;
                piece.style.transform = `translate(${Math.cos(angle) * distance}px,${Math.sin(angle) * distance}px) rotate(${index * 24 + progress * 110}deg)`;
                piece.style.opacity = String(1 - progress);
            }
        }, signal);
    } finally { surface.removeMoving(object); }
}

export async function animateCreditLoss(screen, palette, info, diceIds, credit, signal) {
    await Promise.all(diceIds.map(async (id, index) => {
        if (index && !await animateProgress(Math.min(120, index * 40), () => {}, signal)) return;
        const slot = Math.min(index, credit - 1);
        const readTarget = () => info.creditTarget(slot);
        const capture = palette.captureMaterial(id);
        const object = new MoveObject(`credit-flight:${id}`, capture.element);
        object.element.dataset.creditFlight = id;
        capture.start();
        let arrived;
        try {
            arrived = await animateProgress(flightDuration, progress => {
                const source = capture.read(), target = center(readTarget()), travel = progress ** 1.35;
                const size = source.size * (1 - .35 * progress);
                const x = source.x + (target.x - source.x) * travel;
                const y = source.y + (target.y - source.y) * travel;
                screen.surface.renderMoving(object, { x: x - size / 2, y: y - size / 2, width: size, height: size });
            }, signal);
        } finally { screen.surface.removeMoving(object); }
        if (!arrived || signal.aborted) return;
        info.impactCredit(slot);
        await scatter(screen.surface, id, readTarget, signal);
    }));
}

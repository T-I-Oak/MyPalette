import { MoveObject } from '../ui/areaTransition/MoveObject.js';
import { createCardScene } from './cardScene.js';
import { createPlayPresentation } from './playPresentation.js';
import './layoutGame.css';
import './sceneComparison.css';

// Keep the normal scene's model, poses, frame drawing and layout subscription.
// The synchronous engine supplies final snapshots instead of a staged timeline.
export function createSceneComparison(screen) {
    const area = screen.areas.get('play');
    const host = document.createElement('div');
    host.className = 'GameAreaHost';
    const object = new MoveObject('comparison:play', host);
    const place = () => area.setSlot(object.id, { x: 0, y: 0, width: area.logicalWidth, height: area.logicalHeight });
    place();
    area.place(object, object.id);
    const play = createPlayPresentation(area, host, () => screen.render());
    const cards = createCardScene(screen, play);
    play.bindScene(cards);
    cards.inspect(() => {});
    let preparing = false, draws = 0, moves = 0, controlsRoot;
    const labels = [...screen.areas.values()].map(owner => owner.fixedLayer.querySelector('.LayoutAreaName'));
    for (const id of ['info', 'palette', 'hand']) screen.areas.get(id).fixedLayer.querySelector('.LayoutAreaName').hidden = true;
    function layoutControls() {
        if (!controlsRoot) return;
        for (const node of controlsRoot.querySelectorAll('[data-comparison-area]')) {
            const owner = screen.areas.get(node.dataset.comparisonArea), frame = owner.layoutFrame;
            node.hidden = !frame.visible;
            Object.assign(node.style, { left: `${frame.rect.x}px`, top: `${frame.rect.y}px`,
                width: `${frame.rect.width / frame.fixedScale}px`, height: `${frame.rect.height / frame.fixedScale}px`,
                transform: `scale(${frame.fixedScale})` });
            for (const row of node.querySelectorAll('[data-card-id]')) {
                const matrix = cards.poseFor(row.dataset.cardId).matrix;
                row.style.left = `${(matrix[12] + 147 * matrix[0] - frame.rect.x) / frame.fixedScale}px`;
            }
        }
    }
    cards.onDraw(() => { draws++; });
    const unsubscribe = screen.subscribe(() => {
        place();
        if (preparing) return;
        play.update();
        cards.update();
        layoutControls();
    });
    function field(state) {
        const section = document.createElement('section');
        const content = document.createElement('div');
        content.className = 'GameCardAreaContent';
        for (const card of state.field) {
            const slot = document.createElement('div');
            slot.className = 'GameCardSlot';
            const actions = document.createElement('div');
            actions.className = 'GameCardActions';
            slot.append(actions);
            content.append(slot);
        }
        section.append(content);
        return section;
    }
    return {
        renderControls(root, state) {
            controlsRoot = root;
            for (const [id, name] of [['deck', 'デッキ'], ['discard', '捨て札']]) {
                screen.areas.get(id).fixedLayer.querySelector('.LayoutAreaName').textContent = `${name} ${state[id].length}枚`;
            }
            layoutControls();
        },
        resources: () => ({ mode: 'normal-scene-sync-engine', sceneCards: cards.model?.cards.size ?? 0,
            sceneDraws: draws, sceneMoves: moves, canvases: document.querySelectorAll('canvas').length }),
        initialize(definitions, state) {
            preparing = true;
            cards.initialize(definitions, state);
            play.present(field(state), state);
            play.begin();
            play.finish();
            preparing = false;
            cards.update();
        },
        async present(state) {
            preparing = true;
            cards.adopt(state);
            play.present(field(state), state);
            preparing = false;
            cards.busy = true;
            try {
                moves++;
                await cards.move(state, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420, 'comparison-action');
            } finally {
                cards.busy = false;
                cards.update();
            }
        },
        dispose() {
            unsubscribe();
            cards.dispose();
            play.dispose();
            object.area.remove(object);
            for (const label of labels) label.hidden = false;
        },
    };
}

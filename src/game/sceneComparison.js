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
    let preparing = false, draws = 0, moves = 0;
    cards.onDraw(() => { draws++; });
    const unsubscribe = screen.subscribe(() => {
        place();
        if (preparing) return;
        play.update();
        cards.update();
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
        },
    };
}

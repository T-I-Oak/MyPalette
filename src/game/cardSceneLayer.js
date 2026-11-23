export function cardSceneLayer(area, moving) {
    return moving ? 'moving' : ['stock', 'discard', 'deck'].includes(area) ? 'panel' : 'main';
}

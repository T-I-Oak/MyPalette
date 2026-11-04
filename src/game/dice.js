import { COLORS, MATERIALS, COLOR_PAIR_COLORS } from '../effectCatalog.js';

export function shuffle(items, random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
export const roll = (die, random) => { die.current = Math.floor(random() * 6); };
export const currentFace = die => die.faces[die.current];
export function initialFaces(random) {
    const colors = shuffle(COLORS, random);
    const materials = shuffle([0, 0, 1, 1, 2, 2], random);
    return [0, 1, 2].map(offset => shuffle(colors.map((color, i) =>
        ({ color, material: MATERIALS[(materials[i] + offset) % 3] })), random));
}
export function normalCandidates(random) {
    const faces = shuffle(COLORS.flatMap(color => MATERIALS.map(material => ({ color, material }))), random);
    return [0, 6, 12].map(start => faces.slice(start, start + 6));
}
export function specifiedFaces(effect) {
    if (effect.type === 'gainColorDice') return COLOR_PAIR_COLORS[effect.colors]
        .flatMap(color => MATERIALS.map(material => ({ color, material })));
    return COLORS.map(color => ({ color, material: effect.material }));
}

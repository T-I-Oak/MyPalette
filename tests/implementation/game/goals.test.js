import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingDice, satisfiesSelection } from '../../../src/game/goals.js';
import { initialFaces, normalCandidates } from '../../../src/game/dice.js';

const die = (id, color, material, used = false) => ({ id, faces: [{ color, material }], current: 0, used });
test('AND uses distinct unused dice; OR alternatives and exact selections', () => {
    const goals = [{ color: 'red', material: null }, { color: 'red', material: null },
        { color: null, material: 'brush', join: 'or' }];
    const dice = [die('a', 'red', 'pastel'), die('b', 'red', 'airbrush'), die('c', 'blue', 'brush')];
    assert.deepEqual(matchingDice(goals, dice), ['a', 'b']);
    assert.equal(satisfiesSelection(goals, dice, ['c']), true);
    assert.equal(satisfiesSelection(goals, dice, ['a', 'a']), false);
    assert.equal(satisfiesSelection(goals, dice, ['a', 'b', 'c']), false);
    dice[0].used = true; dice[2].faces = [{ special: 'fame1' }];
    assert.equal(matchingDice(goals, dice), null);
    assert.equal(satisfiesSelection(goals, dice, ['a', 'b']), false);
});
test('initial dice cover all pairs, each with six colors and two of each material', () => {
    const faces = initialFaces(() => .37);
    assert.equal(new Set(faces.flat().map(f => `${f.color}/${f.material}`)).size, 18);
    for (const die of faces) {
        assert.equal(new Set(die.map(f => f.color)).size, 6);
        for (const material of ['brush', 'pastel', 'airbrush']) assert.equal(die.filter(f => f.material === material).length, 2);
    }
    const candidates = normalCandidates(() => .71);
    assert.deepEqual(candidates.map(f => f.length), [6, 6, 6]);
    assert.equal(new Set(candidates.flat().map(f => `${f.color}/${f.material}`)).size, 18);
});

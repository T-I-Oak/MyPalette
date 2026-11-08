import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../../src/game/engine.js';

test('消費済みへの遷移と効果発動を分離し、描画待機中の他操作を拒否する', () => {
    const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url), 'utf8'));
    const game = new Game(settings, () => .4);
    const card = game.state.hand[0];
    game.definitions[card.id].steps[0].playEffects = [];
    game.definitions[card.id].steps[0].goals = [{ color: 'yellow', material: null }];
    game.definitions[card.id].steps[0].achievementEffects = [{ type: 'changeFame', amount: 1 }];
    game.play(card.id);
    const die = game.state.dice[0]; die.faces[die.current] = { color: 'yellow', material: 'brush' };
    const fame = game.state.fame;
    game.beginAchievement(card.id, [die.id]);
    assert.equal(die.used, true); assert.equal(game.state.fame, fame);
    assert.equal(card.step, 0); assert.ok(game.state.field.includes(card));
    assert.throws(() => game.endDay());
    game.completeAchievement();
    assert.equal(game.state.fame, fame + 1); assert.equal(card.step, 1);
    assert.ok(game.state.discard.includes(card)); assert.equal(game.state.achievement, null);
});

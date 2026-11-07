import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../../src/game/engine.js';
const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url), 'utf8'));
const make = () => new Game(settings, () => .4);
test('initial setup, cloned definitions and day start', () => {
    const game = make(), s = game.state;
    assert.equal(s.day, 1); assert.equal(s.credit, 3); assert.equal(s.hand.length, 4);
    assert.equal(s.deck.length, 3); assert.equal(s.stocks.A.length, 8);
    assert.equal(s.dice.length, 3); assert.equal(s.rerolls, 1);
    s.hand[0].step = 2;
    assert.equal(settings.cards[0].step, undefined);
});
test('effect sequence pauses, blocks unrelated actions, validates choices and resumes', () => {
    const game = make(), s = game.state;
    game.run(game.effects([{ type: 'changeColor', color: 'red' }, { type: 'changeFame', amount: 7 }]));
    assert.equal(s.pending.kind, 'dice'); assert.equal(s.fame, 0);
    assert.throws(() => game.play(s.hand[0].id));
    assert.throws(() => game.endDay());
    assert.throws(() => game.choose(['missing']));
    game.choose([s.dice[0].id]);
    assert.equal(s.dice[0].faces[s.dice[0].current].color, 'red');
    assert.equal(s.fame, 7); assert.equal(s.pending, null);
});
test('achievement consumes before effects, updates steps and ships with increased credit', () => {
    const game = make(), s = game.state, card = s.hand.pop();
    card.step = 2; s.field = [card];
    game.definitions[card.id].steps[2] = { goals: [{ color: 'red', material: null }], playEffects: [],
        achievementEffects: [{ type: 'discardDice', count: 1 }] };
    s.dice[0].faces[s.dice[0].current] = { color: 'red', material: 'brush' };
    game.achieve(card.id, [s.dice[0].id]);
    assert.equal(s.dice[0].used, true); assert.equal(card.step, 2);
    game.choose([s.dice[0].id]);
    assert.equal(card.step, 3); assert.equal(s.shipped.length, 1); assert.equal(s.credit, 4);
});
test('turn end consumes specials then two flyer dice, reduces credit and removes temporary dice', () => {
    const game = make(), s = game.state;
    s.discard.push(...s.hand.splice(0));
    s.dice[0].faces[s.dice[0].current] = { special: 'fame1' };
    s.dice.push({ ...structuredClone(s.dice[1]), id: 'extra', lifetime: 'temporary' });
    game.endDay();
    assert.equal(s.phase, 'betweenDays'); assert.equal(s.credit, 2);
    assert.equal(s.flyers, 1); assert.equal(s.progress, 0); assert.equal(s.dice.length, 3);
    assert.equal(s.reserved.length, 1); assert.equal(s.rerolls, 0);
    assert.equal(s.dayEndDice.length, 4);
    assert.equal(s.dayEndDice.at(-1).id, 'extra');
    assert.equal(s.dayEndDice.at(-1).used, false);
    assert.equal(s.dayEndDice[0].used, true);
    game.nextDay(); assert.equal(s.fame, 1); assert.equal(s.day, 2);
    assert.equal(s.dayEndDice, null);
});
test('normal multi acquisition waits for all candidates before rolling and adding', () => {
    const accepted = [];
    const game = new Game(settings, () => .4, { onCandidateAcquired: id => accepted.push(id) });
    const s = game.state;
    game.run(game.effects([{ type: 'gainNormalDice', count: 2, lifetime: 'temporary' }]));
    game.choose(['0']); assert.equal(s.dice.length, 3);
    assert.equal(accepted.length, 1);
    game.choose(['2']); assert.equal(s.dice.length, 5);
    assert.deepEqual(accepted, s.dice.slice(3).map(die => die.id));
    assert.equal(s.dice.at(-1).used, false);
});
test('empty stock exchange returns then exposes same card, resetting step', () => {
    const game = make(), s = game.state;
    s.stocks = { A: [], B: [], C: [] }; s.public = { A: null, B: null, C: null };
    s.hand = [s.hand[0]]; const card = s.hand[0]; card.step = 2;
    game.run(game.effects([{ type: 'exchangeCards', count: 1 }]));
    game.choose([card.id]); assert.equal(s.public.A, card.id);
    game.choose([card.id]); assert.equal(s.hand.length, 1); assert.equal(card.step, 0);
});
test('flyer ordering consumes flyers with empty stocks when credit remains', () => {
    const game = make(), s = game.state;
    s.hand = []; s.stocks = { A: [], B: [], C: [] }; s.public = { A: null, B: null, C: null };
    s.flyers = 2; s.progress = 1;
    game.endDay();
    assert.equal(s.flyers, 0); assert.equal(s.orderCost, 5); assert.equal(s.progress, 1);
    assert.equal(s.credit, 2); assert.equal(s.phase, 'betweenDays'); assert.equal(s.pending, null);
});
test('flyer ordering keeps flyers with empty stocks when credit reaches zero', () => {
    const game = make(), s = game.state;
    s.hand = []; s.stocks = { A: [], B: [], C: [] }; s.public = { A: null, B: null, C: null };
    s.flyers = 2; s.progress = 1; s.credit = 1;
    s.dice.push({ ...structuredClone(s.dice[0]), id: 'four' });
    game.endDay();
    assert.equal(s.flyers, 3); assert.equal(s.orderCost, 3); assert.equal(s.progress, 1);
    assert.equal(s.credit, 0); assert.equal(s.phase, 'finished'); assert.equal(s.pending, null);
});

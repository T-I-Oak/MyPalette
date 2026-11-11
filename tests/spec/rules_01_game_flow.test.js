import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game, gameIssues } from '../../src/game/engine.js';
import { matchingDice } from '../../src/game/goals.js';
const settings = JSON.parse(readFileSync(new URL('../../public/data/cards.json', import.meta.url), 'utf8'));
function random(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; }; }
test('1.3 legal fixed-seed action sequences reach an ending without losing or duplicating cards/dice', () => {
    for (const seed of [1, 15, 76, 392, 1024]) {
        const game = new Game(settings, random(seed)), s = game.state;
        let actions = 0;
        while (s.phase !== 'finished' && actions++ < 5000) {
            const cards = [...s.deck, ...s.hand, ...s.field, ...s.discard, ...s.shipped, ...Object.values(s.stocks).flat()];
            assert.equal(cards.length, 45); assert.equal(new Set(cards.map(c => c.id)).size, 45);
            assert.equal(new Set(s.dice.map(d => d.id)).size, s.dice.length);
            for (const grade of ['A', 'B', 'C']) if (s.public[grade]) assert.equal(s.public[grade], s.stocks[grade][0].id);
            if (s.pending) { game.choose(s.pending.options.slice(0, s.pending.min).map(o => o.id)); continue; }
            if (s.phase === 'betweenDays') { game.nextDay(); continue; }
            const achievable = s.field.find(c => matchingDice(game.step(c).goals, s.dice));
            if (achievable) { game.achieve(achievable.id, matchingDice(game.step(achievable).goals, s.dice)); continue; }
            if (s.hand.length >= 2) { game.play(s.hand[0].id); continue; }
            if (s.rerolls && s.dice.some(d => !d.used)) { game.reroll(); continue; }
            game.endDay();
        }
        assert.equal(s.phase, 'finished', `seed ${seed}, ${s.day} days, ${actions} actions`);
        assert.equal(s.credit, 0); assert.ok(s.day > 1);
    }
});
test('1.3 ending is optional even with remaining hand cards and achievable field cards', () => {
    for (const hasFieldCard of [false, true]) {
        const game = new Game(settings, random(4)), s = game.state;
        if (hasFieldCard) {
            const card = s.hand.shift(); s.field.push(card);
            game.definitions[card.id].steps[0].goals = [{ color: null, material: s.dice[0].faces[s.dice[0].current].material }];
            assert.ok(matchingDice(game.step(card).goals, s.dice));
        }
        assert.ok(s.hand.length >= 2);
        game.endDay();
        assert.equal(s.phase, 'betweenDays'); assert.equal(s.hand.length, 0); assert.equal(s.field.length, 0);
        assert.equal(s.discard.length, 4); assert.equal(s.credit, 2);
    }
});
test('1.3 third shipment increases credit without granting dice or requesting a reward choice', () => {
    const game = new Game(settings, random(10)), s = game.state;
    s.shipped.push(...s.hand.splice(0, 2)); s.shipped.forEach(c => { c.step = 3; });
    const card = s.hand.pop(); card.step = 2; s.field.push(card);
    game.definitions[card.id].steps[2] = { goals: [{ color: null, material: s.dice[0].faces[s.dice[0].current].material }], playEffects: [], achievementEffects: [] };
    game.achieve(card.id, [s.dice[0].id]);
    assert.equal(s.shipped.length, 3); assert.equal(s.credit, 4);
    assert.equal(s.pending, null); assert.equal(s.dice.length, 3);
    assert.equal(s.phase, 'play');
});
test('1.3 refresh rotates public cards, including replacements exposed after acquisition', () => {
    const game = new Game(settings, random(3)), s = game.state;
    const oldA = s.public.A, newB = s.stocks.B[1].id;
    const afterRefreshB = s.stocks.B[2].id;
    game.run(game.effects([{ type: 'gainStockCards', count: 1 }])); game.choose([s.public.B]);
    assert.equal(s.public.B, newB);
    s.discard.push(...s.hand.splice(0)); s.dice.forEach(d => { d.used = true; });
    game.endDay();
    assert.equal(s.stocks.A.at(-1).id, oldA);
    assert.equal(s.stocks.B.at(-1).id, newB);
    assert.equal(s.public.B, null);
    assert.equal(s.stocks.B[0].id, afterRefreshB);
    game.nextDay();
    assert.equal(s.public.B, afterRefreshB);
});
test('1.3 flyer ordering proceeds when flyer dice are consumed and credit remains', () => {
    const game = new Game(settings, random(9)), s = game.state;
    s.discard.push(...s.hand.splice(0)); s.flyers = 2; s.progress = 1; s.credit = 2;
    game.endDay(); assert.equal(s.phase, 'end'); assert.equal(s.pending.kind, 'stock');
    assert.equal(s.orderCost, 5); assert.equal(s.flyers, 0); assert.equal(s.progress, 1); assert.equal(s.credit, 1);
    const chosen = s.public.C; game.choose([chosen]); assert.equal(s.discard.some(c => c.id === chosen), true);
    assert.equal(s.credit, 1); assert.equal(s.progress, 1);
    game.nextDay(); s.discard.push(...s.hand.splice(0)); s.flyers = 4;
    const specialDie = game.makeDie(Array.from({ length: 6 }, () => ({ special: 'draw1' })), 'temporary');
    s.dice[0].used = true; s.dice.push(specialDie);
    game.endDay(); assert.equal(s.orderCost, 7); game.choose([s.public.A]); assert.equal(s.progress, 1);
    assert.equal(s.credit, 1); assert.equal(s.reserved.length, 1);
});
test('1.3 game over consumes reserved flyers and skips stock acquisition', () => {
    const game = new Game(settings, random(9)), s = game.state;
    s.flyers = 2; s.progress = 1; s.credit = 1;
    const publicCards = { ...s.public };
    assert.ok(publicCards.C);

    game.endDay();

    assert.equal(s.phase, 'finished'); assert.equal(s.credit, 0); assert.equal(s.pending, null);
    assert.equal(s.flyers, 0); assert.equal(s.progress, 1); assert.equal(s.orderCost, 5);
    assert.deepEqual(s.public, publicCards); assert.equal(s.discard.length, 0);
});
test('1.3 temporary specials reserve before removal and trigger after next day draw/roll', () => {
    const game = new Game(settings, random(8)), s = game.state;
    s.discard.push(...s.hand.splice(0));
    const die = game.makeDie(Array.from({ length: 6 }, () => ({ special: 'draw1' })), 'temporary'); s.dice.push(die);
    s.dice.slice(0, 3).forEach(d => { d.used = true; });
    game.endDay(); assert.equal(s.dice.includes(die), false); assert.equal(s.reserved.length, 1);
    game.nextDay(); assert.equal(s.hand.length, 5); assert.equal(s.reserved.length, 0);
});
test('incomplete settings explain card/step and are never repaired or mutated', () => {
    const incomplete = structuredClone(settings); incomplete.cards[0].steps[1].goals = [];
    incomplete.cards[1].steps[2].playEffects = [{ type: 'changeColor', color: null }];
    const original = JSON.stringify(incomplete);
    assert.ok(gameIssues(incomplete).some(issue => issue.includes('A01') && issue.includes('ステップ1')));
    assert.ok(gameIssues(incomplete).some(issue => issue.includes('A02') && issue.includes('ステップ2')));
    assert.throws(() => new Game(incomplete)); assert.equal(JSON.stringify(incomplete), original);
});

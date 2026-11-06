import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../src/game/engine.js';
import { specialEffects } from '../../src/game/effects.js';
import { SPECIAL_FACES, SPECIAL_FACE_EFFECTS } from '../../src/effectCatalog.js';
const settings = JSON.parse(readFileSync(new URL('../../public/data/cards.json', import.meta.url), 'utf8'));
const make = () => new Game(settings, () => .51);
test('7.2 fame can decrease, 7.3 draw reshuffles discard and stops when exhausted', () => {
    const game = make(), s = game.state;
    s.discard.push(...s.hand.splice(0));
    game.run(game.effects([{ type: 'changeFame', amount: -3 }, { type: 'drawCards', count: 99 }]));
    assert.equal(s.fame, -3); assert.equal(s.hand.length, 7); assert.equal(s.deck.length, 0); assert.equal(s.discard.length, 0);
});
test('7.3 stock acquisition immediately exposes the next card and stops when stocks are empty, step is absolute', () => {
    const game = make(), s = game.state;
    const stockIds = Object.values(s.stocks).flat().map(card => card.id);
    game.run(game.effects([{ type: 'gainStockCards', count: stockIds.length + 1 }, { type: 'changeCardStep', step: 2 }]));
    for (const id of stockIds) {
        const grade = id[0];
        assert.equal(s.public[grade], id);
        game.choose([id]);
        assert.equal(s.public[grade], s.stocks[grade][0]?.id ?? null);
    }
    assert.deepEqual(s.discard.map(card => card.id), stockIds);
    const card = s.hand[0]; game.choose([card.id]); assert.equal(card.step, 2);
    game.run(game.effects([{ type: 'changeCardStep', step: 0 }])); game.choose([card.id]); assert.equal(card.step, 0);
    s.hand = []; game.run(game.effects([{ type: 'changeCardStep', step: 1 }, { type: 'exchangeCards', count: 2 }]));
    assert.equal(s.pending, null);
});
test('7.3 sequential exchanges preserve hand count and put returns at bottom', () => {
    const game = make(), s = game.state, returned = s.hand[0]; returned.step = 2;
    const first = s.public.B;
    game.run(game.effects([{ type: 'exchangeCards', count: 2 }]));
    game.choose([returned.id]); assert.equal(s.stocks.A.at(-1), returned); assert.equal(returned.step, 0);
    game.choose([first]); assert.equal(s.hand.length, 4);
    game.choose([first]); assert.equal(s.public.B, s.stocks.B[0].id);
    game.choose([s.public.C]); assert.equal(s.hand.length, 4); assert.equal(s.pending, null);
});
test('7.4 special snapshot preserves duplicates, prescribed order and excludes used dice', () => {
    const game = make(), s = game.state;
    const makeDie = (special, used = false) => ({ ...game.makeDie(Array.from({ length: 6 }, () => ({ special })), 'temporary'), used });
    s.dice = [makeDie('temporaryNormal1'), makeDie('draw1'), makeDie('fame1'), makeDie('reroll1'), makeDie('fame1'), makeDie('fame1', true)];
    assert.deepEqual(specialEffects(s.dice).map(e => e.type), ['changeFame', 'changeFame', 'gainRerolls', 'drawCards', 'gainNormalDice']);
    game.run(game.effects([{ type: 'activateSpecialFaces' }]));
    assert.equal(s.fame, 2); assert.equal(s.rerolls, 2); assert.equal(s.hand.length, 5);
    s.dice.push(makeDie('fame1'));
    game.choose(['0']); assert.equal(s.fame, 2); assert.equal(s.pending, null);
    assert.equal(s.dice[0].used, false);
});
test('7.4 all ten special faces execute their defined effects', () => {
    for (const special of SPECIAL_FACES) {
        const game = make(), s = game.state;
        s.dice = [game.makeDie(Array.from({ length: 6 }, () => ({ special })), 'permanent')];
        game.run(game.effects([{ type: 'activateSpecialFaces' }]));
        if (s.pending) game.choose(['0']);
        const effect = SPECIAL_FACE_EFFECTS[special];
        if (effect.type.startsWith('gain') && effect.type !== 'gainRerolls') {
            assert.equal(s.dice.length, 2); assert.equal(s.dice[1].lifetime, 'temporary');
        } else if (special === 'fame1') assert.equal(s.fame, 1);
        else if (special === 'draw1') assert.equal(s.hand.length, 5);
        else assert.equal(s.rerolls, 2);
    }
});

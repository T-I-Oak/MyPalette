import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../src/game/engine.js';
import { serializeDocument, readDocument } from '../../src/cardData.js';
const settings = JSON.parse(readFileSync(new URL('../../public/data/cards.json', import.meta.url), 'utf8'));

test('6.6 永続・一時の全使用済みダイスを出目を変えず再利用し、選択とリロールを行わない', () => {
    const game = new Game(settings, () => .23);
    game.state.dice[0].used = true;
    game.state.dice[1].used = true;
    game.state.dice[1].lifetime = 'temporary';
    game.state.dice[1].faces[game.state.dice[1].current] = {special:'fame1'};
    const expected = structuredClone(game.state.dice).map(die => ({...die, used:false}));
    const rerolls = game.state.rerolls;
    game.random = () => { throw new Error('再利用で乱数を使わない'); };
    game.run(game.effects([{type:'refreshDice'}]));
    assert.deepEqual(game.state.dice, expected);
    assert.equal(game.state.rerolls, rerolls);
    assert.equal(game.state.pending, null);
    game.run(game.effects([{type:'refreshDice'}]));
    assert.deepEqual(game.state.dice, expected);
    game.state.dice = [];
    game.run(game.effects([{type:'refreshDice'}]));
    assert.deepEqual(game.state.dice, []);
});
test('6.6 再利用効果をカードのプレイ時・達成時に保存し再読込みできる', () => {
    const edited = structuredClone(settings);
    for (const key of ['playEffects','achievementEffects']) edited.cards[0].steps[0][key] = [{type:'refreshDice'}];
    const restored = readDocument(serializeDocument(edited));
    assert.deepEqual(restored.cards[0].steps[0], edited.cards[0].steps[0]);
});

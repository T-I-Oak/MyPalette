import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../src/game/engine.js';
import { currentFace } from '../../src/game/dice.js';
import { SPECIAL_FACES } from '../../src/effectCatalog.js';
const settings = JSON.parse(readFileSync(new URL('../../public/data/cards.json', import.meta.url), 'utf8'));
const make = () => new Game(settings, () => .23);
const effect = (game, item) => game.run(game.effects([item]));

test('6.2 通常ダイスの全候補へ獲得効果の所持期間を渡し、選択後も維持する', () => {
    for (const lifetime of ['temporary', 'permanent']) {
        const game = make();
        effect(game, {type:'gainNormalDice', count:1, lifetime});
        assert.equal(game.state.pending.kind, 'candidates');
        assert.ok(game.state.pending.options.length > 0);
        for (const option of game.state.pending.options) {
            assert.equal(option.lifetime, lifetime);
            assert.equal(option.faces.length, 6);
        }
        const chosen = game.state.pending.options[0];
        game.choose([chosen.id]);
        assert.equal(game.state.dice.at(-1).lifetime, lifetime);
        assert.deepEqual(game.state.dice.at(-1).faces, chosen.faces);
    }
});
test('6.2 specified dice have exact six faces and lifetime, are rolled unused', () => {
    const game = make(), s = game.state;
    effect(game, { type: 'gainColorDice', count: 2, colors: 'orange_blue', lifetime: 'temporary' });
    for (const die of s.dice.slice(3)) {
        assert.equal(die.lifetime, 'temporary'); assert.equal(die.used, false);
        assert.deepEqual([...new Set(die.faces.map(f => f.color))], ['orange', 'blue']);
        assert.equal(new Set(die.faces.map(f => f.color + f.material)).size, 6);
    }
    effect(game, { type: 'gainMaterialDice', count: 1, material: 'pastel', lifetime: 'permanent' });
    assert.equal(s.dice.at(-1).faces.every(f => f.material === 'pastel'), true);
    assert.equal(new Set(s.dice.at(-1).faces.map(f => f.color)).size, 6);
});
test('6.3 ticket rerolls accept only one or all unused, immediate accepts any nonempty subset', () => {
    const game = make(), s = game.state;
    s.dice[0].used = true;
    const face = s.dice[0].current;
    effect(game, { type: 'gainRerolls', count: 2 }); assert.equal(s.rerolls, 3);
    game.reroll(s.dice[1].id); assert.equal(s.rerolls, 2);
    game.reroll(); assert.equal(s.rerolls, 1); assert.equal(s.dice[0].current, face);
    effect(game, { type: 'reroll' });
    assert.equal(s.pending.options.length, 2);
    assert.throws(() => game.choose([]));
    assert.throws(() => game.choose([s.dice[0].id]));
    game.choose(s.dice.slice(1).map(d => d.id)); assert.equal(s.rerolls, 1);
    s.dice.forEach(d => { d.used = true; });
    effect(game, { type: 'reroll' }); assert.equal(s.pending, null);
    assert.throws(() => game.reroll()); assert.equal(s.rerolls, 1);
});
test('6.4 face rewrites persist, retain other normal attribute and convert special faces', () => {
    const game = make(), die = game.state.dice[0], at = die.current;
    const material = currentFace(die).material;
    effect(game, { type: 'changeColor', color: 'red' }); game.choose([die.id]);
    assert.deepEqual(currentFace(die), { color: 'red', material });
    effect(game, { type: 'changeMaterial', material: 'airbrush' }); game.choose([die.id]);
    assert.deepEqual(currentFace(die), { color: 'red', material: 'airbrush' });
    effect(game, { type: 'changeSpecialFace', face: 'fame1' }); game.choose([die.id]);
    assert.deepEqual(die.faces[at], { special: 'fame1' });
    effect(game, { type: 'changeColor', color: 'blue' }); game.choose([die.id]);
    assert.equal(currentFace(die).color, 'blue'); assert.ok(currentFace(die).material);
    effect(game, { type: 'changeSpecialFace', face: 'draw1' }); game.choose([die.id]);
    effect(game, { type: 'changeMaterial', material: 'brush' }); game.choose([die.id]);
    assert.equal(currentFace(die).material, 'brush'); assert.ok(currentFace(die).color);
    const rewritten = structuredClone(die.faces[at]); game.reroll(); assert.deepEqual(die.faces[at], rewritten);
    game.state.dice.forEach(d => { d.used = true; });
    for (const item of [{ type: 'changeColor', color: 'red' }, { type: 'changeMaterial', material: 'brush' },
        { type: 'changeSpecialFace', face: 'fame1' }]) { effect(game, item); assert.equal(game.state.pending, null); }
});
test('6.5 使用済み化は個数を維持し、永続・一時の所持情報と出目を変えない', () => {
    const game = make(), s = game.state;
    s.dice[0].used = true; s.dice[1].lifetime = 'temporary';
    const before = structuredClone(s.dice);
    effect(game, { type: 'useDie', count: 2 });
    assert.equal(s.pending.options.length, 2);
    assert.throws(() => game.choose(s.dice.slice(0, 2).map(d => d.id)));
    assert.throws(() => game.choose([s.dice[1].id]));
    game.choose(s.dice.slice(1).map(d => d.id));
    assert.deepEqual(s.dice, before.map(die => ({ ...die, used: true })));
    effect(game, { type: 'useDie', count: 5 }); assert.equal(s.pending, null);
    s.dice[0].used = false;
    effect(game, { type: 'useDie', count: 5 }); assert.equal(s.pending.min, 1);
    assert.equal(s.pending.max, 1);
    game.choose([s.dice[0].id]); assert.equal(s.dice.length, 3);
    effect(game, { type: 'useDie', count: 1 }); assert.equal(s.pending, null);
});

test('6.5 特殊面は使用済み化で発動せず、即時適用・日末の対象から外れ、再利用で戻る', () => {
    for (const refresh of [false, true]) {
        const game = make(), s = game.state;
        s.dice[0].faces[s.dice[0].current] = { special: 'fame1' };
        s.dice[1].faces[s.dice[1].current] = { special: 'draw1' };
        const before = structuredClone(s.dice);
        const hand = s.hand.length;
        effect(game, { type: 'useDie', count: 2 });
        game.choose(s.dice.slice(0, 2).map(die => die.id));
        assert.deepEqual(s.dice, before.map((die, i) => ({ ...die, used: i < 2 })));
        assert.equal(s.fame, 0); assert.equal(s.hand.length, hand);
        effect(game, { type: 'activateSpecialFaces' });
        assert.equal(s.fame, 0); assert.equal(s.hand.length, hand);
        if (refresh) effect(game, { type: 'refreshDice' });
        effect(game, { type: 'activateSpecialFaces' });
        assert.equal(s.fame, refresh ? 1 : 0);
        assert.equal(s.hand.length, hand + (refresh ? 1 : 0));
        game.endDay();
        assert.equal(s.fame, refresh ? 2 : 0);
        assert.deepEqual(s.reserved, refresh ? [{ type: 'drawCards', count: 1 }] : []);
    }
});

test('6.5 連続する使用済み化は対象を更新し、対象なしでも後続へ進む', () => {
    const game = make(), s = game.state;
    game.run(game.effects([{ type: 'useDie', count: 2 }, { type: 'useDie', count: 2 },
        { type: 'useDie', count: 1 }, { type: 'gainRerolls', count: 3 }]));
    game.choose(s.dice.slice(0, 2).map(die => die.id));
    assert.deepEqual(s.pending.options, [{ id: s.dice[2].id }]);
    assert.equal(s.pending.min, 1); assert.equal(s.pending.max, 1);
    game.choose([s.dice[2].id]);
    assert.equal(game.task, null); assert.equal(s.rerolls, 4);
});

test('6.5 使用済み化した永続ダイスは翌日に戻り、一時ダイスは日末に回収する', () => {
    const game = make(), s = game.state;
    s.dice[1].lifetime = 'temporary';
    const permanent = s.dice[0], temporary = s.dice[1];
    const faces = structuredClone(permanent.faces);
    effect(game, { type: 'useDie', count: 2 }); game.choose([permanent.id, temporary.id]);
    effect(game, { type: 'refreshDice' });
    assert.equal(permanent.used, false); assert.equal(temporary.used, false);
    effect(game, { type: 'useDie', count: 2 }); game.choose([permanent.id, temporary.id]);
    game.endDay();
    assert.ok(s.dice.includes(permanent)); assert.ok(!s.dice.includes(temporary));
    game.nextDay();
    assert.ok(s.dice.includes(permanent)); assert.equal(permanent.used, false);
    assert.deepEqual(permanent.faces, faces);
});

test('6.5 全10種類の特殊面は使用済みの間、発動・予約・再ロールを行わない', () => {
    for (const face of SPECIAL_FACES) {
        const game = make(), s = game.state, die = s.dice[0];
        die.faces[die.current] = { special: face };
        const before = structuredClone(die), hand = s.hand.length, rerolls = s.rerolls;
        const random = game.random;
        game.random = () => { throw new Error('使用済み化は抽選しない'); };
        effect(game, { type: 'useDie', count: 1 }); game.choose([die.id]);
        effect(game, { type: 'activateSpecialFaces' });
        assert.deepEqual(die, { ...before, used: true });
        assert.equal(s.dice.length, 3); assert.equal(s.hand.length, hand);
        assert.equal(s.rerolls, rerolls); assert.equal(s.fame, 0);
        game.random = random;
        game.endDay();
        assert.equal(s.fame, 0); assert.deepEqual(s.reserved, []);
    }
});

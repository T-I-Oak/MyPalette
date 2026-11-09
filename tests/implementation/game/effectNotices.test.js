import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../../src/game/engine.js';
import { createEffectNoticeQueue } from '../../../src/game/effectNoticeQueue.js';
import { specialNoticeEffects } from '../../../src/game/specialNoticeEffects.js';
import { effectDescriptionParts, effectDescriptionResources } from '../../../src/game/effectDescriptions.js';
import { EFFECTS, SPECIAL_FACES, SPECIAL_FACE_EFFECTS, COLORS, COLOR_PAIRS, MATERIALS, displayLabel } from '../../../src/effectCatalog.js';

const settings = JSON.parse(readFileSync(new URL('../../../public/data/cards.json', import.meta.url)));
test('special notices combine repeated effects while preserving settings and original game effects', () => {
    const effects = ['fame1', 'fame1', 'draw1', 'draw1', 'temporaryRedGreen1', 'temporaryRedGreen1', 'temporaryOrangeBlue1', 'temporaryBrush1', 'temporaryPastel1']
        .map(face => ({ ...SPECIAL_FACE_EFFECTS[face] }));
    const original = structuredClone(effects);
    const grouped = specialNoticeEffects(effects);
    assert.equal(grouped.length, 6);
    assert.deepEqual(grouped[0], { type: 'changeFame', amount: 2 });
    assert.deepEqual(grouped[1], { type: 'drawCards', count: 2 });
    assert.equal(grouped[2].count, 2); assert.equal(grouped[2].colors, 'red_green');
    assert.equal(grouped[3].colors, 'orange_blue');
    assert.equal(grouped[4].material, 'brush'); assert.equal(grouped[5].material, 'pastel');
    assert.deepEqual(effects, original);
    assert.deepEqual(specialNoticeEffects([]), []);
});
test('notice queue preserves bursts, waits for animation and cancels on disposal', () => {
    const shown = [], timers = new Map(); let sequence = 0, idles = 0;
    const queue = createEffectNoticeQueue({ show: event => shown.push(event.id), hide() {}, idle: () => idles++,
        schedule(callback, ms) { assert.equal(ms, 3000); timers.set(++sequence, callback); return sequence; },
        cancel: id => timers.delete(id) });
    const tick = () => { const [id, callback] = timers.entries().next().value; timers.delete(id); callback(); };
    queue.pause(true); queue.enqueue([{ id: 1 }, { id: 2 }]);
    assert.deepEqual(shown, []); assert.equal(queue.busy, true);
    queue.pause(false); queue.enqueue([{ id: 3 }]); queue.enqueue([]);
    assert.deepEqual(shown, [1]); assert.equal(timers.size, 1);
    tick(); tick(); assert.deepEqual(shown, [1, 2, 3]);
    tick(); assert.equal(idles, 1); assert.equal(queue.busy, false);
    queue.enqueue([{ id: 4 }, { id: 5 }]); queue.dispose();
    assert.equal(timers.size, 0); assert.equal(queue.busy, false);
    queue.enqueue([{ id: 6 }]); assert.deepEqual(shown, [1, 2, 3, 4]);
});

test('all effect descriptions support both languages, omit quantities and reuse special face definitions', () => {
    for (const language of ['ja', 'en']) {
        const resources = Object.fromEntries(Object.entries(effectDescriptionResources).map(([key, value]) => [key, value['lang-store'][language]]));
        for (const definition of EFFECTS) {
            const effect = Object.fromEntries([['type', definition.type], ...definition.fields.map(field => [field.name, field.options ? field.options[0] : 29])]);
            const parts = effectDescriptionParts(effect, resources, String);
            assert.ok(parts.length); assert.ok(!parts.join('').includes('29'));
        }
        for (const face of SPECIAL_FACES) {
            const parts = effectDescriptionParts({ type: 'changeSpecialFace', face }, resources, String);
            const embedded = parts.find(part => typeof part !== 'string').effect;
            assert.deepEqual(embedded, SPECIAL_FACE_EFFECTS[face]);
            assert.ok(effectDescriptionParts(embedded, resources, String).length);
        }
        assert.notDeepEqual(effectDescriptionParts({ type: 'changeFame', amount: 2 }, resources, String),
            effectDescriptionParts({ type: 'changeFame', amount: -2 }, resources, String));
    }
});

test('structured notices group root effects, include nested special activation and notify reservations only once', () => {
    const game = new Game(settings, () => .23), s = game.state;
    s.dice[0].faces[s.dice[0].current] = { special: 'fame1' };
    const effects = [{ type: 'changeFame', amount: 2 }, { type: 'activateSpecialFaces' }];
    game.run(game.effects(effects, 'play'));
    assert.deepEqual(s.effectNotices.map(event => event.timing), ['play', 'special']);
    assert.deepEqual(s.effectNotices[0].effects, effects);
    assert.deepEqual(s.effectNotices[1].effects, [{ type: 'changeFame', amount: 1 }]);
    effects[0].amount = 100; assert.equal(s.effectNotices[0].effects[0].amount, 2);
    assert.deepEqual(s.effectNotices.map(event => event.id), [1, 2]);
    s.effectNotices.splice(0); game.endDay();
    assert.equal(s.effectNotices.length, 1); assert.equal(s.effectNotices[0].timing, 'special');
    s.effectNotices.splice(0); game.nextDay(); assert.equal(s.effectNotices.length, 0);
});

test('a following animation delays the next notice without restarting the active one', () => {
    const shown = []; let timer, idle = 0;
    const queue = createEffectNoticeQueue({ show: event => shown.push(event.id), hide() {}, idle: () => idle++,
        schedule(callback) { timer = callback; return 1; }, cancel() {} });
    queue.enqueue([{ id: 1 }, { id: 2 }]);
    queue.pause(true); timer();
    assert.deepEqual(shown, [1]); assert.equal(queue.busy, true); assert.equal(idle, 0);
    queue.pause(false); assert.deepEqual(shown, [1, 2]);
    timer(); assert.equal(queue.busy, false); assert.equal(idle, 1);
    queue.dispose();
});

test('approved Japanese wording covers every lifetime, pair, material, color and step without quantities', () => {
    const text = Object.fromEntries(Object.entries(effectDescriptionResources).map(([key, value]) => [key, value['lang-store'].ja]));
    const describe = effect => effectDescriptionParts(effect, text, displayLabel).join('');
    for (const lifetime of ['permanent', 'temporary']) {
        assert.equal(describe({ type: 'gainNormalDice', lifetime, count: 9 }), `${displayLabel(lifetime)}ダイスを3個の候補から選んで獲得する。`);
        for (const colors of COLOR_PAIRS) assert.equal(describe({ type: 'gainColorDice', colors, lifetime, count: 9 }), `${displayLabel(colors)}の${displayLabel(lifetime)}ダイスを獲得する。`);
        for (const material of MATERIALS) assert.equal(describe({ type: 'gainMaterialDice', material, lifetime, count: 9 }), `${displayLabel(material)}の${displayLabel(lifetime)}ダイスを獲得する。`);
    }
    for (const color of COLORS) assert.equal(describe({ type: 'changeColor', color }), `未使用ダイスを選択し、現在の面の色を${displayLabel(color)}に変更する。`);
    for (const material of MATERIALS) assert.equal(describe({ type: 'changeMaterial', material }), `未使用ダイスを選択し、現在の面の画材を${displayLabel(material)}に変更する。`);
    for (const step of [0, 1, 2]) assert.equal(describe({ type: 'changeCardStep', step }), `手札のカードを選択し、ステップを${step}に変更する。`);
});

test('no-target effects still notify their original group and finish without an extra choice', () => {
    const game = new Game(settings, () => .23), s = game.state;
    s.dice.forEach(die => { die.used = true; });
    const effects = [{ type: 'reroll' }, { type: 'discardDice', count: 8 }];
    game.run(game.effects(effects, 'reward'));
    assert.equal(game.task, null); assert.equal(s.pending, null); assert.equal(s.dice.length, 3);
    assert.equal(s.effectNotices.length, 1); assert.deepEqual(s.effectNotices[0].effects, effects);
});

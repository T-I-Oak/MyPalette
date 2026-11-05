import { COLORS, MATERIALS, SPECIAL_FACE_EFFECTS } from '../effectCatalog.js';
import { currentFace, normalCandidates, specifiedFaces, roll } from './dice.js';

export function specialEffects(dice) {
    const order = { changeFame: 0, gainRerolls: 1, drawCards: 2, gainNormalDice: 3, gainColorDice: 3, gainMaterialDice: 3 };
    return dice.filter(die => !die.used && currentFace(die).special)
        .map(die => ({ ...SPECIAL_FACE_EFFECTS[currentFace(die).special] }))
        .sort((a, b) => order[a.type] - order[b.type]);
}
function* select(game, kind, title, options, min = 1, max = min) {
    if (!options.length) { game.log(`${title}：対象なし`); return []; }
    const ids = yield { kind, title, options, min: Math.min(min, options.length), max: Math.min(max, options.length) };
    return ids;
}
export function* acquire(game, effect) {
    const gained = [];
    for (let i = 0; i < effect.count; i++) {
        let faces;
        if (effect.type === 'gainNormalDice') {
            const candidates = normalCandidates(game.random);
            const [id] = yield* select(game, 'candidates', `通常ダイス獲得 ${i + 1}/${effect.count}`, candidates.map((faces, index) => ({ id: String(index), faces, lifetime: effect.lifetime })));
            faces = candidates[Number(id)];
        } else faces = specifiedFaces(effect);
        gained.push(game.makeDie(faces, effect.lifetime));
    }
    for (const die of gained) roll(die, game.random);
    game.state.dice.push(...gained);
    game.log(`ダイス獲得：${gained.map(die => die.id).join('、')}（${effect.lifetime === 'temporary' ? '一時' : '永続'}）`);
}
export function* stockCards(game, count, destination = 'discard') {
    for (let i = 0; i < count; i++) {
        const options = Object.values(game.state.public).filter(Boolean).map(id => ({ id }));
        if (!options.length) { game.log('ストック取得：公開カードなし'); return; }
        const [id] = yield* select(game, 'cards', `公開カードを取得 ${i + 1}/${count}`, options);
        const grade = id[0];
        const card = game.state.stocks[grade].shift();
        game.state.public[grade] = null;
        game.state[destination].push(card);
        game.log(`${id}を${destination === 'hand' ? '手札' : '捨て札'}へ取得`);
    }
}
export function* resolveEffects(game, effects) {
    const s = game.state;
    for (const effect of effects) {
        game.log(`効果：${game.effectLabel(effect)}`);
        if (['gainNormalDice', 'gainColorDice', 'gainMaterialDice'].includes(effect.type)) {
            yield* acquire(game, effect);
        } else if (effect.type === 'changeFame') s.fame += effect.amount;
        else if (effect.type === 'refreshDice') {
            for (const die of s.dice) die.used = false;
        }
        else if (effect.type === 'gainRerolls') s.rerolls += effect.count;
        else if (effect.type === 'drawCards') game.draw(effect.count);
        else if (effect.type === 'gainStockCards') yield* stockCards(game, effect.count);
        else if (effect.type === 'activateSpecialFaces') yield* resolveEffects(game, specialEffects(s.dice));
        else if (effect.type === 'changeCardStep') {
            const [id] = yield* select(game, 'cards', `手札をステップ${effect.step}へ変更`, s.hand.map(c => ({ id: c.id })));
            if (id) s.hand.find(c => c.id === id).step = effect.step;
        } else if (effect.type === 'exchangeCards') {
            for (let i = 0; i < effect.count; i++) {
                const [id] = yield* select(game, 'cards', `ストックへ戻す手札 ${i + 1}/${effect.count}`, s.hand.map(c => ({ id: c.id })));
                if (!id) break;
                const card = s.hand.splice(s.hand.findIndex(c => c.id === id), 1)[0];
                card.step = 0; s.stocks[id[0]].push(card);
                if (!s.public[id[0]]) s.public[id[0]] = s.stocks[id[0]][0].id;
                game.log(`${id}をステップ0でストックへ返却`);
                yield* stockCards(game, 1, 'hand');
            }
        } else {
            const discard = effect.type === 'discardDice';
            const options = s.dice.filter(die => discard || !die.used).map(die => ({ id: die.id }));
            const count = discard ? effect.count : 1;
            const max = effect.type === 'reroll' ? options.length : count;
            const ids = yield* select(game, 'dice', game.effectLabel(effect), options, count, max);
            if (discard) s.dice = s.dice.filter(die => !ids.includes(die.id));
            else for (const die of s.dice.filter(die => ids.includes(die.id))) {
                const face = currentFace(die);
                if (effect.type === 'reroll') roll(die, game.random);
                else if (effect.type === 'changeSpecialFace') die.faces[die.current] = { special: effect.face };
                else if (effect.type === 'changeColor') die.faces[die.current] = {
                    color: effect.color, material: face.special ? MATERIALS[Math.floor(game.random() * 3)] : face.material,
                };
                else if (effect.type === 'changeMaterial') die.faces[die.current] = {
                    color: face.special ? COLORS[Math.floor(game.random() * 6)] : face.color, material: effect.material,
                };
                else throw new Error(`未対応の効果：${effect.type}`);
            }
            game.log(`対象：${ids.join('、') || 'なし'}`);
        }
    }
}

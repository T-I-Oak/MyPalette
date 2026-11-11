import { validateDocument, draftIssues } from '../cardData.js';
import { describeEffect } from '../cardSummary.js';
import { initialFaces, shuffle, roll, currentFace } from './dice.js';
import { satisfiesSelection } from './goals.js';
import { resolveEffects, stockCards, specialEffects } from './effects.js';

export function gameIssues(settings) {
    const issues = validateDocument(settings).map(issue => `${issue.path}：${issue.reason}`);
    if (issues.length) return issues;
    return settings.cards.flatMap(card => draftIssues(card).map(issue => `${card.id}：${issue}`));
}
export class Game {
    constructor(settings, random = Math.random, { onCandidateAcquired, manualStartRoll = false, manualRolls = manualStartRoll, manualDayStart = false, manualRecycle = false } = {}) {
        const issues = gameIssues(settings);
        if (issues.length) throw new Error(issues.join('\n'));
        this.random = random;
        this.onCandidateAcquired = onCandidateAcquired;
        this.manualRolls = manualRolls; this.rollSequence = 0;
        this.manualDayStart = manualDayStart;
        this.definitions = Object.fromEntries(structuredClone(settings.cards).map(card => [card.id, card]));
        this.sequence = 0; this.task = null; this.noticeSequence = 0;
        this.manualRecycle = manualRecycle; this.recycleSequence = 0;
        this.deckEvents = [];
        this.state = {
            day: 0, fame: 0, credit: 3, flyers: 0, progress: 0, orderCost: 3, rerolls: 0,
            phase: 'betweenDays', pending: null, achievement: null, dice: [], deck: [], hand: [], field: [], discard: [], shipped: [],
            stocks: {}, public: {}, reserved: [], logs: [], dayEndDice: null, rollRequest: null, recycleRequest: null, effectNotices: [],
        };
        const s = this.state;
        for (const grade of ['A', 'B', 'C']) s.stocks[grade] = shuffle(settings.cards.filter(c => c.id[0] === grade)
            .map(c => ({ id: c.id, step: 0 })), random);
        for (const grade of ['A', 'B', 'C']) s.public[grade] = null;
        s.dice = initialFaces(random).map(faces => this.makeDie(faces, 'permanent'));
        if (this.manualDayStart) for (const die of s.dice) die.current = null;
        this.nextDay();
    }
    effectLabel(effect) { return describeEffect(effect); }
    log(text) { this.state.logs.push(`${this.state.day}日目：${text}`); }
    makeDie(faces, lifetime) { return { id: `D${++this.sequence}`, faces, current: 0, used: false, lifetime }; }
    step(card) { return this.definitions[card.id].steps[card.step]; }
    notifyEffects(timing, effects) {
        if (effects.length) this.state.effectNotices.push({ id: ++this.noticeSequence, timing, effects: structuredClone(effects) });
    }
    *effects(items, timing = null) {
        if (timing) this.notifyEffects(timing, items);
        yield* resolveEffects(this, items);
    }
    run(task) {
        if (this.task) throw new Error('効果の選択を完了してください。');
        this.task = task; this.advance();
    }
    advance(value) {
        const result = this.task.next(value);
        this.state.pending = result.done || ['roll', 'recycle'].includes(result.value.kind) ? null : result.value;
        if (result.done) this.task = null;
    }
    choose(ids) {
        const pending = this.state.pending;
        if (!pending || !Array.isArray(ids) || new Set(ids).size !== ids.length ||
            ids.length < pending.min || ids.length > pending.max || ids.some(id => !pending.options.some(o => o.id === id))) {
            throw new Error('有効な対象を指定された個数だけ選択してください。');
        }
        this.advance(ids);
    }
    assertPlay() {
        if (this.task || this.state.achievement || this.state.phase !== 'play') throw new Error('現在この操作はできません。');
    }
    beginStartRoll(id) { return this.beginRoll(id); }
    failStartRoll(id) { return this.failRoll(id); }
    completeStartRoll(id, results) { return this.completeRoll(id, results); }
    beginRoll(id) {
        const request = this.state.rollRequest;
        if (!request || request.id !== id || request.status !== 'ready') throw new Error('ロール待機中ではありません。');
        request.status = 'rolling';
    }
    failRoll(id) {
        const request = this.state.rollRequest;
        if (!request || request.id !== id || request.status !== 'rolling') throw new Error('ロール中ではありません。');
        request.status = 'ready';
    }
    completeRoll(id, results) {
        const request = this.state.rollRequest;
        if (!request || request.id !== id || request.status !== 'rolling' || !Array.isArray(results) ||
            results.length !== request.ids.length || new Set(results.map(result => result.id)).size !== results.length ||
            results.some(result => !request.ids.includes(result.id) || result.status !== 'settled' ||
                !Number.isInteger(result.index) || result.index < 0 || result.index > 5)) {
            throw new Error('全対象の物理ロール結果が必要です。');
        }
        for (const result of results) this.state.dice.find(die => die.id === result.id).current = result.index;
        this.state.rollRequest = null;
        this.advance();
    }
    *rollDice(dice, reason) {
        if (!dice.length) return;
        if (!this.manualRolls) { for (const die of dice) roll(die, this.random); return; }
        for (const die of dice) die.current = null;
        this.state.rollRequest = { id: ++this.rollSequence, ids: dice.map(die => die.id), status: 'ready', reason };
        yield { kind: 'roll' };
    }
    completeRecycle(id) {
        if (!this.state.recycleRequest || this.state.recycleRequest.id !== id) throw new Error('再構成待機中ではありません。');
        this.state.recycleRequest = null;
        this.advance();
    }
    draw(count) { this.drawCards(count, false).next(); }
    *drawCards(count, wait = this.manualRecycle) {
        const s = this.state; let drawn = 0;
        for (let i = 0; i < count; i++) {
            if (!s.deck.length) {
                if (wait && s.discard.length) {
                    s.recycleRequest = { id: ++this.recycleSequence, cards: structuredClone(s.discard) };
                    yield { kind: 'recycle' };
                }
                s.deck = shuffle(s.discard, this.random); s.discard = [];
                if (s.deck.length) this.deckEvents.push({ kind: 'recycle', cards: structuredClone(s.deck) });
            }
            if (!s.deck.length) break;
            const card = s.deck.shift();
            this.deckEvents.push({ kind: 'draw', card: { ...card } });
            s.hand.push(card); drawn++;
        }
        this.log(`${drawn}枚ドロー`);
    }
    nextDay() {
        const s = this.state;
        if (this.task || s.phase !== 'betweenDays') throw new Error('翌日を開始できません。');
        if (this.manualDayStart) { s.day++; s.phase = 'awaitingStart'; return; }
        this.run(this.startDay());
    }
    beginDay() {
        if (this.task || this.state.phase !== 'awaitingStart') throw new Error('仕事の開始待ちではありません。');
        this.run(this.startDay());
    }
    *startDay() {
        const s = this.state;
        if (s.phase !== 'awaitingStart') s.day++;
        s.phase = 'start'; s.dayEndDice = null;
        for (const die of s.dice) { die.used = false; die.current = null; }
        if (s.day === 1) {
            s.deck = s.stocks.A.splice(0, 7);
            this.deckEvents.push({ kind: 'deal', cards: structuredClone(s.deck) });
        }
        for (const grade of ['A', 'B', 'C']) s.public[grade] = s.stocks[grade][0]?.id ?? null;
        s.rerolls++; yield* this.drawCards(4);
        const reserved = s.reserved; s.reserved = [];
        yield* this.effects(reserved);
        yield* this.rollDice(s.dice, 'start');
        s.phase = 'play'; this.log('プレイ開始');
    }
    play(id) {
        this.assertPlay(); const s = this.state;
        const index = s.hand.findIndex(c => c.id === id);
        if (s.hand.length < 2 || index < 0) throw new Error('手札が2枚以上のときにプレイできます。');
        const card = s.hand.splice(index, 1)[0]; s.field.push(card);
        this.log(`${id}をプレイ`); this.run(this.effects(this.step(card).playEffects, 'play'));
    }
    achieve(id, ids) {
        this.beginAchievement(id, ids); this.completeAchievement();
    }
    beginAchievement(id, ids) {
        this.assertPlay(); const s = this.state;
        const card = s.field.find(c => c.id === id);
        if (!card || !satisfiesSelection(this.step(card).goals, s.dice, ids)) throw new Error('選択したダイスでは目標を満たしません。');
        for (const die of s.dice.filter(d => ids.includes(d.id))) die.used = true;
        this.log(`${id}達成：${ids.join('、')}を消費`);
        s.achievement = { id };
    }
    completeAchievement() {
        const s = this.state;
        if (!s.achievement) throw new Error('達成処理は開始されていません。');
        const card = s.field.find(card => card.id === s.achievement.id);
        s.achievement = null; this.run(this.finishAchievement(card));
    }
    *finishAchievement(card) {
        const s = this.state;
        const effects = this.step(card).achievementEffects;
        card.step++; s.field.splice(s.field.indexOf(card), 1);
        if (card.step === 3) {
            s.shipped.push(card); s.credit++; this.log(`${card.id}を出荷、信用＋1`);
        } else { s.discard.push(card); this.log(`${card.id}をステップ${card.step}で捨て札へ`); }
        yield* this.effects(effects, 'reward');
    }
    reroll(id = null) {
        this.assertPlay(); const s = this.state;
        const dice = s.dice.filter(die => !die.used && (id === null || die.id === id));
        if (!s.rerolls || !dice.length) throw new Error('リロール権と未使用ダイスが必要です。');
        s.rerolls--;
        this.run(this.rerollDice(dice));
    }
    *rerollDice(dice) {
        yield* this.rollDice(dice, 'reroll');
        this.log(`リロール：${dice.map(d => d.id).join('、')}`);
    }
    endDay() {
        this.assertPlay();
        this.run(this.finishDay());
    }
    *finishDay() {
        const s = this.state; s.phase = 'end'; s.rerolls = 0;
        s.reserved = specialEffects(s.dice);
        this.notifyEffects('special', s.reserved);
        for (const die of s.dice) if (!die.used && currentFace(die).special) die.used = true;
        this.log(`特殊面予約：${s.reserved.length}件`);
        const flyerDice = s.dice.filter(d => !d.used).slice(0, 2);
        for (const die of flyerDice) die.used = true;
        s.progress += flyerDice.length;
        const made = Math.floor(s.progress / 2); s.flyers += made; s.progress %= 2;
        this.log(`チラシ制作：${flyerDice.map(d => d.id).join('、') || 'なし'}、完成${made}枚、所持${s.flyers}枚、進捗${s.progress}/2`);
        const loss = s.dice.filter(d => !d.used).length;
        while (loss < s.credit && s.flyers >= s.orderCost) {
            const cost = s.orderCost; s.flyers -= cost; s.orderCost += 2;
            this.log(`自動発注：チラシ${cost}枚消費、次回${s.orderCost}枚`);
            yield* stockCards(this, 1);
        }
        s.credit = Math.max(0, s.credit - loss); this.log(`未使用ダイス${loss}個：信用−${loss} → ${s.credit}`);
        if (!s.credit) { s.phase = 'finished'; this.log(`ゲーム終了：名声${s.fame}、出荷${s.shipped.length}枚`); return; }
        s.dayEndDice = structuredClone(s.dice);
        s.discard.push(...s.hand.splice(0), ...s.field.splice(0));
        s.dice = s.dice.filter(d => d.lifetime === 'permanent');
        for (const grade of ['A', 'B', 'C']) {
            if (s.public[grade]) s.stocks[grade].push(s.stocks[grade].shift());
            s.public[grade] = null;
        }
        s.phase = 'betweenDays'; this.log('一日の仕事を終了');
        if (this.manualDayStart) { s.day++; s.phase = 'awaitingStart'; }
    }
}

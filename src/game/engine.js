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
    constructor(settings, random = Math.random, { onCandidateAcquired } = {}) {
        const issues = gameIssues(settings);
        if (issues.length) throw new Error(issues.join('\n'));
        this.random = random;
        this.onCandidateAcquired = onCandidateAcquired;
        this.definitions = Object.fromEntries(structuredClone(settings.cards).map(card => [card.id, card]));
        this.sequence = 0; this.task = null;
        this.state = {
            day: 0, fame: 0, credit: 3, flyers: 0, progress: 0, orderCost: 3, rerolls: 0,
            phase: 'betweenDays', pending: null, dice: [], deck: [], hand: [], field: [], discard: [], shipped: [],
            stocks: {}, public: {}, reserved: [], logs: [], dayEndDice: null,
        };
        const s = this.state;
        for (const grade of ['A', 'B', 'C']) s.stocks[grade] = shuffle(settings.cards.filter(c => c.id[0] === grade)
            .map(c => ({ id: c.id, step: 0 })), random);
        s.deck = s.stocks.A.splice(0, 7);
        for (const grade of ['A', 'B', 'C']) s.public[grade] = s.stocks[grade][0]?.id ?? null;
        s.dice = initialFaces(random).map(faces => this.makeDie(faces, 'permanent'));
        this.nextDay();
    }
    effectLabel(effect) { return describeEffect(effect); }
    log(text) { this.state.logs.push(`${this.state.day}日目：${text}`); }
    makeDie(faces, lifetime) { return { id: `D${++this.sequence}`, faces, current: 0, used: false, lifetime }; }
    step(card) { return this.definitions[card.id].steps[card.step]; }
    effects(items) { return resolveEffects(this, items); }
    run(task) {
        if (this.task) throw new Error('効果の選択を完了してください。');
        this.task = task; this.advance();
    }
    advance(value) {
        const result = this.task.next(value);
        this.state.pending = result.done ? null : result.value;
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
        if (this.task || this.state.phase !== 'play') throw new Error('現在この操作はできません。');
    }
    draw(count) {
        const s = this.state; let drawn = 0;
        for (let i = 0; i < count; i++) {
            if (!s.deck.length) { s.deck = shuffle(s.discard, this.random); s.discard = []; }
            if (!s.deck.length) break;
            s.hand.push(s.deck.shift()); drawn++;
        }
        this.log(`${drawn}枚ドロー`);
    }
    nextDay() {
        const s = this.state;
        if (this.task || s.phase !== 'betweenDays') throw new Error('翌日を開始できません。');
        this.run(this.startDay());
    }
    *startDay() {
        const s = this.state; s.phase = 'start'; s.day++; s.dayEndDice = null;
        for (const die of s.dice) die.used = false;
        s.rerolls++; this.draw(4);
        for (const die of s.dice) roll(die, this.random);
        const reserved = s.reserved; s.reserved = [];
        yield* this.effects(reserved); s.phase = 'play'; this.log('プレイ開始');
    }
    play(id) {
        this.assertPlay(); const s = this.state;
        const index = s.hand.findIndex(c => c.id === id);
        if (s.hand.length < 2 || index < 0) throw new Error('手札が2枚以上のときにプレイできます。');
        const card = s.hand.splice(index, 1)[0]; s.field.push(card);
        this.log(`${id}をプレイ`); this.run(this.effects(this.step(card).playEffects));
    }
    achieve(id, ids) {
        this.assertPlay(); const s = this.state;
        const card = s.field.find(c => c.id === id);
        if (!card || !satisfiesSelection(this.step(card).goals, s.dice, ids)) throw new Error('選択したダイスでは目標を満たしません。');
        for (const die of s.dice.filter(d => ids.includes(d.id))) die.used = true;
        this.log(`${id}達成：${ids.join('、')}を消費`); this.run(this.finishAchievement(card));
    }
    *finishAchievement(card) {
        const s = this.state;
        yield* this.effects(this.step(card).achievementEffects);
        card.step++; s.field.splice(s.field.indexOf(card), 1);
        if (card.step === 3) {
            s.shipped.push(card); s.credit++; this.log(`${card.id}を出荷、信用＋1`);
        } else { s.discard.push(card); this.log(`${card.id}をステップ${card.step}で捨て札へ`); }
    }
    reroll(id = null) {
        this.assertPlay(); const s = this.state;
        const dice = s.dice.filter(die => !die.used && (id === null || die.id === id));
        if (!s.rerolls || !dice.length) throw new Error('リロール権と未使用ダイスが必要です。');
        s.rerolls--; for (const die of dice) roll(die, this.random);
        this.log(`リロール：${dice.map(d => d.id).join('、')}`);
    }
    endDay() {
        this.assertPlay();
        this.run(this.finishDay());
    }
    *finishDay() {
        const s = this.state; s.phase = 'end'; s.rerolls = 0;
        s.reserved = specialEffects(s.dice);
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
            s.public[grade] = s.stocks[grade][0]?.id ?? null;
        }
        s.phase = 'betweenDays'; this.log('一日の仕事を終了');
    }
}

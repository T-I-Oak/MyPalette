import test from 'node:test';
import assert from 'node:assert/strict';
import { endDayAttention } from '../../../src/game/endDayAttention.js';

function fixture() {
    const definitions = {
        a: { steps: [{ goals: [{ color: 'red' }], playEffects: [] },
            { goals: [{ color: 'blue' }], playEffects: [{ type: 'drawCards', count: 1 }] }] },
        b: { steps: [{ goals: [{ color: 'blue' }], playEffects: [] }] },
    };
    return { state: { phase: 'play', rerolls: 0, hand: [{ id: 'a', step: 0 }, { id: 'b', step: 0 }],
        field: [], dice: [{ id: 'd', faces: [{ color: 'red', material: 'brush' }], current: 0, used: false }] },
        step: card => definitions[card.id].steps[card.step] };
}

test('手札枚数・達成可否・プレイ時効果・リロール権の組み合わせ', () => {
    for (const count of [1, 2, 4]) for (const achievable of [false, true])
        for (const effect of [false, true]) for (const rerolls of [0, 1, 2]) {
            const game = fixture();
            game.state.hand = Array.from({ length: count }, () => ({ id: 'a', step: effect ? 1 : 0 }));
            game.state.dice[0].faces[0].color = effect ? 'blue' : 'red';
            game.state.dice[0].used = !achievable;
            game.state.rerolls = rerolls;
            assert.equal(endDayAttention(game), rerolls === 0 && (count === 1 || (!achievable && !effect)),
                JSON.stringify({ count, achievable, effect, rerolls }));
        }
});

test('手札の全カードを調べ、現在ステップだけを使う', () => {
    const game = fixture();
    assert.equal(endDayAttention(game), false);
    game.state.dice[0].used = true;
    assert.equal(endDayAttention(game), true); // 次ステップの効果は含めない
    game.state.hand[0].step = 1;
    assert.equal(endDayAttention(game), false); // 対象や処理結果にかかわらず効果あり
    game.state.hand.reverse();
    assert.equal(endDayAttention(game), false);
});

test('場に達成可能なカードがあれば手札1枚・複数枚とも注目表示しない', () => {
    const game = fixture();
    for (const count of [1, 2, 4]) {
        game.state.hand = Array.from({ length: count }, () => ({ id: 'b', step: 0 }));
        game.state.field = [];
        assert.equal(endDayAttention(game), true);
        game.state.field = [{ id: 'a', step: 1 }, { id: 'a', step: 0 }];
        assert.equal(endDayAttention(game), false); // 2枚目の現在ステップが達成可能
        game.state.field = [{ id: 'a', step: 1 }];
        assert.equal(endDayAttention(game), true); // 次・前ステップや場のプレイ時効果は使わない
        game.state.field = [{ id: 'a', step: 0 }];
        game.state.dice[0].used = true;
        assert.equal(endDayAttention(game), true); // 使用済みダイスでは達成できない
        game.state.dice[0].used = false;
    }
    game.state.field = [{ id: 'a', step: 3 }];
    assert.equal(endDayAttention(game), true); // 完成済みは達成判定しない
});

test('操作待機・日末・開始前・ゲーム終了には表示せず、新しい日とゲームへ持ち越さない', () => {
    const game = fixture(); game.state.hand.length = 1;
    assert.equal(endDayAttention(game), true);
    for (const key of ['pending', 'achievement', 'rollRequest', 'recycleRequest', 'dayEndRequest']) {
        game.state[key] = {};
        assert.equal(endDayAttention(game), false, key);
        game.state[key] = null;
    }
    assert.equal(endDayAttention(game, true), false);
    for (const phase of ['awaitingStart', 'start', 'end', 'betweenDays', 'finished']) {
        game.state.phase = phase;
        assert.equal(endDayAttention(game), false, phase);
    }
    game.state.phase = 'play'; game.state.rerolls = 1;
    assert.equal(endDayAttention(game), false);
    assert.equal(endDayAttention(fixture()), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { handStandardSize, handMetrics, layoutHand, handButtonCenter } from '../../../src/game/handLayout.js';

test('標準寸法で4枚が回転分の余裕を保って左から並ぶ', () => {
    const slots = layoutHand(handStandardSize.width, handStandardSize.height, 4);
    assert.equal(slots.length, 4);
    assert.ok(slots[0].x > handMetrics.padding);
    for (let i = 1; i < slots.length; i++) {
        assert.ok(slots[i].x - slots[i - 1].x >= handMetrics.envelopeWidth);
    }
    const right = slots[3].x + handMetrics.cardWidth + (handMetrics.envelopeWidth - handMetrics.cardWidth) / 2;
    assert.ok(right <= handStandardSize.width - handMetrics.padding);
});

test('枚数と重なりの有無によらず手札全体を中央に寄せる', () => {
    for (const n of [1, 2, 3, 4, 5, 12]) {
        const cards = layoutHand(handStandardSize.width, handStandardSize.height, n);
        const center = (cards[0].x + cards.at(-1).x + handMetrics.cardWidth) / 2;
        assert.ok(Math.abs(center - handStandardSize.width / 2) < 1e-9);
    }
    const five = layoutHand(handStandardSize.width * 2, handStandardSize.height, 5);
    assert.ok(five[1].x - five[0].x >= handMetrics.envelopeWidth);
    assert.deepEqual(layoutHand(handStandardSize.width, handStandardSize.height, 0), []);
});

test('幅が足りない場合だけ均等に重ね、両端を描画範囲内に収める', () => {
    const cards = layoutHand(handStandardSize.width, handStandardSize.height, 12);
    const interval = cards[1].x - cards[0].x;
    assert.ok(interval < handMetrics.cardWidth);
    for (let i = 2; i < cards.length; i++) assert.ok(Math.abs(cards[i].x - cards[i - 1].x - interval) < 1e-9);
    assert.ok(cards.at(-1).x + handMetrics.cardWidth < handStandardSize.width);
});

test('ボタン中心をカードの中心から固定倍率層へ変換する', () => {
    const slot = { x: 200, y: 18 };
    assert.equal(handButtonCenter(slot, 0.5, 2, 10), 10 + (200 + handMetrics.cardWidth / 2) * 0.5 / 2);
});

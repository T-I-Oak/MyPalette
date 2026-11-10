import test from 'node:test';
import assert from 'node:assert/strict';
import { stockMetrics as m, stockStandardSize, stockOffsets, layoutStock } from '../../../src/game/stockLayout.js';
import { fitArea } from '../../../src/ui/screenLayout/ScreenLayout.js';

test('15枚の山3つが回転・並進を含め描画枠内に収まる', () => {
    assert.deepEqual(stockStandardSize, { width: 993, height: 546 });
    for (const dimensions of [stockStandardSize, { width: 1800, height: 546 }, { width: 993, height: 900 }]) {
        const slots = layoutStock(dimensions.width, dimensions.height);
        assert.deepEqual(slots.map(slot => slot.grade), ['A', 'B', 'C']);
        for (const slot of slots) {
            const left = slot.x - (m.envelopeWidth - m.cardWidth) / 2;
            const top = slot.y - (m.envelopeHeight - m.cardHeight) / 2 - m.stackHeight;
            assert.ok(left >= m.padding);
            assert.ok(top >= m.padding);
            assert.ok(top - m.lift >= m.padding, '持ち上げても上端で切れない');
            assert.ok(slot.labelY >= m.padding);
            assert.ok(slot.labelY + m.labelHeight + m.labelGap <= top - m.lift + 1e-9);
            assert.ok(left + m.envelopeWidth <= dimensions.width - m.padding);
            assert.ok(slot.y + m.cardHeight + (m.envelopeHeight - m.cardHeight) / 2 <= dimensions.height - m.bottomPadding);
        }
        const gap = slots[1].x - slots[0].x - m.envelopeWidth;
        assert.ok(gap >= m.gap - 1e-9 && gap <= m.maxGap + 1e-9);
        assert.ok(Math.abs((slots[0].x + slots[2].x + m.cardWidth) / 2 - dimensions.width / 2) < 1e-9);
    }
});

test('余った横幅では山間隔を広げ、64に達した後は中央寄せする', () => {
    const gapAt = width => {
        const slots = layoutStock(width, stockStandardSize.height);
        return slots[1].x - slots[0].x - m.envelopeWidth;
    };
    assert.ok(gapAt(1020) > gapAt(stockStandardSize.width));
    assert.ok(gapAt(1020) < m.maxGap);
    assert.ok(Math.abs(gapAt(1800) - m.maxGap) < 1e-9);
    assert.ok(Math.abs(gapAt(3600) - m.maxGap) < 1e-9);
});

test('上下の固定表示領域を確保し、小画面・固定倍率変更でも山を収める', () => {
    for (const [width, height, fixedScale] of [[600, 233, 1], [331.5, 253.2, 1], [600, 233, 1.5]]) {
        const frame = fitArea({ x: 0, y: 0, width, height }, { ...stockStandardSize, ...stockOffsets }, true, fixedScale);
        assert.equal(frame.drawRect.y, 36 * fixedScale);
        assert.equal(frame.drawRect.height, height - 76 * fixedScale);
        assert.ok(frame.logicalWidth >= stockStandardSize.width - 1e-9);
        assert.ok(frame.logicalHeight >= stockStandardSize.height - 1e-9);
    }
});

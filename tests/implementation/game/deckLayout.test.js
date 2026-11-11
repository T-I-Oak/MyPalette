import test from 'node:test';
import assert from 'node:assert/strict';
import { deckStandardSize, discardScatter, layoutDeck } from '../../../src/game/deckLayout.js';
import { stockMetrics as m } from '../../../src/game/stockLayout.js';
import { areaDefinitions } from '../../../src/ui/screenLayout/ScreenLayout.js';

test('両エリアが同じ標準寸法で、最大45枚・最大のずれ・持ち上げを収める', () => {
    for (const id of ['deck', 'discard']) {
        assert.equal(areaDefinitions[id].width, deckStandardSize.width);
        assert.equal(areaDefinitions[id].height, deckStandardSize.height);
    }
    const epsilon = 1e-9;
    const slot = layoutDeck(deckStandardSize.width, deckStandardSize.height);
    for (const count of [1, 45]) for (const layer of [0, count - 1]) {
        for (const dx of [-discardScatter.x, discardScatter.x]) {
            for (const dy of [-discardScatter.y, discardScatter.y]) {
                for (let degrees = -discardScatter.angle; degrees <= discardScatter.angle; degrees += .25) {
                    const angle = degrees * Math.PI / 180;
                    for (const x of [-m.cardWidth / 2, m.cardWidth / 2]) {
                        for (const y of [-m.cardHeight / 2, m.cardHeight / 2]) {
                            const px = slot.x + m.cardWidth / 2 + dx + x * Math.cos(angle) - y * Math.sin(angle);
                            const py = slot.y + m.cardHeight / 2 + dy - layer * m.thickness + x * Math.sin(angle) + y * Math.cos(angle);
                            assert.ok(px >= m.bottomPadding - epsilon && px <= deckStandardSize.width - m.bottomPadding + epsilon);
                            assert.ok(py - m.lift >= m.bottomPadding - epsilon && py <= deckStandardSize.height - m.bottomPadding + epsilon);
                        }
                    }
                }
            }
        }
    }
});

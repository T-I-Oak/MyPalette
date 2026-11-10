import test from 'node:test';
import assert from 'node:assert/strict';
import { DiceGroup } from '../../../src/dice/DiceGroup.js';
import { syncPaletteSnapshot } from '../../../src/game/paletteSnapshot.js';

const source = (id, current = 0) => ({ id, current, used: false, lifetime: 'permanent',
    faces: Array.from({ length: 6 }, () => ({ color: 'orange', material: 'brush' })) });

test('ゲームの確定スナップショットを同一IDの3D表示へ反映し、抽選しない', () => {
    const group = new DiceGroup({ random() { throw new Error('must not roll'); } });
    try {
        const a = source('a');
        for (let index = 0; index < 6; index++) {
            a.current = index;
            syncPaletteSnapshot(group, [a]);
            assert.equal(group.get('a').top.index, index);
            assert.equal(group.get('a').result.index, index);
        }
        const existing = group.get('a');
        a.used = true; a.faces[5] = { special: 'fame1' };
        syncPaletteSnapshot(group, [a, { ...source('b'), lifetime: 'temporary' }]);
        assert.equal(group.get('a'), existing);
        assert.equal(existing.consumed, true);
        assert.equal(existing.result.face.special, 'fame1');
        assert.equal(group.get('b').lifetime, 'temporary');
        a.used = false;
        syncPaletteSnapshot(group, [a]);
        assert.equal(group.dice.length, 1);
        assert.equal(existing.consumed, false);
        syncPaletteSnapshot(group, []);
        assert.equal(group.dice.length, 0);
    } finally { group.dispose(); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { removeGoal } from '../../src/goalEditing.js';
import { goalGroups } from '../../src/goalGroups.js';

test('ORの直後の目標を削除しても、残る組の境界を保つ', () => {
    const goals=[{material:'brush',color:null},{material:'pastel',color:null,join:'or'},{material:'airbrush',color:null}];
    removeGoal(goals,1);
    assert.equal(goals[1].join,'or');
    assert.deepEqual(goalGroups(goals).map(group=>group.length),[1,1]);
});
test('先頭を削除するとORの先頭化を防ぎ、区切りだけを削除するとANDの組へ結合する', () => {
    const goals=[{material:'brush',color:null},{material:'pastel',color:null,join:'or'},{material:'airbrush',color:null,join:'or'}];
    removeGoal(goals,0);
    assert.equal(goals[0].join,undefined);
    delete goals[1].join;
    assert.deepEqual(goalGroups(goals).map(group=>group.length),[2]);
});

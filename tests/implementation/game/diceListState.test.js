import test from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion } from 'cannon-es';
import { topFace } from '../../../src/dice/orientation.js';
import { DiceListState, listOrientation, clampListPosition, resizeListBounds } from '../../../src/game/diceListState.js';

test('四辺・四隅のリサイズは反対側の位置を固定し、画面と最小寸法に収める', () => {
    const start={x:100,y:150,width:400,height:300}, viewport={width:1200,height:844};
    for(const direction of ['n','e','s','w','ne','se','sw','nw']) {
        const result=resizeListBounds(start,{x:20,y:30},direction,viewport,140);
        assert.equal(result.x+result.width,direction.includes('w')?500:direction.includes('e')?520:500);
        assert.equal(result.y+result.height,direction.includes('n')?450:direction.includes('s')?480:450);
        if(!direction.includes('w'))assert.equal(result.x,100);
        if(!direction.includes('n'))assert.equal(result.y,150);
    }
    assert.equal(resizeListBounds(start,{x:1000,y:1000},'nw',viewport,140).width,300);
    const narrow=resizeListBounds({x:20,y:20,width:300,height:300},{x:1000,y:1000},'nw',{width:390,height:844},140);
    assert.equal(narrow.width,156);assert.equal(narrow.height,140);
    const expanded=resizeListBounds(start,{x:-1000,y:-1000},'nw',viewport,140);
    assert.equal(expanded.x,0);assert.equal(expanded.y,0);
});

test('全6面を上面に向け、未確定の姿勢を出目として返さない', () => {
    for (let index = 0; index < 6; index++) {
        const q = listOrientation(index);
        assert.equal(topFace(new Quaternion(q.x, q.y, q.z, q.w)).index, index);
    }
    assert.equal(listOrientation(null), null);
});
test('検索は3秒で終了し、再検索で期限を更新して最新の全6面を照合する', () => {
    let now = 0;
    const state = new DiceListState({now:()=>now});
    const die = {id:'a', faces:Array.from({length:6}, () => ({color:'red', material:'brush'}))};
    state.search({color:'red'}); state.open();
    assert.deepEqual(state.matches(die), []);
    state.search({color:'red'});
    state.open();
    assert.deepEqual(state.matches(die), [0,1,2,3,4,5]);
    die.faces[2] = {special:'fame1'};
    assert.deepEqual(state.matches(die), [0,1,3,4,5]);
    now = 2999;
    assert.deepEqual(state.matches(die), [0,1,3,4,5]);
    now = 3000;
    assert.deepEqual(state.matches(die), []);
    state.search({color:'red'});
    now = 5000; state.search({color:'red'});
    now = 6000;
    assert.deepEqual(state.matches(die), [0,1,3,4,5]);
    now = 8000;
    assert.deepEqual(state.matches(die), []);
    state.search({color:'blue'}); assert.deepEqual(state.matches(die), []);
    state.close(); state.open(); assert.deepEqual(state.matches(die), []);
});
test('リサイズと拡縮後も小窓を画面内へ収める', () => {
    assert.deepEqual(clampListPosition({x:900,y:-40}, {width:400,height:500}, {width:390,height:844}), {x:0,y:0});
    assert.deepEqual(clampListPosition({x:900,y:900}, {width:400,height:500}, {width:1200,height:800}), {x:800,y:300});
});

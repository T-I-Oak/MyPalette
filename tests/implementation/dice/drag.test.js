import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Vec3 } from 'cannon-es';
import { DiceGroup } from '../../../src/dice/DiceGroup.js';
import { createDiceDrag, pointerOnPlane } from '../../../src/dice/drag.js';
import { fieldContains } from '../../../src/dice/field.js';
import { dragPosition } from '../../../src/dice/dragPosition.js';

const camera = () => {
    const value = new THREE.OrthographicCamera(-14, 14, 7, -7, .1, 100);
    value.position.set(0, 15, 9); value.lookAt(0, 0, 0); value.updateMatrixWorld(); return value;
};
const canvas = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 560, height: 280 }) };
test('移動先での本体の重なりを防ぎ、途中のすり抜けと接触は許可する', () => {
    const group = new DiceGroup();
    const faces=Array.from({length:6},()=>({color:'orange',material:'brush'}));
    const a=group.add({id:'a',faces,position:{x:-5,y:2.5,z:0}});
    const b=group.add({id:'b',faces,position:{x:0,y:2.5,z:0}});
    try {
        assert.deepEqual(dragPosition(group,a,{x:0,y:2.5,z:0}),{...a.body.position});
        const beyond=dragPosition(group,a,{x:3,y:2.5,z:0});
        assert.equal(beyond.x,3);
        const touching=dragPosition(group,a,{x:-2,y:2.5,z:0});
        assert.equal(touching.x,-2);
        b.body.quaternion.setFromAxisAngle(new Vec3(0,1,0),Math.PI/4);
        assert.deepEqual(dragPosition(group,a,{x:-2.1,y:2.5,z:0}),{...a.body.position});
    } finally { group.dispose(); }
});
test('ポインタ座標はCSS拡縮された表示寸法からワールド平面へ変換する', () => {
    const point = pointerOnPlane(380, 190, canvas, camera(), 0);
    assert(Math.abs(point.x) < 1e-8 && Math.abs(point.z) < 1e-8);
});

test('空中待機と確定後はドラッグでき、全体ロール中は禁止し、範囲と出目を保つ', () => {
    const group = new DiceGroup();
    const die = group.add({ id:'a', faces:Array.from({length:6}, () => ({color:'orange',material:'brush'})) });
    const listeners = new Map(); let capture = null;
    const container = { style:{}, classList:{add(){},remove(){}},
        addEventListener:(name,fn) => listeners.set(name,fn), removeEventListener:name=>listeners.delete(name),
        setPointerCapture:id=>{capture=id;}, hasPointerCapture:id=>capture===id, releasePointerCapture:()=>{capture=null;} };
    let clock = 0;
    const taps = [];
    const drag = createDiceDrag({ container, group, renderer:{domElement:canvas}, camera:camera(), visuals:new Map() },
        { onTap: id => taps.push(id), now: () => clock });
    const event = (x,y) => ({ clientX:x,clientY:y,pointerId:1,button:0,isPrimary:true,preventDefault(){},
        target:{closest:()=>({dataset:{dieId:'a'}})} });
    try {
        listeners.get('pointerdown')(event(380,190));
        listeners.get('pointerup')(event(382,191));
        assert.deepEqual(taps, ['a']);
        listeners.get('pointerdown')(event(380,190)); clock += 600;
        listeners.get('pointerup')(event(380,190));
        assert.deepEqual(taps, ['a']);
        listeners.get('pointerdown')(event(380,190));
        listeners.get('pointercancel')(event(380,190));
        assert.deepEqual(taps, ['a']);
        const before = die.body.position.clone();
        listeners.get('pointerdown')(event(380,190));
        listeners.get('pointermove')(event(420,190));
        assert.notEqual(die.body.position.x, before.x);
        assert.equal(die.body.position.y, before.y);
        assert.equal(die.state, 'ready');
        listeners.get('pointerup')(event(420,190));
        assert.deepEqual(taps, ['a']);
        die.begin(); die.settle(2);
        const orientation = die.body.quaternion.clone();
        listeners.get('pointerdown')(event(380,190));
        listeners.get('pointermove')(event(5000,5000));
        assert(fieldContains(die.body.position,1.79));
        assert.equal(die.current,2); assert.deepEqual(die.body.quaternion, orientation);
        group.rolling = true;
        const blocked = die.body.position.clone();
        listeners.get('pointermove')(event(100,100));
        assert.deepEqual(die.body.position,blocked);
        listeners.get('pointerdown')(event(380,190));
        listeners.get('pointermove')(event(420,190));
        assert.deepEqual(die.body.position,blocked);
    } finally { drag.dispose(); group.rolling=false; group.dispose(); }
    assert.equal(listeners.size,0); assert.equal(capture,null);
});

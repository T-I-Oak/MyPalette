import test from 'node:test';
import assert from 'node:assert/strict';
import { diceListPreferences, loadDiceListPreferences, saveDiceListPreferences } from '../../../src/game/diceListPreferences.js';

test('保存版と位置・サイズを検証し、不正な値や未知の版は復元しない', () => {
    assert.deepEqual(diceListPreferences({version:2,position:{x:10,y:20}}),{position:null,size:null});
    assert.deepEqual(diceListPreferences({version:1,position:{x:-1,y:20},size:{width:0,height:100}}),{position:null,size:null});
    assert.deepEqual(diceListPreferences({version:1,position:{x:0,y:20},size:{width:Infinity,height:100}}),{position:{x:0,y:20},size:null});
});
test('共通DataManagerでゲーム名前空間へ保存し、他のキーを保持して再取得できる', () => {
    const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
    const values=new Map([['MyPalette',JSON.stringify({other:{keep:true}})]]);
    Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}});
    try {
        saveDiceListPreferences({x:12,y:34},{width:350,height:280});
        assert.deepEqual(JSON.parse(values.get('MyPalette')),{
            other:{keep:true},'ui.diceList':{version:1,position:{x:12,y:34},size:{width:350,height:280}},
        });
        assert.deepEqual(loadDiceListPreferences(),{position:{x:12,y:34},size:{width:350,height:280}});
        values.set('MyPalette','broken JSON');
        assert.deepEqual(loadDiceListPreferences(),{position:null,size:null});
        Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('blocked');}});
        assert.deepEqual(loadDiceListPreferences(),{position:null,size:null});
        assert.doesNotThrow(()=>saveDiceListPreferences({x:0,y:0},null));
    } finally {
        if(original)Object.defineProperty(globalThis,'localStorage',original);else delete globalThis.localStorage;
    }
});

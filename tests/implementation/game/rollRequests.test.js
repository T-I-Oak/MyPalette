import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game } from '../../../src/game/engine.js';
const settings=JSON.parse(readFileSync(new URL('../../../public/data/cards.json',import.meta.url)));
const settle=game=>{
    const request=game.state.rollRequest;
    game.beginRoll(request.id);
    game.completeRoll(request.id,request.ids.map(id=>({id,status:'settled',index:2})));
};
const make=()=>{const game=new Game(settings,()=>.4,{manualRolls:true});settle(game);return game;};

test('権利リロールは対象だけを待機させ、権利を一度消費し確定まで進行しない',()=>{
    const game=make(),s=game.state;
    const target=s.dice[0],other=s.dice[1];
    game.reroll(target.id);
    assert.equal(s.rerolls,0);assert.deepEqual(s.rollRequest.ids,[target.id]);
    assert.equal(target.current,null);assert.equal(other.current,2);
    assert.throws(()=>game.reroll());assert.throws(()=>game.endDay());
    game.beginRoll(s.rollRequest.id);game.failRoll(s.rollRequest.id);
    assert.equal(s.rerolls,0);settle(game);assert.equal(s.rollRequest,null);
    s.rerolls=1;other.used=true;
    game.reroll();assert.deepEqual(s.rollRequest.ids,s.dice.filter(d=>!d.used).map(d=>d.id));settle(game);
    s.rerolls=1;for(const die of s.dice)die.used=true;
    assert.throws(()=>game.reroll());assert.equal(s.rerolls,1);
});

test('ダイス獲得は新規対象だけを待機させ、後続効果を確定後に再開する',()=>{
    const game=make(),s=game.state,original=s.dice.map(d=>d.id);
    game.run(game.effects([{type:'gainMaterialDice',material:'brush',count:2,lifetime:'temporary'}, {type:'changeFame',amount:5}]));
    assert.equal(s.rollRequest.reason,'acquire');assert.equal(s.rollRequest.ids.length,2);
    assert(s.rollRequest.ids.every(id=>!original.includes(id)));assert.equal(s.fame,0);
    assert.throws(()=>game.endDay());settle(game);assert.equal(s.fame,5);assert.equal(s.rollRequest,null);
});

test('効果リロールは対象選択後に待機し、権利を消費せず後続を停止する',()=>{
    const game=make(),s=game.state;
    game.run(game.effects([{type:'reroll'},{type:'changeFame',amount:3}]));
    assert.equal(s.pending.kind,'dice');assert.equal(s.rollRequest,null);
    assert.equal(s.pending.effectType,'reroll');assert.throws(()=>game.choose([]));
    assert.throws(()=>game.endDay());assert.throws(()=>game.reroll());
    const ids=s.dice.slice(0,2).map(d=>d.id);game.choose(ids);
    assert.deepEqual(s.rollRequest.ids,ids);assert.equal(s.pending,null);assert.equal(s.fame,0);assert.equal(s.rerolls,1);
    settle(game);assert.equal(s.fame,3);assert.equal(s.rerolls,1);
});

test('獲得候補は先に選び、獲得ロール確定後に次の選択へ進む',()=>{
    const game=make(),s=game.state;
    game.run(game.effects([{type:'gainNormalDice',count:1,lifetime:'permanent'},{type:'changeColor',color:'red'}]));
    assert.equal(s.pending.kind,'candidates');game.choose([s.pending.options[0].id]);
    assert.equal(s.pending,null);assert.equal(s.rollRequest.ids.length,1);
    settle(game);assert.equal(s.pending.kind,'dice');
});

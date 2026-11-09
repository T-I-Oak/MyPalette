import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../../../src/game/engine.js';
import {DiceGroup} from '../../../src/dice/DiceGroup.js';
import {syncPaletteSnapshot} from '../../../src/game/paletteSnapshot.js';
const settings=JSON.parse(readFileSync(new URL('../../../public/data/cards.json',import.meta.url)));

for(const count of [13,20,30])test(`${count}個の獲得・物理確定・全体リロール・破棄で後続処理を再開できる`,async()=>{
 let seed=729;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const game=new Game(settings,random,{manualRolls:true}),s=game.state,group=new DiceGroup({random});
 const finish=async()=>{
  syncPaletteSnapshot(group,s.dice,s.rollRequest);
  assert.equal(group.dice.length,s.dice.length);
  const request=s.rollRequest;game.beginRoll(request.id);
  const pending=group.roll(request.ids);
  for(let i=0;i<7200&&group.dice.some(d=>d.state==='rolling');i++)group.step(1/60);
  assert(group.dice.every(d=>d.state!=='rolling'),'all rolls finish');
  const results=await pending;assert(results.every(r=>r.status==='settled'),JSON.stringify(results));
  for(const r of results)assert.equal(r.index,group.get(r.id).top.index);
  game.completeRoll(request.id,results);syncPaletteSnapshot(group,s.dice);
 };
 try{
  await finish();const original=s.dice.map(d=>[d.id,d.current]);
  game.run(game.effects([{type:'gainMaterialDice',material:'brush',count:count-3,lifetime:'temporary'},{type:'changeFame',amount:5}]));
  assert.equal(s.dice.length,count);assert.equal(s.fame,0);await finish();
  assert.equal(s.fame,5);assert.deepEqual(s.dice.slice(0,3).map(d=>[d.id,d.current]),original);
  game.reroll();await finish();assert.equal(s.rollRequest,null);assert.equal(s.phase,'play');
  assert.equal(group.findFaces({material:'brush'}).length>=count-3,true);
  const removed=s.dice.at(-1).id;s.dice.pop();syncPaletteSnapshot(group,s.dice);
  assert.equal(group.dice.length,count-1);assert.throws(()=>group.get(removed));
 }finally{group.dispose();}
});

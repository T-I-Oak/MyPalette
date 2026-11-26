import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Game} from '../../../src/game/engine.js';
import {DiceGroup} from '../../../src/dice/DiceGroup.js';
import {syncPaletteSnapshot} from '../../../src/game/paletteSnapshot.js';
const settings=JSON.parse(readFileSync(new URL('../../../public/data/cards.json',import.meta.url)));

// cannon-es の world.step は1サブステップの実処理時間が上限を超えると残りを打ち切るため、
// 負荷状況で物理の進行量が変わり、シードを固定しても結果が決定的にならない。
// このテストでは performance.now を固定し、打ち切りを発生させない。
performance.now = () => 0;

for(const counts of [[13],[20],[30],[13,20,30]])test(`${counts.join("→")}個の獲得・物理確定・全体リロール・破棄で後続処理を再開できる`,async(t)=>{
 let seed=729;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
 const game=new Game(settings,random,{manualRolls:true}),s=game.state,group=new DiceGroup({random});
 const floorFailures=[];
 const finish=async()=>{
  syncPaletteSnapshot(group,s.dice,s.rollRequest);
  assert.equal(group.dice.length,s.dice.length);
  const request=s.rollRequest;game.beginRoll(request.id);
  const atSettlement=new Map();
  const readMotion=die=>({
   height:die.body.position.y,
   position:{...die.body.position},
   tiltDegrees:Math.acos(Math.max(-1,Math.min(1,die.top.alignment)))*180/Math.PI,
   linearSpeed:die.body.velocity.length(),
   angularSpeed:die.body.angularVelocity.length(),
   velocity:{...die.body.velocity},angularVelocity:{...die.body.angularVelocity},
   quaternion:{...die.body.quaternion},quietSeconds:die.quiet,
  });
  const originals=request.ids.map(id=>{
   const die=group.get(id),settle=die.settle;
   die.settle=function(index){
    const nearby=group.dice.filter(other=>other.id!==id).map(other=>({
     id:other.id,state:other.state,position:{...other.body.position},
     horizontalDistance:Math.hypot(other.body.position.x-this.body.position.x,other.body.position.z-this.body.position.z),
     distance:other.body.position.distanceTo(this.body.position),
    })).sort((a,b)=>a.horizontalDistance-b.horizontalDistance);
    atSettlement.set(id,{...readMotion(this),nearby});return settle.call(this,index);
   };
   return {die,settle};
  });
  const pending=group.roll(request.ids);
  const startScale=group.fieldScale;
  let steps=0;
  for(;steps<18000&&group.dice.some(d=>d.state==='rolling');steps++)group.step(1/60);
  t.diagnostic(`${s.dice.length} dice (${request.reason}): ${(steps/60).toFixed(2)}s, scale ${startScale.toFixed(4)} → ${group.fieldScale.toFixed(4)}, max retries ${Math.max(...request.ids.map(id=>group.get(id).attempts))}`);
  assert(group.dice.every(d=>d.state!=='rolling'),'all rolls finish');
  const results=await pending;
  for(const {die,settle} of originals)die.settle=settle;
  assert(results.every(r=>r.status==='settled'),JSON.stringify(results));
  for(const r of results){
   const die=group.get(r.id);
   assert.equal(r.index,die.top.index);
   // 許容する傾きと小さな浮きを含め、中心が床から十分低いことを独立に検査する。
   if(die.body.position.y<.85||die.body.position.y>=1.2){
    t.diagnostic(`floor failure ${r.id}: ${JSON.stringify({atSettlement:atSettlement.get(r.id),atCheck:readMotion(die)})}`);
    floorFailures.push(`${s.dice.length} dice, ${r.id} must rest on the floor: center height=${die.body.position.y}`);
   }
  }
  game.completeRoll(request.id,results);syncPaletteSnapshot(group,s.dice);
 };
 try{
  await finish();
  for(const count of counts){
  const original=s.dice.map(d=>[d.id,d.current]);
  const before=s.dice.length,previousFame=s.fame,previousScale=group.fieldScale;
  game.run(game.effects([{type:'gainMaterialDice',material:'brush',count:count-before,lifetime:'temporary'},{type:'changeFame',amount:5}]));
  assert.equal(s.dice.length,count);assert.equal(s.fame,previousFame);await finish();
  assert(group.fieldScale>=previousScale);
  assert.equal(s.fame,previousFame+5);assert.deepEqual(s.dice.slice(0,before).map(d=>[d.id,d.current]),original);
  if(count===counts.at(-1)){game.reroll();await finish();assert.equal(s.rollRequest,null);assert.equal(s.phase,'play');}
  assert.equal(group.findFaces({material:'brush'}).length>=count-3,true);
  }
  const count=counts.at(-1);
  const removed=s.dice.at(-1).id;s.dice.pop();syncPaletteSnapshot(group,s.dice);
  assert.equal(group.dice.length,count-1);assert.throws(()=>group.get(removed));
  assert.deepEqual(floorFailures,[],floorFailures.join('\n'));
 }finally{group.dispose();}
});

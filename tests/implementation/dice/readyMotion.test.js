import test from 'node:test';
import assert from 'node:assert/strict';
import { DiceGroup } from '../../../src/dice/DiceGroup.js';
import { READY_HEIGHT } from '../../../src/dice/pose.js';

test('停止姿勢からアイコンの帰還を待ち、連続して上昇・回転し、完了前のロールを拒否する',async()=>{
 const group=new DiceGroup(),die=group.add({id:'a',faces:Array.from({length:6},()=>({color:'orange',material:'brush'}))});
 die.begin();die.settle(2);die.body.position.y=1;
 const start=die.body.quaternion.clone();
 try{
  die.prepare({animated:true});
  assert.equal(die.body.position.y,1);assert.deepEqual(die.body.quaternion,start);
  assert.equal(die.readyMotion.result.index,2);
  await assert.rejects(group.roll(['a']));
  for(let i=0;i<5;i++)group.step(.05);
  assert.equal(die.body.position.y,1);
  for(let i=0;i<5;i++)group.step(.05);
  assert(die.body.position.y>1&&die.body.position.y<READY_HEIGHT);
  for(let i=0;i<12;i++)group.step(.05);
  assert.equal(die.readyMotion,null);assert.equal(die.body.position.y,READY_HEIGHT);
  const before=die.body.quaternion.clone();group.step(.001);
  const q=die.body.quaternion;
  assert(Math.abs(before.x*q.x+before.y*q.y+before.z*q.z+before.w*q.w)>.9999);
 }finally{group.dispose();}
});

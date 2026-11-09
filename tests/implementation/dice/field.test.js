import test from 'node:test';
import assert from 'node:assert/strict';
import { fieldContains, constrainToField, fieldSpawn, FIELD_POLYGON } from '../../../src/dice/field.js';
test('穴と外縁を避け、絵の具の領域も使える範囲にする',()=>{
 for(const point of [{x:-100,z:0},{x:100,z:20},{x:0,z:-50},{x:0,z:50}])assert(fieldContains(constrainToField(point),1.79));
 assert(!fieldContains({x:9,z:1}));
 assert(fieldContains({x:0,z:-2},1.79));
 assert(fieldContains({x:-8,z:0},1.79));
 for(let i=0;i<12;i++)assert(fieldContains(fieldSpawn(i),1.79));
 for(const [x,z] of FIELD_POLYGON)assert(!fieldContains({x,z},.9));
});

import { DiceGroup } from '../../../src/dice/DiceGroup.js';
test('12個のロール中と位置指定後も穴・外縁へ出ない',async()=>{
 const group=new DiceGroup({random:()=>.37});
 for(let i=0;i<12;i++)group.add({id:String(i),faces:Array.from({length:6},()=>({material:'brush',color:'orange'}))});
 group.get('0').setPosition({x:-100,y:2.5,z:100});assert(fieldContains(group.get('0').body.position,1.79));
 const pending=group.roll();
 for(let i=0;i<3600&&group.rolling;i++){
  group.step(1/60);
  for(const die of group.dice)assert(fieldContains(die.body.position,1.79));
 }
 const results=await pending;assert(results.every(result=>result.status==='settled'));group.dispose();
});

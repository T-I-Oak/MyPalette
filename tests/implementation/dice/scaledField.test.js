import test from 'node:test';
import assert from 'node:assert/strict';
import {DiceGroup} from '../../../src/dice/DiceGroup.js';
import {FIELD_WIDTH,FIELD_DEPTH,FIELD_MARGIN,fieldSpawn,fieldContains,fieldEdges,fieldCenterVertices} from '../../../src/dice/field.js';
import {paletteSizeForScale,paletteCameraBounds,paletteMetrics} from '../../../src/dice/paletteLayout.js';
import {dragPosition} from '../../../src/dice/dragPosition.js';

test('拡大しても画像比率とダイスの余白を保つ',()=>{
 let previous=0;
 for(const scale of [1,1.1,1.21,2,10]){
  const count=30;
  const size=paletteSizeForScale(scale),bounds=paletteCameraBounds(size.width,size.height,scale);
  assert(scale>=previous);previous=scale;
  assert(Math.abs((FIELD_WIDTH*scale)/(FIELD_DEPTH*scale)-FIELD_WIDTH/FIELD_DEPTH)<1e-12);
  assert.deepEqual(size,{width:536,height:232});
  assert(Math.abs(bounds.bottom+FIELD_DEPTH*scale*(15/Math.hypot(15,9))/2+.4*scale)<1e-9);
  for(let slot=0;slot<count;slot++)assert(fieldContains(fieldSpawn(slot,scale),FIELD_MARGIN-1e-6,scale));
  for(const point of fieldCenterVertices(FIELD_MARGIN,scale))assert(fieldContains(point,FIELD_MARGIN-1e-6,scale));
  assert.equal(fieldEdges(scale).length,fieldEdges().length);
 }
});

test('個数で拡大せず、再投入による拡大後は減少してもサイズと状態を維持する',()=>{
 const group=new DiceGroup(),faces=Array.from({length:6},()=>({material:'brush',color:'orange'}));
 try{
  for(let i=0;i<30;i++)group.add({id:String(i),faces});
  const die=group.get('0');die.current=3;die.state='settled';die.setConsumed(true);
  assert.equal(group.fieldScale,1);
  group.expandField();
  const scale=group.fieldScale;
  const destination=dragPosition(group,die,{x:10000,y:die.body.position.y,z:10000});
  assert(fieldContains(destination,FIELD_MARGIN-1e-6,scale));
  for(let i=29;i>=12;i--)group.remove(String(i));
  assert.equal(group.fieldScale,1.03);assert.equal(die.current,3);assert.equal(die.consumed,true);
  assert(fieldContains(die.body.position,FIELD_MARGIN-1e-6,scale));
  group.remove('5');const replacement=group.add({id:'replacement',faces});assert.equal(replacement.slot,5);
 }finally{group.dispose();}
});


test('再投入のたびに1.03倍に広げ、同時の複数対象でも個別に拡大し8回超も続行する',async()=>{
 const group=new DiceGroup(),faces=Array.from({length:6},()=>({material:'brush',color:'orange'}));
 const a=group.add({id:'a',faces}),b=group.add({id:'b',faces}),fixed=group.add({id:'fixed',faces,position:{x:4,y:1,z:0}});
 fixed.current=2;fixed.state='settled';const quaternion=fixed.body.quaternion.clone();
 const pending=group.roll(['a','b']);
 group.world.step=()=>{};
 const fail=die=>{die.body.position.y=3;die.body.velocity.setZero();die.body.angularVelocity.setZero();die.quiet=.81;};
 try{
  fail(a);group.step(1/60);assert.equal(group.fieldScale,1.03);
  fail(a);fail(b);group.step(1/60);
  assert.ok(Math.abs(group.fieldScale-1.03**3)<1e-12);
  assert.ok(Math.abs(fixed.body.position.x-4*1.03**3)<1e-12);
  assert.equal(fixed.body.position.y,1);assert.deepEqual(fixed.body.quaternion,quaternion);assert.equal(fixed.current,2);
  for(let i=0;i<8;i++){fail(a);group.step(1/60);}
  assert.equal(a.attempts,10);assert.equal(a.state,'rolling');
  assert.ok(Math.abs(group.fieldScale-1.03**11)<1e-12);
  a.settle(0);b.settle(0);await pending;
  assert.ok(Math.abs(group.fieldScale-1.03**11)<1e-12);
  const next=group.roll(['a']);assert.equal(a.attempts,0);a.cancel();await next;
  assert.ok(Math.abs(group.fieldScale-1.03**11)<1e-12);
 }finally{group.dispose();await pending;}
});

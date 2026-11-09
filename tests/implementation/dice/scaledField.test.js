import test from 'node:test';
import assert from 'node:assert/strict';
import {DiceGroup} from '../../../src/dice/DiceGroup.js';
import {FIELD_WIDTH,FIELD_DEPTH,FIELD_MARGIN,paletteScaleForCount,fieldSpawn,fieldContains,fieldEdges,fieldCenterVertices} from '../../../src/dice/field.js';
import {paletteSizeForScale,paletteCameraBounds,paletteMetrics} from '../../../src/dice/paletteLayout.js';
import {dragPosition} from '../../../src/dice/dragPosition.js';

test('固定上限を持たず、画像比率とダイスの余白を保って個数に応じて拡大する',()=>{
 let previous=0;
 for(const count of [3,12,13,20,30,100,1000]){
  const scale=paletteScaleForCount(count),size=paletteSizeForScale(scale),bounds=paletteCameraBounds(size.width,size.height,scale);
  assert(scale>=previous);previous=scale;
  assert.equal((FIELD_WIDTH*scale)/(FIELD_DEPTH*scale),FIELD_WIDTH/FIELD_DEPTH);
  assert(size.width>=FIELD_WIDTH*scale*paletteMetrics.pixelsPerUnit);
  assert(Math.abs(bounds.bottom+FIELD_DEPTH*scale*(15/Math.hypot(15,9))/2+.4)<1e-9);
  for(let slot=0;slot<count;slot++)assert(fieldContains(fieldSpawn(slot,scale),FIELD_MARGIN-1e-6,scale));
  for(const point of fieldCenterVertices(FIELD_MARGIN,scale))assert(fieldContains(point,FIELD_MARGIN-1e-6,scale));
  assert.equal(fieldEdges(scale).length,fieldEdges().length);
 }
});

test('拡大後も外縁ガードと移動・面・消費状態を維持し、減少時も縮小する',()=>{
 const group=new DiceGroup(),faces=Array.from({length:6},()=>({material:'brush',color:'orange'}));
 try{
  for(let i=0;i<30;i++)group.add({id:String(i),faces});
  const die=group.get('0');die.current=3;die.state='settled';die.setConsumed(true);
  const scale=group.fieldScale;
  const destination=dragPosition(group,die,{x:10000,y:die.body.position.y,z:10000});
  assert(fieldContains(destination,FIELD_MARGIN-1e-6,scale));
  for(let i=29;i>=12;i--)group.remove(String(i));
  assert.equal(group.fieldScale,1);assert.equal(die.current,3);assert.equal(die.consumed,true);
  assert(fieldContains(die.body.position,FIELD_MARGIN-1e-6));
  group.remove('5');const replacement=group.add({id:'replacement',faces});assert.equal(replacement.slot,5);
 }finally{group.dispose();}
});

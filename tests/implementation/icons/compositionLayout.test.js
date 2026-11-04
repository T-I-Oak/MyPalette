import test from 'node:test';
import assert from 'node:assert/strict';
import { compositionLayout, ICON_SIZES } from '../../../src/icons/compositionLayout.js';
const outlineFor = node => node.kind==='arrowQuantity'?[30,20,70,80]:[10,10,70,90];
import {effectIconPlan} from '../../../src/icons/iconPlan.js';
test('メイン・サブは共通の高さと輪郭間隔で配置する',()=>{
 for(const effect of [{type:'changeSpecialFace',face:'fame1'},{type:'discardDice',count:1},{type:'reroll'}]){
  const nodes=effectIconPlan(effect).nodes;const layout=compositionLayout(nodes,outlineFor);
  assert.equal(nodes.filter(n=>n.role==='main').length,1);assert.equal(nodes.filter(n=>n.role==='sub').length,1);
  for(const slot of layout.slots){assert.ok(Math.abs(slot.height-ICON_SIZES[slot.node.role])<1e-9);}
  assert.ok(Math.abs(layout.slots[1].left-layout.slots[0].right-ICON_SIZES.gap)<1e-9);
 }
});


test('手札交換とドローはメインと数量の全境界を8単位でつなぐ',()=>{
 for(const effect of [{type:'drawCards',count:1},{type:'drawCards',count:10},{type:'exchangeCards',count:1},{type:'exchangeCards',count:10}]){
  const layout=compositionLayout(effectIconPlan(effect).nodes,outlineFor);
  assert.equal(layout.slots.length,effect.type==='drawCards'?2:3);
  for(let i=0;i<layout.slots.length;i++){
   const slot=layout.slots[i];
   if(slot.node.role==='main')assert.ok(Math.abs(slot.height-80)<1e-9);
   if(i)assert.ok(Math.abs(slot.left-layout.slots[i-1].right-8)<1e-9);
  }
 }
});

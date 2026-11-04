import test from 'node:test';
import assert from 'node:assert/strict';
import { effectIconPlan, faceEffectIconPlan, goalIconPlan } from '../../../src/icons/iconPlan.js';
import { EFFECTS, SPECIAL_FACE_EFFECTS } from '../../../src/effectCatalog.js';

test('全効果の必須属性を検証し、数量や変更先を省略せず保持する',()=>{
 for(const definition of EFFECTS){
  const effect={type:definition.type};
  for(const f of definition.fields)effect[f.name]=f.options?.[0]??(f.name==='amount'?-8:2);
  const plan=effectIconPlan(effect);assert.equal(plan.effect.type,effect.type);
  for(const f of definition.fields)assert.equal(plan.effect[f.name],effect[f.name]);
  for(const f of definition.fields){const missing={...effect};delete missing[f.name];assert.throws(()=>effectIconPlan(missing));}
 }
});
test('全特殊面は共通効果の計画を使い、面変更の入れ子にも同じ効果を渡す',()=>{
 for(const [face,effect] of Object.entries(SPECIAL_FACE_EFFECTS)){
  const nested=effectIconPlan({type:'changeSpecialFace',face});
  assert.deepEqual(nested.nodes[1].effect,effect);
  assert.deepEqual(effectIconPlan(effect).effect,effect);
 }
});
test('取得では×1を表示し、数値の意味を区別する',()=>{
 assert.equal(effectIconPlan({type:'gainRerolls',count:1}).nodes.at(-1).value,'×1');
 assert.equal(effectIconPlan({type:'gainRerolls',count:10}).nodes.at(-1).value,'×10');
 assert.equal(effectIconPlan({type:'changeFame',amount:-7}).nodes[0].amount,-7);
 assert.equal(effectIconPlan({type:'drawCards',count:1}).nodes[1].value,'+1');
 for(const effect of [{type:'drawCards',count:0},{type:'changeFame',amount:0},{type:'gainNormalDice',count:1,lifetime:'other'},{type:'changeColor',color:'cyan'},{type:'changeCardStep',step:3},{type:'unknown'}])assert.throws(()=>effectIconPlan(effect));
});
test('目標は画材・色・画材＋色を受け付け、空条件や未知属性を拒否する',()=>{
 for(const goal of [{material:'brush'},{color:'orange'},{material:'airbrush',color:'purple'}])assert.deepEqual(goalIconPlan(goal).condition,goal);
 for(const goal of [{},{material:'pen'},{color:'cyan'},{material:'brush',extra:true}])assert.throws(()=>goalIconPlan(goal));
});

test('手札交換は左右の対象の間に、右矢印・左矢印・数量をまとめる',()=>{
 for(const count of [1,2,10]){
  const plan=effectIconPlan({type:'exchangeCards',count});
  assert.equal(plan.nodes.length,3);
  assert.deepEqual(plan.nodes[1],{kind:'arrowQuantity',arrows:['→','←'],value:`×${count}`});
 }
});

test('矢印付き数量は1も表示し、単独数量を右端に追加しない',()=>{
 for(const type of ['drawCards','gainStockCards','exchangeCards'])for(const count of [1,2,10]){
  const plan=effectIconPlan({type,count});
  const quantity=plan.nodes.filter(node=>node.kind==='arrowQuantity');assert.equal(quantity.length,1);
  assert.equal(quantity[0].value,`${type==='drawCards'?'+':'×'}${count}`);
  assert.equal(plan.nodes.some(node=>node.kind==='quantity'),false);
 }
 for(const count of [1,2]){
  const nodes=effectIconPlan({type:'discardDice',count}).nodes;
  assert.equal(nodes.some(n=>n.kind==='quantity'),count!==1);
  if(count!==1)assert.equal(nodes.at(-1).value,'×2');
 }
});

test('名声は数量を含む月桂冠として＋1も維持する',()=>{
 const plan=effectIconPlan({type:'changeFame',amount:1});
 assert.deepEqual(plan.nodes,[{kind:'fame',amount:1}]);
});

test('ダイスとリロール権の取得は×1を含む数量を右端に表示する',()=>{
 for(const count of [1,2,10])for(const effect of [
  {type:'gainNormalDice',lifetime:'permanent',count},
  {type:'gainColorDice',lifetime:'temporary',colors:'red_green',count},
  {type:'gainMaterialDice',lifetime:'temporary',material:'brush',count},
  {type:'gainRerolls',count},
 ])assert.deepEqual(effectIconPlan(effect).nodes.at(-1),{kind:'quantity',value:`×${count}`});
 assert.equal(effectIconPlan({type:'discardDice',count:1}).nodes.some(n=>n.kind==='quantity'),false);
});

test('面内の取得×1は省略し、直接のカード効果とドロー＋1は維持する',()=>{
 for(const effect of Object.values(SPECIAL_FACE_EFFECTS)){
  const face=faceEffectIconPlan(effect);
  assert.equal(face.nodes.some(n=>n.kind==='quantity'&&n.value==='×1'),false);
  if(effect.type.startsWith('gain'))assert.equal(effectIconPlan(effect).nodes.at(-1).value,'×1');
  if(effect.type==='drawCards')assert.equal(face.nodes.at(-1).value,'+1');
 }
 assert.equal(faceEffectIconPlan({type:'gainRerolls',count:2}).nodes.at(-1).value,'×2');
});

test('再利用アイコン案は描画できる種類に含め、ゲームの効果候補は増やさない',()=>{
 assert.equal(effectIconPlan({type:'refreshDice'}).nodes[0].kind,'refreshedDie');
 assert.equal(EFFECTS.some(effect=>effect.type==='refreshDice'),false);
});

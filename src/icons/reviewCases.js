import { EFFECTS, COLORS, MATERIALS, COLOR_PAIRS, SPECIAL_FACES, displayLabel } from '../effectCatalog.js';

export const ICON_REVIEW_CASES = [];
function add(id,label,effect){ICON_REVIEW_CASES.push({id,label,effect});}
// New shapes first. Each item is displayed separately; no implicit approval.
for(const color of COLORS)add(`color-${color}`,`面の色変更：${displayLabel(color)}`,{type:'changeColor',color});
for(const material of MATERIALS)add(`material-${material}`,`面の画材変更：${displayLabel(material)}`,{type:'changeMaterial',material});
for(const face of SPECIAL_FACES)add(`special-${face}`,`特殊面への変更：${displayLabel(face)}`,{type:'changeSpecialFace',face});
for(const count of [1,2,10])add(`discard-${count}`,`ダイス破棄 ×${count}`,{type:'discardDice',count});
add('reroll','即時リロール',{type:'reroll'});
add('refresh','使用済みダイスの再利用',{type:'refreshDice'});
for(const count of [1,2,10]){
 add(`stock-${count}`,`ストックから獲得 ×${count}`,{type:'gainStockCards',count});
 add(`exchange-${count}`,`手札交換 ×${count}`,{type:'exchangeCards',count});
}
for(const step of [0,1,2])add(`step-${step}`,`カードのステップを${step}へ変更`,{type:'changeCardStep',step});
add('activate','特殊面の即時適用',{type:'activateSpecialFaces'});
for(const lifetime of ['permanent','temporary'])for(const count of [1,2,10]){
 add(`normal-${lifetime}-${count}`,`通常${displayLabel(lifetime)}ダイス ×${count}`,{type:'gainNormalDice',lifetime,count});
 for(const colors of COLOR_PAIRS)add(`pair-${colors}-${lifetime}-${count}`,`${displayLabel(colors)}・${displayLabel(lifetime)}ダイス ×${count}`,{type:'gainColorDice',colors,lifetime,count});
 for(const material of MATERIALS)add(`gain-${material}-${lifetime}-${count}`,`${displayLabel(material)}・${displayLabel(lifetime)}ダイス ×${count}`,{type:'gainMaterialDice',material,lifetime,count});
}
for(const amount of [-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,1,2,3,4,5,6,7,8,9,10])add(`fame-${amount}`,`名声 ${amount>0?'+':''}${amount}`,{type:'changeFame',amount});
for(const count of [1,2,3,4,5,6,7,8,9,10])add(`draw-${count}`,`ドロー +${count}`,{type:'drawCards',count});
for(const count of [1,2,10])add(`ticket-${count}`,`リロール権 ×${count}`,{type:'gainRerolls',count});
for(const material of MATERIALS)ICON_REVIEW_CASES.push({id:`goal-${material}`,label:`目標：${displayLabel(material)}`,condition:{material}});
for(const color of COLORS)ICON_REVIEW_CASES.push({id:`goal-${color}`,label:`目標：${displayLabel(color)}`,condition:{color}});
for(const material of MATERIALS)for(const color of COLORS)ICON_REVIEW_CASES.push({id:`goal-${material}-${color}`,label:`目標：${displayLabel(material)}・${displayLabel(color)}`,condition:{material,color}});
// Ensure catalog additions are not silently absent from review.
for(const definition of EFFECTS)if(!ICON_REVIEW_CASES.some(item=>item.effect?.type===definition.type))throw new Error(`Missing review case: ${definition.type}`);

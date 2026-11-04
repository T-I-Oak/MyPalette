import { effectIconCanvas, goalIconCanvas } from './render.js';
import { ICON_REVIEW_CASES } from './reviewCases.js';
import './layout.css';

function element(tag,className,text){const node=document.createElement(tag);node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function mountIconLab(root,home){
 const lab=element('section','IconLab');const toolbar=element('nav','Toolbar');
 const back=element('button','Button','入口へ戻る');back.addEventListener('click',home);
 const previous=element('button','Button','前のアイコン');const next=element('button','Button','次のアイコン');
 const choices=[];const byKey=new Map();
 const choiceKey=item=>{const effect=item.effect&&{...item.effect};if(effect){delete effect.count;delete effect.amount;}return JSON.stringify(effect??item.condition);};
 for(const item of ICON_REVIEW_CASES){
  const key=choiceKey(item);if(byKey.has(key))continue;
  const parameter=item.effect&&('count' in item.effect?'count':'amount' in item.effect?'amount':null);
  const label=parameter==='amount'?'名声値変更':parameter?item.label.replace(/\s*[×+]\d+$/,''):item.label;
  const choice={...item,label,parameter};choices.push(choice);byKey.set(key,choice);
 }
 const select=element('select','');select.setAttribute('aria-label','アイコンの種類');
 for(const item of choices){const option=element('option','',item.label);option.value=item.id;select.append(option);}
 const quantityField=element('label','Field');const quantityCaption=element('span','','数量');
 const quantity=element('input','');quantity.type='number';quantity.step='1';quantity.value='1';quantity.required=true;
 quantityField.append(quantityCaption,quantity);toolbar.append(back,previous,next,select,quantityField);
 const heading=element('h2','');
 const content=element('div','IconComparisons');const note=element('output','');note.setAttribute('aria-live','polite');
 lab.append(toolbar,heading,content,note);root.replaceChildren(lab);
 const requested=new URLSearchParams(location.search).get('icon');
 const requestedItem=ICON_REVIEW_CASES.find(item=>item.id===requested);
 let index=requestedItem?choices.indexOf(byKey.get(choiceKey(requestedItem))):0;
 if(choices[index].parameter)quantity.value=String(requestedItem?.effect?.[choices[index].parameter]??1);
 function render(){
  previous.disabled=index===0;next.disabled=index===choices.length-1;
  const item=choices[index];select.value=item.id;heading.textContent=item.label;content.replaceChildren();note.textContent='';
  quantityField.hidden=!item.parameter;
  quantityCaption.textContent=item.parameter==='amount'?'増減値':'数量';
  quantity.setAttribute('aria-label',quantityCaption.textContent);
  if(item.parameter==='count')quantity.min='1';else quantity.removeAttribute('min');
  const value=quantity.valueAsNumber;
  if(item.parameter&&(!Number.isSafeInteger(value)||(item.parameter==='count'?value<1:value===0))){
   note.textContent=item.parameter==='count'?'数量は1以上の整数を入力してください。':'増減値は0以外の整数を入力してください。';return;
  }
  const effect=item.effect?{...item.effect,...(item.parameter?{[item.parameter]:value}:{})}:null;
  for(const [texture,label] of [['texture-surface-warm','明るい暖色の背景'],['texture-surface-cool','明るい寒色の背景']]){
   const panel=element('section',`IconPreview Surface ${texture}`);panel.append(element('h3','',label));
   for(const size of [128,48,32]){
    const figure=element('figure','IconSample');const icon=effect?effectIconCanvas(effect,size*2):goalIconCanvas(item.condition,size*2);
    // CSS dimensions follow the requested preview size, not a second icon renderer.
    icon.style.height=`${size}px`;icon.style.width=`${icon.width/2}px`;icon.setAttribute('role','img');icon.setAttribute('aria-label',item.label+(item.parameter?` ${value}`:''));
    figure.append(icon,element('figcaption','',`高さ ${size}px`));panel.append(figure);
   }
   content.append(panel);
  }
 }
 function choose(newIndex){
  if(newIndex<0||newIndex>=choices.length)return;
  const old=choices[index].parameter;index=newIndex;
  if(choices[index].parameter!==old)quantity.value='1';render();
 }
 select.addEventListener('change',()=>choose(choices.findIndex(item=>item.id===select.value)));
 previous.addEventListener('click',()=>choose(index-1));
 next.addEventListener('click',()=>choose(index+1));
 quantity.addEventListener('input',render);render();
}

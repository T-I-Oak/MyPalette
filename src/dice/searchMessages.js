import {expandLanguageResource} from '../../../GameWorksOAK/src/lib/core/i18n.js';

const translated=(ja,en)=>({'lang-store':{ja,en}});
const resources={
    one:translated('{condition} を含むダイスが{count}個あります','{count} die contains {condition}.'),
    many:translated('{condition} を含むダイスが{count}個あります','{count} dice contain {condition}.'),
    none:translated('{condition} を含むダイスはありません','No dice contain {condition}.'),
    paletteNone:translated('{condition} を含む画材ダイスはありません','No material dice contain {condition}.'),
    pair:translated('{material}・{color}','{color} {material}'),
    faceOne:translated('{condition}：{count}面','{condition}: {count} matching face'),
    faceMany:translated('{condition}：{count}面','{condition}: {count} matching faces'),
    labels:{brush:translated('絵筆','Brush'),pastel:translated('パステル','Pastel'),airbrush:translated('エアブラシ','Airbrush'),
        orange:translated('橙','Orange'),yellow:translated('黄','Yellow'),green:translated('緑','Green'),
        blue:translated('青','Blue'),purple:translated('紫','Purple'),red:translated('赤','Red')}
};
function label(condition,text){
    return condition.material && condition.color?text.pair.replace('{material}',text.labels[condition.material]).replace('{color}',text.labels[condition.color]):text.labels[condition.material??condition.color];
}
export function describeSearchCondition(condition){const text=expandLanguageResource(resources);return label(condition,text);}
export function searchNoticeParts({condition,diceCount},{palette=false}={}){
    const text=expandLanguageResource(resources),template=text[palette&&diceCount===0?'paletteNone':diceCount===0?'none':diceCount===1?'one':'many'];
    return template.split(/(\{condition\}|\{count\})/).filter(Boolean).map(part=>
        part==='{condition}'?{condition,label:label(condition,text)}:part==='{count}'?String(diceCount):part);
}
export function describeFaceCount(condition,count){
    const text=expandLanguageResource(resources);
    return text[count===1?'faceOne':'faceMany'].replace('{condition}',label(condition,text)).replace('{count}',String(count));
}

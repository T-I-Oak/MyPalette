import { drawGlyphText, measureGlyphText } from './glyphs.js';
import { drawFameIcon } from './laurel.js';
import { INKS, LETTERS, materialSymbol, drawDieSymbol, drawHandSymbol, drawStockSymbol, reroll, rerollTicket } from './symbols.js';
import { measuredOutline } from './outlineBounds.js';
import { compositionLayout } from './compositionLayout.js';
import { drawQuantity } from './quantity.js';
import { effectIconPlan, faceEffectIconPlan, goalIconPlan } from './iconPlan.js';

const OUTLINE = '#394b47';
function diamond(ctx, half=32) {
    ctx.save(); ctx.translate(50,50); ctx.rotate(Math.PI/4);
    ctx.beginPath(); ctx.roundRect(-half,-half,half*2,half*2,half===30?6:5); ctx.restore();
}
function star(ctx) {
    ctx.beginPath();
    for(let i=0;i<10;i++){
        const angle=-Math.PI/2+i*Math.PI/5,r=i%2?12:27;
        const x=50+Math.cos(angle)*r,y=50+Math.sin(angle)*r;
        if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);
    }
    ctx.closePath(); ctx.fillStyle=OUTLINE;ctx.fill();
}
function pen(ctx) {
    ctx.save();ctx.translate(50,50);ctx.rotate(.6);
    ctx.fillStyle='#f2ce79';ctx.beginPath();ctx.roundRect(-9,-34,18,51,3);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-9,17);ctx.lineTo(0,37);ctx.lineTo(9,17);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=OUTLINE;ctx.beginPath();ctx.moveTo(-4,28);ctx.lineTo(0,37);ctx.lineTo(4,28);ctx.closePath();ctx.fill();ctx.restore();
}
function arrow(ctx) { drawGlyphText(ctx,'←',50,50,35,OUTLINE,'#fff'); }
function face(ctx,node) {
    diamond(ctx);ctx.fillStyle=node.color?INKS[node.color]:'#fff';ctx.fill();ctx.stroke();
    if(node.color)drawGlyphText(ctx,LETTERS[node.color],50,50,38,'#fff',true);
    if(node.material){ctx.save();ctx.translate(24,24);ctx.scale(.52,.52);materialSymbol(ctx,node.material);ctx.restore();}
    if(node.star)star(ctx);
    if(node.effect){
        const plan=faceEffectIconPlan(node.effect),width=planWidth(plan);
        ctx.save();ctx.translate(50,50);const scale=Math.min(65/width,.58);ctx.scale(scale,scale);ctx.translate(-width/2,-50);drawPlan(ctx,plan);ctx.restore();
    }
}
function goal(ctx,node){
    ctx.save();
    ctx.beginPath();ctx.roundRect(8,8,84,84,8);
    ctx.fillStyle=node.material?'#fff':INKS[node.color];
    ctx.strokeStyle=OUTLINE;ctx.lineWidth=3;ctx.fill();ctx.stroke();
    if(node.material){
        ctx.translate(15,15);ctx.scale(.7,.7);materialSymbol(ctx,node.material,node.color);
    }else{
        drawGlyphText(ctx,LETTERS[node.color],50,50,44,'#fff',true);
    }
    ctx.restore();
}
function nodeWidth(node){
    if(node.kind==='hand'||node.kind==='stock')return 64;
    if(node.kind==='arrowQuantity')return Math.max(44,measureGlyphText(node.value,23)+8);
    if(node.kind==='quantity')return Math.max(60,measureGlyphText(node.value,29)+14);
    return ['pen','arrow','exchange','lightning'].includes(node.kind)?60:100;
}
function hasComposition(plan){return plan.nodes.some(node=>node.role||node.kind==='quantity'||node.kind==='arrowQuantity');}
function measuredLayout(plan){return compositionLayout(plan.nodes,node=>measuredOutline(node,drawNode));}
function planWidth(plan){if(hasComposition(plan))return measuredLayout(plan).width;return plan.nodes.reduce((width,node)=>width+(node.gapBefore??0)+nodeWidth(node),0);}
function drawNode(ctx,node){
    switch(node.kind){
        case 'refreshedDie':
            drawDieSymbol(ctx,{baseColor:'#b8bec4'});
            ctx.save();ctx.translate(6,0);ctx.fillStyle='#fff9c7';ctx.strokeStyle=OUTLINE;ctx.lineWidth=2.5;
            ctx.beginPath();ctx.moveTo(86,1);ctx.quadraticCurveTo(88,13,98,16);
            ctx.quadraticCurveTo(88,19,86,31);ctx.quadraticCurveTo(84,19,74,16);
            ctx.quadraticCurveTo(84,13,86,1);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();break;
        case 'die':drawDieSymbol(ctx,node);break;
        case 'ticket':rerollTicket(ctx);break;
        case 'reroll':ctx.save();ctx.translate(-23,-45);ctx.scale(1.85,1.85);reroll(ctx);ctx.restore();break;
        case 'fame':drawFameIcon(ctx,node.amount);break;
        case 'hand':ctx.translate(19,-1);drawHandSymbol(ctx);break;
        case 'stock':drawStockSymbol(ctx);break;
        case 'pen':pen(ctx);break;
        case 'face':face(ctx,node);break;
        case 'goal':goal(ctx,node);break;
        case 'arrow':arrow(ctx);break;
        case 'arrowQuantity':drawQuantity(ctx,node);break;
        case 'quantity':drawGlyphText(ctx,node.value,50,50,29,OUTLINE,'#fff');break;
        case 'card':ctx.fillStyle='#fff';ctx.beginPath();ctx.roundRect(23,13,54,74,4);ctx.fill();ctx.stroke();drawGlyphText(ctx,String(node.step),50,50,39,OUTLINE,'#fff');break;
        case 'trash':
            ctx.fillStyle='#edf0ed';ctx.beginPath();ctx.moveTo(26,31);ctx.lineTo(31,83);ctx.lineTo(69,83);ctx.lineTo(74,31);ctx.closePath();ctx.fill();ctx.stroke();
            ctx.beginPath();ctx.moveTo(20,25);ctx.lineTo(80,25);ctx.moveTo(39,25);ctx.lineTo(39,15);ctx.lineTo(61,15);ctx.lineTo(61,25);ctx.moveTo(43,40);ctx.lineTo(44,72);ctx.moveTo(57,40);ctx.lineTo(56,72);ctx.stroke();break;
        case 'lightning':ctx.fillStyle='#dbb61e';ctx.beginPath();ctx.moveTo(57,9);ctx.lineTo(24,54);ctx.lineTo(48,54);ctx.lineTo(35,91);ctx.lineTo(77,40);ctx.lineTo(52,40);ctx.closePath();ctx.fill();ctx.stroke();break;
        default:throw new Error(`Unknown icon node: ${node.kind}`);
    }
}
function drawPlan(ctx,plan){
    if(hasComposition(plan)){
        for(const slot of measuredLayout(plan).slots){
            ctx.save();ctx.translate(slot.x,slot.y);ctx.scale(slot.scale,slot.scale);drawNode(ctx,slot.node);ctx.restore();
        }
        return;
    }
    let x=0;
    for(const node of plan.nodes){
        x+=node.gapBefore??0;
        const width=nodeWidth(node);ctx.save();ctx.translate(x,0);
        // narrow symbols retain their height and are centered in their allocated column.
        ctx.translate((width-100)/2,0);drawNode(ctx,node);ctx.restore();x+=width;
    }
}
function canvasFor(plan,height){
    if(!Number.isSafeInteger(height)||height<16||height>2048)throw new Error('Icon height must be 16–2048 pixels');
    const width=planWidth(plan);const canvas=document.createElement('canvas');
    canvas.height=height;canvas.width=Math.ceil((width+12)*height/112);
    drawIconPlan(canvas.getContext('2d'), plan, 0, 0, canvas.width, height);
    return canvas;
}
export function drawIconPlan(ctx, plan, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(width / (planWidth(plan) + 12), height / 112);
    ctx.translate(6, 6);
    ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=3;ctx.strokeStyle=OUTLINE;ctx.fillStyle='#fff';drawPlan(ctx,plan);
    ctx.restore();
}
export function effectIconCanvas(effect,height=192){return canvasFor(effectIconPlan(effect),height);}
export function rerollTicketCanvas(height=192){return canvasFor({nodes:[{kind:'ticket'}]},height);}
export function goalIconCanvas(condition,height=192){return canvasFor(goalIconPlan(condition),height);}
export function iconAspect(plan){return (planWidth(plan)+12)/112;}

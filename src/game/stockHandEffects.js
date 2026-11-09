import { layoutHand } from './handLayout.js';
import { layoutStock, stockMetrics as m } from './stockLayout.js';
import { interpolateRect } from '../ui/areaTransition/geometry.js';
import { clampProgress as p } from './stockMotion.js';
import { Card } from './Card.js';
import { releasePaintingIcons } from '../cardIcons.js';

export const stockHandTiming = Object.freeze({ lift: 180, flip: 360, flight: 420, lower: 180, insert: 260 });
const t = stockHandTiming;
export const stockHandDuration = t.lift+t.flip+t.flight+t.lower+t.insert;

export function createStockHandActors(screen, stockHost, capture, after, transfers) {
    if(!transfers.length) return [];
    const stock=screen.areas.get('stock'),hand=screen.areas.get('hand');
    function rect(area,x,y) {
        const local=area.readScreenRect({x,y,width:m.cardWidth,height:m.cardHeight});
        const origin=screen.surface.readViewportTransform();return {...local,x:local.x+origin.x,y:local.y+origin.y};
    }
    function handRect(state,id,lift=0) {
        const index=state.hand.findIndex(card=>card.id===id);
        const slot=layoutHand(hand.logicalWidth,hand.logicalHeight,state.hand.length)[index];
        return rect(hand,slot.x,slot.y-lift);
    }
    const result=[];
    for(const transfer of transfers) {
        const element=capture.nodes.get(transfer.id);
        const destination=transfer.to==='hand'
            ? stock.canvas.closest('.LayoutScreen').querySelector(`.HandArea .PaintingCard[data-card-id="${transfer.id}"]`)
            : stockHost.querySelector(`[data-stock-card-id="${transfer.id}"]`);
        const placement=['--painting-x','--painting-y','--painting-tilt'].map(name=>({name,
            from:parseFloat(element.style.getPropertyValue(name)),to:parseFloat(destination.style.getPropertyValue(name))}));
        const actor={id:transfer.id,element,render(){},transfer};
        actor.draw=time=>{
            if(!stock.layoutFrame.drawable || !hand.layoutFrame.drawable) { element.style.visibility='hidden';return; }
            element.style.visibility='';
            const slot=layoutStock(stock.logicalWidth,stock.logicalHeight)[['A','B','C'].indexOf(transfer.grade)];
            let target,flip=0,z=80;
            if(transfer.to==='hand') {
                const count=capture.state.stocks[transfer.grade].length;
                const y=slot.y-(count-1)*m.thickness;
                const lifted=p(time,0,t.lift),flight=p(time,t.lift,t.flight);
                target=interpolateRect(rect(stock,slot.x,y-m.lift*lifted),handRect(after,transfer.id),flight);
                element.dataset.cardArea=flight===1?'hand':'stock';
            } else {
                if(!actor.reset && time>=t.lift+t.flip) {
                    releasePaintingIcons(element);
                    new Card(transfer.id,element).setFace(capture.definitions[transfer.id],0,0,()=>{});
                    actor.reset=true;
                }
                const lifted=p(time,0,t.lift),flight=p(time,t.lift+t.flip,t.flight);
                const down=p(time,t.lift+t.flip+t.flight,t.lower);
                const insert=p(time,t.lift+t.flip+t.flight+t.lower,t.insert);
                const start=handRect(capture.state,transfer.id,m.lift*lifted);
                const destination=rect(stock,slot.x-m.cardWidth*(1-insert),slot.y-m.lift*(1-down));
                target=interpolateRect(start,destination,flight);flip=180*p(time,t.lift,t.flip);
                z=down===1?0:80;
                if(after.public[transfer.grade]===transfer.id && time>stockHandDuration) {
                    const elapsed=time-stockHandDuration;
                    const up=p(elapsed,0,180),turn=p(elapsed,180,360),settle=p(elapsed,540,180);
                    target=rect(stock,slot.x,slot.y-m.lift*(up-settle));flip=180*(1-turn);z=80;
                }
                element.dataset.cardArea='stock';
            }
            const placed=p(time,transfer.to==='hand'?t.lift:t.lift+t.flip,t.flight);
            for(const value of placement) element.style.setProperty(value.name,
                (value.from+(value.to-value.from)*placed)+(value.name.endsWith('tilt')?'deg':'px'));
            element.querySelector('.PaintingFaces').style.setProperty('--painting-flip',flip+'deg');
            screen.surface.renderMoving(actor,target,target.width/m.cardWidth);
            element.parentElement.style.zIndex=String(z);
        };
        result.push(actor);
    }
    for(const card of capture.state.hand.filter(card=>after.hand.some(item=>item.id===card.id))) {
        const element=capture.nodes.get(card.id);
        const actor={id:card.id,element,render(){}};
        actor.draw=time=>{
            if(!hand.layoutFrame.drawable) { element.style.visibility='hidden';return; }
            element.style.visibility='';
            const target=interpolateRect(handRect(capture.state,card.id),handRect(after,card.id),p(time,t.lift,t.flight));
            screen.surface.renderMoving(actor,target,target.width/m.cardWidth);
            element.parentElement.style.zIndex=String(after.hand.findIndex(item=>item.id===card.id)+1);
        };
        result.push(actor);
    }
    for(const actor of result) {
        actor.element.style.position='relative';actor.element.style.top='0';
        actor.element.dataset.stockHandMotion=actor.id;
    }
    return result;
}

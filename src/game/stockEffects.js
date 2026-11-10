import { Card } from './Card.js';
import { releasePaintingIcons } from '../cardIcons.js';
import { layoutStock, stockMetrics as m } from './stockLayout.js';
import { animateProgress } from './playAnimation.js';
import { stockSnapshot, planStockMotion, stockTiming as t, clampProgress as p, stockDealDepth } from './stockMotion.js';
import { planStockHandTransfers } from './stockHandMotion.js';
import { createStockHandActors, stockHandDuration, stockHandTiming } from './stockHandEffects.js';
import { layoutDeck } from './deckLayout.js';

export function createStockEffects(screen, host, deckEffects) {
    let capture = null, plans = [], objects = [], transfers = [], actors = [], after, controller = new AbortController();
    const area = screen.areas.get('stock');
    function cancel() {
        controller.abort();controller = new AbortController();
        for (const object of [...objects,...actors]) { screen.surface.removeMoving(object);releasePaintingIcons(object.element); }
        actors=[];transfers=[];
        objects=[];plans=[];capture=null;host.classList.remove('state-stock-moving');
        delete host.dataset.stockEffect;
        area.canvas.closest('.LayoutContent').classList.remove('state-deck-receiving');
        area.canvas.closest('.LayoutScreen').querySelector('.HandFixedActions')?.style.removeProperty('visibility');
        screen.areas.get('hand').canvas.closest('.LayoutScreen').querySelector('[data-game-area="hand"]')?.style.removeProperty('visibility');
    }
    function readRect(local, target = area) {
        const rect=target.readScreenRect(local), origin=screen.surface.readViewportTransform();
        return {...rect,x:rect.x+origin.x,y:rect.y+origin.y};
    }
    return {
        cancel,
        begin(action,state,definitions) {
            cancel();
            if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            capture={state:stockSnapshot(state),definitions,nodes:new Map()};
            const root=area.canvas.closest('.LayoutScreen');
            for(const node of [...host.querySelectorAll('[data-stock-card-id]'),...root.querySelectorAll('.HandArea .PaintingCard')]) {
                const clone=node.cloneNode(true);
                node.querySelectorAll('canvas').forEach((canvas,index)=>{
                    if(canvas.width&&canvas.height) clone.querySelectorAll('canvas')[index].getContext('2d').drawImage(canvas,0,0);
                });
                capture.nodes.set(node.dataset.stockCardId || node.dataset.cardId,clone);
            }
        },
        hasWork(state) {
            if (!capture) return false;
            after=stockSnapshot(state);
            plans=planStockMotion(capture.state,after);
            transfers=planStockHandTransfers(capture.state,after);
            if(!plans.length && !transfers.length) { cancel();return false; }
            return true;
        },
        present() {
            if(!plans.length && !transfers.length) return;
            host.classList.add('state-stock-moving');
            host.dataset.stockEffect='pending';
            if(transfers.length || plans.some(plan=>plan.deal.length)) {
                const hand=area.canvas.closest('.LayoutScreen').querySelector('[data-game-area="hand"]');
                if(hand) hand.style.visibility='hidden';
                area.canvas.closest('.LayoutScreen').querySelector('.HandFixedActions')?.style.setProperty('visibility','hidden');
            }
        },
        async run() {
            if(!plans.length && !transfers.length) return;
            const signal=controller.signal;
            const dealDuration=plans.some(plan=>plan.deal.length)?t.deal+t.dealStagger*6:0;
            const revealDuration=t.lift+t.flip+t.settle;
            const transferDuration=transfers.length?stockHandDuration:0;
            const duration=transferDuration+dealDuration+Math.max(0,...plans.map(plan=>plan.rotate||plan.reveal
                ? plan.delay+(plan.replenish?revealDuration:0)+t.lift+t.flip+(plan.rotate?t.slide*2+t.lower:t.settle) : 0));
            actors=createStockHandActors(screen,host,capture,after,transfers);
            for(const grade of ['A','B','C']) {
                for(const card of [...capture.state.stocks[grade]].reverse()) {
                    const element=capture.nodes.get(card.id);
                    const plan=plans.find(item=>item.grade===grade);
                    if(plan?.removed.includes(card.id)) continue;
                    if(plan?.reveal===card.id || plan?.replenish===card.id) {
                        const component=new Card(card.id,element);
                        component.element.classList.remove('PaintingCardBackOnly');component.element.removeAttribute('aria-hidden');
                        component.setFace(capture.definitions[card.id],card.step,card.step,()=>{});
                    }
                    element.style.position='relative';element.style.top='0';
                    element.dataset.stockMotionCard=card.id;
                    objects.push({id:card.id,element,render(){},grade,plan});
                }
            }
            try {
                host.dataset.stockEffect='running';
                if (plans.some(plan => plan.deal.length)) area.canvas.closest('.LayoutContent').classList.add('state-deck-receiving');
                await animateProgress(duration,progress=>{
                    const time=progress*duration;
                    for(const actor of actors) actor.draw(time);
                    const slots=layoutStock(area.logicalWidth,area.logicalHeight);
                    for(const object of objects) {
                        if(!area.layoutFrame.drawable) { object.element.style.visibility='hidden';continue; }
                        object.element.style.visibility='';
                        const slot=slots[['A','B','C'].indexOf(object.grade)],plan=object.plan;
                        const old=capture.state.stocks[object.grade].filter(card=>!plan?.removed.includes(card.id));
                        const index=old.findIndex(c=>c.id===object.id);
                        let x=slot.x,y=slot.y-(old.length-1-index)*m.thickness;
                        if(transfers.some(transfer=>transfer.to==='stock'&&transfer.grade===object.grade)) {
                            const timing=stockHandTiming;
                            y-=m.thickness*p(time,timing.lift+timing.flip+timing.flight+timing.lower,timing.insert);
                        }
                        let flip=capture.state.public[object.grade]===object.id?0:180;
                        let z=old.length-index, rect;
                        if(plan?.deal.length) {
                            const dealIndex=plan.deal.indexOf(object.id);
                            const removed=plan.deal.filter((id,i)=>time>=i*t.dealStagger+t.deal).length;
                            if(dealIndex>=0) {
                                const flight=p(time,dealIndex*t.dealStagger,t.deal);
                                const origin=readRect({x,y,width:m.cardWidth,height:m.cardHeight});
                                const deck=screen.areas.get('deck');
                                if(!deck.layoutFrame.drawable) { object.element.style.visibility='hidden';continue; }
                                const destination=layoutDeck(deck.logicalWidth,deck.logicalHeight);
                                destination.y-=Math.max(0,removed-1-dealIndex)*m.thickness;
                                const target=readRect({...destination,width:m.cardWidth,height:m.cardHeight},deck);
                                rect=Object.fromEntries(['x','y','width','height'].map(key=>[key,origin[key]+(target[key]-origin[key])*flight]));
                                z=flight===1?40-dealIndex:stockDealDepth(old.length,dealIndex,time,plan.deal.length);
                            }
                            host.querySelector('[data-stock-grade="A"] h3').textContent=`グレードA ${old.length-removed}枚`;
                            deckEffects.acceptInitial(removed);
                        }
                        const start=transferDuration+dealDuration+(plan?.delay??0);
                        if(plan?.reveal===object.id || plan?.replenish===object.id) {
                            const lifted=p(time,start,t.lift),turned=p(time,start+t.lift,t.flip),settled=p(time,start+t.lift+t.flip,t.settle);
                            y-=m.lift*(lifted-settled);flip=180*(1-turned);
                            if(lifted>0 && settled<1) z=old.length+1;
                        }
                        if(plan?.rotate && (!plan.replenish || time >= start+revealDuration)) {
                            const s=time-start-(plan.replenish?revealDuration:0);
                            const out=p(s,t.lift+t.flip,t.slide),down=p(s,t.lift+t.flip+t.slide,t.lower),back=p(s,t.lift+t.flip+t.slide+t.lower,t.slide);
                            if(object.id===plan.rotate) {
                                x-=m.cardWidth*(out-back);
                                y-=m.lift*p(s,0,t.lift);
                                y+=(m.lift+(old.length-1)*m.thickness)*down;
                                flip=180*p(s,t.lift,t.flip);z=down===1?0:(s>0?old.length+1:z);
                            } else y-=m.thickness*out;
                        }
                        rect??=readRect({x,y,width:m.cardWidth,height:m.cardHeight});
                        object.element.querySelector('.PaintingFaces')?.style.setProperty('--painting-flip',flip+'deg');
                        screen.surface.renderMoving(object,rect,rect.width/m.cardWidth);
                        object.element.parentElement.style.zIndex=String(z);
                    }
                },signal);
            } finally { cancel(); }
        },
    };
}

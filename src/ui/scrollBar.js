const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function scrollBarMetrics(viewport,content,track,scrollTop) {
    const maxScroll=Math.max(0,content-viewport);
    const thumbHeight=maxScroll?Math.min(track,Math.max(32,track*viewport/content)):track;
    const travel=track-thumbHeight;
    return {maxScroll,thumbHeight,travel,thumbTop:maxScroll?clamp(scrollTop,0,maxScroll)/maxScroll*travel:0};
}
export function scrollForThumb(top,metrics) {
    return metrics.travel?clamp(top,0,metrics.travel)/metrics.travel*metrics.maxScroll:0;
}
export function createScrollBar(viewport,content,{trackTexture,thumbTexture}) {
    const element=document.createElement('div');element.className=`ScrollBar ${trackTexture}`;
    element.setAttribute('role','scrollbar');element.setAttribute('aria-label','リストのスクロール');
    element.setAttribute('aria-orientation','vertical');element.tabIndex=-1;
    const thumb=document.createElement('div');thumb.className=`ScrollThumb ${thumbTexture}`;element.append(thumb);
    const controller=new AbortController(),{signal}=controller;
    let active=null;
    const metrics=()=>scrollBarMetrics(viewport.clientHeight,viewport.scrollHeight,element.clientHeight,viewport.scrollTop);
    function refresh() {
        const value=metrics();
        element.classList.toggle('state-inactive',value.maxScroll===0||!viewport.clientHeight);
        thumb.style.height=`${value.thumbHeight}px`;thumb.style.top=`${value.thumbTop}px`;
        element.setAttribute('aria-valuemin','0');element.setAttribute('aria-valuemax',String(value.maxScroll));
        element.setAttribute('aria-valuenow',String(Math.round(viewport.scrollTop)));
    }
    function cancel() {
        const previous=active;active=null;thumb.classList.remove('state-dragging');
        if(previous&&element.hasPointerCapture(previous.id))element.releasePointerCapture(previous.id);
    }
    element.addEventListener('pointerdown',event=>{
        const value=metrics();
        if(active||event.button!==0||event.isPrimary===false||!value.maxScroll||!value.travel)return;
        const rect=element.getBoundingClientRect(),scale=rect.height/element.clientHeight;
        if(event.target!==thumb){
            viewport.scrollTop=scrollForThumb((event.clientY-rect.top)/scale-value.thumbHeight/2,value);refresh();
        }
        active={id:event.pointerId,y:event.clientY,top:metrics().thumbTop,scale};
        element.setPointerCapture(event.pointerId);thumb.classList.add('state-dragging');event.preventDefault();
    },{signal});
    element.addEventListener('pointermove',event=>{
        if(active?.id!==event.pointerId)return;
        viewport.scrollTop=scrollForThumb(active.top+(event.clientY-active.y)/active.scale,metrics());
        refresh();event.preventDefault();
    },{signal});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,cancel,{signal});
    viewport.addEventListener('scroll',refresh,{signal,passive:true});
    element.addEventListener('wheel',event=>{
        const unit=event.deltaMode===1?20:event.deltaMode===2?viewport.clientHeight:1;
        viewport.scrollTop+=event.deltaY*unit;refresh();event.preventDefault();
    },{signal,passive:false});
    const observer=new ResizeObserver(()=>{cancel();refresh();});observer.observe(viewport);observer.observe(content);
    return {element,refresh,cancel,dispose(){cancel();controller.abort();observer.disconnect();element.remove();}};
}

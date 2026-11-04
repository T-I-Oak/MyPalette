export function specialFrameLayout(target,desiredSize,viewport){
 const margin=4;
 const size=Math.min(desiredSize,viewport.width-2*margin,viewport.height-2*margin);
 const left=Math.max(margin,Math.min(viewport.width-size-margin,target.x-size/2));
 const top=Math.max(margin,Math.min(viewport.height-size-margin,target.y-size-4));
 const points=Array.from({length:10},(_,i)=>{
  const angle=-Math.PI/2+i*Math.PI/5,radius=i%2?25:48;
  return {x:50+Math.cos(angle)*radius,y:50+Math.sin(angle)*radius};
 });
 const path=points.map((point,i)=>`${i?'L':'M'}${point.x} ${point.y}`).join(' ')+' Z';
 return {left,top,size,path};
}

import { READY_HEIGHT } from './pose.js';
export const FIELD_WIDTH=26;
// The supplied artwork already has perspective; compensate for the camera's foreshortening.
export const FIELD_DEPTH=FIELD_WIDTH/3/(15/Math.hypot(15,9));
export const FIELD_POLYGON=Object.freeze([[.26,.14],[.48,.045],[.73,.07],[.91,.20],[.975,.40],[.965,.67],[.84,.87],[.64,.95],[.37,.91],[.245,.80],[.245,.50]].map(([u,v])=>Object.freeze([(u-.5)*FIELD_WIDTH,(v-.5)*FIELD_DEPTH])));
const edges=Object.freeze(FIELD_POLYGON.map(([x,z],i)=>{const [bx,bz]=FIELD_POLYGON[(i+1)%FIELD_POLYGON.length],dx=bx-x,dz=bz-z,length=Math.hypot(dx,dz);return Object.freeze({x,z,bx,bz,length,nx:-dz/length,nz:dx/length});}));
export function fieldEdges(){return edges;}

export function fieldContains({x,z},margin=0){return fieldEdges().every(edge=>(x-edge.x)*edge.nx+(z-edge.z)*edge.nz>=margin-1e-7);}
export function constrainToField(position,margin=.9){
 let {x,z}=position;
 for(let i=0;i<32;i++){
  let moved=false;
  for(const edge of edges){
  const distance=(x-edge.x)*edge.nx+(z-edge.z)*edge.nz;
  if(distance<margin-1e-9){x+=edge.nx*(margin-distance);z+=edge.nz*(margin-distance);moved=true;}
  }
  if(!moved)break;
 }
 return {...position,x,z};
}
export function fieldSpawn(slot){return constrainToField({x:1.56+(slot%4-1.5)*4,y:READY_HEIGHT,z:(Math.floor(slot/4)-1)*2.5});}

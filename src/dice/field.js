import { READY_HEIGHT } from './pose.js';
export const FIELD_WIDTH=26;
export const FIELD_MARGIN=1.8;
export const FIELD_CAMERA_POSITION=Object.freeze([0,15,9]);
export const FIELD_VIEW_COSINE=FIELD_CAMERA_POSITION[1]/Math.hypot(FIELD_CAMERA_POSITION[1],FIELD_CAMERA_POSITION[2]);
// The supplied artwork already has perspective; compensate for the camera's foreshortening.
export const FIELD_DEPTH=FIELD_WIDTH/3/FIELD_VIEW_COSINE;
export const FIELD_POLYGON=Object.freeze([[.26,.14],[.48,.045],[.73,.07],[.91,.20],[.975,.40],[.965,.67],[.84,.87],[.64,.95],[.37,.91],[.245,.80],[.245,.50]].reverse().map(([u,v])=>Object.freeze([(.5-u)*FIELD_WIDTH,(v-.5)*FIELD_DEPTH])));
const edges=Object.freeze(FIELD_POLYGON.map(([x,z],i)=>{const [bx,bz]=FIELD_POLYGON[(i+1)%FIELD_POLYGON.length],dx=bx-x,dz=bz-z,length=Math.hypot(dx,dz);return Object.freeze({x,z,bx,bz,length,nx:-dz/length,nz:dx/length});}));
export function fieldEdges(){return edges;}
export function fieldCenterVertices(margin=FIELD_MARGIN){
 const vertices=[];
 for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
  const a=edges[i],b=edges[j],det=a.nx*b.nz-a.nz*b.nx;
  if(Math.abs(det)<1e-10)continue;
  const ca=a.nx*a.x+a.nz*a.z+margin,cb=b.nx*b.x+b.nz*b.z+margin;
  const point={x:(ca*b.nz-a.nz*cb)/det,z:(a.nx*cb-ca*b.nx)/det};
  if(fieldContains(point,margin-1e-8))vertices.push(point);
 }
 return vertices;
}

export function fieldContains({x,z},margin=0){return fieldEdges().every(edge=>(x-edge.x)*edge.nx+(z-edge.z)*edge.nz>=margin-1e-7);}
export function constrainToField(position,margin=FIELD_MARGIN){
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
export function fieldSpawn(slot){return constrainToField({x:-(1.56+(slot%4-1.5)*4),y:READY_HEIGHT,z:(Math.floor(slot/4)-1)*2.5});}

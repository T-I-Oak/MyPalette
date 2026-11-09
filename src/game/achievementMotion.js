export const materialTiming = Object.freeze({ outbound: 360, orbit: 1200, inbound: 360, absorb: 280, stagger: 200 });
export const materialDuration = count => materialTiming.outbound + materialTiming.orbit + materialTiming.inbound + materialTiming.absorb + Math.max(0,count-1)*materialTiming.stagger;
export function canvasOrbit(corners, progress) {
    const angle=Math.PI/2+progress*Math.PI*2,u=.5+.64*Math.cos(angle),v=.5+.62*Math.sin(angle);
    const [a,b,c,d]=corners;
    return { x:(1-u)*(1-v)*a.x+u*(1-v)*b.x+u*v*c.x+(1-u)*v*d.x,
        y:(1-u)*(1-v)*a.y+u*(1-v)*b.y+u*v*c.y+(1-u)*v*d.y };
}
export function diagonalReveal(progress) {
    const p=Math.max(0,Math.min(1,progress))*2;
    return p<=1 ? [[0,0],[p,0],[0,p]] : [[0,0],[1,0],[1,p-1],[p-1,1],[0,1]];
}

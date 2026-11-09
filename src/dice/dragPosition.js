import { Vec3 } from 'cannon-es';
import { constrainToField } from './field.js';

const cross = (a,b,c) => (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
function footprint(die, position) {
    const points = [];
    for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) {
        const point = die.body.quaternion.vmult(new Vec3(x,y,z));
        points.push({x:point.x+position.x,z:point.z+position.z});
    }
    points.sort((a,b)=>a.x-b.x || a.z-b.z);
    const half = list => {
        const hull=[];
        for(const point of list) {
            while(hull.length>1 && cross(hull.at(-2),hull.at(-1),point)<=1e-10) hull.pop();
            hull.push(point);
        }
        hull.pop(); return hull;
    };
    return [...half(points),...half([...points].reverse())];
}
function overlaps(a,b) {
    for(const polygon of [a,b]) for(let i=0;i<polygon.length;i++) {
        const p=polygon[i],q=polygon[(i+1)%polygon.length];
        const nx=-(q.z-p.z),nz=q.x-p.x;
        const project=points=>points.map(point=>point.x*nx+point.z*nz);
        const pa=project(a),pb=project(b);
        if(Math.min(...pa)>=Math.max(...pb)-1e-8 || Math.min(...pb)>=Math.max(...pa)-1e-8) return false;
    }
    return true;
}

// Only the destination is tested: crossing another die on the way is permitted.
export function dragPosition(group, die, desired) {
    const candidate=constrainToField(desired), shape=footprint(die,candidate);
    if(group.dice.some(other=>other!==die && overlaps(shape,footprint(other,other.body.position)))) {
        return {...die.body.position};
    }
    return candidate;
}

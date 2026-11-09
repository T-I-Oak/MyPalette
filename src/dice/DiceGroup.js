import { World, Body, Box, Vec3, Material, ContactMaterial } from 'cannon-es';
import { FIELD_WIDTH, FIELD_DEPTH, fieldEdges, fieldSpawn, constrainToField } from './field.js';
import { READY_HEIGHT, advanceReadyPose } from './pose.js';
import { Die } from './Die.js';
import { validateFaceCondition } from './faceConditions.js';

export class DiceGroup {
    constructor({ random = Math.random } = {}) {
        this.random = random; this.items = new Map(); this.rolling = false; this.disposed = false;
        this.collisions = 0; this.clock = 0;
        this.world = new World({ gravity: new Vec3(0, -18, 0), allowSleep: true });
        this.world.solver.iterations = 20;
        this.material = new Material('dice');
        this.world.addContactMaterial(new ContactMaterial(this.material, this.material,
            { friction: .45, restitution: .28 }));
        const wall = (size, position) => {
            const body = new Body({ mass: 0, material: this.material, shape: new Box(new Vec3(...size)),
                position: new Vec3(...position) });
            this.world.addBody(body);
        };
        wall([FIELD_WIDTH/2, .25, FIELD_DEPTH/2], [0, -.25, 0]);
        for(const edge of fieldEdges()){
            const body=new Body({mass:0,material:this.material,shape:new Box(new Vec3(edge.length/2+.15,6,.15)),
                position:new Vec3((edge.x+edge.bx)/2-edge.nx*.15,5.5,(edge.z+edge.bz)/2-edge.nz*.15)});
            body.quaternion.setFromAxisAngle(new Vec3(0,1,0),-Math.atan2(edge.bz-edge.z,edge.bx-edge.x));
            this.world.addBody(body);
        }
    }
    assertLive() { if (this.disposed) throw new Error('disposed'); }
    get dice() { return [...this.items.values()]; }
    findFaces(condition) {
        this.assertLive();const query=validateFaceCondition(condition);
        return this.dice.flatMap(die=>{const indices=die.findFaces(query);return indices.length?[{id:die.id,indices,count:indices.length}]:[];});
    }
    get(id) { if (!this.items.has(id)) throw new Error(`Unknown die: ${id}`); return this.items.get(id); }
    add(options) {
        this.assertLive();
        if (this.rolling) throw new Error('rolling');
        if (this.items.has(options.id)) throw new Error('Duplicate ID');
        if (this.items.size >= 12) throw new Error('Maximum 12 dice');
        const slot = Array.from({ length: 12 }, (_, i) => i).find(i => !this.dice.some(die => die.slot === i));
        const position=options.position??fieldSpawn(slot);
        const die = new Die({ ...options, position: constrainToField(position) });
        die.slot = slot; die.owner = this; die.body.material = this.material;
        die.body.addEventListener('collide', () => { this.collisions++; });
        this.items.set(die.id, die); this.world.addBody(die.body);
        return die;
    }
    remove(id) {
        const die = this.get(id);
        this.items.delete(id); this.world.removeBody(die.body);
        die.owner = null; die.dispose();
    }
    constrainPosition(position) { return constrainToField(position); }
    throwDie(die) {
        const random = this.random;
        die.body.type = Body.DYNAMIC; die.body.mass = 1; die.body.updateMassProperties(); die.body.wakeUp();
        die.body.position.y = 5 + random() * 2;
        if (die.attempts > 0) {
            const spawn = fieldSpawn((die.slot + die.attempts * 5) % 12);
            die.body.position.x = spawn.x; die.body.position.z = spawn.z;
        }
        const safe=constrainToField(die.body.position);
        die.body.position.x=safe.x;die.body.position.z=safe.z;
        die.body.quaternion.setFromEuler(random() * Math.PI * 2, random() * Math.PI * 2, random() * Math.PI * 2);
        die.body.velocity.set((random() - .5) * 6, 1 + random() * 3, (random() - .5) * 6);
        die.body.angularVelocity.set(4 + random() * 12, 4 + random() * 12, 4 + random() * 12);
        die.body.aabbNeedsUpdate = true; die.quiet = 0; die.elapsed = 0;
    }
    async roll(ids = this.dice.filter(die => !die.consumed).map(die => die.id)) {
        this.assertLive();
        if (this.rolling) throw new Error('rolling');
        if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Select unique targets');
        const targets = ids.map(id => this.get(id));
        targets.forEach(die => { die.assertMutable(); if (die.consumed) throw new Error('consumed'); if (die.readyMotion) throw new Error('preparing'); });
        this.rolling = true;
        targets.forEach(die => { die.begin(); die.attempts = 0; this.throwDie(die); });
        try { return await Promise.all(targets.map(die => die.pending)); }
        finally { this.rolling = false; }
    }
    step(delta) {
        if (this.disposed) return;
        const dt = Math.min(delta, .05); this.clock += dt;
        this.world.step(1 / 120, dt, 6);
        for (const die of this.dice) {
            if (die.state === 'ready') {
                if (die.smoothReady) advanceReadyPose(die, dt);
                else die.body.quaternion.setFromEuler(this.clock * .37 + die.slot, this.clock * .29, this.clock * .23);
                die.body.aabbNeedsUpdate = true;
            }
            if (die.state !== 'rolling') continue;
            const safe=constrainToField(die.body.position);
            if(Math.abs(safe.x-die.body.position.x)+Math.abs(safe.z-die.body.position.z)>1e-6){
                die.body.position.x=safe.x;die.body.position.z=safe.z;die.body.aabbNeedsUpdate=true;
            }
            die.elapsed += dt;
            const quiet = die.body.velocity.length() < .13 && die.body.angularVelocity.length() < .13;
            die.quiet = quiet ? die.quiet + dt : 0;
            if (die.quiet > .5 && die.top.alignment > .99 && die.body.position.y < 5.3) {
                die.settle(die.top.index);
            } else if (die.quiet > .8 || die.elapsed > 12) {
                if (++die.attempts > 8) { die.cancel('failed'); die.body.position.y = READY_HEIGHT; }
                else this.throwDie(die);
            }
        }
    }
    dispose() {
        if (this.disposed) return;
        for (const die of this.dice) this.remove(die.id);
        for (const body of [...this.world.bodies]) this.world.removeBody(body);
        this.disposed = true;
    }
}

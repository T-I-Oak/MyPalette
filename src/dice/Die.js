import { Body, Box, Vec3 } from 'cannon-es';
import { COLORS, MATERIALS, SPECIAL_FACES } from '../effectCatalog.js';
import { topFace } from './orientation.js';
import { findMatchingFaces } from './faceConditions.js';

function validateFace(face) {
    const special = Object.keys(face).length === 1 && SPECIAL_FACES.includes(face.special);
    const normal = Object.keys(face).length === 2 && COLORS.includes(face.color) && MATERIALS.includes(face.material);
    if (!special && !normal) throw new Error('Invalid die face');
    return Object.freeze({ ...face });
}

export class Die {
    constructor({ id, faces, lifetime = 'permanent', position = { x: 0, y: 3, z: 0 } }) {
        if (typeof id !== 'string' || !id || faces.length !== 6) throw new Error('ID and six faces required');
        if (!['permanent', 'temporary'].includes(lifetime)) throw new Error('Invalid lifetime');
        this.id = id;
        this.faces = Object.freeze(faces.map(validateFace));
        this.lifetime = lifetime;
        this.state = 'ready';
        this.consumed = false;
        this.current = null;
        this.revision = 0;
        this.body = new Body({ mass: 0, shape: new Box(new Vec3(.5, .5, .5)),
            position: new Vec3(position.x, position.y, position.z),
            linearDamping: .22, angularDamping: .3, allowSleep: true,
            sleepSpeedLimit: .16, sleepTimeLimit: .6 });
    }
    assertMutable() {
        if (['rolling', 'disposed'].includes(this.state)) throw new Error(this.state);
    }
    get top() { return topFace(this.body.quaternion); }
    findFaces(condition) { return findMatchingFaces(this.faces,condition); }
    get result() {
        return this.state === 'settled' ? { id: this.id, status: 'settled', index: this.current,
            face: { ...this.faces[this.current] }, lifetime: this.lifetime } : null;
    }
    setFace(index, face) {
        this.assertMutable();
        if (!Number.isInteger(index) || index < 0 || index > 5) throw new Error('Invalid face index');
        this.faces = Object.freeze(this.faces.map((old, i) => i === index ? validateFace(face) : old));
        this.revision++;
    }
    setConsumed(value) { this.assertMutable(); this.consumed = Boolean(value); }
    setPosition({ x, y, z }) {
        this.assertMutable();
        if (![x, y, z].every(Number.isFinite)) throw new Error('Invalid position');
        const safe=this.owner?this.owner.constrainPosition({x,y,z}):{x,y,z};
        this.body.position.set(safe.x, safe.y, safe.z); this.body.aabbNeedsUpdate = true;
    }
    prepare() { this.assertMutable(); this.state = 'ready'; this.current = null; }
    begin() {
        this.assertMutable();
        if (this.consumed) throw new Error('consumed');
        this.state = 'rolling'; this.current = null;
        this.pending = new Promise(resolve => { this.resolve = resolve; });
    }
    roll() {
        if (!this.owner) throw new Error('Die must belong to a DiceGroup');
        return this.owner.roll([this.id]).then(results => results[0]);
    }
    settle(index) {
        if (this.state !== 'rolling') throw new Error('Not rolling');
        this.current = index; this.state = 'settled';
        this.body.type = Body.STATIC; this.body.mass = 0; this.body.updateMassProperties(); this.body.sleep();
        this.resolve(this.result); this.resolve = null;
    }
    cancel(status = 'cancelled') {
        if (this.state === 'rolling') {
            this.resolve({ id: this.id, status }); this.resolve = null;
            this.body.type = Body.STATIC; this.body.mass = 0; this.body.updateMassProperties(); this.body.sleep();
            this.state = 'ready';
        }
    }
    dispose() {
        if (this.state === 'disposed') return;
        this.cancel(); this.state = 'disposed'; this.current = null;
        if (this.owner) this.owner.remove(this.id);
    }
}

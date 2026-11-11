export function identityPose() {
    return { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], flip: 0, z: 0 };
}

export class CardSceneState {
    constructor(ids) {
        this.cards = new Map(ids.map(id => [id, { id, pose: identityPose(), opacity: 1, owner: null }]));
        this.motion = null;
    }
    get(id) { return this.cards.get(id); }
    begin(targets, owner) {
        this.motion = { owner, entries: [...targets].map(([id, target]) => {
            const card = this.get(id); card.owner = owner;
            return { card, from: structuredClone(card.pose), target };
        }) };
    }
    sample(progress) {
        for (const { card, from, target } of this.motion.entries) {
            const to = target(), amount = typeof progress === 'function' ? progress(card.id) : progress;
            card.pose = { matrix: from.matrix.map((value, index) => value + (to.matrix[index] - value) * amount),
                flip: from.flip + (to.flip - from.flip) * amount, z: to.z };
        }
    }
    finish() { this.sample(1); this.interrupt(); }
    interrupt() {
        if (!this.motion) return;
        for (const { card } of this.motion.entries) card.owner = null;
        this.motion = null;
    }
    opacity(id, value) {
        this.get(id).opacity = value;
    }
}

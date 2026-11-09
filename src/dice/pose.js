import { Quaternion } from 'cannon-es';
export const READY_HEIGHT = 4.5;
export const RETURN_DURATION = .3;
export const LIFT_DURATION = .5;
export function advanceReadyPose(die, delta) {
    let speed = 1;
    if (die.readyMotion) {
        const motion = die.readyMotion;
        motion.elapsed += delta;
        const t = Math.max(0, Math.min(1, (motion.elapsed - RETURN_DURATION) / LIFT_DURATION));
        const eased = t * t * (3 - 2 * t);
        die.body.position.y = motion.height + (Math.max(READY_HEIGHT, motion.height) - motion.height) * eased;
        speed = eased;
        if (t === 1) die.readyMotion = null;
    }
    const rotation = new Quaternion();
    rotation.setFromEuler(delta * .37 * speed, delta * .29 * speed, delta * .23 * speed);
    die.body.quaternion.mult(rotation, die.body.quaternion); die.body.quaternion.normalize();
    die.body.aabbNeedsUpdate = true;
}

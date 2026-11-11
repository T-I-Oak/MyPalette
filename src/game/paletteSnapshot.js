import { Vec3 } from 'cannon-es';
import { FACE_NORMALS } from '../dice/orientation.js';

// Display an already committed Game snapshot. This does not simulate a roll.
export function syncPaletteSnapshot(group, dice, request = null, { animateReady = false } = {}) {
    const ids = new Set(dice.map(die => die.id));
    for (const die of group.dice) if (!ids.has(die.id)) group.remove(die.id);
    for (const source of dice) {
        const die = group.items.has(source.id) ? group.get(source.id) : group.add(source);
        if (!group.rolling) source.faces.forEach((face, index) => {
            if (JSON.stringify(face) !== JSON.stringify(die.faces[index])) die.setFace(index, face);
        });
        if (request?.ids.includes(source.id)) {
            if (request.status === 'ready') {
                die.setConsumed(false);
                if (die.state !== 'ready') die.prepare({ animated: animateReady });
            }
            continue;
        }
        if (source.current === null) {
            die.setConsumed(source.used);
            if (die.state !== 'ready') die.prepare({ animated: animateReady });
            continue;
        }
        const preservePose = die.state === 'settled' && die.current === source.current;
        die.current = source.current;
        die.state = 'settled';
        if (!preservePose) {
            die.body.position.y = 1;
            die.body.quaternion.setFromVectors(new Vec3(...FACE_NORMALS[source.current]), new Vec3(0, 1, 0));
        }
        die.setConsumed(source.used);
    }
}

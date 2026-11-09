// Notification grouping must not change the order or multiplicity of game effects.
export function specialNoticeEffects(effects) {
    const groups = new Map();
    for (const effect of effects) {
        const parameters = Object.entries(effect).filter(([name]) => name !== 'count' && name !== 'amount')
            .sort(([a], [b]) => a.localeCompare(b));
        const key = JSON.stringify([parameters, Math.sign(effect.amount ?? 0)]);
        const existing = groups.get(key);
        if (!existing) groups.set(key, { ...effect });
        else {
            if (Object.hasOwn(effect, 'count')) existing.count += effect.count;
            if (Object.hasOwn(effect, 'amount')) existing.amount += effect.amount;
        }
    }
    return [...groups.values()];
}

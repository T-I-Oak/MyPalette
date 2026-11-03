import { COLORS, MATERIALS } from './effectCatalog.js';
import { goalGroups } from './goalGroups.js';

export const MAX_PROBABILITY_DICE = 12;

export function goalProbability(goals, diceCount) {
    if (!Number.isInteger(diceCount) || diceCount < 1 || diceCount > MAX_PROBABILITY_DICE) throw new RangeError('ダイス数は1～12個で指定してください。');
    if (!goals.length || goals.some(goal => goal.color === null && goal.material === null)) return null;
    const alternatives = goalGroups(goals).filter(group => group.length <= diceCount);
    if (!alternatives.length) return 0;
    goals = alternatives.flat();
    let offset = 0;
    const goalIndices = alternatives.map(group => group.map(() => offset++));
    const groups = new Map();
    for (const color of COLORS) for (const material of MATERIALS) {
        const mask = goals.reduce((value, goal, i) => value | (((goal.color === null || goal.color === color) && (goal.material === null || goal.material === material)) ? 1n << BigInt(i) : 0n), 0n);
        groups.set(mask, (groups.get(mask) ?? 0) + 1);
    }
    const masks = [...groups.keys()]; const probabilities = [...groups.values()].map(count => count / 18);
    const counts = new Array(masks.length).fill(0);
    // 等しい目標適合パターンをまとめ、順序の違いを多項分布の重みに含める。
    const factorial = [1]; for (let n = 1; n <= diceCount + masks.length; n++) factorial[n] = factorial[n - 1] * n;
    const stateCount = factorial[diceCount + masks.length - 1] / factorial[diceCount] / factorial[masks.length - 1];
    if (stateCount > 500000) throw new RangeError('計算規模が大きいため、ダイス数を減らして確認してください。');
    function matches() {
        const dice = masks.flatMap((mask, i) => Array(counts[i]).fill(mask));
        const assigned = Array(dice.length).fill(-1);
        function place(goal, visited) {
            for (let d = 0; d < dice.length; d++) {
                if (visited[d] || !(dice[d] & (1n << BigInt(goal)))) continue;
                visited[d] = true;
                if (assigned[d] === -1 || place(assigned[d], visited)) { assigned[d] = goal; return true; }
            }
            return false;
        }
        return goalIndices.some(indices => {
            assigned.fill(-1);
            return indices.every(goal => place(goal, Array(dice.length).fill(false)));
        });
    }
    const states = []; const success = new Set();
    function enumerate(index, remaining, weight) {
        if (index === masks.length - 1) {
            counts[index] = remaining;
            const probability = weight * probabilities[index] ** remaining / factorial[remaining];
            const key = counts.join(','); const hit = matches();
            if (hit) success.add(key);
            states.push({ counts: [...counts], probability: factorial[diceCount] * probability, hit });
            return;
        }
        for (let n = 0; n <= remaining; n++) { counts[index] = n; enumerate(index + 1, remaining - n, weight * probabilities[index] ** n / factorial[n]); }
    }
    enumerate(0, diceCount, 1);
    const initial = states.reduce((sum, state) => sum + (state.hit ? state.probability : 0), 0);
    let result = initial;
    for (const state of states) {
        if (state.hit) continue;
        counts.splice(0, counts.length, ...state.counts);
        let best = initial; // 全個を振り直す場合。
        for (let removed = 0; removed < counts.length; removed++) {
            if (!counts[removed]) continue;
            counts[removed]--;
            let chance = 0;
            for (let added = 0; added < counts.length; added++) {
                counts[added]++;
                if (success.has(counts.join(','))) chance += probabilities[added];
                counts[added]--;
            }
            counts[removed]++; best = Math.max(best, chance);
        }
        result += state.probability * best;
    }
    return Math.max(0, Math.min(1, result));
}

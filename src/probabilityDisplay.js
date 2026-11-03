import { MAX_PROBABILITY_DICE } from './goalProbability.js';
import { goalGroups } from './goalGroups.js';

export function createProbabilityDisplay() {
    const dice = { A: 4, B: 5, C: 6 };
    const results = new Map(); const pending = new Map();
    let workerError = null;
    const worker = new Worker(new URL('./probabilityWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
        results.set(data.key, data);
        for (const output of pending.get(data.key) ?? []) if (output.dataset.key === data.key) update(output, data);
        pending.delete(data.key);
    };
    worker.onerror = () => {
        workerError = '確率計算を開始できませんでした。ページを再読み込みしてください。';
        for (const outputs of pending.values()) for (const output of outputs) { output.textContent = '計算失敗'; output.title = workerError; }
        pending.clear();
    };
    function update(output, data) {
        output.textContent = data.error ? '計算不可' : `${(data.probability * 100).toFixed(1)}%`;
        output.title = data.error ?? output.dataset.model;
    }
    function refresh(output) {
        output.dataset.key = '';
        if (workerError) { output.textContent = '計算失敗'; output.title = workerError; return; }
        const goals = JSON.parse(output.dataset.goals); const n = dice[output.dataset.grade];
        output.dataset.model = `通常ダイス${n}個＋リロール1回。18面等確率、1個／全個を最適選択。カード効果なし。`;
        if (!Number.isInteger(n) || n < 1 || n > MAX_PROBABILITY_DICE) { output.textContent = 'N未設定'; output.title = 'ダイス数は1～12個で指定してください。'; return; }
        if (!goals.length || goals.some(goal => goal.color === null && goal.material === null)) { output.textContent = '—'; output.title = '目標が未設定です。'; return; }
        const key = JSON.stringify([goalGroups(goals).map(group => group.map(goal => [goal.color, goal.material]).sort()).sort(), n]);
        output.dataset.key = key;
        if (results.has(key)) { update(output, results.get(key)); return; }
        output.textContent = '計算中'; output.title = output.dataset.model;
        const waiting = pending.get(key) ?? [];
        const requested = pending.has(key); waiting.push(output); pending.set(key, waiting);
        if (!requested) worker.postMessage({ key, goals, diceCount: n });
    }
    function output(goals, grade) {
        const element = document.createElement('output'); element.className = 'Probability';
        element.dataset.goals = JSON.stringify(goals); element.dataset.grade = grade;
        element.setAttribute('aria-label', `${grade}の目標達成確率`); refresh(element); return element;
    }
    function controls(root) {
        const group = document.createElement('div'); group.className = 'ProbabilityControls';
        const text = document.createElement('span'); text.textContent = '確率計算のダイス数'; group.append(text);
        group.title = '各出目は18通りが等確率。1個／全個のリロール1回を最適選択。設定は保存しません。';
        for (const grade of ['A', 'B', 'C']) {
            const label = document.createElement('label'); label.textContent = `${grade}=`;
            const input = document.createElement('input'); input.type = 'number'; input.min = '1'; input.max = String(MAX_PROBABILITY_DICE); input.step = '1'; input.value = dice[grade];
            input.setAttribute('aria-label', `グレード${grade}の通常ダイス数`);
            input.addEventListener('input', () => {
                dice[grade] = input.valueAsNumber;
                input.setAttribute('aria-invalid', String(!input.validity.valid || !input.value));
                for (const item of root.querySelectorAll('.Probability')) if (item.dataset.grade === grade) refresh(item);
            });
            label.append(input); group.append(label);
        }
        return group;
    }
    function refreshStep(container, goals, grade) { const old = container.querySelector('.Probability'); if (old) old.replaceWith(output(goals, grade)); }
    return { output, controls, refreshStep };
}

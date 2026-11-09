import { evaluationRows, evaluationTimings } from './effectEvaluation.js';
import { effectTypeIcon } from './cardIcons.js';

const el = (tag, text, className) => {
    const node = document.createElement(tag); if (tag === 'button') node.tabIndex = -1;
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
};
export function mountEvaluationEditor(root, settings, changed) {
    root.append(el('h2', '効果の評価設定'), el('p', '評価点＝各ステップの（プレイ時効果の合計＋達成時効果の合計）×ステップ倍率を合計。数量指定は数量倍、名声値変更は符号付きの増減値を掛けます。'));
    const number = (label, value, update) => {
        const input = el('input'); input.type = 'number'; input.step = 'any'; input.required = true;
        input.value = value; input.setAttribute('aria-label', label);
        input.addEventListener('input', () => {
            const valid = input.value !== '' && Number.isFinite(input.valueAsNumber);
            input.setAttribute('aria-invalid', String(!valid));
            update(valid ? input.valueAsNumber : null); changed();
        });
        return input;
    };
    const multipliers = el('fieldset'); multipliers.append(el('legend', 'ステップ倍率（全カード共通）'));
    const row = el('div', undefined, 'Row');
    settings.stepMultipliers.forEach((value, index) => {
        const label = el('label', `ステップ${index}`, 'Field');
        label.append(number(`ステップ${index}の倍率`, value, next => { settings.stepMultipliers[index] = next; })); row.append(label);
    });
    multipliers.append(row); root.append(multipliers);
    const table = el('table', undefined, 'EvaluationTable');
    const head = el('thead'), headings = el('tr');
    for (const title of ['効果', 'プレイ時の評価点', '達成時の評価点']) { const th = el('th', title); th.scope = 'col'; headings.append(th); }
    head.append(headings); const body = el('tbody');
    for (const effect of evaluationRows) {
        const tr = el('tr'); const name = el('th'); name.scope = 'row';
        const [type, face] = effect.key.split('.');
        name.append(effectTypeIcon(type, face, effect.label)); tr.append(name);
        for (const [timing, label] of evaluationTimings) {
            const cell = el('td'); cell.append(number(`${effect.label} ${label}の評価点`, settings[timing][effect.key], value => { settings[timing][effect.key] = value; })); tr.append(cell);
        }
        body.append(tr);
    }
    table.append(head, body); root.append(table);
}

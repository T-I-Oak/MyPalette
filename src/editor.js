import { COLORS, MATERIALS, EFFECTS, displayLabel } from './effectCatalog.js';
import { draftIssues } from './cardData.js';
import { saveSettings, saveSettingsFile } from './settingsStorage.js';
import { cardEvaluation, serializeEvaluation } from './effectEvaluation.js';
import { mountEvaluationEditor } from './evaluationEditor.js';
import { goalIcons, effectIcons } from './cardIcons.js';
import { createProbabilityDisplay } from './probabilityDisplay.js';
import { removeGoal } from './goalEditing.js';
import { sortDocumentGoals } from './goalOrdering.js';
import { goalChoices, goalMetadataIssues } from './goalChoices.js';
import { effectChoices } from './effectChoices.js';

function el(tag, text, className) {
    const item = document.createElement(tag); if (tag === 'button') item.tabIndex = -1;
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
}
function button(text, action) {
    const item = el('button', text, 'Button texture-raised'); item.type = 'button';
    item.addEventListener('click', action); return item;
}
function select(label, options, value, update, numeric = false) {
    const wrapper = el('label', label, 'Field'); const input = el('select');
    input.append(new Option('未指定', ''));
    for (const option of options) input.append(new Option(displayLabel(option), String(option)));
    input.value = value === null ? '' : String(value);
    input.addEventListener('change', () => update(input.value === '' ? null : numeric ? Number(input.value) : input.value));
    wrapper.append(input); return wrapper;
}
export function mountEditor(root, savedDocument, savedRevision, savedEvaluation) {
    const state = { document: savedDocument, selected: 'A01', dirty: false, revision: savedRevision,
        evaluation:savedEvaluation.document, evaluationRevision:savedEvaluation.revision };
    let evaluationBase = structuredClone(savedEvaluation.document);
    let cardBase = sortDocumentGoals(savedDocument);
    const probability = createProbabilityDisplay();
    const toolbar = el('div', undefined, 'Toolbar');
    const notice = el('div', undefined, 'EditorNotice');
    const message = el('pre', '', 'Message');
    message.setAttribute('role', 'status');
    const dismissNotice = button('×', () => { message.textContent = ''; });
    dismissNotice.setAttribute('aria-label', '通知を閉じる');
    notice.append(message, dismissNotice);
    const layout = el('div', undefined, 'EditorLayout');
    const overview = el('section', undefined, 'Overview Surface texture-paper');
    overview.setAttribute('aria-label', '45枚の設定一覧');
    const evaluationScreen = el('section', undefined, 'EvaluationScreen Surface texture-paper');
    const views = el('div', undefined, 'Toolbar');
    const showView = mode => {
        overview.hidden = mode !== 'overview'; layout.hidden = mode !== 'editor';
        evaluationScreen.hidden = mode !== 'evaluation';
        listView.setAttribute('aria-pressed', String(mode === 'overview'));
        editView.setAttribute('aria-pressed', String(mode === 'editor'));
        evaluationView.setAttribute('aria-pressed', String(mode === 'evaluation'));
        if (mode === 'overview') renderOverview();
    };
    const listView = button('全体一覧', () => showView('overview'));
    const editView = button('選択カードを編集', () => showView('editor'));
    const evaluationView = button('効果の評価設定', () => showView('evaluation'));
    views.append(listView, editView, evaluationView);
    const wrapLabel = el('label', undefined, 'WrapControl'); const wrap = el('input'); wrap.type = 'checkbox';
    wrap.addEventListener('change', () => overview.classList.toggle('state-wrap', wrap.checked));
    wrapLabel.append(wrap, document.createTextNode('詳細を折り返す')); views.append(wrapLabel);
    const sidebar = el('nav', undefined, 'CardList Surface texture-paper'); sidebar.setAttribute('aria-label', 'カード一覧');
    const detail = el('section', undefined, 'CardDetail Surface texture-paper');
    const summary = el('p'); const saveState = el('span', 'ゲーム設定を読込済み');
    const draft = el('p', undefined, 'Draft');
    const current = () => state.document.cards.find(card => card.id === state.selected);
    function renderDraft() {
        const issues = [...draftIssues(current()), ...goalMetadataIssues(current())];
        draft.textContent = issues.length ? `要確認 ${issues.length}件` : '';
        draft.title = issues.join('／');
    }
    function changed() {
        state.dirty = true; saveState.textContent = '未保存の変更あり';
        message.textContent = '';
        renderList(); renderDraft(); refreshScores();
    }
    function refreshScores() {
        for (const output of root.querySelectorAll('[data-score-card]')) {
            const card = state.document.cards.find(card => card.id === output.dataset.scoreCard);
            const score = cardEvaluation(card, state.evaluation);
            output.textContent = score === null ? '—' : score.toFixed(2);
        }
    }
    function scoreOutput(card) {
        const output = el('output', undefined, 'CardScore'); output.dataset.scoreCard = card.id;
        output.setAttribute('aria-label', `${card.id}の評価点`);
        output.title = '効果の評価点×数量×ステップ倍率の合計。名声は符号付きの増減値を掛けます。';
        const score = cardEvaluation(card, state.evaluation); output.textContent = score === null ? '—' : score.toFixed(2);
        return output;
    }
    const save = button('ゲーム設定を保存', async () => {
        toolbar.inert = true; layout.inert = true; overview.inert = true; views.inert = true; evaluationScreen.inert = true;
        message.textContent = 'ゲーム設定を保存しています…';
        let cardsSaved = false;
        const written = [];
        try {
            const evaluationJson = serializeEvaluation(state.evaluation);
            const sorted = sortDocumentGoals(state.document);
            if (JSON.stringify(sorted) !== JSON.stringify(cardBase)) {
                state.revision = await saveSettings(sorted, state.revision);
                cardBase = sorted;
                written.push('カード設定');
            }
            cardsSaved = true;
            if (evaluationJson !== serializeEvaluation(evaluationBase)) {
                state.evaluationRevision = await saveSettingsFile('/api/effect-evaluation', evaluationJson, state.evaluationRevision);
                evaluationBase = structuredClone(state.evaluation);
                written.push('効果の評価設定');
            }
            const scroll = detail.scrollTop;
            state.document = structuredClone(sorted);
            renderList(); renderDetail(); renderOverview(); detail.scrollTop = scroll;
            state.dirty = false; saveState.textContent = 'ゲーム設定に保存済み';
            message.textContent = written.length
                ? `${written.join('と')}を保存しました。`
                : 'このタブに保存する変更はありません。';
        } catch (error) {
            message.textContent = `${cardsSaved ? 'カード設定は保存済みですが、効果の評価設定を保存できませんでした。' : '保存できませんでした。'}編集内容は保持しています。\n${error.message}`;
            if (cardsSaved) saveState.textContent = 'カード保存済み・評価設定未保存';
        }
        finally { toolbar.inert = false; layout.inert = false; overview.inert = false; views.inert = false; evaluationScreen.inert = false; }
    });
    save.disabled = !import.meta.env.DEV;
    if (save.disabled) message.textContent = 'ゲーム設定の編集・保存はローカル開発サーバーで行ってください。';
    toolbar.append(save, saveState);
    function renderOverview() {
        overview.replaceChildren();
        const table = el('table', undefined, 'OverviewTable');
        const head = el('thead'); const headers = el('tr'); const subheaders = el('tr');
        for (const [title, className] of [['ID', 'id-column'], ['カード名', 'name-column'], ['画材', 'material-column'], ['色', 'color-column'], ['難易度', 'difficulty-column'], ['評価点', 'score-column']]) {
            const th = el('th', title, className); th.rowSpan = 2; th.scope = 'col'; headers.append(th);
        }
        for (let i = 0; i < 3; i++) {
            const th = el('th', `ステップ${i}`); th.colSpan = 4; th.scope = 'colgroup'; headers.append(th);
            for (const title of ['目標', '達成率', 'プレイ時', '達成時']) { const sub = el('th', title); sub.scope = 'col'; subheaders.append(sub); }
        }
        head.append(headers, subheaders); const body = el('tbody');
        const cell = (text, className) => { const td = el('td', undefined, className); const content = el('span', text, 'CellText'); content.title = text; td.append(content); return td; };
        for (const card of [...state.document.cards].sort((a, b) => a.id.localeCompare(b.id))) {
            const row = el('tr'); const id = el('td');
            id.append(button(card.id, () => { state.selected = card.id; renderList(); renderDetail(); detail.scrollTop = 0; showView('editor'); }));
            row.append(id, cell(card.name || '名称未設定', 'card-name'));
            for (const key of ['materials', 'colors']) row.append(cell(Object.keys(card.metadata[key]).filter(value => card.metadata[key][value]).map(displayLabel).join('・') || '—'));
            const difficulty = el('td'); difficulty.append(probability.difficultyOutput(card.steps, card.id[0])); row.append(difficulty);
            const score = el('td'); score.append(scoreOutput(card)); row.append(score);
            for (const step of card.steps) {
                const goalCell = el('td', undefined, 'step-start'); goalCell.append(goalIcons(step.goals)); row.append(goalCell);
                const chance = el('td'); chance.append(probability.output(step.goals, card.id[0])); row.append(chance);
                for (const key of ['playEffects', 'achievementEffects']) { const td = el('td'); td.append(effectIcons(step[key])); row.append(td); }
            }
            body.append(row);
        }
        table.append(head, body); overview.append(table);
    }
    function renderList() {
        sidebar.replaceChildren();
        for (const grade of ['A', 'B', 'C']) {
            sidebar.append(el('h2', `グレード${grade}`));
            for (const card of state.document.cards.filter(c => c.id[0] === grade).sort((a, b) => a.id.localeCompare(b.id))) {
                const entry = button(`${card.id}　${card.name || '名称未設定'}`, () => {
                    state.selected = card.id; renderList(); renderDetail(); detail.scrollTop = 0;
                });
                entry.setAttribute('aria-current', String(card.id === state.selected)); sidebar.append(entry);
            }
        }
        summary.textContent = `45枚 · 制作途中 ${state.document.cards.filter(card => draftIssues(card).length).length}枚`;
    }
    function metadata(card, key, title, values) {
        const group = el('fieldset'); group.append(el('legend', title)); const row = el('div', undefined, 'Choices');
        for (const value of values) {
            const label = el('label'); const input = el('input'); input.type = 'checkbox'; input.checked = card.metadata[key][value];
            input.addEventListener('change', () => {
                card.metadata[key][value] = input.checked; changed();
            });
            label.append(input, document.createTextNode(displayLabel(value))); row.append(label);
        }
        group.append(row); return group;
    }
    function setAvailableOptions(input, options, value) {
        input.replaceChildren(new Option('未指定', ''), ...options.map(code => new Option(displayLabel(code), code)));
        const outside = value !== null && !options.includes(value);
        if (outside) {
            const selected = new Option(`メタ対象外：${displayLabel(value)}`, value); selected.disabled = true; input.append(selected);
        }
        input.value = value ?? '';
        input.setAttribute('aria-invalid', String(outside));
        input.setCustomValidity(outside ? 'メタ情報に含まれる項目を選択してください。' : '');
        input.title = outside ? 'メタ対象外の設定です。設定値を変更するか、メタ情報を見直してください。' : '';
    }
    function goalSelect(label, field, goal, refreshGoal) {
        const control = select(label, goalChoices(current(), field), goal[field], value => {
            goal[field] = value; setAvailableOptions(control.querySelector('select'), goalChoices(current(), field), value); refreshGoal();
        });
        const input = control.querySelector('select'); input.dataset.goalField = field;
        setAvailableOptions(input, goalChoices(current(), field), goal[field]); return control;
    }
    function editDialog(title, content) {
        const dialog = el('dialog', undefined, 'EditorDialog Surface texture-paper');
        const heading = el('h2', title); heading.id = 'editor-dialog-heading';
        dialog.setAttribute('aria-labelledby', heading.id);
        const body = el('form', undefined, 'DialogFields');
        body.addEventListener('submit', event => event.preventDefault());
        const actions = el('div', undefined, 'Row');
        const close = () => dialog.close();
        const apply = () => { changed(); renderDetail(); close(); };
        dialog.append(heading, body, actions);
        content(body, actions, apply);
        const confirm = actions.querySelector('button');
        const refreshValidity = () => { confirm.disabled = !body.checkValidity(); };
        body.addEventListener('input', refreshValidity); body.addEventListener('change', refreshValidity);
        refreshValidity();
        actions.append(button('キャンセル', close));
        dialog.addEventListener('close', () => dialog.remove());
        root.append(dialog); dialog.showModal();
    }
    function editGoal(step, index, at) {
        const adding = at === undefined;
        const value = adding ? { material: null, color: null } : structuredClone(step.goals[at]);
        editDialog(`ステップ${index} 目標を${adding ? '追加' : '編集'}`, (body, actions, apply) => {
            const material = goalSelect('画材', 'material', value, () => updateCondition());
            const color = goalSelect('色', 'color', value, () => updateCondition());
            const updateCondition = () => {
                const input = material.querySelector('select');
                setAvailableOptions(input, goalChoices(current(), 'material'), value.material);
                if (value.material === null && value.color === null) input.setCustomValidity('画材か色を指定してください。');
            };
            body.append(material, color); updateCondition();
            if (adding ? step.goals.length : at > 0) {
                const connection = select('直前の目標との結合', ['and', 'or'], value.join ?? 'and', next => {
                    value.join = next;
                });
                connection.querySelector('option[value=""]').remove(); body.append(connection);
            }
            actions.append(button('確定', () => {
                if (adding) step.goals.push(value); else step.goals[at] = value;
                apply();
            }));
            if (!adding) actions.append(button('削除', () => { removeGoal(step.goals, at); apply(); }));
        });
    }
    function goals(step, index) {
        const group = el('fieldset'); group.append(el('legend', '達成目標'));
        group.setAttribute('aria-label', `ステップ${index} 達成目標`);
        const chance = el('span', ' · 達成率 '); chance.append(probability.output(step.goals, current().id[0]));
        group.querySelector('legend').append(chance);
        group.append(goalIcons(step.goals, at => editGoal(step, index, at)));
        const actions = el('div', undefined, 'Row');
        actions.append(button('目標を追加', () => editGoal(step, index)));
        group.append(actions); return group;
    }
    function parameterFields(effect, update) {
        const fields = el('div', undefined, 'Row');
        const definition = EFFECTS.find(item => item.type === effect.type);
        for (const field of definition.fields) {
            const change = value => { effect[field.name] = value; update(); };
            if (field.options) {
                const options = effectChoices(current(), field);
                const constrained = ['material', 'color', 'colors'].includes(field.name);
                const control = select(field.label, options, effect[field.name], value => {
                    change(value);
                    if (constrained) setAvailableOptions(control.querySelector('select'), options, value);
                }, typeof field.options[0] === 'number');
                if (constrained) setAvailableOptions(control.querySelector('select'), options, effect[field.name]);
                control.querySelector('select').required = true;
                fields.append(control);
            }
            else {
                const label = el('label', field.label, 'Field'); const input = el('input'); input.type = 'number'; input.step = '1';
                input.required = true; input.min = String(field.min ?? -Number.MAX_SAFE_INTEGER); input.max = String(Number.MAX_SAFE_INTEGER);
                input.value = effect[field.name] === null ? '' : effect[field.name];
                const checkNumber = () => input.setCustomValidity(field.nonzero && input.valueAsNumber === 0 ? '0以外の整数を指定してください。' : '');
                checkNumber();
                input.addEventListener('input', () => { checkNumber(); change(input.value === '' ? null : input.valueAsNumber); }); label.append(input); fields.append(label);
            }
        }
        return fields;
    }
    function editEffect(step, key, title, index, at) {
        const adding = at === undefined;
        let value = adding ? { type: null } : structuredClone(step[key][at]);
        let position = adding ? step[key].length : at;
        editDialog(`ステップ${index} ${title}を${adding ? '追加' : '編集'}`, (body, actions, apply) => {
            const fields = el('div');
            const refresh = () => fields.replaceChildren(...(value.type === null ? [] : [parameterFields(value, () => {})]));
            body.append(select('効果の種類', EFFECTS.map(item => item.label),
                value.type === null ? null : EFFECTS.find(item => item.type === value.type).label, label => {
                    const selected = EFFECTS.find(item => item.label === label);
                    value = selected ? Object.fromEntries([['type', selected.type], ...selected.fields.map(field => [field.name, field.integer ? 1 : null])]) : { type: null };
                    refresh();
                }), fields);
            refresh();
            body.querySelector('select').required = true;
            if (!adding) {
                const order = el('span');
                const up = button('上へ', () => { position--; refreshOrder(); });
                const down = button('下へ', () => { position++; refreshOrder(); });
                const refreshOrder = () => {
                    order.textContent = `実行順 ${position + 1} / ${step[key].length}`;
                    up.disabled = position === 0; down.disabled = position === step[key].length - 1;
                };
                const row = el('div', undefined, 'Row'); row.append(order, up, down); body.append(row); refreshOrder();
            }
            actions.append(button('確定', () => {
                if (!adding) step[key].splice(at, 1);
                step[key].splice(position, 0, value); apply();
            }));
            if (!adding) actions.append(button('削除', () => { step[key].splice(at, 1); apply(); }));
        });
    }
    function effects(step, key, title, index) {
        const group = el('fieldset'); group.append(el('legend', title));
        group.setAttribute('aria-label', `ステップ${index} ${title}`);
        group.append(effectIcons(step[key], at => editEffect(step, key, title, index, at)),
            button('効果を追加', () => editEffect(step, key, title, index)));
        return group;
    }
    function renderDetail() {
        const card = current(); const heading = el('div', undefined, 'CardHeading'); heading.append(el('h2', `${card.id}`)); detail.replaceChildren(heading);
        const label = el('label', 'カード名', 'Field'); const name = el('input'); name.type = 'text'; name.value = card.name;
        name.addEventListener('input', () => { card.name = name.value; changed(); }); label.append(name);
        const difficulty = el('span', '難易度 ', 'DifficultyLabel'); difficulty.append(probability.difficultyOutput(card.steps, card.id[0]));
        const score = el('span', '評価点 ', 'DifficultyLabel'); score.append(scoreOutput(card));
        heading.append(label, difficulty, score, draft); renderDraft();
        const meta = el('div', undefined, 'MetadataRow');
        meta.append(metadata(card, 'materials', '画材', MATERIALS), metadata(card, 'colors', '色', COLORS)); detail.append(meta);
        const grid = el('div', undefined, 'StepGrid'); grid.setAttribute('aria-label', 'ステップ別設定');
        card.steps.forEach((step, i) => {
            const column = el('section', undefined, 'StepColumn');
            column.append(el('h3', `ステップ${i}`), goals(step, i),
                effects(step, 'playEffects', 'プレイ時効果', i), effects(step, 'achievementEffects', '達成時効果', i));
            grid.append(column);
        });
        detail.append(grid);
    }
    const controls = el('div', undefined, 'ControlBar'); controls.append(views, toolbar, summary);
    controls.append(probability.controls(root));
    mountEvaluationEditor(evaluationScreen, state.evaluation, changed);
    layout.append(sidebar, detail); root.append(controls, overview, layout, evaluationScreen, notice); renderList(); renderDetail(); showView('overview');
    window.addEventListener('beforeunload', event => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
}

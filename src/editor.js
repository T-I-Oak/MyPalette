import { COLORS, MATERIALS, EFFECTS, displayLabel } from './effectCatalog.js';
import { draftIssues, validateDocument } from './cardData.js';
import { saveSettings } from './settingsStorage.js';
import { describeEffect, describeGoals } from './cardSummary.js';
import { createProbabilityDisplay } from './probabilityDisplay.js';
import { removeGoal } from './goalEditing.js';
import { sortDocumentGoals } from './goalOrdering.js';
import { goalChoices, goalMetadataIssues } from './goalChoices.js';

function el(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
}
function button(text, action) {
    const item = el('button', text, 'Button'); item.type = 'button';
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
export function mountEditor(root, savedDocument, savedRevision) {
    const state = { document: savedDocument, selected: 'A01', dirty: false, revision: savedRevision };
    const probability = createProbabilityDisplay();
    const pendingOr = new Set();
    const toolbar = el('div', undefined, 'Toolbar');
    const message = el('pre', '', 'Message');
    message.setAttribute('role', 'status');
    const layout = el('div', undefined, 'EditorLayout');
    const overview = el('section', undefined, 'Overview Surface texture-paper');
    overview.setAttribute('aria-label', '45枚の設定一覧');
    const views = el('div', undefined, 'Toolbar');
    const showView = mode => {
        overview.hidden = mode !== 'overview'; layout.hidden = mode !== 'editor';
        listView.setAttribute('aria-pressed', String(mode === 'overview'));
        editView.setAttribute('aria-pressed', String(mode === 'editor'));
        if (mode === 'overview') renderOverview();
    };
    const listView = button('全体一覧', () => showView('overview'));
    const editView = button('選択カードを編集', () => showView('editor'));
    views.append(listView, editView);
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
        renderList(); renderDraft();
    }
    const save = button('ゲーム設定を保存', async () => {
        if (pendingOr.size) { message.textContent = 'ORの後に目標を追加するか、末尾のORを削除してください。'; return; }
        toolbar.inert = true; layout.inert = true; overview.inert = true; views.inert = true;
        message.textContent = 'ゲーム設定を保存しています…';
        try {
            const sorted = sortDocumentGoals(state.document);
            state.revision = await saveSettings(sorted, state.revision);
            const scroll = detail.scrollTop;
            state.document = sorted;
            renderList(); renderDetail(); renderOverview(); detail.scrollTop = scroll;
            state.dirty = false; saveState.textContent = 'ゲーム設定に保存済み';
            message.textContent = 'ゲーム設定に保存しました。次回起動時もこの内容を読み込みます。';
        } catch (error) { message.textContent = `保存できませんでした。編集内容は保持しています。\n${error.message}`; }
        finally { toolbar.inert = false; layout.inert = false; overview.inert = false; views.inert = false; }
    });
    save.disabled = !import.meta.env.DEV;
    if (save.disabled) message.textContent = 'ゲーム設定の編集・保存はローカル開発サーバーで行ってください。';
    toolbar.append(save, button('入力を検証', () => {
        const errors = validateDocument(state.document);
        message.textContent = errors.length ? errors.map(e => `${e.path}: ${e.reason}`).join('\n')
            : `入力エラーなし。制作途中 ${state.document.cards.filter(card => draftIssues(card).length).length}／45枚（未設定のまま保存できます）。`;
    }), saveState);
    function renderOverview() {
        overview.replaceChildren();
        const table = el('table', undefined, 'OverviewTable');
        const head = el('thead'); const headers = el('tr'); const subheaders = el('tr');
        for (const [title, className] of [['ID', 'id-column'], ['カード名', 'name-column'], ['画材', 'material-column'], ['色', 'color-column']]) {
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
            for (const step of card.steps) {
                row.append(cell(step.goals.length ? describeGoals(step.goals) : '—', 'step-start'));
                const chance = el('td'); chance.append(probability.output(step.goals, card.id[0])); row.append(chance);
                for (const key of ['playEffects', 'achievementEffects']) row.append(cell(step[key].length ? step[key].map((effect, i) => `${i + 1}. ${describeEffect(effect)}`).join(' → ') : '—'));
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
                for (const select of detail.querySelectorAll('select[data-goal-field]')) {
                    setGoalOptions(select, select.dataset.goalField, select.value === '' ? null : select.value);
                }
            });
            label.append(input, document.createTextNode(displayLabel(value))); row.append(label);
        }
        group.append(row); return group;
    }
    function setGoalOptions(input, field, value) {
        const options = goalChoices(current(), field);
        input.replaceChildren(new Option('未指定', ''), ...options.map(code => new Option(displayLabel(code), code)));
        const outside = value !== null && !options.includes(value);
        if (outside) {
            const selected = new Option(`メタ対象外：${displayLabel(value)}`, value); selected.disabled = true; input.append(selected);
        }
        input.value = value ?? '';
        input.setAttribute('aria-invalid', String(outside));
        input.title = outside ? 'メタ対象外の設定です。目標を変更するか、メタ情報を見直してください。' : '';
    }
    function goalSelect(label, field, goal, refreshGoal) {
        const control = select(label, goalChoices(current(), field), goal[field], value => {
            goal[field] = value; setGoalOptions(control.querySelector('select'), field, value); refreshGoal();
        });
        const input = control.querySelector('select'); input.dataset.goalField = field;
        setGoalOptions(input, field, goal[field]); return control;
    }
    function goals(step, index) {
        const group = el('fieldset'); group.append(el('legend', '達成目標'));
        group.setAttribute('aria-label', `ステップ${index} 達成目標`);
        group.title = 'ANDを優先し、ORで区切った組のいずれかを満たせば達成します。各目標には別々のダイスを使います。';
        const previewGoals = () => pendingOr.has(step) ? [...step.goals, {material:null,color:null,join:'or'}] : step.goals;
        const expression = el('p', describeGoals(step.goals) + (pendingOr.has(step) ? ' |' : ''), 'GoalExpression'); group.append(expression);
        const refreshGoal = () => { changed(); expression.textContent = describeGoals(step.goals) + (pendingOr.has(step) ? ' |' : ''); probability.refreshStep(group, previewGoals(), current().id[0]); };
        const chance = el('span', '達成率 '); chance.append(probability.output(previewGoals(), current().id[0])); group.querySelector('legend').append(' · ', chance);
        const separator = action => {
            const item = el('div', undefined, 'OrSeparator'); item.append(el('span', 'OR'));
            const remove = button('×', action); remove.setAttribute('aria-label', 'ORを削除'); remove.title = 'ORを削除して前後の目標をつなぐ';
            item.append(remove); return item;
        };
        step.goals.forEach((goal, i) => {
            const row = el('div', undefined, 'GoalRow'); row.setAttribute('aria-label', `目標${i + 1}`);
            if (goal.join === 'or') group.append(separator(() => { delete goal.join; changed(); renderDetail(); }));
            row.append(
                goalSelect('画材', 'material', goal, refreshGoal),
                goalSelect('色', 'color', goal, refreshGoal),
                button('×', () => { removeGoal(step.goals, i); if (!step.goals.length) pendingOr.delete(step); changed(); renderDetail(); }));
            const remove = row.querySelector('button'); remove.setAttribute('aria-label', `目標${i + 1}を削除`); remove.title = '目標を削除'; group.append(row);
        });
        if (pendingOr.has(step)) group.append(separator(() => { pendingOr.delete(step); changed(); renderDetail(); }));
        const actions = el('div', undefined, 'Row');
        const addOr = button('ORを追加', () => { pendingOr.add(step); changed(); renderDetail(); });
        addOr.disabled = !step.goals.length || pendingOr.has(step);
        actions.append(button('目標を追加', () => {
            step.goals.push({ material: null, color: null, ...(pendingOr.has(step) ? {join:'or'} : {}) });
            pendingOr.delete(step); changed(); renderDetail();
        }), addOr); group.append(actions);
        return group;
    }
    function parameterFields(effect, update) {
        const fields = el('div', undefined, 'Row');
        const definition = EFFECTS.find(item => item.type === effect.type);
        for (const field of definition.fields) {
            const change = value => { effect[field.name] = value; update(); };
            if (field.options) fields.append(select(field.label, field.options, effect[field.name], change, typeof field.options[0] === 'number'));
            else {
                const label = el('label', field.label, 'Field'); const input = el('input'); input.type = 'number'; input.step = '1';
                if (field.min) input.min = String(field.min);
                input.value = effect[field.name] === null ? '' : effect[field.name];
                input.addEventListener('input', () => change(input.value === '' ? null : input.valueAsNumber)); label.append(input); fields.append(label);
            }
        }
        return fields;
    }
    function effects(step, key, title, index) {
        const group = el('fieldset'); group.append(el('legend', title)); group.setAttribute('aria-label', `ステップ${index} ${title}`);
        step[key].forEach((effect, i) => {
            const def = EFFECTS.find(item => item.type === effect.type);
            const row = el('div', undefined, 'EffectRow');
            row.append(select(`効果${i + 1}の種類`, EFFECTS.map(item => item.label), def?.label ?? null, value => {
                const selected = EFFECTS.find(item => item.label === value);
                step[key][i] = selected
                    ? Object.fromEntries([['type', selected.type], ...selected.fields.map(field => [field.name, field.integer ? 1 : null])])
                    : { type: null };
                changed(); renderDetail();
            }));
            const fields = effect.type === null ? el('div', undefined, 'Row') : parameterFields(effect, changed);
            const move = delta => { [step[key][i + delta], step[key][i]] = [step[key][i], step[key][i + delta]]; changed(); renderDetail(); };
            const up = button('上へ', () => move(-1)); up.disabled = i === 0;
            const down = button('下へ', () => move(1)); down.disabled = i === step[key].length - 1;
            fields.append(up, down, button('削除', () => { step[key].splice(i, 1); changed(); renderDetail(); }));
            row.append(fields); group.append(row);
        });
        group.append(button('効果を追加', () => {
            step[key].push({ type: null });
            changed(); renderDetail();
        })); return group;
    }
    function renderDetail() {
        const card = current(); const heading = el('div', undefined, 'CardHeading'); heading.append(el('h2', `${card.id}`)); detail.replaceChildren(heading);
        const label = el('label', 'カード名', 'Field'); const name = el('input'); name.type = 'text'; name.value = card.name;
        name.addEventListener('input', () => { card.name = name.value; changed(); }); label.append(name); heading.append(label, draft); renderDraft();
        const meta = el('div', undefined, 'MetadataRow');
        meta.append(metadata(card, 'materials', '画材', MATERIALS), metadata(card, 'colors', '色', COLORS)); detail.append(meta);
        const grid = el('div', undefined, 'StepGrid'); grid.setAttribute('aria-label', 'ステップ別設定');
        card.steps.forEach((_, i) => grid.append(el('h3', `ステップ${i}`)));
        card.steps.forEach((step, i) => grid.append(goals(step, i)));
        card.steps.forEach((step, i) => grid.append(effects(step, 'playEffects', 'プレイ時効果', i)));
        card.steps.forEach((step, i) => grid.append(effects(step, 'achievementEffects', '達成時効果', i)));
        detail.append(grid);
    }
    const controls = el('div', undefined, 'ControlBar'); controls.append(views, toolbar, summary);
    controls.append(probability.controls(root));
    layout.append(sidebar, detail); root.append(controls, message, overview, layout); renderList(); renderDetail(); showView('overview');
    window.addEventListener('beforeunload', event => { if (state.dirty) { event.preventDefault(); event.returnValue = ''; } });
}

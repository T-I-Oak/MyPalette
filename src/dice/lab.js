import { COLORS, MATERIALS, SPECIAL_FACES, displayLabel } from '../effectCatalog.js';
import { DiceGroup } from './DiceGroup.js';
import { DiceScene } from './DiceScene.js';
import { faceCanvas } from './icons.js';
import { loadResultGraphics } from './resultGraphics.js';
import { FACE_SEARCH_NOTICE_ID } from './FaceSearchNotice.js';
import { IdOverlay } from './lab/IdOverlay.js';
import './layout.css';
import './lab/layout.css';
import './states.css';

function element(tag, className, text) {
    const node = document.createElement(tag); node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}
function button(text, action) {
    const node = element('button', 'Button', text); node.type = 'button'; node.addEventListener('click', action); return node;
}
function select(label, values, value, action) {
    const field = element('label', 'Field', label), input = document.createElement('select');
    input.setAttribute('aria-label', label);
    for (const item of values) {
        const option = document.createElement('option'); option.value = item; option.textContent = displayLabel(item); input.append(option);
    }
    input.value = value; input.addEventListener('change', () => action(input.value)); field.append(input);
    return { field, input };
}
const describe = face => face.special ? displayLabel(face.special) : `${displayLabel(face.color)}・${displayLabel(face.material)}`;

export async function mountDiceLab(root, home) {
    root.replaceChildren(element('p', '', '画材画像と3D表示を準備しています…'));
    let graphics;
    try { graphics = await loadResultGraphics(); }
    catch (error) {
        root.replaceChildren(element('p', '', error.message), button('再読み込み', () => location.reload()), button('入口へ戻る', home));
        return;
    }
    const group = new DiceGroup();
    const selected = new Set(); let focus = 'dice-1', sequence = 0, scene, idOverlay, disposed = false;
    const lab = element('section', 'DiceLab');
    const toolbar = element('div', 'Toolbar');
    const target = select('ロール対象', ['all', 'selected', 'single'], 'all', () => {});
    for (const [i, label] of ['未消費の全体', '選択した複数', '編集中の単体'].entries()) target.input.options[i].textContent = label;
    const message = element('output', 'DiceMessage', '空中回転中。対象を選んでロールしてください。'); message.setAttribute('aria-live', 'polite');
    function targets() {
        if (target.input.value === 'single') return [focus];
        if (target.input.value === 'selected') return [...selected];
        return group.dice.filter(die => !die.consumed).map(die => die.id);
    }
    async function roll() {
        try {
            const pending = group.roll(targets()); renderList(); renderInspector();
            message.textContent = 'ロール中…以前の結果は非表示です。';
            const results = await pending;
            if (disposed) return;
            message.textContent = results.map(result => `${result.id}: ${result.status === 'settled' ?
                `面${result.index + 1} ${describe(result.face)}` : result.status === 'cancelled' ? '削除による中止' : '停止できませんでした。再ロールしてください'}`).join(' / ');
        } catch (error) { message.textContent = `操作できません: ${error.message}`; }
        if (!disposed) { renderList(); renderInspector(); }
    }
    const rollButton = button('使う画材を決める', roll); rollButton.classList.add('texture-primary');
    const prepare = button('対象を空中回転へ戻す', () => {
        try {
            const dice = targets().map(id => group.get(id)); dice.forEach(die => die.assertMutable());
            dice.forEach(die => { die.prepare(); die.setPosition({ x: die.body.position.x, y: 2.5, z: die.body.position.z }); });
            message.textContent = '対象をロール前の状態へ戻しました。'; renderList(); renderInspector();
        } catch (error) { message.textContent = error.message; }
    });
    toolbar.append(button('入口へ戻る', () => { dispose(); home(); }), target.field, rollButton, prepare);
    const workspace = element('div', 'DiceWorkspace');
    const viewport = element('div', 'DiceViewport');
    const side = element('aside', 'DiceControls Surface texture-paper');
    const intro = element('p', 'DiceHint', '一覧で対象を選択。「編集」で6面を変更できます。面番号は1始まり、APIのindexは0始まりです。');
    const list = element('div', 'DiceList'), inspector = element('section', 'DiceInspector');
    const searchControls=element('section','DiceSearchControls');
    searchControls.append(element('h3','','面構成を探す'));
    const searchSummary=element('output','DiceSearchSummary Surface texture-paper');
    searchSummary.id=FACE_SEARCH_NOTICE_ID;searchSummary.hidden=true;
    searchSummary.setAttribute('role','status');searchSummary.setAttribute('aria-live','polite');searchSummary.setAttribute('aria-atomic','true');
    const searchMode=select('検索する条件',['material','color','both'],'material',updateSearchFields);
    for(const [i,label] of ['画材','色','画材＋色'].entries())searchMode.input.options[i].textContent=label;
    const searchMaterial=select('検索する画材',MATERIALS,'brush',()=>{});
    const searchColor=select('検索する色',COLORS,'orange',()=>{});
    function updateSearchFields(){searchMaterial.field.hidden=searchMode.input.value==='color';searchColor.field.hidden=searchMode.input.value==='material';}
    const searchButton=button('条件を含むダイスを探す',()=>{
        const condition={};if(searchMode.input.value!=='color')condition.material=searchMaterial.input.value;
        if(searchMode.input.value!=='material')condition.color=searchColor.input.value;
        scene.showFaceSearch(condition);
    });
    const clearSearchButton=button('検索表示をクリア',()=>{scene.clearFaceSearch();});
    searchControls.append(searchMode.field,searchMaterial.field,searchColor.field,searchButton,clearSearchButton);
    updateSearchFields();
    const addControls = element('div', 'DiceAdd');
    const addType = select('追加する面構成', [...MATERIALS, ...SPECIAL_FACES], 'brush', () => {});
    const addLifetime = select('所持期間', ['permanent', 'temporary'], 'permanent', () => {});
    const addButton = button('ダイスを追加', () => {
        add(addType.input.value, addLifetime.input.value); renderList(); renderInspector();
    });
    addControls.append(addType.field, addLifetime.field, addButton);
    side.append(searchControls,element('h2', '', 'ダイスと出目'), intro, list, addControls, inspector);
    workspace.append(viewport, side);
    const gallery = element('details', 'DiceGallery Surface texture-paper');
    gallery.append(element('summary', '', '通常面36組・特殊面10種を比較する'));
    const grid = element('div', 'DiceIconGrid');
    for (const lifetime of ['permanent', 'temporary']) for (const material of MATERIALS) for (const color of COLORS) {
        const face = { color, material }, item = element('figure', 'DiceSample');
        item.append(faceCanvas(face, lifetime, 128), element('figcaption', '', `${displayLabel(lifetime)} ${describe(face)}`)); grid.append(item);
    }
    for (const special of SPECIAL_FACES) {
        const item = element('figure', 'DiceSample'); item.append(faceCanvas({ special }, 'permanent', 128),
            element('figcaption', '', displayLabel(special))); grid.append(item);
    }
    gallery.append(grid); lab.append(toolbar, message, searchSummary, workspace, gallery); root.replaceChildren(lab);
    function add(type, lifetime) {
        if (group.dice.length >= 12) { message.textContent = '確認画面は最大12個です。削除してから追加してください。'; return; }
        const faces = SPECIAL_FACES.includes(type) ? Array.from({ length: 6 }, () => ({ special: type })) :
            COLORS.map(color => ({ color, material: type }));
        const die = group.add({ id: `dice-${++sequence}`, faces, lifetime }); focus = die.id; selected.add(die.id);
    }
    function renderList() {
        rollButton.disabled = group.rolling; prepare.disabled = group.rolling;
        addButton.disabled = group.rolling || group.dice.length >= 12;
        list.replaceChildren();
        for (const die of group.dice) {
            const row = element('div', 'DiceRow texture-surface-muted'); row.dataset.id = die.id;
            const label = element('label', 'DiceSelection'), checkbox = document.createElement('input'); checkbox.type = 'checkbox';
            checkbox.checked = selected.has(die.id); checkbox.disabled = die.consumed || group.rolling;
            checkbox.addEventListener('change', () => checkbox.checked ? selected.add(die.id) : selected.delete(die.id));
            label.append(checkbox, document.createTextNode(`${die.id} ${displayLabel(die.lifetime)}`));
            const result = die.result;
            const status = die.consumed ? '消費済み' : ({ ready: '空中回転', rolling: 'ロール中', settled: '確定' })[die.state];
            const readout = element('span', 'DiceReadout', `${status}${result ? ` / 面${result.index + 1} (index ${result.index}) ${describe(result.face)}` : ''}`);
            if (result) { const icon = faceCanvas(result.face, die.lifetime, 64); icon.className = 'DiceMiniFace'; row.append(icon); }
            const edit = button('編集', () => { focus = die.id; renderInspector(); }); edit.setAttribute('aria-label', `${die.id}を編集`);
            row.append(label, readout, edit); list.append(row);
        }
    }
    function renderInspector() {
        inspector.replaceChildren();
        if (!group.items.has(focus)) return;
        const die = group.get(focus);
        inspector.append(element('h3', '', `${die.id}の6面`));
        const actions = element('div', 'Toolbar');
        const consumed = button(die.consumed ? '未消費に戻す' : '消費済みにする', () => {
            die.setConsumed(!die.consumed); selected.delete(die.id); renderList(); renderInspector();
        }); consumed.disabled = group.rolling;
        const remove = button('このダイスを削除', () => {
            selected.delete(die.id); group.remove(die.id); focus = group.dice[0]?.id; renderList(); renderInspector();
        });
        actions.append(consumed, remove); inspector.append(actions);
        die.faces.forEach((face, index) => {
            const row = element('fieldset', 'DiceFaceEditor'); row.disabled = group.rolling;
            row.append(element('legend', '', `面${index + 1} / index ${index}`));
            const preview = faceCanvas(face, die.lifetime, 96); preview.className = 'DiceFacePreview'; row.append(preview);
            const mode = select('面の種類', ['normal', ...SPECIAL_FACES], face.special ?? 'normal', value => {
                die.setFace(index, value === 'normal' ? { color: 'yellow', material: 'brush' } : { special: value });
                renderInspector(); renderList();
            }); mode.input.options[0].textContent = '通常面'; row.append(mode.field);
            if (!face.special) {
                row.append(select('色', COLORS, face.color, value => {
                    die.setFace(index, { ...face, color: value }); renderInspector(); renderList();
                }).field, select('画材', MATERIALS, face.material, value => {
                    die.setFace(index, { ...face, material: value }); renderInspector(); renderList();
                }).field);
            }
            inspector.append(row);
        });
    }
    function dispose() {
        if (disposed) return; disposed = true; idOverlay?.dispose(); scene?.dispose();
        window.removeEventListener('pagehide', dispose);
    }
    add('brush', 'permanent'); add('pastel', 'temporary'); add('airbrush', 'permanent');
    focus = group.dice[0].id;
    try { scene = new DiceScene(viewport, group, graphics, () => { renderList(); }); idOverlay = new IdOverlay(viewport,scene); }
    catch (error) {
        group.dispose(); graphics.dispose(); viewport.replaceChildren(element('p', '', `3D表示を開始できません: ${error.message}`), button('再読み込み', () => location.reload()));
        rollButton.disabled = true; prepare.disabled = true; addButton.disabled = true;
        searchButton.disabled=true;clearSearchButton.disabled=true;return;
    }
    window.addEventListener('pagehide', dispose);
    renderList(); renderInspector();
    return dispose;
}

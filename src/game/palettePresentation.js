import { DiceGroup } from '../dice/DiceGroup.js';
import { DiceScene } from '../dice/DiceScene.js';
import { loadResultGraphics } from '../dice/resultGraphics.js';
import { syncPaletteSnapshot } from './paletteSnapshot.js';
import { rerollTicketCanvas } from '../icons/render.js';
import {paletteScaleForCount} from '../dice/field.js';
import {paletteSizeForScale} from '../dice/paletteLayout.js';
import '../dice/layout.css';
import '../dice/states.css';
import './palette.css';

export function createPalettePresentation(area, host, relayout) {
    host.classList.add('PaletteArea');
    area.bottomRightOffset = { x: 0, y: 40 };
    const controls = document.createElement('div');
    controls.className = 'PaletteFixedActions';
    area.fixedLayer.append(controls);
    const rerolls = document.createElement('div');
    rerolls.className = 'PaletteRerolls'; rerolls.setAttribute('role', 'img'); rerolls.hidden = true;
    const ticket = rerollTicketCanvas(); ticket.setAttribute('aria-hidden', 'true');
    const quantity = document.createElement('span');
    rerolls.append(ticket, quantity); area.fixedLayer.append(rerolls);
    const searchNotice = document.createElement('output'); searchNotice.className = 'PaletteSearchNotice Surface texture-floating';
    searchNotice.hidden = true; area.fixedLayer.append(searchNotice);
    const name = area.fixedLayer.querySelector('.LayoutAreaName');
    name.hidden = true;
    const viewport = document.createElement('div');
    viewport.className = 'PaletteViewport';
    viewport.setAttribute('role', 'img');
    let scene, group, disposed = false, generation = 0, started = false, snapshot = [];
    let request = null, actions;
    let pendingSearch = null;
    let rollScheduled = false, failedRequest = null;
    const held = new Set();
    const notice = document.createElement('div'); notice.className = 'PaletteNotice';
    notice.setAttribute('role', 'status');
    const retry = document.createElement('button'); retry.tabIndex = -1; retry.type = 'button';
    retry.className = 'Button texture-raised'; retry.textContent = '再読み込み';
    retry.addEventListener('click', initialize);
    function updateActions() {
        controls.replaceChildren();
        if (!request && actions.rerollSelection) {
            const button = document.createElement('button'); button.type = 'button'; button.tabIndex = -1;
            button.className = 'Button texture-raised state-attention'; button.textContent = '選択して画材を更新する';
            button.disabled = !actions.canConfirmReroll(); button.dataset.gameAction = '';
            button.addEventListener('click', actions.confirmReroll); controls.append(button); return;
        }
        if (!request) {
            for (const [text, enabled, handler] of [
                ['すべての画材を更新する', actions.canChangeAll(), actions.changeAll],
                ['1つの画材を更新する', actions.canChangeOne(), actions.changeOne],
            ]) {
                const button = document.createElement('button'); button.type = 'button'; button.tabIndex = -1;
                button.className = 'Button texture-raised'; button.textContent = text;
                button.disabled = !enabled; button.dataset.gameAction = '';
                button.addEventListener('click', handler); controls.append(button);
            }
            return;
        }
        if (failedRequest === request.id) {
            const retryRoll = document.createElement('button'); retryRoll.tabIndex = -1; retryRoll.type = 'button';
            retryRoll.className = 'Button texture-raised'; retryRoll.textContent = 'ロールを再試行';
            retryRoll.addEventListener('click', () => { failedRequest = null; updateActions(); });
            controls.append(retryRoll);
        } else if (!rollScheduled && group && request.status === 'ready' && actions.canStartRoll() && !group.dice.some(die => die.readyMotion)) {
            rollScheduled = true;
            queueMicrotask(() => { rollScheduled = false; if (!disposed) performRoll(); });
        }
    }
    async function performRoll() {
        if (!group || request?.status !== 'ready' || !actions.canStartRoll() || group.dice.some(die => die.readyMotion)) return;
        const token = generation, activeGroup = group, id = request.id, ids = [...request.ids];
        const callbacks = actions;
        callbacks.beginRoll(id);
        notice.remove();
        try {
            const results = await activeGroup.roll(ids);
            if (disposed || token !== generation) return;
            if (results.some(result => result.status !== 'settled')) throw new Error('出目が確定しませんでした。もう一度お試しください。');
            callbacks.completeRoll(id, results);
        } catch (error) {
            if (disposed || token !== generation) return;
            notice.textContent = `ロールを完了できませんでした。${error.message}`;
            viewport.append(notice);
            failedRequest = id;
            callbacks.failRoll(id);
        }
    }

    async function initialize() {
        started = true;
        const token = ++generation;
        scene?.dispose(); scene = null; group = null;
        notice.textContent = '画材を読み込んでいます…'; viewport.replaceChildren(notice);
        let graphics, pendingGroup;
        try {
            graphics = await loadResultGraphics();
            if (disposed || token !== generation) { graphics.dispose(); return; }
            pendingGroup = new DiceGroup();
            const next = new DiceScene(viewport, pendingGroup, graphics, updateActions, {
                transparent: true,
                bottomAligned: true,
                draggable: true,
                searchNoticeOptions: { target: searchNotice, emptyOnly: true, palette: true },
                onTap: id => {
                    const ids = actions.toggleDie(id); actions.selectedDice = ids;
                    next.setSelected(ids); updateActions();
                },
                readSize: () => ({ width: area.logicalWidth, height: area.logicalHeight,
                    pixelRatio: Math.min(devicePixelRatio, 2) * area.layoutFrame.scale }),
            });
            scene = next; group = pendingGroup;
            next.setSelected(actions.selectedDice);
            next.renderer.domElement.setAttribute('aria-hidden', 'true');
            syncSnapshot(); notice.remove(); updateActions(); update();
            if (pendingSearch) { next.showFaceSearch(pendingSearch); pendingSearch = null; }
        } catch (error) {
            pendingGroup?.dispose(); graphics?.dispose();
            if (disposed || token !== generation) return;
            notice.textContent = `画材を表示できませんでした。${error.message}`;
            viewport.replaceChildren(notice, retry);
        }
    }
    function update() {
        if (!viewport.isConnected) return;
        scene?.resize();
    }
    function syncSnapshot() {
        syncPaletteSnapshot(group, snapshot.map(die => held.has(die.id) ? {...die,used:false} : die), request,
            { animateReady: !matchMedia('(prefers-reduced-motion: reduce)').matches });
    }
    function endAchievement() {
        held.clear();
        if (scene) { scene.travelling.clear(); scene.interactionLocked = false; }
        if (group) syncSnapshot();
    }
    return {
        searchFaces(condition) {
            if (scene) return scene.showFaceSearch(condition);
            pendingSearch = {...condition};
        },
        beginAchievement(ids) {
            for (const id of ids) held.add(id);
            if (scene) { scene.interactionLocked = true; scene.drag?.cancel(); }
        },
        endAchievement,
        captureMaterial(id) {
            const owner = scene, die = group.get(id), visual = owner.visuals.get(id);
            const element = visual.result.cloneNode(true);
            element.className = `AchievementMaterial${visual.result.classList.contains('state-special') ? ' state-special' : ''}`;
            element.style.cssText = ''; element.removeAttribute('hidden'); element.removeAttribute('data-die-id');
            element.setAttribute('aria-hidden','true');
            const contents = element.querySelector('.DiceResultMotion'); contents.className = 'AchievementMaterialContents';
            const read = () => {
                const rect = viewport.getBoundingClientRect(), scale = rect.width / owner.width;
                const p = owner.project({...die.body.position,y:die.body.position.y-.35}), body = owner.project(die.body.position);
                const size = parseFloat(visual.result.style.width);
                return { x:rect.left+(p.x+parseFloat(visual.result.style.left))*scale,
                    y:rect.top+(p.y+parseFloat(visual.result.style.top)+size/2)*scale,
                    size:size*scale, body:{x:rect.left+body.x*scale,y:rect.top+body.y*scale} };
            };
            return { id, element, read,
                start() { owner.travelling.add(id); visual.result.hidden = true; },
                consume() {
                    if (scene !== owner) return;
                    held.delete(id); die.setConsumed(true); owner.travelling.delete(id); visual.result.hidden = true;
                },
            };
        },
        present(section, state, callbacks) {
            rerolls.hidden = state.rerolls <= 0;
            quantity.textContent = `×${state.rerolls}`;
            rerolls.setAttribute('aria-label', `リロール権 ${state.rerolls}個`);
            request = state.rollRequest ? structuredClone(state.rollRequest) : null;
            actions = callbacks;
            snapshot = structuredClone(state.phase === 'betweenDays' ? state.dayEndDice ?? [] : state.dice);
            const size=paletteSizeForScale(paletteScaleForCount(snapshot.length));
            const resized=area.standardWidth!==size.width||area.standardHeight!==size.height;
            area.standardWidth=size.width;area.standardHeight=size.height;
            viewport.setAttribute('aria-label', `パレット：${snapshot.map(die =>
                `${die.lifetime === 'permanent' ? '永続' : '一時'}ダイス、${die.used ? '消費済み' : '未使用'}、${die.current === null ? 'ロール待ち' : `面${die.current + 1}`}`).join('。')}`);
            if (viewport.parentNode !== host) host.append(viewport);
            section.remove();
            if (group) syncSnapshot();
            else if (!started) initialize();
            scene?.setSelected(actions.selectedDice);
            if(resized)relayout?.();
            updateActions(); update();
        },
        update,
        clear() { controls.replaceChildren(); },
        reset() {
            held.clear();
            pendingSearch = null; searchNotice.hidden = true; searchNotice.replaceChildren();
            failedRequest = null;
            generation++; scene?.dispose(); scene = null; group = null;
            snapshot = []; request = null; actions = null; viewport.replaceChildren(); controls.replaceChildren(); rerolls.hidden = true; started = false;
        },
        dispose() { disposed = true; generation++; scene?.dispose(); viewport.remove(); controls.remove(); rerolls.remove(); searchNotice.remove(); name.hidden = false; },
    };
}

import { DiceGroup } from '../dice/DiceGroup.js';
import { traceWebGL } from './startupTrace.js';
import { DiceScene } from '../dice/DiceScene.js';
import { loadResultGraphics } from '../dice/resultGraphics.js';
import { syncPaletteSnapshot } from './paletteSnapshot.js';
import { rerollTicketCanvas } from '../icons/render.js';
import {paletteScaleForCount} from '../dice/field.js';
import {paletteSizeForScale} from '../dice/paletteLayout.js';
import '../dice/layout.css';
import '../dice/states.css';
import './palette.css';

// MP28-02 comparison build.
const domDice = true;

export function createPalettePresentation(area, host, relayout, resultGraphics) {
    host.classList.add('PaletteArea');
    area.bottomRightOffset = { x: 0, y: 40 };
    const controls = document.createElement('div');
    controls.className = 'PaletteFixedActions';
    area.fixedLayer.append(controls);
    const rerolls = document.createElement('div');
    rerolls.className = 'PaletteRerolls texture-text-outline'; rerolls.setAttribute('role', 'img'); rerolls.hidden = true;
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
    if (domDice) {
        viewport.classList.add('PaletteDomDice');
        viewport.setAttribute('role', 'group');
    }
    let domGraphics;
    let scene, group, canvasTrace, disposed = false, generation = 0, started = false, snapshot = [];
    let request = null, actions;
    let pendingSearch = null;
    let rollScheduled = false, failedRequest = null;
    const held = new Set();
    const creditMaterials = new Set();
    const notice = document.createElement('div'); notice.className = 'PaletteNotice Surface texture-floating';
    const noticeText = document.createElement('div');
    noticeText.setAttribute('role', 'status');
    notice.append(noticeText);
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
        } else if (!rollScheduled && (domGraphics || group) && request.status === 'ready' && actions.canStartRoll() && !group?.dice.some(die => die.readyMotion)) {
            rollScheduled = true;
            queueMicrotask(() => { rollScheduled = false; if (!disposed) performRoll(); });
        }
    }
    async function performRoll() {
        if ((!group && !domGraphics) || request?.status !== 'ready' || !actions.canStartRoll() || group?.dice.some(die => die.readyMotion)) return;
        const token = generation, activeGroup = group, id = request.id, ids = [...request.ids];
        const callbacks = actions;
        callbacks.beginRoll(id);
        notice.remove();
        try {
            const results = domDice
                ? ids.map(id => ({ id, status: 'settled', index: Math.floor(Math.random() * 6) }))
                : await activeGroup.roll(ids);
            if (disposed || token !== generation) return;
            if (results.some(result => result.status !== 'settled')) throw new Error('出目が確定しませんでした。もう一度お試しください。');
            callbacks.completeRoll(id, results);
        } catch (error) {
            if (disposed || token !== generation) return;
            noticeText.textContent = `ロールを完了できませんでした。${error.message}`;
            viewport.append(notice);
            failedRequest = id;
            callbacks.failRoll(id);
        }
    }

    async function initialize() {
        started = true;
        const token = ++generation;
        canvasTrace?.stop(); scene?.dispose(); scene = null; group = null;
        retry.remove();
        if (!resultGraphics) {
            noticeText.textContent = '画材を読み込んでいます…';
            viewport.replaceChildren(notice);
        }
        let graphics, pendingGroup;
        try {
            graphics = resultGraphics ?? await loadResultGraphics();
            if (disposed || token !== generation) { graphics.dispose(); return; }
            if (domDice) {
                domGraphics = graphics;
                drawDomDice();
                updateActions();
                return;
            }
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
            canvasTrace = traceWebGL(next.renderer.domElement, 'palette');
            next.setSelected(actions.selectedDice);
            next.renderer.domElement.setAttribute('aria-hidden', 'true');
            syncSnapshot(); notice.remove(); updateActions(); update();
            if (pendingSearch) { next.showFaceSearch(pendingSearch); pendingSearch = null; }
        } catch (error) {
            pendingGroup?.dispose(); graphics?.dispose();
            if (disposed || token !== generation) return;
            noticeText.textContent = `画材を表示できませんでした。${error.message}`;
            notice.append(retry);
            viewport.replaceChildren(notice);
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
    function drawDomDice() {
        const buttons = snapshot.map(die => {
            const button = document.createElement('button');
            button.type = 'button';
            button.tabIndex = -1;
            button.className = 'Button texture-raised';
            button.dataset.dieId = die.id;
            button.disabled = die.current === null || (die.used && !held.has(die.id));
            button.hidden = creditMaterials.has(die.id);
            button.setAttribute('aria-pressed', String(actions.selectedDice.includes(die.id)));
            button.setAttribute('aria-label', die.id + (die.current === null ? ' ロール待ち' : ` 面${die.current + 1}`));
            if (die.current === null) button.textContent = '？';
            else {
                const image = document.createElement('img');
                image.src = domGraphics.get(die.faces[die.current]);
                image.alt = '';
                button.append(image);
            }
            button.onclick = () => {
                actions.selectedDice = actions.toggleDie(die.id);
                drawDomDice();
                updateActions();
            };
            return button;
        });
        viewport.replaceChildren(...buttons);
    }
    function endAchievement() {
        held.clear();
        if (scene) {
            scene.travelling.clear();
            for (const id of creditMaterials) scene.travelling.add(id);
            scene.interactionLocked = false;
        }
        if (group) syncSnapshot();
        if (domGraphics) drawDomDice();
    }
    return {
        resourceCounts: () => domGraphics ? { mode: 'dom', dice: snapshot.length }
            : scene ? { ...scene.renderer.info.memory, dice: group.dice.length, canvasWrites: canvasTrace.read() } : null,
        hideCreditMaterials(ids) {
            for (const id of ids) {
                creditMaterials.add(id);
                scene?.travelling.add(id);
            }
            if (domGraphics) drawDomDice();
        },
        waitReady(signal) {
            return new Promise(resolve => {
                let frame;
                const done = () => { cancelAnimationFrame(frame); signal.removeEventListener('abort', done); resolve(); };
                const tick = () => {
                    if (disposed || signal.aborted || domGraphics || group && group.dice.every(die => die.state === 'ready' && !die.readyMotion)) done();
                    else frame = requestAnimationFrame(tick);
                };
                signal.addEventListener('abort', done, { once: true }); tick();
            });
        },
        searchFaces(condition) {
            if (domDice) {
                const hits = snapshot.filter(die => !die.used && die.faces.some(face =>
                    Object.entries(condition).every(([key, value]) => face[key] === value)));
                searchNotice.textContent = `条件に合う画材：${hits.length}個`;
                searchNotice.hidden = false;
                return;
            }
            if (scene) return scene.showFaceSearch(condition);
            pendingSearch = {...condition};
        },
        beginAchievement(ids) {
            for (const id of ids) held.add(id);
            if (scene) { scene.interactionLocked = true; scene.drag?.cancel(); }
        },
        endAchievement,
        captureMaterial(id) {
            if (domDice) {
                const button = viewport.querySelector(`[data-die-id="${id}"]`);
                const element = document.createElement('div');
                element.className = 'AchievementMaterial';
                element.append(button.querySelector('img').cloneNode());
                const read = () => {
                    const rect = button.getBoundingClientRect();
                    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
                    return { x, y, size: rect.width, body: { x, y } };
                };
                return { id, element, read,
                    start() { button.style.visibility = 'hidden'; },
                    consume() { held.delete(id); },
                };
            }
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
            if (state.phase === 'play' && creditMaterials.size) {
                for (const id of creditMaterials) scene?.travelling.delete(id);
                creditMaterials.clear();
            }
            rerolls.hidden = state.rerolls <= 0;
            quantity.textContent = `×${state.rerolls}`;
            rerolls.setAttribute('aria-label', `リロール権 ${state.rerolls}個`);
            request = state.rollRequest ? structuredClone(state.rollRequest) : null;
            actions = callbacks;
            const showingDayEnd = state.phase === 'betweenDays' || state.dayEndRequest?.kind === 'cleanup';
            snapshot = structuredClone(showingDayEnd ? state.dayEndDice ?? [] : state.dice);
            const size=paletteSizeForScale(paletteScaleForCount(snapshot.length));
            const resized=area.standardWidth!==size.width||area.standardHeight!==size.height;
            area.standardWidth=size.width;area.standardHeight=size.height;
            viewport.setAttribute('aria-label', `パレット：${snapshot.map(die =>
                `${die.lifetime === 'permanent' ? '永続' : '一時'}ダイス、${die.used ? '消費済み' : '未使用'}、${die.current === null ? 'ロール待ち' : `面${die.current + 1}`}`).join('。')}`);
            if (viewport.parentNode !== host) host.append(viewport);
            section.remove();
            if (domGraphics) drawDomDice();
            else if (group) syncSnapshot();
            else if (!started) initialize();
            scene?.setSelected(actions.selectedDice);
            if(resized)relayout?.();
            updateActions(); update();
        },
        update,
        clear() { controls.replaceChildren(); },
        reset() {
            held.clear();
            creditMaterials.clear();
            pendingSearch = null; searchNotice.hidden = true; searchNotice.replaceChildren();
            failedRequest = null;
            domGraphics?.dispose(); domGraphics = null;
            generation++; canvasTrace?.stop(); scene?.dispose(); scene = null; group = null;
            snapshot = []; request = null; actions = null; viewport.replaceChildren(); controls.replaceChildren(); rerolls.hidden = true; started = false;
        },
        dispose() { disposed = true; generation++; canvasTrace?.stop(); scene?.dispose(); viewport.remove(); controls.remove(); rerolls.remove(); searchNotice.remove(); name.hidden = false; },
    };
}

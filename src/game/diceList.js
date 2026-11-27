import { faceCanvas } from '../dice/icons.js';
import { SPECIAL_FACE_EFFECTS, displayLabel } from '../effectCatalog.js';
import { cardMessages } from './cardMessages.js';
import { DiceListState, clampListPosition, resizeListBounds } from './diceListState.js';
import { createDiceListPreview } from './diceListPreview.js';
import { bindDieFaceDescription, releasePaintingIcons } from '../cardIcons.js';
import { controlIconElement } from '../icons/render.js';
import { createScrollBar } from '../ui/scrollBar.js';
import { loadDiceListPreferences, saveDiceListPreferences } from './diceListPreferences.js';
import './diceList.css';

function button(label, className) {
    const node = document.createElement('button');
    node.type = 'button'; node.tabIndex = -1; node.className = className;
    node.setAttribute('aria-label',label); return node;
}
function faceExplanation(face) {
    const text = cardMessages();
    return face.special ? `${displayLabel(face.special)}：${text.describeEffect(SPECIAL_FACE_EFFECTS[face.special])}`
        : text.describeGoal(face);
}
export function createDiceList(host, toggleDie, onVisibilityChange = () => {}) {
    const state = new DiceListState(), rows = new Map();
    const panel = document.createElement('section');
    panel.className = 'DiceList texture-tinted'; panel.hidden = true;
    panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','ダイスリスト');
    const heading = document.createElement('header'); heading.className = 'DiceListHeading texture-label-inverse';
    const title = document.createElement('span'); title.textContent = 'ダイスリスト';
    const close = button('ダイスリストを閉じる','Button DiceListClose texture-raised');
    close.append(controlIconElement('close'));
    heading.append(title,close);
    const scroll = document.createElement('div'); scroll.className = 'DiceListScroll';
    const section = document.createElement('section'); section.className = 'DiceListSection FramedSection texture-frame texture-divided';
    section.setAttribute('aria-label','所持ダイス'); scroll.append(section);
    const scrollArea=document.createElement('div');scrollArea.className='DiceListScrollArea';
    scrollArea.append(scroll);panel.append(heading,scrollArea);host.append(panel);
    const scrollBar=createScrollBar(scroll,section,{trackTexture:'texture-recessed',thumbTexture:'texture-painted'});
    scrollArea.append(scrollBar.element);
    const handles = ['n','e','s','w','ne','se','sw','nw'].map(direction => {
        const handle = document.createElement('div'); handle.className = `DiceListResize ${direction}`;
        handle.setAttribute('role','separator'); handle.setAttribute('aria-label','ダイスリストのサイズを変更');
        if (direction==='se') for (let i=0;i<2;i++) { const grip=document.createElement('span'); grip.className='texture-ink'; handle.append(grip); }
        panel.append(handle); return {handle,direction};
    });
    const controller = new AbortController(), {signal} = controller;
    const preferences=loadDiceListPreferences();
    let preferredPosition=preferences.position, size=preferences.size;
    let dice = [], selected = [], preview, position = null, drag = null, resize = null, scale = 1, searchTimer;
    function expireSearch() {
        if (state.remaining > 0) searchTimer = setTimeout(expireSearch,state.remaining);
        else render();
    }
    function cancelDrag() {
        const previous=drag;
        drag = null;
        if (previous) {
            preferredPosition={...position}; saveDiceListPreferences(preferredPosition,size);
            if (heading.hasPointerCapture(previous.id)) heading.releasePointerCapture(previous.id);
        }
    }
    function cancelResize() {
        const previous=resize; resize=null;
        if (previous) { preferredPosition={...position}; saveDiceListPreferences(preferredPosition,size); }
        if (previous?.handle.hasPointerCapture(previous.id)) previous.handle.releasePointerCapture(previous.id);
    }
    function fit(nextScale = scale) {
        if (nextScale !== scale) { releasePaintingIcons(panel); scrollBar.cancel(); cancelResize(); }
        scale = nextScale;
        panel.style.setProperty('--dice-list-scale',scale);
        if (!state.visible) return;
        const maxWidth=Math.max(1,innerWidth-16), maxHeight=Math.max(1,innerHeight-16);
        const width=Math.min(maxWidth,Math.max(Math.min(300,innerWidth*.4),size?.width ?? 470*scale));
        panel.style.width=`${width/scale}px`;
        // Only the dice content follows the available width; window controls keep their fixed scale.
        const contentWidth=Math.max(1,scroll.clientWidth);
        section.style.width='428px'; section.style.zoom=String(contentWidth/428);
        panel.style.height=size ? `${Math.min(maxHeight,Math.max(140*scale,size.height))/scale}px` : 'auto';
        panel.style.maxHeight=`${(size ? maxHeight : Math.min(maxHeight,540*scale,innerHeight*.6))/scale}px`;
        const rect = panel.getBoundingClientRect();
        position = clampListPosition(preferredPosition ?? position ?? {x:(innerWidth - rect.width)/2,y:(innerHeight - rect.height)/2},rect,{width:innerWidth,height:innerHeight});
        panel.style.left = `${position.x}px`; panel.style.top = `${position.y}px`;
        scrollBar.refresh();
    }
    function render() {
        if (!state.visible) return;
        const ids = new Set(dice.map(die => die.id));
        for (const [id,row] of rows) if (!ids.has(id)) { releasePaintingIcons(row.node); row.node.remove(); rows.delete(id); }
        section.querySelector('.DiceListEmpty')?.remove();
        if (!dice.length) {
            const empty = document.createElement('p'); empty.className = 'DiceListEmpty'; empty.textContent = '所持ダイスはありません'; section.append(empty);
        }
        for (const die of dice) {
            let row = rows.get(die.id);
            const signature = JSON.stringify([die.faces,die.current,die.used,die.lifetime]);
            if (!row || row.signature !== signature) {
                const node = document.createElement('div'); node.className = 'DiceListRow'; node.dataset.dieId = die.id;
                const visual = button('ダイスを選択／解除','DiceListVisual texture-clear');
                const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden','true');
                // An unresolved die has no preview top face that could be mistaken for its result.
                if (die.current !== null) { preview ??= createDiceListPreview(); preview.draw(die,canvas); visual.append(canvas); }
                else { const pending = document.createElement('span'); pending.className = 'DiceListUnresolved'; pending.textContent = '未確定'; visual.append(pending); }
                visual.addEventListener('click',() => toggleDie(die.id));
                const contents = document.createElement('div'); contents.className = 'DiceListContents';
                const faces = document.createElement('div'); faces.className = 'DiceListFaces';
                die.faces.forEach((face,index) => {
                    const explanation = faceExplanation(face);
                    const target = button(`面${index+1}：${explanation}`,'DiceListFace texture-paper-muted texture-glow');
                    target.dataset.faceIndex = index;
                    target.classList.toggle('state-current',die.current === index);
                    if (die.current === index) target.setAttribute('aria-current','true');
                    const icon = faceCanvas(face,die.lifetime,96); icon.setAttribute('aria-hidden','true'); target.append(icon);
                    icon.classList.toggle('texture-grayscale',die.used);
                    bindDieFaceDescription(target,face);
                    faces.append(target);
                });
                contents.append(faces); node.append(visual,contents);
                if (row) { releasePaintingIcons(row.node); row.node.replaceWith(node); } else section.append(node);
                row = {node,visual,signature}; rows.set(die.id,row);
            }
            const isSelected = selected.includes(die.id);
            row.visual.setAttribute('aria-pressed',String(isSelected));
            row.visual.classList.toggle('state-selected',isSelected);
            row.node.classList.toggle('state-selected',isSelected);
            row.node.classList.toggle('state-consumed',die.used);
            const matches = state.matches(die);
            row.node.querySelectorAll('.DiceListFace').forEach((face,index) => {
                face.classList.toggle('state-match',matches.includes(index));
            });
        }
        fit();
    }
    function hide() {
        scrollBar.cancel();
        clearTimeout(searchTimer);
        releasePaintingIcons(panel);
        cancelDrag(); cancelResize(); state.close(); panel.hidden = true;
        preview?.dispose(); preview = null;
        onVisibilityChange(false);
    }
    function show() {
        if (state.visible) return;
        state.open(); panel.hidden = false; render(); onVisibilityChange(true);
    }
    close.addEventListener('click',hide,{signal});
    for (const {handle,direction} of handles) {
        handle.addEventListener('pointerdown',event=>{
            if (event.button!==0 || event.isPrimary===false || resize || drag) return;
            releasePaintingIcons(panel); scrollBar.cancel();
            const rect=panel.getBoundingClientRect();
            resize={id:event.pointerId,handle,x:event.clientX,y:event.clientY,start:{x:rect.x,y:rect.y,width:rect.width,height:rect.height}};
            handle.setPointerCapture(event.pointerId); event.preventDefault();
        },{signal});
        handle.addEventListener('pointermove',event=>{
            if(resize?.id!==event.pointerId)return;
            const bounds=resizeListBounds(resize.start,{x:event.clientX-resize.x,y:event.clientY-resize.y},direction,
                {width:innerWidth,height:innerHeight},140*scale);
            size={width:bounds.width,height:bounds.height}; preferredPosition={x:bounds.x,y:bounds.y};
            fit(); event.preventDefault();
        },{signal});
        for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,cancelResize,{signal});
    }
    heading.addEventListener('pointerdown',event => {
        if (event.target.closest('button') || event.button !== 0 || event.isPrimary === false || drag || resize) return;
        releasePaintingIcons(panel);
        drag = {id:event.pointerId,x:event.clientX-position.x,y:event.clientY-position.y};
        heading.setPointerCapture(event.pointerId); event.preventDefault();
    },{signal});
    heading.addEventListener('pointermove',event => {
        if (drag?.id !== event.pointerId) return;
        preferredPosition = {x:event.clientX-drag.x,y:event.clientY-drag.y}; fit(); event.preventDefault();
    },{signal});
    for (const type of ['pointerup','pointercancel','lostpointercapture']) heading.addEventListener(type,cancelDrag,{signal});
    panel.addEventListener('contextmenu',event => event.preventDefault(),{signal});
    panel.addEventListener('pointerdown',event => {
        if (event.target.closest('button')) event.preventDefault();
    },{signal});
    window.addEventListener('resize',() => { releasePaintingIcons(panel); cancelDrag(); cancelResize(); fit(); },{signal});
    return {
        open: show,
        toggle() { if (state.visible) hide(); else show(); },
        update(nextDice,nextSelected,nextScale) { dice = nextDice; selected = nextSelected; fit(nextScale); render(); },
        select(ids) { selected = ids; render(); },
        search(condition) {
            clearTimeout(searchTimer); state.search(condition); render();
            if (state.remaining > 0) searchTimer = setTimeout(expireSearch,state.remaining);
        },
        reset() { hide(); rows.clear(); section.replaceChildren(); dice = []; selected = []; position = null; },
        dispose() { hide(); scrollBar.dispose(); controller.abort(); panel.remove(); },
    };
}

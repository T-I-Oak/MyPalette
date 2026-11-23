import test from 'node:test';
import assert from 'node:assert/strict';
import { createCardSceneTimeline } from '../../../src/game/cardSceneTimeline.js';
import { cardSceneSnapshot } from '../../../src/game/cardSceneLayout.js';

globalThis.matchMedia = () => ({ matches: false });
const card = id => ({ id, step: 0 });
const empty = () => ({ deck: [], hand: [], field: [], discard: [], shipped: [], stocks: { A: [], B: [], C: [] }, public: { A: null, B: null, C: null }, phase: 'play' });
function setup(initial, panel = { mode: 'B', open: false, progress: 0 }) {
    const root = { dataset: {} }, moves = [];
    const screen = { panelState: panel, areas: new Map([['play', { canvas: { closest: () => root } }], ['discard', {}]]) };
    const cards = { display: cardSceneSnapshot(initial), model: new Map(Object.values(initial.stocks).flat().map(c => [c.id, { pose: { z: 1 } }])),
        adopt(state) { this.display = cardSceneSnapshot(state); }, update() {},
        async move(state, duration, name) { moves.push({ duration, name, state: structuredClone(state) }); this.adopt(state); await screen.onMove?.(name); } };
    const timeline = createCardSceneTimeline(screen, cards, {}, { waitReady: async () => {} }, {}, {}, () => {});
    const run = async (state, events = [], resume = () => []) => { timeline.begin(); timeline.hasWork(state, events); await timeline.run(state, () => [], resume, () => []); };
    return { screen, cards, moves, run, timeline };
}
for (const panel of [{mode:'B',open:false,progress:0},{mode:'B',open:true,progress:1},{mode:'A',open:false,progress:0},{mode:'B',open:false,progress:.4}]) {
    test(`初日配分と公開は完全閉状態だけ省略し、ドローは維持する ${JSON.stringify(panel)}`, async () => {
        const initial=empty(), dealt=Array.from({length:7},(_,i)=>card(`A${i+1}`));
        initial.stocks.A=[...dealt,card('A8')];
        const actual=structuredClone(initial); actual.stocks.A=[card('A8')];actual.public.A='A8';actual.deck=dealt.slice(1);actual.hand=[dealt[0]];
        const s=setup(initial,panel); await s.run(actual,[{kind:'deal',cards:dealt},{kind:'draw',card:dealt[0]}]);
        const skip=panel.mode==='B'&&panel.progress===0;
        assert.equal(s.moves.find(m=>m.name==='initial-deal').duration===0,skip);
        assert.ok(s.moves.filter(m=>m.name.startsWith('stock-')).every(m=>(m.duration===0)===skip));
        assert.ok(s.moves.find(m=>m.name==='draw').duration>0);
        assert.deepEqual(s.cards.display,cardSceneSnapshot(actual));
    });
}
for(const initiallyClosed of [true,false]) {
    test(`切り替え開始時の省略判定を公開まで保持する closed=${initiallyClosed}`,async()=>{
        const initial=empty();initial.stocks.A=[card('A1'),card('A2')];initial.public.A='A1';
        const actual=structuredClone(initial);actual.stocks.A.reverse();actual.public.A='A2';
        const s=setup(initial,{mode:'B',progress:initiallyClosed?0:1});
        s.screen.onMove=()=>{s.screen.panelState.progress=initiallyClosed?1:0;};
        await s.run(actual);
        assert.ok(s.moves.length>0);
        assert.ok(s.moves.every(m=>(m.duration===0)===initiallyClosed));
        assert.deepEqual(s.cards.display,cardSceneSnapshot(actual));
    });
    test(`再構成は一度再開しドローへ継続する closed=${initiallyClosed}`,async()=>{
        const initial=empty();initial.discard=[card('A1'),card('A2')];
        const state=structuredClone(initial);state.recycleRequest={id:7};
        const s=setup(initial,{mode:'B',progress:initiallyClosed?0:1});let resumes=0;
        s.screen.onMove=()=>{s.screen.panelState.progress=initiallyClosed?1:0;};
        await s.run(state,[],id=>{assert.equal(id,7);resumes++;state.recycleRequest=null;state.discard=[];state.deck=[card('A1')];state.hand=[card('A2')];return [{kind:'recycle',cards:[card('A1'),card('A2')]},{kind:'draw',card:card('A2')}];});
        assert.equal(resumes,1);
        assert.ok(s.moves.filter(m=>m.name.startsWith('recycle-')).every(m=>(m.duration===0)===initiallyClosed));
        assert.ok(s.moves.find(m=>m.name==='draw').duration>0);
        assert.deepEqual(s.cards.display,cardSceneSnapshot(state));
    });
}
test('閉状態でも取得の移動は維持する',async()=>{
    const initial=empty();initial.stocks.A=[card('A1'),card('A2')];initial.public.A='A1';
    const state=structuredClone(initial);state.stocks.A.shift();state.public.A='A2';state.discard=[card('A1')];
    const s=setup(initial);await s.run(state);
    assert.ok(s.moves.find(m=>m.name==='stock-transfer').duration>0);
    assert.ok(s.moves.filter(m=>m.name.startsWith('stock-')&&m.name!=='stock-transfer').every(m=>m.duration===0));
});
test('補充公開の開始前に閉じた場合は省略する',async()=>{
    const initial=empty();initial.stocks.A=[card('A1'),card('A2')];initial.public.A='A1';
    const state=structuredClone(initial);state.stocks.A.shift();state.public.A='A2';state.discard=[card('A1')];
    const s=setup(initial,{mode:'B',progress:1});
    s.screen.onMove=name=>{if(name==='stock-transfer')s.screen.panelState.progress=0;};
    await s.run(state);
    assert.ok(s.moves.find(m=>m.name==='stock-transfer').duration>0);
    assert.equal(s.moves.find(m=>m.name==='stock-update').duration,0);
});
test('閉状態でも返却の全段階を維持する',async()=>{
    const initial=empty();initial.hand=[card('A1')];
    const state=structuredClone(initial);state.hand=[];state.stocks.A=[card('A1')];state.public.A='A1';
    const s=setup(initial);await s.run(state);
    assert.equal(s.moves.filter(m=>m.name.startsWith('hand-return-')).length,4);
    assert.ok(s.moves.filter(m=>m.name.startsWith('hand-return-')).every(m=>m.duration>0));
});
test('動きを減らす設定では開状態でもすべて即時更新する',async()=>{
    const previous=globalThis.matchMedia;globalThis.matchMedia=()=>({matches:true});
    try {
        const initial=empty();initial.stocks.A=[card('A1')];
        const state=structuredClone(initial);state.public.A='A1';
        const s=setup(initial,{mode:'A',progress:0});await s.run(state);
        assert.ok(s.moves.every(m=>m.duration===0));assert.deepEqual(s.cards.display,cardSceneSnapshot(state));
    }finally{globalThis.matchMedia=previous;}
});
test('再構成の中断では再開せず、次の処理へ状態を持ち越さない',async()=>{
    const initial=empty();initial.discard=[card('A1')];const state=structuredClone(initial);state.recycleRequest={id:1};
    const s=setup(initial,{mode:'B',progress:1});let resumes=0;
    s.screen.onMove=name=>{if(name==='recycle-spread')s.timeline.begin();};
    await s.run(state,[],()=>{resumes++;return [];});assert.equal(resumes,0);
    s.screen.onMove=undefined;s.screen.panelState.progress=0;state.recycleRequest=null;
    await s.run(state);assert.equal(s.cards.busy,false);
});

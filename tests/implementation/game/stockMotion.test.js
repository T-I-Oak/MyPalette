import test from 'node:test';
import assert from 'node:assert/strict';
import { planStockMotion, stockTiming, stockDealDepth } from '../../../src/game/stockMotion.js';
const cards = grade => Array.from({ length: 15 }, (_, index) => ({ id: grade + index, step: 0 }));
test('配分前は積み順を維持し、出発したカードだけが山より手前になる',()=>{
    assert.deepEqual(Array.from({length:15},(_,i)=>stockDealDepth(15,i,0,7)),Array.from({length:15},(_,i)=>15-i));
    for(let departing=0;departing<7;departing++) {
        const time=departing*stockTiming.dealStagger+1;
        assert.ok(stockDealDepth(15,departing,time,7)>15);
        for(let waiting=departing+1;waiting<15;waiting++) assert.equal(stockDealDepth(15,waiting,time,7),15-waiting);
    }
    assert.ok(stockDealDepth(15,0,100,7)>stockDealDepth(15,1,100,7),'同時に移動するカードも元の上下関係を維持');
});
test('初日は7枚準備後の公開を識別し、A/B/Cの開始をずらす', () => {
    const before = { day: 1, stocks: { A: cards('A'), B: cards('B'), C: cards('C') }, public: { A: null, B: null, C: null } };
    const after = structuredClone(before);after.stocks.A.splice(0,7);after.public={A:'A7',B:'B0',C:'C0'};
    const plan = planStockMotion(before,after);
    assert.deepEqual(plan.map(p=>p.delay),[0,stockTiming.stagger,stockTiming.stagger*2]);
    assert.deepEqual(plan[0].deal,['A0','A1','A2','A3','A4','A5','A6']);
    assert.deepEqual(plan.map(p=>p.reveal),['A7','B0','C0']);
});
test('日末は最上段の裏返し・最下段挿入と判定し、翌朝まで公開しない', () => {
    const before={day:1,stocks:{A:cards('A'),B:cards('B'),C:[]},public:{A:'A0',B:'B0',C:null}};
    const after=structuredClone(before);for(const g of ['A','B']){after.stocks[g].push(after.stocks[g].shift());after.public[g]=null;}
    const plan=planStockMotion(before,after);
    assert.deepEqual(plan.map(p=>p.rotate),['A0','B0']);
    assert.ok(plan.every(p=>!p.reveal&&!p.deal.length));
    assert.deepEqual(planStockMotion(after,after),[]);
});

test('取得直後の補充と、最後の発注後に続く日末更新を識別する',()=>{
    const before={day:2,stocks:{A:cards('A'),B:cards('B'),C:[]},public:{A:'A0',B:'B0',C:null}};
    const after=structuredClone(before);after.stocks.A.shift();after.public.A='A1';
    const [gain]=planStockMotion(before,after);
    assert.equal(gain.reveal,'A1');assert.deepEqual(gain.removed,['A0']);
    assert.equal(gain.rotate,null);
    after.stocks.A.push(after.stocks.A.shift());after.public.A=null;
    const [end]=planStockMotion(before,after);
    assert.equal(end.rotate,'A1');assert.equal(end.replenish,'A1');
    assert.deepEqual(end.removed,['A0']);
});

test('最後の1枚の取得でも除去対象を保持し、元の山に重複表示しない',()=>{
    const before={day:2,stocks:{A:[{id:'A0',step:0}],B:[],C:[]},public:{A:'A0',B:null,C:null}};
    const after={day:2,stocks:{A:[],B:[],C:[]},public:{A:null,B:null,C:null}};
    const [plan]=planStockMotion(before,after);
    assert.deepEqual(plan.removed,['A0']);assert.equal(plan.reveal,null);assert.equal(plan.rotate,null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { goalProbability } from '../../src/goalProbability.js';

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test('単一目標は全個の振り直しを選び、2N回に1回以上当たる確率となる', () => {
    for (const n of [1,3,4,5]) {
        close(goalProbability([{color:'red',material:null}], n), 1 - (5/6)**(2*n));
        close(goalProbability([{color:null,material:'brush'}], n), 1 - (2/3)**(2*n));
        close(goalProbability([{color:'blue',material:'pastel'}], n), 1 - (17/18)**(2*n));
    }
});
test('2個の同色目標では部分達成を残して1個だけ振り直せる', () => {
    close(goalProbability([{color:'red',material:null},{color:'red',material:null}],2),121/1296);
});
test('重なる目標を同じダイスで二重に満たさない', () => {
    const goals = [{color:'red',material:null},{color:null,material:'brush'}];
    assert.equal(goalProbability(goals,1),0);
    // 独立な全出目と振り直しを総当たりする参照計算との照合。
    const faces = Array.from({length:18},(_,i)=>({color:i%6,material:Math.floor(i/6)}));
    const hit = (a,b) => (a.color===0 && b.material===0) || (b.color===0 && a.material===0);
    let base=0; for(const a of faces) for(const b of faces) base+=Number(hit(a,b))/324;
    let expected=0;
    for(const a of faces) for(const b of faces) {
        if(hit(a,b)) expected+=1/324;
        else expected+=Math.max(base,faces.filter(f=>hit(f,b)).length/18,faces.filter(f=>hit(a,f)).length/18)/324;
    }
    close(goalProbability(goals,2),expected);
});
test('制作途中の目標は計算せず、個数の不足は0とする', () => {
    assert.equal(goalProbability([],3),null);
    assert.equal(goalProbability([{color:null,material:null}],3),null);
    assert.throws(()=>goalProbability([{color:'red',material:null}],0));
    assert.equal(goalProbability(Array.from({length:4},()=>({color:'red',material:null})),3),0);
});

test('ORは排他的ではなく、いずれかの組を達成すればよい', () => {
    close(goalProbability([{color:'red',material:null},{color:'blue',material:null,join:'or'}],1), 1-(2/3)**2);
    close(goalProbability([{color:'red',material:null},{color:'red',material:null,join:'or'}],3), 1-(5/6)**6);
    // 個数不足の組があっても、別の1目標の組で達成できる。
    close(goalProbability([{color:'red',material:null},{color:'red',material:null},{color:'blue',material:null,join:'or'}],1),1-(5/6)**2);
});

test('ANDでまとめた複数目標のORを独立した全出目・最適リロールの参照計算と照合する', () => {
    const goals = [{color:'red',material:null},{color:'blue',material:null},{color:null,material:'brush',join:'or'},{color:null,material:'pastel'}];
    const faces=Array.from({length:18},(_,i)=>({color:i%6,material:Math.floor(i/6)}));
    const hit=(a,b)=>((a.color===0&&b.color===1)||(a.color===1&&b.color===0))||((a.material===0&&b.material===1)||(a.material===1&&b.material===0));
    let base=0; for(const a of faces) for(const b of faces) base+=Number(hit(a,b))/324;
    let expected=0;
    for(const a of faces) for(const b of faces) expected+=(hit(a,b)?1:Math.max(base,faces.filter(f=>hit(f,b)).length/18,faces.filter(f=>hit(a,f)).length/18))/324;
    close(goalProbability(goals,2),expected);
});

test('ORで多数の候補がある場合も32目標以上を正しく識別する', () => {
    const goals = Array.from({length:35},(_,i)=>({color:'red',material:null,...(i?{join:'or'}:{})}));
    close(goalProbability(goals,1),1-(5/6)**2);
});

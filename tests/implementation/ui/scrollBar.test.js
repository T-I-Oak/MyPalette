import test from 'node:test';
import assert from 'node:assert/strict';
import { scrollBarMetrics, scrollForThumb } from '../../../src/ui/scrollBar.js';

test('多い内容でもつまみの最小寸法を保ち、両端と途中をスクロール位置へ対応させる',()=>{
    const start=scrollBarMetrics(100,1000,100,0);
    assert.deepEqual(start,{maxScroll:900,thumbHeight:32,travel:68,thumbTop:0});
    assert.equal(scrollBarMetrics(100,1000,100,450).thumbTop,34);
    assert.equal(scrollForThumb(68,start),900);
    assert.equal(scrollForThumb(34,start),450);
    assert.equal(scrollForThumb(-10,start),0);
    assert.equal(scrollForThumb(1000,start),900);
});
test('内容が収まる場合と非表示の高さ0では移動量を0にする',()=>{
    assert.deepEqual(scrollBarMetrics(100,60,100,0),{maxScroll:0,thumbHeight:100,travel:0,thumbTop:0});
    const hidden=scrollBarMetrics(0,0,0,0);
    assert.deepEqual(hidden,{maxScroll:0,thumbHeight:0,travel:0,thumbTop:0});
    assert.equal(scrollForThumb(20,hidden),0);
});

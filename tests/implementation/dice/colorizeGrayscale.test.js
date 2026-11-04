import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colorizeGrayscale } from '../../../src/dice/colorizeGrayscale.js';

test('元のアルファを維持し、黒・中間色・白の明暗を保つ', () => {
    const pixels = new Uint8ClampedArray([0,0,0,255, 128,128,128,253, 255,255,255,128]);
    colorizeGrayscale(pixels, '#0000ff');
    assert.deepEqual([...pixels], [0,0,0,255, 1,1,255,253, 255,255,255,128]);
});
test('パステル本体の暗いグレーを透明化せず、明度と色の識別を保つ', () => {
    const pixels = new Uint8ClampedArray([115,115,115,253, 175,175,175,252, 200,200,200,0]);
    colorizeGrayscale(pixels, '#397ccb');
    for(let i=0;i<12;i+=4){
        const rgb=[...pixels.slice(i,i+3)];
        assert.ok(rgb[2]>rgb[0]);
        assert.ok(Math.abs((Math.max(...rgb)+Math.min(...rgb))/2-[115,175,200][i/4])<=1);
    }
    assert.deepEqual([pixels[3],pixels[7],pixels[11]],[253,252,0]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {specialFrameLayout} from '../../../src/dice/specialFrameLayout.js';
test('特殊面の星は位置で変形せず画面内に収まり、ダイスを指す尾を持たない',()=>{
 const viewport={width:300,height:180};const center=specialFrameLayout({x:150,y:140},80,viewport);
 for(const target of [{x:1,y:1},{x:299,y:179}]){
  const layout=specialFrameLayout(target,80,viewport);
  assert.equal(layout.path,center.path);assert(layout.left>=4&&layout.top>=4);
  assert(layout.left+layout.size<=296&&layout.top+layout.size<=176);
 }
 assert.equal((center.path.match(/L/g)||[]).length,9);
});

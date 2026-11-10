import test from 'node:test';
import assert from 'node:assert/strict';
import {canvasOrbit,diagonalReveal,materialDuration} from '../../../src/game/achievementMotion.js';
import {effectField,beginPlayEffect} from '../../../src/game/playEffectState.js';
test('カンバスの6時から時計回りに9・12・3・6時を通り、各ダイスを時間差にする',()=>{
 const corners=[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:0,y:100}];
 const points=[0,.25,.5,.75,1].map(p=>canvasOrbit(corners,p));
 assert(points[0].y>100);assert(points[1].x<0);assert(points[2].y<0);assert(points[3].x>100);
 assert(Math.abs(points[4].x-points[0].x)<1e-8&&Math.abs(points[4].y-points[0].y)<1e-8);
 assert.equal(materialDuration(3)-materialDuration(1),400);
 assert.deepEqual(diagonalReveal(.5),[[0,0],[1,0],[0,1]]);
 assert(diagonalReveal(1).some(([x,y])=>x===1&&y===1));
});
test('イーゼルを消した後は効果選択中も達成カードを表示へ復活させない',()=>{
 const state={field:[{id:'A01',step:0},{id:'A02',step:0}]};
 const effect=beginPlayEffect({kind:'achieve',id:'A01',diceIds:['D1','D2']},state);
 effect.stage='effects';
 assert.deepEqual(effectField(state,effect),[{id:'A02',step:0}]);
 assert.deepEqual(effect.diceIds,['D1','D2']);
});

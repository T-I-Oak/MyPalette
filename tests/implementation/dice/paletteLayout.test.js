import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { paletteCameraBounds, paletteStandardSize, paletteMetrics, paletteDieTop } from '../../../src/dice/paletteLayout.js';
import { FIELD_WIDTH, FIELD_DEPTH, FIELD_CAMERA_POSITION, fieldCenterVertices } from '../../../src/dice/field.js';
import { READY_HEIGHT } from '../../../src/dice/pose.js';

test('最低標準サイズはパレット全体と余白を収め、高さの追加分は上側へ割り当てる', () => {
    assert.deepEqual(paletteStandardSize,{width:536,height:232});
    const project=(width,height) => {
        const b=paletteCameraBounds(width,height);
        const camera=new THREE.OrthographicCamera(b.left,b.right,b.top,b.bottom,.1,100);
        camera.position.set(...FIELD_CAMERA_POSITION);camera.lookAt(0,0,0);camera.updateMatrixWorld();
        const p=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).project(camera);return{x:(v.x+1)*width/2,y:(1-v.y)*height/2};};
        return {p,b};
    };
    const h=paletteStandardSize.height;
    const min=project(536,h),tall=project(536,h+200),wide=project(736,h);
    for(const x of [-FIELD_WIDTH/2,FIELD_WIDTH/2])for(const z of [-FIELD_DEPTH/2,FIELD_DEPTH/2]){
        const a=min.p(x,0,z),b=tall.p(x,0,z);
        assert(a.x>=paletteMetrics.padding-1e-7&&a.x<=536-paletteMetrics.padding+1e-7);
        assert(a.y>=0&&a.y<=h-paletteMetrics.padding+1e-7);
        assert(Math.abs(b.y-a.y-200)<1e-7);
    }
    assert(Math.abs(wide.p(0,0,0).x-min.p(0,0,0).x-100)<1e-7);
    assert.equal(tall.b.bottom,min.b.bottom);
    // A high die moves down with the palette instead of being recentered or shrunk.
    assert(Math.abs(tall.p(0,7,0).y-min.p(0,7,0).y-200)<1e-7);
});

test('準備時の回転頂点が収まり、必要量を超える投げ上げ余裕は確保しない',()=>{
 const bounds=paletteCameraBounds(paletteStandardSize.width,paletteStandardSize.height);
 const upper=paletteDieTop;
 assert(bounds.top>=upper+paletteMetrics.padding/paletteMetrics.pixelsPerUnit);
 assert(bounds.top<upper+(paletteMetrics.padding+1)/paletteMetrics.pixelsPerUnit);
 const camera=new THREE.OrthographicCamera(bounds.left,bounds.right,bounds.top,bounds.bottom,.1,100);
 camera.position.set(...FIELD_CAMERA_POSITION);camera.lookAt(0,0,0);camera.updateMatrixWorld();
 for(const center of fieldCenterVertices())for(let i=0;i<24;i++){
  const rotation=new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.73,i*.41,i*.67));
  for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
   const projected=new THREE.Vector3(x,y,z).applyQuaternion(rotation).add(new THREE.Vector3(center.x,READY_HEIGHT,center.z)).project(camera);
   assert(Math.abs(projected.x)<=1&&Math.abs(projected.y)<=1,'準備中の頂点が描画範囲内');
  }
 }
});

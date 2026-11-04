import {test} from 'node:test';
import assert from 'node:assert/strict';
import {findMatchingFaces} from '../../../src/dice/faceConditions.js';
import {DiceGroup} from '../../../src/dice/DiceGroup.js';
import {FaceSearch} from '../../../src/dice/FaceSearch.js';

const faces=[{material:'brush',color:'orange'},{material:'brush',color:'orange'},
    {material:'brush',color:'green'},{material:'pastel',color:'orange'},
    {material:'airbrush',color:'blue'},{special:'fame1'}];
test('画材・色・同じ面の画材＋色を別々に数え、重複面を残す',()=>{
    assert.deepEqual(findMatchingFaces(faces,{material:'brush'}),[0,1,2]);
    assert.deepEqual(findMatchingFaces(faces,{color:'orange'}),[0,1,3]);
    assert.deepEqual(findMatchingFaces(faces,{material:'brush',color:'orange'}),[0,1]);
    assert.deepEqual(findMatchingFaces(faces,{material:'pastel',color:'green'}),[]);
});
test('空条件・未知の画材や色・範囲外の検索キーは拒否する',()=>{
    for(const condition of [{},{material:'pen'},{color:'pink'},{special:'fame1'},{material:undefined}])
        assert.throws(()=>findMatchingFaces(faces,condition));
});
test('群は一致するダイスだけを返し、消費状態・出目・姿勢を変更しない',()=>{
    const group=new DiceGroup();const a=group.add({id:'a',faces});
    const b=group.add({id:'b',faces:Array.from({length:6},()=>({material:'brush',color:'green'}))});
    a.begin();a.settle(2);a.setConsumed(true);
    const before={result:a.result,position:a.body.position.clone(),quaternion:a.body.quaternion.clone(),consumed:a.consumed};
    assert.deepEqual(group.findFaces({material:'brush',color:'orange'}),[{id:'a',indices:[0,1],count:2}]);
    assert.deepEqual({result:a.result,position:a.body.position,quaternion:a.body.quaternion,consumed:a.consumed},before);
    assert.equal(b.state,'ready');group.dispose();
});
test('同じ条件の再指定で3秒を延長し、結果データは期限後も取得できる',()=>{
    let now=0;const group=new DiceGroup();group.add({id:'a',faces});
    const search=new FaceSearch(group,{now:()=>now});
    assert.equal(search.result,null);
    assert.equal(search.search({material:'brush'}).diceCount,1);
    now=2900;assert.equal(search.active,true);search.search({material:'brush'});
    now=3100;assert.equal(search.active,true);
    now=5900;assert.equal(search.active,false);assert.equal(search.result.diceCount,1);
    search.clear();assert.equal(search.result,null);group.dispose();
});
test('共通の時計でフェードイン・維持・フェードアウトし、再指定で最初に戻る',()=>{
    let now=0;const group=new DiceGroup();group.add({id:'a',faces});const search=new FaceSearch(group,{now:()=>now});
    assert.equal(search.opacity,0);search.search({material:'brush'});assert.equal(search.opacity,0);
    now=100;assert.equal(search.opacity,.5);
    now=200;assert.equal(search.opacity,1);
    now=2700;assert.equal(search.opacity,1);
    now=2850;assert.equal(search.opacity,.5);
    search.search({material:'brush'});assert.equal(search.opacity,0);
    now=2950;assert.equal(search.opacity,.5);
    now=5850;assert.equal(search.opacity,0);assert.equal(search.active,false);group.dispose();
});
test('0件も返し、面変更・追加・削除を検索結果に反映する',()=>{
    const group=new DiceGroup();const die=group.add({id:'a',faces});const search=new FaceSearch(group,{now:()=>0});
    const condition={material:'pastel',color:'blue'};
    assert.equal(search.search(condition).diceCount,0);condition.color='red';
    die.setFace(0,{material:'pastel',color:'blue'});
    assert.equal(search.result.diceCount,1);assert.equal(search.result.hits[0].count,1);
    group.add({id:'b',faces:Array.from({length:6},()=>({material:'pastel',color:'blue'}))});
    assert.equal(search.result.diceCount,2);
    group.remove('a');assert.equal(search.result.diceCount,1);
    group.remove('b');assert.equal(search.result.diceCount,0);
    group.dispose();
});

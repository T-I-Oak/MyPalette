import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setLanguage} from '../../../../GameWorksOAK/src/lib/core/i18n.js';
import {searchNoticeParts,describeSearchCondition,describeFaceCount} from '../../../src/dice/searchMessages.js';

test('ダイス確認画面のシーンと検索表示の依存を読み込める', async () => {
    const { DiceScene } = await import('../../../src/dice/DiceScene.js');
    assert.equal(typeof DiceScene, 'function');
});

const storage=new Map();
Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)}});
const text=result=>searchNoticeParts(result).map(part=>typeof part==='string'?part:part.label).join('');
const condition={material:'brush',color:'orange'};
test('日本語で該当件数と0件を通知し、条件名も翻訳する',()=>{
    setLanguage('ja');
    assert.equal(text({condition,diceCount:2}),'絵筆・橙 を含むダイスが2個あります');
    assert.equal(text({condition,diceCount:0}),'絵筆・橙 を含むダイスはありません');
    assert.equal(describeFaceCount(condition,2),'絵筆・橙：2面');
});
test('英語ではアイコンの位置と単数・複数形を翻訳文で決める',()=>{
    setLanguage('en');
    assert.equal(text({condition,diceCount:1}),'1 die contains Orange Brush.');
    assert.equal(text({condition,diceCount:3}),'3 dice contain Orange Brush.');
    assert.equal(text({condition,diceCount:0}),'No dice contain Orange Brush.');
    assert.equal(describeSearchCondition({material:'pastel'}),'Pastel');
    assert.equal(describeFaceCount(condition,1),'Orange Brush: 1 matching face');
});
test('未対応言語は共通i18nの英語フォールバックを使う',()=>{
    setLanguage('ko');assert.equal(text({condition:{color:'blue'},diceCount:2}),'2 dice contain Blue.');
    setLanguage('ja');
});

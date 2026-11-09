import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';

test('作品の全ステップ画像はオリジナルのステップ3と同じ1536×1024で揃える',()=>{
    const directory=new URL('../../public/assets/paintings/',import.meta.url);
    const originals=readdirSync(directory).filter(name=>name.endsWith('-3.png'));
    assert.equal(originals.length,45);
    const size=name=>{
        const png=readFileSync(new URL(name,directory));
        return [png.readUInt32BE(16),png.readUInt32BE(20)];
    };
    for(const original of originals){
        const expected=size(original);
        assert.deepEqual(expected,[1536,1024],original);
        for(const step of [1,2]){
            const name=original.replace(/-3\.png$/,`-${step}.png`);
            assert.deepEqual(size(name),expected,name);
        }
    }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDocument, serializeDocument } from '../../src/cardData.js';
import { loadSettings, saveSettings, revision } from '../../src/settingsStorage.js';
import { cardSettingsPlugin } from '../../scripts/cardSettingsPlugin.js';
import { sortDocumentGoals } from '../../src/goalOrdering.js';

test('ゲーム用ファイルを読み込み、保存先へ45枚を送る', async () => {
    const text = serializeDocument(createDocument());
    const saved = await loadSettings(async () => new Response(text));
    assert.equal(saved.revision, revision(text));
    const result = await saveSettings(saved.document, saved.revision, async (url, options) => {
        assert.equal(url, '/api/card-settings');
        assert.equal(options.headers['If-Match'], saved.revision);
        assert.deepEqual(JSON.parse(options.body), saved.document);
        return Response.json({ revision: 'next' });
    });
    assert.equal(result, 'next');
    await assert.rejects(saveSettings(saved.document, result, async () => Response.json({ error: '保存失敗' }, {status:500})), /保存失敗/);
});

test('保存APIは検証後に実ファイルを更新し、不正・競合・別Originでは保持する', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'palette-settings-'));
    const path = join(directory, 'cards.json');
    const original = serializeDocument(createDocument()) + '\n';
    await writeFile(path, original);
    let handler;
    cardSettingsPlugin(path).configureServer({ config: { logger: { error: message => console.error(message) } }, middlewares: { use(_url, fn) { handler = fn; } } });
    const send = (body, rev, origin = 'http://127.0.0.1:5181') => new Promise(resolve => {
        const request = {
            method: 'PUT', headers: { origin, host: '127.0.0.1:5181', 'if-match': rev },
            async *[Symbol.asyncIterator]() { yield Buffer.from(body); },
        };
        const response = { statusCode: 200, setHeader() {}, end(text) { resolve({status:this.statusCode, ...JSON.parse(text)}); } };
        handler(request, response);
    });
    try {
        const edited = createDocument(); edited.cards[0].steps[0].playEffects = [{type:'gainColorDice', count:2, lifetime:'temporary', colors:'orange_blue'}];
        edited.cards[0].steps[0].goals=[{material:null,color:'red'},{material:'airbrush',color:'orange'},{material:'brush',color:null,join:'or'}];
        const good = await send(JSON.stringify(edited), revision(original));
        assert.equal(good.status, 200);
        const stored = await readFile(path, 'utf8');
        assert.deepEqual(JSON.parse(stored), sortDocumentGoals(edited));
        assert.equal((await send('{', good.revision)).status, 400);
        assert.equal((await send(serializeDocument(edited), 'stale')).status, 409);
        assert.equal((await send(serializeDocument(edited), good.revision, 'http://example.com')).status, 403);
        assert.equal(await readFile(path, 'utf8'), stored);
        // 同じ版から同時保存した場合も片方を競合として拒否する。
        edited.cards[0].name = '更新';
        const concurrent = await Promise.all([send(serializeDocument(edited), good.revision), send(original, good.revision)]);
        assert.deepEqual(concurrent.map(item => item.status), [200,409]);
    } finally { await rm(directory, { recursive: true, force: true }); }
});

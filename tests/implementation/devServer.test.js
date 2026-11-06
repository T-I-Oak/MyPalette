import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import config from '../../vite.config.js';
import { cardSettingsPlugin, settingsFilePlugin } from '../../scripts/cardSettingsPlugin.js';
import { createEvaluation, readEvaluation, serializeEvaluation } from '../../src/effectEvaluation.js';
import { revision } from '../../src/settingsStorage.js';

test('ベースパス配下の入口・設定・画像と同一Originの保存を実サーバーで確認する', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'palette-vite-'));
    const path = join(directory, 'cards.json');
    const original = await readFile('public/data/cards.json', 'utf8');
    await writeFile(path, original);
    const evaluationPath = join(directory, 'effect-evaluation.json');
    const evaluation = createEvaluation();
    const evaluationOriginal = serializeEvaluation(evaluation) + '\n'; await writeFile(evaluationPath, evaluationOriginal);
    const server = await createServer({ ...config, configFile: false, plugins: [cardSettingsPlugin(path),
        settingsFilePlugin(evaluationPath, {name:'effect-evaluation', route:'/api/effect-evaluation', read:readEvaluation, serialize:serializeEvaluation, allowRead:true})],
        server: { ...config.server, port: 0, open: false } });
    try {
        assert.equal(config.server.port, 3000);
        assert.equal(config.server.open, false);
        assert.equal(config.server.host, '127.0.0.1');
        await server.listen();
        const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
        for (const url of ['/MyPalette/data/cards.json', '/MyPalette/assets/paintings/A01-3.png']) {
            const response = await fetch(origin + url);
            assert.equal(response.status, 200, url);
            await response.arrayBuffer();
        }
        const gameEntry = await fetch(origin + '/MyPalette/');
        assert.equal(gameEntry.status, 200);
        const gameHtml = await gameEntry.text();
        assert.match(gameHtml, /src\/main\.js/);
        assert.doesNotMatch(gameHtml, /dev\.html|src\/dev\.js/);
        const devEntry = await fetch(origin + '/MyPalette/dev.html');
        assert.equal(devEntry.status, 200);
        assert.match(await devEntry.text(), /src\/dev\.js/);
        const evaluationResponse = await fetch(origin + '/api/effect-evaluation');
        assert.equal(evaluationResponse.status, 200);
        assert.equal(await evaluationResponse.text(), evaluationOriginal);
        const saved = await fetch(origin + '/api/card-settings', { method: 'PUT',
            headers: { Origin: origin, 'Content-Type': 'application/json', 'If-Match': revision(original) }, body: original });
        assert.equal(saved.status, 200);
        const stored = await readFile(path, 'utf8');
        assert.deepEqual(JSON.parse(stored), JSON.parse(original));
        assert.equal((await saved.json()).revision, revision(stored));
        evaluation.playEffects.drawCards = 1.25;
        evaluation.achievementEffects['changeSpecialFace.fame1'] = -2.5;
        evaluation.stepMultipliers = [.5, 1, 2.25];
        const sendEvaluation = (body, rev) => fetch(origin + '/api/effect-evaluation', {method:'PUT',
            headers:{Origin:origin,'Content-Type':'application/json','If-Match':rev}, body});
        const rated = await sendEvaluation(serializeEvaluation(evaluation), revision(evaluationOriginal));
        assert.equal(rated.status, 200);
        const ratingText = await readFile(evaluationPath, 'utf8');
        assert.deepEqual(readEvaluation(ratingText), evaluation);
        assert.equal((await rated.json()).revision, revision(ratingText));
        assert.equal(await readFile(path,'utf8'), stored, '評価設定の保存でカードデータを変更しない');
        const invalid = await sendEvaluation('{}', revision(ratingText)); assert.equal(invalid.status,400); await invalid.text();
        const stale = await sendEvaluation(evaluationOriginal, revision(evaluationOriginal)); assert.equal(stale.status,409); await stale.text();
        assert.equal(await readFile(evaluationPath, 'utf8'), ratingText);
    } finally {
        await server.close();
        await rm(directory, { recursive: true, force: true });
    }
});

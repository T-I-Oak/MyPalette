import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { readDocument, serializeDocument } from '../src/cardData.js';
import { revision } from '../src/settingsStorage.js';

export function cardSettingsPlugin(settingsPath) {
    return settingsFilePlugin(settingsPath, {name:'card-settings', route:'/api/card-settings', read:readDocument, serialize:serializeDocument});
}
export function settingsFilePlugin(settingsPath, {name, route, read, serialize, allowRead = false}) {
    let pending = Promise.resolve();
    return {
        name,
        configureServer(server) {
            const handler = async (request, response) => {
                response.setHeader('Content-Type', 'application/json; charset=utf-8');
                response.setHeader('Cache-Control', 'no-store');
                if (allowRead && request.method === 'GET') {
                    try {
                        response.end(await readFile(settingsPath, 'utf8'));
                    } catch (error) {
                        server.config.logger.error(error.stack);
                        response.statusCode = 500;
                        response.end(JSON.stringify({ error: '設定ファイルを読み込めませんでした。' }));
                    }
                    return;
                }
                if (request.method !== 'PUT') { response.statusCode = 405; response.end(JSON.stringify({ error: 'PUTのみ利用できます。' })); return; }
                const origin = request.headers.origin;
                if (!origin || origin !== `http://${request.headers.host}` || !/^127\.0\.0\.1(?::\d+)?$/.test(request.headers.host ?? '')) {
                    response.statusCode = 403; response.end(JSON.stringify({ error: 'ローカル編集画面から保存してください。' })); return;
                }
                let tempPath;
                try {
                    const chunks = []; let size = 0;
                    for await (const chunk of request) {
                        size += chunk.length;
                        if (size > 2 * 1024 * 1024) { response.statusCode = 413; response.end(JSON.stringify({ error: '設定データが大きすぎます。' })); return; }
                        chunks.push(chunk);
                    }
                    const document = read(Buffer.concat(chunks).toString('utf8'));
                    // 別の編集画面が保存した内容を無言で上書きしない。
                    const existing = await readFile(settingsPath, 'utf8');
                    if (request.headers['if-match'] !== revision(existing)) {
                        response.statusCode = 409; response.end(JSON.stringify({ error: '別の画面から設定が更新されています。編集中の内容は保持しています。' })); return;
                    }
                    const json = serialize(document) + '\n';
                    tempPath = `${settingsPath}.${randomUUID()}.tmp`;
                    await writeFile(tempPath, json, { flag: 'wx' });
                    await rename(tempPath, settingsPath); tempPath = undefined;
                    response.end(JSON.stringify({ revision: revision(json) }));
                } catch (error) {
                    if (!(error instanceof SyntaxError) && !error.issues) server.config.logger.error(error.stack);
                    response.statusCode = error instanceof SyntaxError || error.issues ? 400 : 500;
                    response.end(JSON.stringify({ error: error.issues || error instanceof SyntaxError ? error.message : '設定ファイルに保存できませんでした。編集内容は保持しています。' }));
                } finally { if (tempPath) await unlink(tempPath).catch(() => {}); }
            };
            server.middlewares.use(route, (request, response) => {
                pending = pending.then(() => handler(request, response));
            });
        },
    };
}

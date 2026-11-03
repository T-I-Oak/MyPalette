import { readDocument, serializeDocument } from './cardData.js';

export function revision(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(16);
}

export async function loadSettings(fetcher = fetch) {
    const response = await fetcher(`${import.meta.env?.BASE_URL ?? '/'}data/cards.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error('ゲーム設定を読み込めませんでした。再読み込みしてください。');
    const text = await response.text();
    return { document: readDocument(text), revision: revision(text) };
}

export async function saveSettings(document, savedRevision, fetcher = fetch) {
    const body = serializeDocument(document);
    const response = await fetcher('/api/card-settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'If-Match': savedRevision }, body,
    });
    if (!response.ok) {
        if (response.headers.get('content-type')?.includes('application/json')) throw new Error((await response.json()).error);
        throw new Error('ゲーム設定を保存できませんでした。ローカル開発サーバーで開いてください。');
    }
    return (await response.json()).revision;
}

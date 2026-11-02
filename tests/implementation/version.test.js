import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { initializeAppVersion } from '../../src/version.js';
import { getAppVersion } from '../../../GameWorksOAK/src/lib/utils/env.js';

test('ゲーム設定のバージョンが共通ライブラリに接続される', async () => {
    const packageInfo = JSON.parse((await readFile(new URL('../../package.json', import.meta.url), 'utf8')).replace(/^\uFEFF/, ''));
    assert.equal(initializeAppVersion(packageInfo.version), packageInfo.version);
    assert.equal(getAppVersion(), packageInfo.version);
});

import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { cardSettingsPlugin } from './scripts/cardSettingsPlugin.js';

const packageInfo = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));

export default defineConfig({
    plugins: [cardSettingsPlugin(fileURLToPath(new URL('./public/data/cards.json', import.meta.url)))],
    base: './',
    define: { __APP_VERSION__: JSON.stringify(packageInfo.version) },
    server: {
        host: '127.0.0.1',
        watch: { ignored: ['**/public/data/cards.json', '**/public/data/cards.json.*.tmp'] },
        fs: {
            allow: [
                fileURLToPath(new URL('.', import.meta.url)),
                fileURLToPath(new URL('../GameWorksOAK/src/lib/', import.meta.url))
            ]
        }
    },
    build: { outDir: 'dist' }
});

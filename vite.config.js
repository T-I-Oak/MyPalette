import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { cardSettingsPlugin, settingsFilePlugin } from './scripts/cardSettingsPlugin.js';
import { readEvaluation, serializeEvaluation } from './src/effectEvaluation.js';

const packageInfo = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));

export default defineConfig({
    plugins: [cardSettingsPlugin(fileURLToPath(new URL('./public/data/cards.json', import.meta.url))),
        settingsFilePlugin(fileURLToPath(new URL('./dev-data/effect-evaluation.json', import.meta.url)),
            {name:'effect-evaluation', route:'/api/effect-evaluation', read:readEvaluation, serialize:serializeEvaluation, allowRead:true})],
    base: '/MyPalette/',
    define: { __APP_VERSION__: JSON.stringify(packageInfo.version) },
    server: {
        host: '127.0.0.1',
        port: 3000,
        open: false,
        watch: { ignored: ['**/public/data/cards.json', '**/public/data/cards.json.*.tmp', '**/dev-data/effect-evaluation.json', '**/dev-data/effect-evaluation.json.*.tmp'] },
        fs: {
            allow: [
                fileURLToPath(new URL('.', import.meta.url)),
                fileURLToPath(new URL('../GameWorksOAK/src/lib/', import.meta.url))
            ]
        }
    },
    build: { outDir: 'dist' }
});

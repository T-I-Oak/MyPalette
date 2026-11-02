import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const packageInfo = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));

export default defineConfig({
    base: './',
    define: { __APP_VERSION__: JSON.stringify(packageInfo.version) },
    server: {
        host: '127.0.0.1',
        fs: {
            allow: [
                fileURLToPath(new URL('.', import.meta.url)),
                fileURLToPath(new URL('../GameWorksOAK/src/lib/', import.meta.url))
            ]
        }
    },
    build: { outDir: 'dist' }
});

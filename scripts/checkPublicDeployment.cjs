const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const [mode, base = 'https://t-i-oak.github.io/MyPalette/', snapshot = 'tmp_public_baseline.json'] = process.argv.slice(2);

async function read(url) {
    const response = await fetch(url, { cache: 'no-store' });
    assert.equal(response.status, 200, url);
    return Buffer.from(await response.arrayBuffer());
}
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

(async () => {
    if (mode === 'snapshot') {
        const html = await read(base);
        const urls = [...new Set([...html.toString().matchAll(/(?:src|href)=["']([^"']+)["']/g)]
            .map(match => new URL(match[1], base).href).filter(url => url.startsWith(base)))];
        const result = { [base]: hash(html) };
        for (const url of urls) result[url] = hash(await read(url));
        fs.writeFileSync(snapshot, JSON.stringify(result, null, 2));
        console.log(`PASS: saved ${Object.keys(result).length} existing public files`);
    } else if (mode === 'preserved') {
        const result = JSON.parse(fs.readFileSync(snapshot));
        for (const [url, expected] of Object.entries(result)) assert.equal(hash(await read(url)), expected, url);
        console.log(`PASS: ${Object.keys(result).length} existing public files unchanged`);
    } else if (mode === 'metadata') {
        const info = JSON.parse(await read(new URL('data/project_info.json', base)));
        for (const asset of [info.image, info.logo.path, info.button.url]) {
            const url = new URL(asset, base);
            assert.ok(url.href.startsWith(base), url.href);
            await read(url);
        }
        assert.deepEqual(JSON.parse(await read(new URL('data/update_history.json', base))), []);
        assert.equal(JSON.parse(await read(new URL('data/cards.json', base))).cards.length, 45);
        console.log('PASS: published metadata, image, logo, play link, history and 45 cards');
    } else throw new Error('Use snapshot, preserved or metadata');
})().catch(error => { console.error(error); process.exitCode = 1; });

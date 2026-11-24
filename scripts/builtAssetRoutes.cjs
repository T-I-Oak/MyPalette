const fs = require('node:fs');
const path = require('node:path');

// Verify dist through the existing origin without starting or replacing a server.
async function installBuiltAssetRoutes(page, base) {
    if (process.env.MYPALETTE_VERIFY_DIST !== '1') return;
    const root = path.resolve(__dirname, '../dist');
    const baseUrl = new URL(base);
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
        '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
    await page.route(`${baseUrl.origin}${baseUrl.pathname}**`, async route => {
        const relative = decodeURIComponent(new URL(route.request().url()).pathname.slice(baseUrl.pathname.length));
        const file = path.resolve(root, relative || 'index.html');
        if (!file.startsWith(root + path.sep)) throw new Error(`Outside dist: ${file}`);
        await route.fulfill({ body: fs.readFileSync(file), contentType: mime[path.extname(file)] || 'application/octet-stream' });
    });
}

module.exports = { installBuiltAssetRoutes };

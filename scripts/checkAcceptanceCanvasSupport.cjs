const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const directory = process.env.MYPALETTE_ACCEPTANCE_EVIDENCE || 'tmp_acceptance_evidence';
fs.mkdirSync(directory, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 760 }, deviceScaleFactor: 1 });
        await page.goto(base);
        const displayedVersion = await page.locator('.TitleMetadata p').last().textContent();
        assert.equal(displayedVersion, `v${require('../package.json').version}`, 'normal title displays current version');
        await page.goto(new URL('dev.html', base).href);
        const measurement = await page.evaluate(async () => {
            const { createEasel } = await import('./src/game/easel/createEasel.js');
            const { createPaintingCanvas } = await import('./src/game/easel/createPaintingCanvas.js');
            const { createPaintingCamera, orientPainting } = await import('./src/game/easel/paintingView.js');
            const module = performance.getEntriesByType('resource').find(entry => new URL(entry.name).pathname.endsWith('/three.js'));
            const THREE = await import(module.name);
            const image = new Image(); image.src = './assets/paintings/A01-1.png'; await image.decode();
            document.body.replaceChildren();
            document.documentElement.style.cssText = 'height:auto;overflow:visible';
            document.body.style.cssText = 'margin:0;background:#eee7d8;color:#263a32;font:16px system-ui;height:auto;overflow:visible';
            const heading = document.createElement('h1'); heading.textContent = 'MP45-01 / actual easel and canvas modules / A01 1536x1024'; document.body.append(heading);
            const row = document.createElement('main'); row.style.cssText = 'display:flex'; document.body.append(row);
            const measurements = [];
            for (const angle of [-.4, 0, .4]) {
                const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xfff5e2, 0x74695c, 2.4));
                const light = new THREE.DirectionalLight(0xffefd7, 3.2); light.position.set(-3, 5, 4); scene.add(light);
                const easel = createEasel(), canvas = createPaintingCanvas(image); easel.mountCanvas(canvas); scene.add(easel.object);
                orientPainting(easel, 200, 400, 'A01'); easel.object.rotation.y += angle;
                const lip = easel.object.getObjectByName('top-clamp-lip');
                const tray = easel.object.getObjectByName('tray-shelf');
                const bottom = canvas.placement.center[1] - canvas.placement.height / 2;
                const top = canvas.placement.top;
                const clampBottom = lip.position.y - lip.geometry.parameters.height / 2;
                const trayTop = tray.position.y + tray.geometry.parameters.height / 2;
                const block = easel.object.getObjectByName('top-clamp-block');
                const knob = easel.object.getObjectByName('clamp-knob');
                const front = lip.parent, body = canvas.object.children[0];
                easel.object.updateMatrixWorld(true);
                const origin = front.localToWorld(new THREE.Vector3(0, top + .1, canvas.placement.center[2]));
                const direction = new THREE.Vector3(0, -1, 0).transformDirection(front.matrixWorld);
                const hit = new THREE.Raycaster(origin, direction).intersectObject(body)[0];
                const surfaceTop = front.worldToLocal(hit.point.clone()).y;
                const lipBack = lip.position.z - lip.geometry.parameters.depth / 2;
                const lipFront = lip.position.z + lip.geometry.parameters.depth / 2;
                measurements.push({ angle, image: [image.naturalWidth, image.naturalHeight], canvas: canvas.placement,
                    clampBottom, trayTop, bottomGap: bottom - trayTop, topGap: clampBottom - top,
                    roundedSurfaceGap: clampBottom - surfaceTop, lipBack, lipFront,
                    blockGap: block.position.y - block.geometry.parameters.height / 2 - (lip.position.y + lip.geometry.parameters.height / 2),
                    knobGap: knob.position.z - knob.geometry.parameters.height / 2 - (block.position.z + block.geometry.parameters.depth / 2) });
                const slot = document.createElement('section'); slot.append(`view angle ${angle}`); row.append(slot);
                const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setSize(400, 640); slot.append(renderer.domElement);
                const camera = createPaintingCamera(400 / 640); camera.setViewOffset(400, 760, 0, 50, 400, 640);
                renderer.render(scene, camera);
                const detail = new THREE.WebGLRenderer({ antialias: true, alpha: true }); detail.setSize(400, 280); slot.append(detail.domElement);
                const close = createPaintingCamera(400 / 280); close.zoom = 4;
                close.lookAt(front.localToWorld(new THREE.Vector3(0, top, canvas.placement.center[2]))); close.updateProjectionMatrix();
                detail.render(scene, close);
            }
            return measurements;
        });
        await page.screenshot({ path: `${directory}/d03-canvas-support.png`, fullPage: true });
        fs.writeFileSync(`${directory}/d03-canvas-support.json`, JSON.stringify({ version: require('../package.json').version,
            displayedVersion, browser: browser.version(), fixture: 'production createEasel/createPaintingCanvas/mountCanvas/orientPainting; saved A01-1; three view angles, full view and clamp close-up; rounded body raycast; no product changes', measurement }, null, 2) + '\n');
        for (const view of measurement) {
            assert.ok(Math.abs(view.bottomGap) < 1e-6, 'canvas lower edge rests on tray');
            assert.ok(Math.abs(view.topGap) < 1e-6, `canvas upper edge must meet clamp: gap=${view.topGap}`);
            assert.ok(Math.abs(view.roundedSurfaceGap) < 1e-6, 'actual rounded mesh meets clamp');
            assert.ok(Math.abs(view.blockGap) < 1e-6, 'block meets lip');
            assert.ok(Math.abs(view.knobGap) < 1e-6, 'knob meets block');
            assert.ok(view.lipBack < view.canvas.center[2] - view.canvas.depth / 2 + .008 &&
                view.lipFront > view.canvas.center[2] + view.canvas.depth / 2, 'lip covers flat top and front rounded edge');
        }
        console.log('PASS: canvas supported at lower and upper edges');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

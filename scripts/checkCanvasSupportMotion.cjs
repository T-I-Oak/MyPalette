const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const directory = process.env.MYPALETTE_ACCEPTANCE_EVIDENCE || 'tmp_acceptance_evidence';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
for (const card of settings.cards) for (const step of card.steps) { step.playEffects = []; step.achievementEffects = []; }
fs.mkdirSync(directory, { recursive: true });

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    const results = [];
    try {
        for (const layout of ['A', 'B']) for (const step of [0, 1, 2]) {
            const viewport = layout === 'A' ? { width: 1200, height: 800 } : { width: 390, height: 844 };
            const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            // Expose actual product objects only inside this verification browser.
            await page.route('**/src/game/easel/createEasel.js*', async route => {
                const response = await route.fetch();
                const original = await response.text();
                const source = original.replace(/easel\.name = ['"]easel['"];/, "easel.name = 'easel'; (globalThis.supportEasels ||= []).push(easel);");
                assert.notEqual(source, original, 'product easel observation installed');
                await route.fulfill({ response, body: source });
            });
            await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
                <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
                <script type="module">
                import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
                import {createLayoutPresentation} from './src/game/layoutPresentation.js';
                import {mountGame} from './src/game/view.js';
                import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
                import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
                Math.random=()=>.4;
                const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
                const presentation=createLayoutPresentation(screen),mounted=mountGame(root,${JSON.stringify(settings)},presentation);
                window.check={screen,presentation,mounted};window.supportFrames=[];window.supportStage='';
                const hold=stage=>new Promise(resolve=>{window.supportStage=stage;window.continueSupport=()=>{window.supportStage='';resolve();};});
                for(const [method,stage] of [['fadeOut','before'],['repaint','after']]) {
                    const original=presentation.play[method].bind(presentation.play);
                    presentation.play[method]=async(...args)=>{await original(...args);await hold(stage);};
                }
                function observe() {
                    for(const easel of window.supportEasels||[]) {
                        const canvas=easel.getObjectByName('painting-canvas');if(!canvas)continue;
                        const body=canvas.children[0],lip=easel.getObjectByName('top-clamp-lip'),tray=easel.getObjectByName('tray-shelf');
                        const {height,depth}=body.geometry.parameters;
                        const top=canvas.position.y+height/2,bottom=canvas.position.y-height/2;
                        const contact=lip.position.y-lip.geometry.parameters.height/2;
                        window.supportFrames.push({layout:screen.panelState.mode,stage:window.supportStage,
                            viewport:[innerWidth,innerHeight],rotation:easel.rotation.toArray(),
                            topGap:contact-top,bottomGap:bottom-(tray.position.y+tray.geometry.parameters.height/2),
                            frontOverlap:lip.position.z+lip.geometry.parameters.depth/2-(canvas.position.z+depth/2)});
                    }
                    window.supportRaf=requestAnimationFrame(observe);
                }
                requestAnimationFrame(observe);
                </script>` }));
            await installDayStartGate(page); await page.goto(base); await page.waitForFunction(() => window.check);
            await releaseDayStart(page);
            const idle = () => page.waitForFunction(() => check.mounted.session.game.state.phase === 'play' && !check.presentation.cards.busy && !document.querySelector('[data-card-scene-motion]'), null, { timeout: 60000 });
            await idle();
            const target = await page.evaluate(step => {
                const g = check.mounted.session.game, c = g.state.hand[0];
                const d = g.state.dice.find(d => !d.faces[d.current].special);
                c.step = step; g.step(c).goals = [{ color: d.faces[d.current].color, material: null }];
                return { id: c.id, die: d.id };
            }, step);
            await page.emulateMedia({ reducedMotion: 'no-preference' });
            await page.locator('.HandFixedActions button:enabled').first().click({ force: true }); await idle();
            const point = await page.evaluate(id => {
                const node = document.querySelector('.PaletteViewport .DiceResult[data-die-id="' + id + '"]'), r = node.getBoundingClientRect();
                for (const y of [.5,.25,.75]) for (const x of [.5,.25,.75]) {
                    const p = { x:r.x+r.width*x,y:r.y+r.height*y };
                    if (document.elementFromPoint(p.x,p.y)?.closest('.DiceResult') === node) return p;
                }
            }, target.die);
            assert.ok(point, 'die is selectable'); await page.mouse.click(point.x, point.y);
            await page.getByRole('button', { name: '選択ダイスで達成', exact: true }).first().click({ force: true });
            for (const stage of ['before', 'after']) {
                await page.waitForFunction(stage => window.supportStage === stage, stage, { timeout: 30000 });
                await page.screenshot({ path: `${directory}/support-${layout}-step${step}-${stage}.png` });
                if (stage === 'after') {
                    await page.setViewportSize(layout === 'A' ? { width: 1000, height: 720 } : { width: 430, height: 932 });
                    await page.evaluate(() => check.screen.setFixedScale(1.3));
                    await page.waitForTimeout(100);
                    const corners = await page.evaluate(id => check.presentation.play.canvasCorners(id), target.id);
                    const size = page.viewportSize();
                    assert.ok(corners.every(p => p.x >= 0 && p.x <= size.width && p.y >= 0 && p.y <= size.height), 'resized canvas remains in viewport');
                    await page.screenshot({ path: `${directory}/support-${layout}-step${step}-resized.png` });
                }
                await page.evaluate(() => window.continueSupport());
            }
            await idle();
            const result = await page.evaluate(({ target, step }) => {
                cancelAnimationFrame(window.supportRaf);
                const s = check.mounted.session.game.state;
                const card = [...s.discard, ...s.shipped].find(c => c.id === target.id);
                return { id:target.id, from:step, to:card?.step, shipped:s.shipped.some(c => c.id === target.id),
                    remainingCanvases:window.supportEasels.filter(e => e.getObjectByName('painting-canvas')).length,
                    frames:window.supportFrames };
            }, { target, step });
            assert.equal(result.to, step + 1); assert.equal(result.shipped, step === 2);
            assert.equal(result.remainingCanvases, 0, 'canvas released after restoration/shipping');
            assert.ok(result.frames.length > 10);
            for (const f of result.frames) {
                assert.ok(Math.abs(f.topGap) < 1e-6 && Math.abs(f.bottomGap) < 1e-6 && f.frontOverlap > 0);
                assert.equal(f.layout, layout);
            }
            assert.deepEqual(errors, []);
            results.push({ layout, viewport, ...result }); await page.close();
            console.log(`PASS: ${layout} Step ${step}→${step + 1}, resize, fixed scale, release`);
        }
        fs.writeFileSync(`${directory}/support-motion.json`, JSON.stringify({ version:require('../package.json').version,
            browser:browser.version(), fixture:'production achievement timeline; browser-only empty effects, one-die goals, selected initial step; observation gates after production fadeOut/repaint; product easels exposed by response instrumentation', results }, null, 2) + '\n');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: 'no-preference' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
        for (const card of settings.cards) for (const step of card.steps) { step.playEffects = [{ type: 'drawCards', count: 2 }]; step.achievementEffects = []; }
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
        <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button class="PanelToggle"></button></main>
        <script type="module">
        import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
        import {createLayoutPresentation} from './src/game/layoutPresentation.js';
        import {mountGame} from './src/game/view.js';
        import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
        Math.random=()=>.4;
        const root=document.querySelector('main'), screen=createLayoutScreen(root,document.querySelector('button'));
        const presentation=createLayoutPresentation(screen), mounted=mountGame(root,${JSON.stringify(settings)},presentation);
        window.check={screen,presentation,mounted};window.samples=[];
        function sample(){
            const scene=presentation.cards, motion=root.querySelector('.LayoutContent').dataset.cardSceneMotion;
            if(scene.model && ['draw','play'].includes(motion)) {
                const frame=screen.areas.get('hand').layoutFrame;
                for(const node of document.querySelectorAll('.HandFixedActions > .GameCardActions')) {
                    const id=node.dataset.cardId, record=scene.model.get(id), card=document.querySelector('[data-scene-id="'+id+'"]');
                    const rect=card.getBoundingClientRect(), button=node.getBoundingClientRect();
                    const content=root.querySelector('.LayoutContent').getBoundingClientRect();
                    const x=content.x+record.pose.matrix[12]+record.pose.matrix[0]*147+record.pose.matrix[4]*207;
                    samples.push({motion,id,playing:window.playing,x:button.x+button.width/2,expected:x,inert:node.parentElement.inert,
                        y:button.y,cardY:rect.y,font:getComputedStyle(node.querySelector('button')||node).fontSize});
                }
            }
            requestAnimationFrame(sample);
        } requestAnimationFrame(sample);
        </script>` }));
        await installDayStartGate(page); await page.goto(base); await page.waitForFunction(() => window.check);
        await releaseDayStart(page);
        const idle = () => page.waitForFunction(() => check.mounted.session.game.state.phase === 'play' && !check.presentation.cards.busy && !check.mounted.session.game.state.rollRequest, null, { timeout: 90000 });
        await idle();
        const play = async (resize = false) => {
            const id = await page.evaluate(() => check.mounted.session.game.state.hand[0].id);
            await page.evaluate(id => { window.playing=id; }, id);
            await page.locator('.HandFixedActions [data-card-id="'+id+'"] button').click();
            await page.waitForFunction(() => document.querySelector('[data-card-scene-motion="play"]'));
            assert.equal(await page.locator('.HandFixedActions [data-card-id="'+id+'"]').count(),0,'played action disappears at movement start');
            if(resize) { await page.setViewportSize({width:390,height:844}); await page.evaluate(() => check.screen.setFixedScale(.65)); }
            await idle();
            assert.equal(await page.locator('.HandFixedActions [data-card-id="'+id+'"]').count(),0);
            return id;
        };
        const first = await play(true);
        await page.setViewportSize({width:1200,height:800});
        await page.evaluate(() => check.screen.setFixedScale(1));
        const second = await play();
        const samples = await page.evaluate(() => window.samples);
        assert.ok(samples.filter(s=>s.motion==='draw').length>10,'draw sampled in flight');
        for(const id of [first,second]) assert.equal(samples.filter(s=>s.motion==='play'&&s.playing===id&&s.id===id).length,0,'no outgoing action during play');
        assert.ok(samples.filter(s=>s.motion==='play').length>2,'remaining hand actions sampled during rearrangement');
        for(const s of samples) { assert.ok(Math.abs(s.x-s.expected)<1,JSON.stringify(s)); assert.ok(s.inert,'animation blocks actions'); }
        await page.emulateMedia({reducedMotion:'reduce'});
        await page.locator('.HandFixedActions button:not(:disabled)').first().click(); await idle();
        assert.equal(await page.locator('.HandFixedActions > .GameCardActions').count(),await page.evaluate(()=>check.presentation.cards.display.hand.length));
        assert.deepEqual(errors,[]);
        console.log(JSON.stringify({samples:samples.length, motions:[...new Set(samples.map(s=>s.motion))], outgoing:[first,second],errors}));
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

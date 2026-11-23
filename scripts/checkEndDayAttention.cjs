const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        for (const reducedMotion of ['no-preference', 'reduce']) for (const width of [1200, 390]) {
            const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion });
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            // Expose redraw only in this driver's response, never in the shipped module.
            await page.route('**/src/game/view.js*', async route => {
                const response = await route.fetch();
                await route.fulfill({ response, body: (await response.text()).replace(
                    'return { session, dispose };', 'return { session, dispose, render };') });
            });
            const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
            for (const card of settings.cards) for (const step of card.steps) {
                step.playEffects = []; step.achievementEffects = [];
            }
            await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
                <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle" type="button"></button></main>
                <script type="module">
                import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
                import {createLayoutPresentation} from './src/game/layoutPresentation.js';
                import {mountGame} from './src/game/view.js';
                import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
                Math.random=()=>.4;
                const root=document.querySelector('main'),screen=createLayoutScreen(root,document.querySelector('button'));
                const presentation=createLayoutPresentation(screen);
                const mount=()=>mountGame(root,${JSON.stringify(settings)},presentation);
                window.check={screen,presentation,mounted:mount(),mount};
                window.refresh=()=>check.mounted.render();
                window.samples=[];
                function sample(){const s=check.mounted.session.game.state,b=document.querySelector('[data-game-end-day]');
                    samples.push({phase:s.phase,day:s.day,attention:!!b?.classList.contains('state-attention'),disabled:b?.disabled});requestAnimationFrame(sample);}
                requestAnimationFrame(sample);
                </script>` }));
            await page.goto(base);
            const ready = () => page.waitForFunction(() => window.check && check.mounted.session.game.state.phase === 'play' &&
                !check.presentation.cards.busy && !document.querySelector('.PaletteRolling') &&
                !document.querySelector('[data-game-end-day]')?.disabled, null, { timeout: 60000 });
            const attention = () => page.evaluate(() => !!document.querySelector('[data-game-end-day]')?.classList.contains('state-attention'));
            await ready();
            assert.equal(await attention(), false);
            await page.evaluate(() => {
                const s=check.mounted.session.game.state;
                window.savedHand=[...s.hand];s.hand=s.hand.slice(0,1);s.rerolls=0;refresh();
            });
            assert.equal(await attention(), true);
            assert.equal(await page.locator('[data-game-end-day]').evaluate(b => getComputedStyle(b).animationName),
                reducedMotion === 'reduce' ? 'none' : 'ButtonAttentionPulse');
            await page.screenshot({path:`tmp_end_day_attention_${width}_${reducedMotion}.png`});
            await page.evaluate(() => { check.mounted.session.game.state.rerolls=1;refresh(); });
            assert.equal(await attention(), false);
            await page.evaluate(() => {
                const g=check.mounted.session.game,s=g.state;
                s.rerolls=0;s.field=[savedHand[1]];
                window.savedGoals=g.step(s.field[0]).goals;
                g.step(s.field[0]).goals=[{color:'red'}];
                for(const d of s.dice)d.used=true;
                const d=s.dice[0];window.savedFace=structuredClone(d.faces[d.current]);
                d.used=false;d.faces[d.current]={color:'red',material:'brush'};refresh();
            });
            assert.equal(await attention(), false); // 達成可能な場がある手札1枚
            await page.evaluate(() => {
                const s=check.mounted.session.game.state;s.hand=[savedHand[0],...savedHand.slice(2)];refresh();
            });
            assert.equal(await attention(), false); // 複数枚でも場の達成可能カードを優先
            await page.evaluate(() => {check.mounted.session.game.state.dice[0].used=true;refresh();});
            assert.equal(await attention(), true); // 場を達成できなくなると表示
            await page.evaluate(() => {
                const g=check.mounted.session.game,s=g.state;
                g.step(s.field[0]).goals=savedGoals;s.field=[];
                s.dice[0].faces[s.dice[0].current]=savedFace;s.hand=savedHand;s.rerolls=0;
                for(const d of s.dice)d.used=true;refresh();
            });
            assert.equal(await attention(), true);
            await page.evaluate(() => {
                const g=check.mounted.session.game;window.savedEffects=g.step(g.state.hand[1]).playEffects;
                g.step(g.state.hand[1]).playEffects=[{type:'drawCards',count:1}];refresh();
            });
            assert.equal(await attention(), false);
            await page.evaluate(() => {
                const g=check.mounted.session.game;g.step(g.state.hand[1]).playEffects=savedEffects;
                g.state.pending={kind:'dice',effectType:'reroll',options:[],min:0,max:0};refresh();
            });
            assert.equal(await attention(), false);
            await page.evaluate(() => {
                const s=check.mounted.session.game.state;s.pending=null;
                s.effectNotices.push({id:999,timing:'play',effects:[{type:'drawCards',count:1}]});refresh();
            });
            assert.equal(await attention(), false);
            await page.waitForFunction(() => document.querySelector('[data-game-end-day]')?.classList.contains('state-attention'), null, {timeout:10000});
            if (await page.locator('#panel-toggle').isVisible() && await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
            // The intentional pulse never passes Playwright's geometry-stability check.
            assert.equal(await page.locator('[data-game-end-day]').isEnabled(),true);
            await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click({force:true});
            await ready();
            assert.equal(await page.evaluate(() => check.mounted.session.game.state.day),2);
            assert.equal(await attention(),false);
            assert.equal(await page.evaluate(() => samples.some(s=>s.phase!=='play'&&s.attention)),false);
            await page.evaluate(() => {check.mounted.dispose();check.mounted=check.mount();});
            await ready();
            assert.equal(await attention(),false);
            assert.equal(await page.evaluate(() => check.mounted.session.game.state.day),1);
            await page.evaluate(() => {check.mounted.session.game.state.credit=0;});
            if (await page.locator('#panel-toggle').isVisible() && await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
            await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
            await page.waitForFunction(() => check.mounted.session.game.state.phase==='finished',null,{timeout:60000});
            assert.equal(await attention(),false);
            assert.deepEqual(errors,[]);
            console.log('PASS end-day attention',width,reducedMotion);
            await page.close();
        }
    } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});

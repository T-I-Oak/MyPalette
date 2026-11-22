const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
(async () => {
    const browser = await chromium.launch({ channel: 'msedge', headless: true });
    try {
        // Use the real title/startup path: isolated InfoDay checks miss WebGL startup stalls.
        for (const viewport of [{width:1200,height:800}, {width:390,height:844}]) {
            const page = await browser.newPage({ viewport });
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            await page.addInitScript(() => {
                window.startupDaySamples = [];
                function sample(time) {
                    const day = document.querySelector('[data-day-start="initial"]');
                    if (day) startupDaySamples.push({time,width:day.getBoundingClientRect().width});
                    requestAnimationFrame(sample);
                }
                requestAnimationFrame(sample);
            });
            await page.goto(base);
            await page.getByRole('button',{name:'ゲーム開始',exact:true}).click();
            await page.waitForFunction(()=>document.querySelector('.InfoDay')&&!document.querySelector('[data-day-start]'),null,{timeout:60000});
            const samples = await page.evaluate(()=>startupDaySamples);
            const maximum = Math.max(...samples.map(sample=>sample.width));
            const growth = samples.slice(0,samples.findIndex(sample=>sample.width===maximum)+1);
            const intermediate = growth.filter(sample=>sample.width>maximum*.4&&sample.width<maximum*.9);
            assert.ok(growth[0].width<maximum*.4,'first displayed frame must use the small journal');
            assert.ok(intermediate.length>=5,'real startup must display intermediate growth frames');
            assert.deepEqual(errors,[]);
            console.log(`PASS real startup journal growth ${viewport.width}: ${intermediate.length} intermediate frames`);
            await page.close();
        }
        if (process.argv.includes('--startup-only')) return;
        for (const reducedMotion of ['no-preference', 'reduce']) {
            for (const viewport of [{width:1200,height:800}, {width:390,height:844}]) {
                const page = await browser.newPage({ viewport, reducedMotion });
                const errors = []; page.on('pageerror', error => {errors.push(error.message);console.error(error.stack);});
                const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));
                for (const card of settings.cards) for (const step of card.steps) { step.playEffects=[]; step.achievementEffects=[]; }
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
                window.samples=[];
                function sample(){const s=check.mounted.session.game.state,n=document.querySelector('.InfoDay');
                  samples.push({day:s.day,phase:s.phase,hand:s.hand.length,rerolls:s.rerolls,motion:n.dataset.dayStart,text:n.textContent,
                  count:document.querySelectorAll('.InfoDay').length,rect:n.getBoundingClientRect().toJSON()});requestAnimationFrame(sample);}
                requestAnimationFrame(sample);
                </script>` }));
                await page.goto(base);
                const ready = () => page.waitForFunction(() => window.check && check.mounted.session.game.state.phase==='play' && !check.presentation.cards.busy && !document.querySelector('.PaletteRolling'), null, {timeout:60000});
                await ready();
                assert.equal(await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).count(),0);
                assert.ok(await page.evaluate(() => samples.filter(s=>s.motion).every(s=>s.hand===0&&s.rerolls===0&&s.count===1)));
                assert.equal(await page.evaluate(()=>check.mounted.session.game.state.hand.length),4);
                await page.evaluate(()=>{check.mounted.session.game.state.fame=17;window.dayNode=document.querySelector('.InfoDay');samples.length=0;});
                if (await page.locator('#panel-toggle').isVisible() && await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
                await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
                await page.waitForFunction(()=>document.querySelector('[data-day-start="next"]'),null,{timeout:60000});
                await page.setViewportSize({width:viewport.width+40,height:viewport.height+30});
                await page.evaluate(()=>{check.screen.setFixedScale(.8);check.screen.openPanel();});
                await ready();
                const samples = await page.evaluate(()=>window.samples);
                if (reducedMotion==='no-preference') assert.ok(samples.some(s=>s.motion==='next'&&s.day===1));
                assert.ok(samples.some(s=>s.motion==='next'&&s.day===2));
                assert.ok(samples.filter(s=>s.motion).every(s=>s.hand===0&&s.count===1));
                assert.equal(await page.evaluate(()=>dayNode===document.querySelector('.InfoDay')),true);
                assert.equal(await page.locator('.InfoDay [aria-label="名声 17"]').count(),1);
                await page.evaluate(()=>{check.mounted.session.game.state.credit=0;samples.length=0;});
                if (await page.locator('#panel-toggle').isVisible() && await page.locator('#panel-toggle').getAttribute('aria-expanded')==='true') await page.locator('#panel-toggle').click();
                await page.getByRole('button',{name:'今日の仕事を終える',exact:true}).click();
                await page.waitForFunction(()=>check.mounted.session.game.state.phase==='finished',null,{timeout:60000});
                assert.equal(await page.locator('[data-day-start]').count(),0);
                assert.equal(await page.evaluate(()=>check.mounted.session.game.state.day),2);
                await page.evaluate(()=>{
                    check.mounted.dispose();check.mounted=check.mount();
                    check.mounted.dispose();check.mounted=check.mount();
                });
                await ready();
                assert.equal(await page.evaluate(()=>check.mounted.session.game.state.day),1);
                assert.deepEqual(errors,[]);
                console.log(`PASS day start ${viewport.width} ${reducedMotion}`);
                await page.close();
            }
        }
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

const { chromium } = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';
const settings = JSON.parse(fs.readFileSync('public/data/cards.json', 'utf8'));

(async () => {
    const browser = await chromium.launch({ channel: process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge', headless: true });
    try {
        const page = await browser.newPage({ viewport: { width: 1200, height: 700 }, reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route(base, route => route.fulfill({ contentType: 'text/html', body: `
            <body class="theme-atelier texture-layout"><main class="LayoutScreen"><button id="panel-toggle" class="PanelToggle"></button></main>
            <script type="module">
            import {createLayoutScreen} from './src/ui/screenLayout/createLayoutScreen.js';
            import {createLayoutPresentation} from './src/game/layoutPresentation.js';
            import {mountGame} from './src/game/view.js';
            import './src/ui/theme.css';import './src/ui/layout.css';import './src/ui/textures.css';
            import './src/ui/states.css';import './src/ui/screenLayout/layout.css';
            Math.random=()=>.4;
            const root=document.querySelector('main');
            const screen=createLayoutScreen(root,document.querySelector('button'));
            const presentation=createLayoutPresentation(screen);
            const settings=${JSON.stringify(settings)};
            const mounted=mountGame(root,settings,()=>{},presentation);
            window.stockCheck={screen,presentation,mounted,root,settings};
            </script>` }));
        await page.goto(base);
        await page.locator('.StockArea .PaintingCard').first().waitFor();
        async function check() {
            const result = await page.evaluate(() => {
                const { screen, mounted } = window.stockCheck;
                const area = screen.areas.get('stock');
                const bounds = area.canvas.getBoundingClientRect();
                const cards = [...document.querySelectorAll('.StockArea .PaintingCard')];
                return {
                    size: [area.standardWidth, area.standardHeight],
                    fonts: [...document.querySelectorAll('.StockArea h3')].map(node => getComputedStyle(node).fontSize),
                    nameFont: getComputedStyle(area.fixedLayer.querySelector('.LayoutAreaName')).fontSize,
                    labelHeights: [...document.querySelectorAll('.StockArea h3')].map(node => node.getBoundingClientRect().height),
                    scale: area.layoutFrame.scale,
                    labels: [...document.querySelectorAll('.StockArea h3')].map(node => node.textContent),
                    expected: ['A','B','C'].map(grade => 'グレード'+grade+' '+mounted.session.game.state.stocks[grade].length+'枚'),
                    inside: cards.every(node => { const r=node.getBoundingClientRect();return r.left>=bounds.left-.5&&r.right<=bounds.right+.5&&r.top>=bounds.top-.5&&r.bottom<=bounds.bottom+.5; }),
                    count: cards.length,
                };
            });
            assert.deepEqual(result.size, [993,546]);
            assert.deepEqual(result.labels, result.expected);
            assert.deepEqual(result.fonts, Array(3).fill('40px'));
            assert.equal(result.nameFont, '24px');
            for (const height of result.labelHeights) assert.ok(Math.abs(height - 48 * result.scale) < 0.1);
            assert.ok(result.inside, 'all card envelopes inside drawing area');
            return result;
        }
        await check();
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),0);
        await page.getByRole('button',{name:'今日の仕事を始める',exact:true}).click();
        await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').first().waitFor();
        await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').first().click();
        await page.locator('.GameCardDetail[open]').waitFor();
        await page.keyboard.press('Escape');
        for (const [width,height] of [[390,844],[768,1024],[1400,700]]) {
            await page.setViewportSize({width,height});
            if (width<height && await page.locator('#panel-toggle').getAttribute('aria-expanded') !== 'true') await page.locator('#panel-toggle').click();
            await page.waitForTimeout(100);
            await check();
        }
        await page.evaluate(() => window.stockCheck.screen.setFixedScale(1.25));
        await check();
        await page.screenshot({path:'tmp_stock_wide.png'});
        await page.evaluate(() => window.stockCheck.mounted.dispose());
        // Check the renderer independently with all 15 cards face-down and an empty grade.
        await page.evaluate(async () => {
            const {Card}=await import('./src/game/Card.js');
            const {createStockPresentation}=await import('./src/game/stockPresentation.js');
            const {screen}=window.stockCheck;
            const host=document.querySelector('.StockArea');
            host.replaceChildren();

            const renderer=createStockPresentation(screen.areas.get('stock'),host);
            const section=document.createElement('section');
            for(const grade of ['A','B','C']) {
                const node=document.createElement('div');node.dataset.stockGrade=grade;
                const label=document.createElement('h3');label.textContent='グレード'+grade+' '+(grade==='C'?0:15)+'枚';node.append(label);
                if(grade!=='C') {
                    const pile=document.createElement('div');pile.className='GameStockPile';
                    for(let i=0;i<15;i++) {
                        const card=new Card(grade+i);card.setPresentation('stock',{x:i%2?1:-1,y:i%2?.45:-.45,angle:i%2?1.5:-1.5});card.setBack();
                        card.element.style.setProperty('--stack-layer',i);pile.append(card.element);
                    }
                    node.append(pile);
                }
                section.append(node);
            }
            renderer.present(section,window.stockCheck.mounted.session.game.state,{stockSelection:false});
            window.stockCheck.mounted.session.game.state.stocks={A:Array(15),B:Array(15),C:[]};
        });
        assert.equal((await check()).count,30);
        assert.equal(await page.locator('.StockArea .PaintingCard:not(.PaintingCardBackOnly)').count(),0);
        assert.equal(await page.getByText('公開カードなし',{exact:true}).count(),0);
        assert.deepEqual(errors,[]);
        console.log('stock area: A/B, fixed scale, detail, 15-card backs, empty grade and bounds passed');
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

const {chromium} = require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const {diceListReviewFixture} = require('./diceListReviewFixture.cjs');
const base = process.argv[2] || 'http://127.0.0.1:3000/MyPalette/';

(async () => {
    const browser = await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge',headless:true});
    try {
        for (const reducedMotion of ['reduce','no-preference']) {
            const page = await browser.newPage({viewport:{width:1200,height:900},hasTouch:true,reducedMotion});
            const errors = []; page.on('pageerror',error => {errors.push(error.message);console.error(error.message);});
            await page.route(base,route => route.fulfill({contentType:'text/html',body:diceListReviewFixture()}));
            await page.goto(base);
            await page.waitForFunction(() => window.review?.session.game.state.phase === 'play' && !window.review.session.game.state.rollRequest,
                null,{timeout:90000});
            await page.waitForFunction(() => window.reviewScene && [...window.reviewScene.visuals.values()].some(v=>!v.result.hidden),null,{timeout:60000});
            assert.equal(await page.locator('#version').textContent(),'v0.44.0');
            const open = () => page.locator('.DiceListOpen').click();
            const panel = page.locator('.DiceList');
            await open(); await panel.waitFor({state:'visible'});
            assert.equal(await page.locator('.DiceListOpen').getAttribute('aria-expanded'),'true');
            await open(); assert(await panel.isHidden());
            assert.equal(await page.locator('.DiceListOpen').getAttribute('aria-expanded'),'false');
            await open(); await panel.waitFor({state:'visible'});
            assert.equal(await page.locator('.DiceListRow').count(),3);
            assert.equal(await page.locator('.DiceListFace').count(),18);
            assert.equal(await page.locator('.DiceListFace.state-current').count(),3);
            const before = await page.evaluate(() => JSON.stringify(review.session.game.state));
            assert.equal(await page.locator('.DiceListDescription').count(),0);
            await page.locator('.DiceListFace').first().hover();
            await page.locator('.PaintingIconDetails:not(.is-pinned)').waitFor();
            await page.locator('.DiceListFace').first().click();
            await page.locator('.PaintingIconDetails.is-pinned').waitFor();
            assert.equal(await page.evaluate(() => JSON.stringify(review.session.game.state)),before);
            const first = page.locator('.DiceListRow').first();
            const id = await first.getAttribute('data-die-id');
            await first.locator('.DiceListVisual').click();
            assert(await first.evaluate(node => node.classList.contains('state-selected')));
            assert(await page.evaluate(id => reviewScene.selected.has(id),id));
            const point = await page.evaluate(id => {
                const r = document.querySelector('.DiceResult[data-die-id="'+id+'"]').getBoundingClientRect();
                return {x:r.x+r.width/2,y:r.y+r.height/2};
            },id);
            // Move to upper left so the palette remains exposed.
            const h = await page.locator('.DiceListHeading').boundingBox();
            await page.mouse.move(h.x+50,h.y+15); await page.mouse.down(); await page.mouse.move(100,140); await page.mouse.up();
            await page.mouse.click(point.x,point.y);
            assert.equal(await first.evaluate(node => node.classList.contains('state-selected')),false);
            await page.locator('[data-scene-area="hand"] [data-goal-condition]').first().click();
            const matches = await page.locator('.DiceListFace.state-match').count(); assert(matches>0);
            await page.waitForTimeout(3300);
            assert.equal(await page.locator('.DiceListFace.state-match').count(),0);
            await page.locator('.DiceListClose').click();
            assert.equal(await page.locator('.DiceListOpen').getAttribute('aria-expanded'),'false');
            await open();
            assert.equal(await page.locator('.DiceListFace.state-match').count(),0);
            await page.evaluate(() => {
                const die = review.session.game.state.dice[0];
                die.current = die.faces.findIndex(face=>face.material==='brush'); reviewRefresh.click();
            });
            await page.getByRole('button',{name:'すべてリロール（リロール権1個消費）',exact:true}).click();
            await page.locator('.RerollOverlay').waitFor();
            assert(await panel.evaluate(node => node.inert));
            await page.getByRole('button',{name:'戻る',exact:true}).click();
            assert.equal(await panel.evaluate(node => node.inert),false);
            // Card inspection still receives clicks outside the modeless window.
            const card = page.locator('.PaintingCard').filter({visible:true}).first();
            await card.click({force:true});
            const detail = page.locator('.GameCardDetail');
            await detail.waitFor({state:'visible'});
            assert(await panel.evaluate(node => node.closest('[inert]') !== null || node.inert));
            await detail.getByRole('button',{name:'閉じる',exact:true}).click();
            await page.locator('#many').click();
            assert.equal(await page.locator('.DiceListRow').count(),30);
            await page.locator('.DiceListRow').nth(1).locator('.DiceListFace').nth(1).click();
            await page.evaluate(() => reviewPresentation.searchFaces({color:'blue'}));
            await page.locator('#mixed').click();
            assert.equal(await page.locator('.IconTooltip.is-pinned').count(),0);
            assert.equal(await page.locator('.DiceListRow').count(),30);
            assert.equal(await page.locator('.DiceListFace').count(),180);
            assert.equal(await page.locator('.DiceListUnresolved').count(),1);
            assert.equal(await page.locator('.DiceListFace.state-current').count(),29);
            assert.deepEqual(await page.locator('.DiceListRow').evaluateAll(nodes=>nodes.map(node=>
                node.querySelector('.state-current') ? Number(node.querySelector('.state-current').dataset.faceIndex) : null)),
            await page.evaluate(()=>review.session.game.state.dice.map(die=>die.current)));
            assert((await page.locator('.DiceListFace.state-match').count())>=30);
            const second = page.locator('.DiceListRow').nth(1);
            const beforeSpecial = await page.evaluate(()=>JSON.stringify(review.session.game.state));
            await second.locator('.DiceListFace').nth(1).click();
            assert.match(await page.locator('.EffectDetails.is-pinned').textContent(),/名声/);
            assert.equal(await page.evaluate(()=>JSON.stringify(review.session.game.state)),beforeSpecial);
            await page.evaluate(() => reviewPresentation.searchFaces({color:'red'}));
            assert.equal(await page.locator('.DiceListFace.state-match').count(),await page.evaluate(() => review.session.game.state.dice.reduce(
                (count,die)=>count+die.faces.filter(face=>face.color==='red').length,0)));
            const used = page.locator('.DiceListRow.state-consumed').first();
            await used.locator('.DiceListVisual').click();
            assert.equal(await used.evaluate(node => node.classList.contains('state-selected')),false);
            const reused = await used.getAttribute('data-die-id');
            await page.evaluate(id=>{review.session.game.state.dice.find(die=>die.id===id).used=false;reviewRefresh.click();},reused);
            const reusedRow = page.locator(`.DiceListRow[data-die-id="${reused}"]`);
            assert.equal(await reusedRow.evaluate(node=>node.classList.contains('state-consumed')),false);
            await reusedRow.locator('.DiceListVisual').click();
            assert(await reusedRow.evaluate(node=>node.classList.contains('state-selected')));
            await reusedRow.locator('.DiceListVisual').click();
            const scroll = page.locator('.DiceListScroll');
            await scroll.hover(); await page.mouse.wheel(0,8000);
            await page.waitForTimeout(150);
            assert(await scroll.evaluate(node => node.scrollTop>0));
            await page.locator('.DiceListRow').last().scrollIntoViewIfNeeded();
            for (const size of [{width:390,height:844},{width:844,height:390}]) {
                await page.setViewportSize(size);
                for (const scale of [.7,1.25]) {
                    await page.evaluate(scale => reviewScreen.setFixedScale(scale),scale);
                    const r = await page.locator('.DiceListHeading').boundingBox();
                    assert(r.x>=-1 && r.y>=-1 && r.x+r.width<=size.width+1 && r.y+r.height<=size.height+1);
                }
            }
            await page.setViewportSize({width:390,height:844});
            await page.evaluate(() => reviewScreen.setFixedScale(.7));
            await page.locator('.ReviewTools').evaluate(node=>{node.style.visibility='hidden';});
            const header = await page.locator('.DiceListHeading').boundingBox();
            const cdp = await page.context().newCDPSession(page);
            const tx = header.x+35, ty = header.y+15;
            await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:tx,y:ty}]});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:tx,y:ty+100}]});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
            const moved = await page.locator('.DiceListHeading').boundingBox(); assert(moved.y>header.y);
            const area = await scroll.boundingBox();
            await scroll.evaluate(node => {node.scrollTop=0;});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:area.x+area.width/2,y:area.y+area.height-20}]});
            for (let n=1;n<=5;n++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:area.x+area.width/2,y:area.y+area.height-20-n*25}]});
            await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
            await page.waitForTimeout(150); assert(await scroll.evaluate(node=>node.scrollTop>0));
            await page.screenshot({path:`tmp_dice_list_${reducedMotion}.png`});
            await page.locator('.ReviewTools').evaluate(node=>{node.style.visibility='visible';});
            await page.locator('#empty').click(); assert.equal(await page.locator('.DiceListRow').count(),0);
            assert.match(await scroll.textContent(),/所持ダイスはありません/);
            assert.equal(await panel.locator('[title],button:not([tabindex="-1"])').count(),0);
            await page.evaluate(() => review.dispose());
            assert(await panel.isHidden());
            await page.evaluate(()=>reviewPresentation.dispose());
            assert.equal(await panel.count(),0);
            assert.deepEqual(errors,[]);
            await page.close(); console.log('PASS: dice list '+reducedMotion);
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });

const { installDayStartGate, releaseDayStart } = require('./dayStartGate.cjs');
const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({channel:'msedge',headless:true});
    try {
        const page=await browser.newPage({viewport:{width:1200,height:800},reducedMotion:'reduce'});
        const errors=[];page.on('pageerror',error=>errors.push(error.message));
        await installDayStartGate(page);
        await page.goto(process.argv[2] || 'http://127.0.0.1:3000/MyPalette/tmp_stock_review.html');
        await releaseDayStart(page);
        await page.waitForFunction(()=>document.querySelector('[data-game-end-day]')?.disabled===false,null,{timeout:60000});
        await page.locator('.HandFixedActions button:enabled').first().click();
        await page.locator('[data-hand-return]:enabled').first().waitFor();
        assert.equal(await page.locator('.GameChoice[open]').count(),0);
        await page.locator('[data-hand-return]:enabled').first().click();
        await page.locator('[data-stock-acquire]').first().click();
        assert.equal(await page.locator('[data-hand-return]').count(),0);
        assert.equal(await page.locator('[data-stock-acquire]').count(),0);
        assert.deepEqual(errors,[]);
        console.log('review page: start, play, return and acquisition passed');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

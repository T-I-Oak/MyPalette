const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto((process.argv[2] || 'http://127.0.0.1:5174/') + '#dice');
    const search=page.getByRole('button',{name:'条件を含むダイスを探す',exact:true});await search.waitFor();
    const notice=page.locator('#dice-search-notice');assert.equal(await notice.isVisible(),false);
    const language=async lang=>page.evaluate(async lang=>{
        const source=await (await fetch('/src/dice/searchMessages.js')).text();
        const moduleUrl=source.match(/from\s*['"]([^'"]*\/i18n\.js[^'"]*)['"]/)[1];
        const {setLanguage}=await import(moduleUrl);setLanguage(lang);
    },lang);
    await search.click();assert.match(await notice.textContent(),/ダイスが1個あります/);
    await language('en');await page.waitForFunction(()=>document.querySelector('#dice-search-notice').textContent.includes('1 die contains'));
    assert.equal(await notice.locator('canvas').getAttribute('aria-label'),'Brush');
    await page.getByLabel('検索する条件',{exact:true}).selectOption('color');await search.click();
    assert.match(await notice.textContent(),/3 dice contain/);assert.equal(await notice.locator('canvas').getAttribute('aria-label'),'Orange');
    await page.screenshot({path:'tmp_review_face_notice_en.png'});
    await page.waitForFunction(()=>document.querySelector('#dice-search-notice').hidden,null,{timeout:5000});
    assert.equal(await page.locator('.DiceSearchBadge:not([hidden])').count(),0);
    await language('ja');assert.equal(await notice.isVisible(),false);
    await page.getByLabel('検索する条件',{exact:true}).selectOption('material');
    await page.getByRole('button',{name:'このダイスを削除',exact:true}).click();
    await search.click();assert.match(await notice.textContent(),/含むダイスはありません/);
    await language('en');assert.match(await notice.textContent(),/No dice contain/);
    await language('ko');assert.match(await notice.textContent(),/No dice contain/);
    await search.click();assert.equal(await notice.isVisible(),true);
    await page.waitForFunction(()=>document.querySelector('#dice-search-notice').hidden,null,{timeout:5000});
    await page.getByRole('button',{name:'検索表示をクリア',exact:true}).click();assert.equal(await notice.textContent(),'');
    await language('ja');assert.deepEqual(errors,[]);
    console.log(JSON.stringify({errors,checks:'fixed DOM id, Japanese/English, singular/plural/zero, localized condition label, language switch, fallback, synchronized expiry, clear'}));
    await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});


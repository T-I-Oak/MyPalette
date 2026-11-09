const {chromium}=require(process.env.MYPALETTE_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
    const browser=await chromium.launch({channel:process.env.MYPALETTE_BROWSER_CHANNEL || 'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:800,height:600}});
    await page.goto(process.argv[2] || 'http://127.0.0.1:3000/MyPalette/dev.html');await page.getByRole('button',{name:'カード設定を開く',exact:true}).waitFor();
    const samples=await page.evaluate(async()=>{
        await import('/MyPalette/src/dice/layout.css');await import('/MyPalette/src/dice/states.css');
        const {DiceGroup}=await import('/MyPalette/src/dice/DiceGroup.js');const {DiceScene}=await import('/MyPalette/src/dice/DiceScene.js');
        const notice=document.createElement('output');notice.id='dice-search-notice';notice.className='DiceSearchSummary';
        const view=document.createElement('div');view.className='DiceViewport';view.style.width='800px';view.style.height='500px';document.body.replaceChildren(notice,view);
        const group=new DiceGroup();group.add({id:'test',faces:Array.from({length:6},()=>({material:'brush',color:'orange'}))});
        const scene=new DiceScene(view,group,{dispose(){}},()=>{});let time=0;scene.faceSearch.now=()=>time;
        const frame=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        scene.showFaceSearch({material:'brush'});const values=[];
        for(const value of [0,100,200,2700,2850,3000]){
            time=value;await frame();const badge=view.querySelector('.DiceSearchBadge');
            values.push({time,notice:Number(notice.style.opacity),badge:Number(badge.style.opacity),noticeHidden:notice.hidden,badgeHidden:badge.hidden});
        }
        scene.showFaceSearch({material:'brush'});await frame();values.push({restart:Number(notice.style.opacity),hidden:notice.hidden});
        scene.showFaceSearch({material:'pastel'});time+=100;await frame();values.push({zero:Number(notice.style.opacity),text:notice.textContent});
        scene.dispose();values.push({disposed:notice.hidden});return values;
    });
    const expected=[0,.5,1,1,.5];for(let i=0;i<5;i++){assert.equal(samples[i].notice,expected[i]);assert.equal(samples[i].badge,expected[i]);assert.equal(samples[i].noticeHidden,false);assert.equal(samples[i].badgeHidden,false);}
    assert.equal(samples[5].noticeHidden,true);assert.equal(samples[5].badgeHidden,true);assert.equal(samples[6].restart,0);assert.equal(samples[6].hidden,false);
    assert.equal(samples[7].zero,.5);assert.match(samples[7].text,/ありません/);assert.equal(samples[8].disposed,true);
    console.log(JSON.stringify(samples));await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});

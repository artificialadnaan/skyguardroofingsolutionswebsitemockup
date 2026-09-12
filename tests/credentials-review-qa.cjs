// Isolated browser checks; no form submissions or third-party widget scripts.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {createServer}=require('../server');
(async()=>{
 let server;let origin=process.env.QA_ORIGIN;
 if(!origin){server=createServer({redirectHosts:false,token:''});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;}
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[],errors=[],widgetRequests=[];
 try{
  const page=await browser.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/chambermaster.*(?:Member\.js|widgets\/member)/i.test(r.url()))widgetRequests.push(r.url());});
  await page.route('**/*',r=>r.request().method()==='POST'?r.abort():r.continue());
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:width===390?844:1000});
   for(const route of ['/','/pages/about.html','/pages/credentials-certifications.html']){
    const r=await page.goto(origin+route,{waitUntil:'networkidle'});assert.equal(r.status(),200);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(await page.locator('img:not([alt])').count(),0);
    assert.doesNotMatch(await page.locator('body').innerText(),/Mercantile|76137|info@skyguardroofing\.com/);
    if(route==='/'){
      assert.equal(await page.locator('.credential-links a').count(),5);
      await page.locator('.credentials-strip').screenshot({path:`/private/tmp/skyguard-credentials-strip-${width}.png`});
    }
    if(route.includes('credentials-certifications')){
     const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').innerText())['@graph'];
     assert.equal(graph.filter(x=>x['@type']==='RoofingContractor').length,1);
     assert.equal(graph.filter(x=>x['@type']==='Service').length,0);
     assert.equal(await page.locator('.credential-card').count(),5);
     const badges=page.locator('.credential-badge');assert.equal(await badges.count(),3);
     for(let i=0;i<3;i++){
      const badge=badges.nth(i);await badge.scrollIntoViewIfNeeded();await badge.evaluate(img=>img.decode());
      assert.ok(await badge.getAttribute('alt'));assert.ok(await badge.evaluate(img=>img.naturalWidth>0));
      assert.match(await badge.evaluate(img=>img.currentSrc),/\/images\/responsive\/.+\.webp$/);
     }
     for(const [id,url]of [['fort-worth-chamber','https://business.fortworthchamber.com/list/member/skyguard-roofing-solutions-50563.htm'],['azle-chamber','https://business.azlechamber.com/list/member/skyguard-roofing-solutions-3520']]){
      assert.equal(await page.locator(`#${id} a`).first().getAttribute('href'),url);
      await page.locator(`#${id} a`).first().focus();assert.equal(await page.locator(`#${id} a`).first().evaluate(e=>e===document.activeElement),true);
     }
     await page.locator('#tamko').screenshot({path:`/private/tmp/skyguard-credentials-tamko-${width}.png`});
     await page.locator('#fort-worth-chamber').screenshot({path:`/private/tmp/skyguard-credentials-chamber-${width}.png`});
     await page.screenshot({path:`/private/tmp/skyguard-credentials-page-${width}.png`,fullPage:true});
    }
    results.push({route,width,status:r.status(),passed:true});
   }
  }
  assert.deepEqual(errors,[]);assert.deepEqual(widgetRequests,[]);
  const result={checkedAt:new Date().toISOString(),origin,passed:true,checks:results,loadedBadges:3,widgetRequests:0,browserErrors:0,leadSubmissions:0};
  fs.writeFileSync('/private/tmp/skyguard-credentials-browser-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});

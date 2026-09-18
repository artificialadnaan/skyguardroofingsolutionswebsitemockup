// Read-only browser checks; every form POST is blocked.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {createServer}=require('../server');
const business=require('../data/business.json');
(async()=>{
 let server,origin=process.env.QA_ORIGIN;
 if(!origin){server=createServer({redirectHosts:false,token:''});await new Promise(r=>server.listen(0,'127.0.0.1',r));origin=`http://127.0.0.1:${server.address().port}`;}
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const checks=[],errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().method()==='POST'?r.abort():r.continue());
  for(const width of [390,1440]){
   await page.setViewportSize({width,height:width===390?844:1000});
   for(const route of ['/pages/roof-replacement.html','/pages/inspections.html','/pages/credentials-certifications.html','/pages/blog/fort-worth-roofing-materials.html','/pages/blog/plano-roofing-contractor-guide.html','/pages/blog/euless-commercial-roof-maintenance.html']){
    const response=await page.goto(origin+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);
    assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('img:not([alt])').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),business.origin+route);
    const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').innerText())['@graph'];
    const org=graph.filter(x=>x['@type']==='RoofingContractor');assert.equal(org.length,1);
    assert.deepEqual(org[0].openingHoursSpecification,business.openingHoursSpecification);
    assert.equal(org[0].address.streetAddress,business.streetAddress);
    assert.ok((await page.locator('footer').innerText()).includes(business.hours));
    if(route==='/pages/roof-replacement.html'){
     assert.match(await page.locator('h1').innerText(),/Roof Replacement in Fort Worth/);
     assert.ok(await page.locator('.page-hero a[href="tel:+16823305088"]').count());
     assert.ok(await page.locator('.page-hero a[href="/pages/inspections.html#request-inspection"]').count());
     assert.ok(await page.locator('main a[href*="fortworthtexas.gov"]').count());
     await page.screenshot({path:`/private/tmp/skyguard-round2-replacement-${width}.png`});
     await page.locator('main').screenshot({path:`/private/tmp/skyguard-round2-replacement-full-${width}.png`});
    }
    if(route.includes('inspections'))assert.ok((await page.locator('.contact-info-card').innerText()).includes(business.hours));
    if(route.includes('credentials'))assert.match(await page.locator('#tamko').innerText(),/172630/);
    checks.push({route,width,status:response.status(),passed:true});
   }
  }
  assert.deepEqual(errors,[]);
  const result={checkedAt:new Date().toISOString(),origin,passed:true,checks,browserErrors:0,leadSubmissions:0};
  fs.writeFileSync('/private/tmp/skyguard-round2-browser-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,pageViewportChecks:checks.length,browserErrors:0,leadSubmissions:0}));
 }finally{await browser.close();if(server)await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});

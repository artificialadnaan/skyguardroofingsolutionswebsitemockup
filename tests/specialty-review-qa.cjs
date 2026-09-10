// Browser verification only; all POST requests are blocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4173';
const canonical = require('../data/business.json').origin;
const routes = ['/', '/pages/stone-coated-steel-roofing-fort-worth.html', '/pages/metal-roofing-fort-worth.html', '/pages/storm-damage.html'];
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});
  const results=[];
  try {
    const page = await browser.newPage();
    const errors=[];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', r => r.request().method()==='POST' ? r.abort() : r.continue());
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:width===390?844:1000});
      for (const route of routes) {
        const response=await page.goto(origin+route,{waitUntil:'networkidle'});
        assert.equal(response.status(),200);
        assert.equal(await page.locator('h1').count(),1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),canonical+route);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' horizontal overflow');
        assert.equal(await page.locator('img:not([alt])').count(),0);
        const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').innerText())['@graph'];
        assert.equal(graph.filter(x=>x['@type']==='RoofingContractor').length,1);
        if(route!=='/') {
          assert.equal(graph.filter(x=>x['@type']==='Service').length,1);
          const hero=page.locator('.page-hero');
          assert.ok(await hero.locator('a[href="tel:+16823305088"]').count());
          assert.ok(await hero.locator('a[href="/pages/inspections.html#request-inspection"]').count());
          assert.ok(await page.locator('main .cta-section a[href="/pages/inspections.html#request-inspection"]').count());
        }
        const name=route==='/'?'home':route.split('/').pop().replace('.html','');
        await page.screenshot({path:`/private/tmp/skyguard-specialty-${name}-${width}.png`});
        results.push({route,width,status:response.status(),overflow:false,missingAlt:0});
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.locator('.nav-toggle').click();
    await page.locator('.has-dropdown .submenu-toggle').click();
    assert.equal(await page.locator('.has-dropdown .submenu-toggle').getAttribute('aria-expanded'),'true');
    await page.locator('.dropdown-menu a[href="/pages/stone-coated-steel-roofing-fort-worth.html"]').click();
    await page.waitForURL('**/pages/stone-coated-steel-roofing-fort-worth.html');
    assert.match(await page.locator('h1').innerText(),/Stone-Coated Steel Roofing/);
    assert.deepEqual(errors,[]);
    fs.writeFileSync('/private/tmp/skyguard-specialty-browser-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),origin,passed:true,results,mobileSpecialtyNavigation:true,browserErrors:errors,leadSubmissions:0},null,2));
    console.log(JSON.stringify({passed:true,pageViewportChecks:results.length,mobileSpecialtyNavigation:true,browserErrors:0,leadSubmissions:0}));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

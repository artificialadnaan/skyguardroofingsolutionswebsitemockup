// Run against tests/preview-server.cjs only: never submit these fixtures to production.
const assert=require('node:assert/strict');const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[],provider=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/google-analytics|googletagmanager/.test(r.url()))provider.push(r.url());});
 async function open(path){await page.goto('http://127.0.0.1:4173'+path,{waitUntil:'domcontentloaded'});await page.locator('h1').waitFor();}
 async function shot(name){await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}window.scrollTo(0,0);});await page.screenshot({path:'/private/tmp/skyguard-'+name+'.png',fullPage:true,timeout:15000});}
 await open('/');assert.match(await page.locator('h1').innerText(),/Dallas–Fort Worth/);await shot('home-desktop-final');
 for(const route of ['/pages/roofing-dallas.html','/pages/roofing-fort-worth.html','/pages/roof-repair.html','/pages/blog/grand-prairie-roofing-permits.html']){
await open(route);assert.equal(await page.locator('h1').count(),1);
 }
 await page.setViewportSize({width:390,height:844});await open('/');await shot('home-mobile');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'mobile overflow');
 const toggle=page.locator('.nav-toggle');await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
 await page.getByRole('button',{name:/Show Services.*links/}).click();assert.equal(await page.locator('.dropdown-menu').isVisible(),true);
 await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(e=>e===document.activeElement),true);
 await open('/pages/inspections.html?utm_source=google&utm_campaign=storm2026&utm_term=private@example.com');await shot('inspection-mobile');
 await page.locator('[name="name"]').fill('Local QA Test');await page.locator('[name="phone"]').fill('5551234567');await page.locator('[name="email"]').fill('qa@example.test');
 await page.locator('[name="city"]').fill('Fort Worth');await page.locator('[name="message"]').fill('Local mock only');
 const before=fs.existsSync('/private/tmp/skyguard-form-qa.json')?JSON.parse(fs.readFileSync('/private/tmp/skyguard-form-qa.json')).length:0;
 await page.locator('#contact-form').evaluate(f=>{f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));f.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});
 await page.getByRole('status').filter({hasText:'your request was received'}).waitFor();
 const requests=JSON.parse(fs.readFileSync('/private/tmp/skyguard-form-qa.json'));assert.equal(requests.length,before+1,'duplicate submission guard');assert.match(requests.at(-1).message,/Roof inspection request/);assert.match(requests.at(-1).message,/source: google/);assert.doesNotMatch(requests.at(-1).message,/private@example/);
 await page.locator('[name="name"]').fill('Local QA Test');await page.locator('[name="phone"]').fill('5551234567');await page.locator('[name="email"]').fill('qa@example.test');await page.locator('[name="message"]').fill('fail-test');await page.locator('#contact-form button[type=submit]').click();await page.getByRole('status').filter({hasText:'could not send'}).waitFor();assert.equal(await page.locator('[name="name"]').inputValue(),'Local QA Test');
 await open('/pages/careers.html');await page.locator('[name="name"]').fill('Local QA Test');await page.locator('[name="phone"]').fill('5551234567');await page.locator('[name="email"]').fill('qa@example.test');
 for(const select of await page.locator('select[required]').all()){const value=await select.locator('option').evaluateAll(nodes=>nodes.find(n=>n.value)?.value);if(value)await select.selectOption(value);}
 await page.locator('#careers-form button[type=submit]').click();await page.getByRole('status').filter({hasText:'Thanks for applying'}).waitFor();
 assert.equal(provider.length,0,'disabled analytics makes no requests');assert.deepEqual(errors,[],'no browser errors');
 await open('/pages/gallery.html');await page.locator('.gallery-item').first().press('Enter');assert.equal(await page.locator('.lightbox').getAttribute('aria-hidden'),'false');await page.keyboard.press('Escape');assert.equal(await page.locator('.lightbox').getAttribute('aria-hidden'),'true');
 console.log(JSON.stringify({desktopAndMobile:true,overflow:false,menuAndEscape:true,inspectionSuccess:true,duplicateGuard:true,upstreamFailureRetainsFields:true,careersSuccess:true,galleryKeyboard:true,analyticsRequests:provider.length,browserErrors:errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

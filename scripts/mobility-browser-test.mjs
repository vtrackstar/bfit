import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.BFIT_TEST_URL||'http://127.0.0.1:8080';
const workout=base+'/guides/build-your-mobility/';
await page.goto(workout);
await page.locator('#setup select[name=mode]').selectOption('targeted');
await page.locator('#setup select[name=area]').selectOption('hips');
await page.locator('#setup select[name=movement]').selectOption('hip-in');
await page.locator('#setup select[name=side]').selectOption('left');
await page.locator('#setup button[type=submit]').click();
assert.equal(await page.locator('#cards h3').count(),1);
assert.match(await page.locator('#cards h3').innerText(),/left/);
await page.locator('#cards select').selectOption('pain');
await page.locator('#cards button[type=submit]').click();
assert.match(await page.locator('#cards').innerText(),/Paused due to reported symptoms/);
await page.reload();
assert.match(await page.locator('#cards').innerText(),/Paused due to reported symptoms/);
assert.equal(await page.locator('#setup select[name=movement]').inputValue(),'hip-in');
page.on('dialog',d=>d.accept());
await page.locator('#setup select[name=area]').selectOption('shoulders');
await page.locator('#setup button[type=submit]').click();
await page.locator('#setup select[name=area]').selectOption('hips');
await page.locator('#setup select[name=movement]').selectOption('hip-in');
await page.locator('#setup button[type=submit]').click();
assert.match(await page.locator('#cards').innerText(),/Paused due to reported symptoms/);
await page.locator('#setup select[name=mode]').selectOption('complement');
await page.locator('#setup select[name=movement]').selectOption('hip-in');
await page.locator('input[name=existing][value=hip-in]').check();
await page.locator('#setup button[type=submit]').click();
assert.equal(await page.locator('#cards h3').count(),0);
assert.match(await page.locator('#archive').textContent(),/paused due to symptoms/);
await page.locator('header a[href="../mobility/"]').click();
await page.waitForURL('**/guides/mobility/');
assert.equal(await page.locator('#methods').count(),1);
await page.locator('a[href="../gamer-fit/"]').first().click();
await page.waitForURL('**/guides/gamer-fit/');
assert.equal(await page.locator('a[href="../build-your-mobility/"]').count()>0,true);
await page.goto(workout);
assert.match(await page.locator('#archive').textContent(),/paused due to symptoms/);
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile horizontal overflow');
assert.deepEqual(errors,[]);
// Verify actual layout and first-time onboarding at three widths.
for(const width of [320,390,1366]){
 const fresh=await browser.newPage({viewport:{width,height:844}});
 const faults=[];fresh.on('pageerror',e=>faults.push(e.message));
 await fresh.route('**/*',route=>route.request().url().startsWith(base)||route.request().url().startsWith('data:')?route.continue():route.abort());
 for(const slug of ['mobility','build-your-mobility']){
  const response=await fresh.goto(base+'/guides/'+slug+'/');
  assert.equal(response.status(),200);
  assert.ok(await fresh.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),slug+' overflow at '+width);
  assert.equal(await fresh.locator('h1').count(),1);
  if(slug==='build-your-mobility'){
   assert.equal(await fresh.locator('#target-options').isVisible(),false);
   assert.equal(await fresh.locator('#existing-options').isVisible(),false);
   await fresh.locator('#setup select[name=minutes]').selectOption('5');
   await fresh.locator('#setup button[type=submit]').click();
   assert.ok(await fresh.locator('#cards article').count()>0);
   assert.ok(await fresh.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'workout cards overflow at '+width);
  }
 }
 assert.deepEqual(faults,[]);
 await fresh.close();
}
// Integrated hub and library checks, deliberately offline from external services.
const integrated=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const integratedErrors=[]; integrated.on('pageerror',e=>integratedErrors.push(e.message));
await integrated.route('**/*',route=>route.request().url().startsWith(base)||route.request().url().startsWith('data:')?route.continue():route.abort());
for(const width of [320,390,1366]){
 await integrated.setViewportSize({width,height:844});
 await integrated.goto(base+'/');
 assert.equal(await integrated.locator('#guides > .cards > .card').count(),7);
 assert.equal(await integrated.locator('#more-training-plans .cards .card').count(),4);
 assert.equal(await integrated.locator('#guides > .cards > .card').first().getAttribute('href'),'guides/foundation/');
 assert.ok(await integrated.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'hub overflow at '+width);
 if(width===1366)assert.equal(await integrated.locator('#guides > .cards > .card--featured').evaluate(el=>getComputedStyle(el).gridColumnEnd),'-1');
 await integrated.locator('#guides > .cards a[href="guides/mobility/"]').click();
 await integrated.waitForURL('**/guides/mobility/');
 assert.ok(await integrated.locator('a[href="../build-your-mobility/"]').count()>0);
 await integrated.goto(base+'/');
 await integrated.locator('#more-training-plans a[href="guides/build-your-mobility/"]').click();
 await integrated.waitForURL('**/guides/build-your-mobility/');
}
await integrated.goto(base+'/exercise-library/#BFIT-00229');
await integrated.waitForFunction(()=>document.querySelector('#feed-status').textContent.startsWith('Catalog checked'));
assert.equal(await integrated.locator('#cards article').count(),231);
await integrated.route('**/exercise-library/catalog.json',route=>route.abort());
await integrated.reload();
await integrated.locator('#BFIT-00229').waitFor();
assert.equal(await integrated.locator('#cards article').count(),231);
await integrated.waitForFunction(()=>document.querySelector('#feed-status').textContent.includes('Live updates are unavailable'));
assert.ok(await integrated.locator('#BFIT-00229').isVisible());
await integrated.locator('#search').fill('nonexistent-exercise-zzzz');
assert.ok(await integrated.locator('#empty').isVisible());
await integrated.locator('#reset').click();
assert.equal(await integrated.locator('#cards article').count(),231);
await integrated.locator('#search').fill('Seated Chest Rotation');
assert.equal(await integrated.locator('#cards article').count(),1);
assert.equal(await integrated.locator('#cards article').getAttribute('id'),'BFIT-00230');
await integrated.locator('#reset').click();
await integrated.locator('#domain').selectOption('Mobility & flexibility');
assert.ok(await integrated.locator('#cards article').count()>0);
assert.ok(await integrated.locator('#BFIT-00233').isVisible());
await integrated.locator('#level').selectOption('Beginner');
assert.ok(await integrated.locator('#BFIT-00233').isVisible());
await integrated.locator('#reset').click();
const {movements}=await import('../guides/build-your-mobility/engine.mjs');
await integrated.goto(workout);
await integrated.locator('#setup select[name=mode]').selectOption('targeted');
await integrated.locator('#setup input[name=strength]').check();
for(const m of movements){
 await integrated.locator('#setup select[name=area]').selectOption(m.area);
 await integrated.locator('#setup select[name=movement]').selectOption(m.key);
 await integrated.locator('#setup select[name=side]').selectOption('left');
 await integrated.locator('#setup select[name=minutes]').selectOption('25');
 await integrated.locator('#setup button[type=submit]').click();
 const link=integrated.locator('#cards a[href^="../../exercise-library/#"]').first();
 assert.equal(await link.count(),1,'Missing library link for '+m.key);
 const href=await link.getAttribute('href');
 const id=href.split('#')[1];
 const lib=await browser.newPage({viewport:{width:320,height:844},reducedMotion:'reduce'});
 await lib.route('**/*',route=>route.request().url().startsWith(base)||route.request().url().startsWith('data:')?route.continue():route.abort());
 await lib.goto(base+'/exercise-library/#'+id);
 await lib.locator('#'+id).waitFor();
 assert.ok(await lib.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'library overflow '+id);
 await lib.close();
}
assert.deepEqual(integratedErrors,[]);
await integrated.close();
console.log('PASS hub card destinations, offline library search/filter/deep links and 18 workout references');
console.log('Mobility browser journey and responsive layout passed');
} finally {await browser.close();}

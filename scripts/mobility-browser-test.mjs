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
console.log('Mobility browser journey and responsive layout passed');
} finally {await browser.close();}

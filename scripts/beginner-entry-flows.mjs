// First-visit checks of the BFit guide paths and consistent Hub navigation.
// Uses fresh temporary local-browser contexts; no coaching submissions or user records.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const host='http://127.0.0.1:8791';
const server=spawn('python3',['-m','http.server','8791','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
let browser;
const errors=[];
async function ready(){for(let i=0;i<60;i++){try{if((await fetch(host+'/')).ok)return}catch{}await sleep(200)}throw Error('Local site server unavailable')}
async function check(name,fn,width=390){
 const page=await browser.newPage({viewport:{width,height:844}});
 const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
 try {await fn(page);assert.deepEqual(pageErrors,[]);console.log('PASS '+name)}
 catch(e){errors.push(name+': '+e.message);console.error('FAIL '+name+': '+e.message)}
 finally{await page.close()}
}
const paths=['foundation','athleticism','gamer-fit','run-strong','50-plus'];
try{
 await ready();browser=await chromium.launch({headless:true});
 await check('Hub shows five distinct guide choices and a separate exercise library',async p=>{
  await p.goto(host+'/',{waitUntil:'domcontentloaded'});
  for(const guide of paths)assert.equal(await p.locator('a.card[href="guides/'+guide+'/"]').count(),1);
  assert.match(await p.locator('.library-cta').innerText(),/Exercise Library/i);
 });
 await check('Every guide exposes one clearly labeled Hub return',async p=>{
  for(const guide of paths){
   await p.goto(host+'/guides/'+guide+'/',{waitUntil:'domcontentloaded'});
   const link=p.locator('header .bfit-hub-link, .topbar .bfit-hub-link').first();
   assert.equal(await link.count(),1,guide+': missing header Hub link');
   assert.equal((await link.innerText()).trim(),'BFit Hub',guide+': wrong Hub label');
   assert.equal(await link.getAttribute('href'),'https://vtrackstar.github.io/bfit/');
   assert.ok((await link.boundingBox())?.height>=44,guide+': Hub touch target under 44px');
  }
 });
 await check('Reader can reach all guides halfway through Foundation and Athleticism on a narrow phone',async p=>{
  await p.setViewportSize({width:320,height:700});
  for(const guide of ['foundation','athleticism']){
   await p.goto(host+'/guides/'+guide+'/',{waitUntil:'domcontentloaded'});
   if(guide==='athleticism'){
    await p.locator('.home-three [data-action="nav"][data-to="build"]').click();
   }
   await p.evaluate(()=>{
    window.scrollTo(0,800);
    const main=document.querySelector('#main, #app');
    if(main) main.scrollTop=800;
   });
   const link=p.locator('.bfit-guide-switch');
   assert.equal(await link.isVisible(),true,guide+': All guides link should be visible');
   assert.match(await link.innerText(),/All guides/);
   assert.equal(await link.getAttribute('href'),'https://vtrackstar.github.io/bfit/');
   assert.equal(await link.evaluate(el=>getComputedStyle(el).position),'fixed');
   const box=await link.boundingBox();
   assert.ok(box&&box.height>=44&&box.x>=0&&box.x+box.width<=321&&box.y>=0&&box.y+box.height<=701,guide+': link outside phone viewport');
   if(guide==='athleticism'&&await p.locator('#floating-back').isVisible()){
    const back=await p.locator('#floating-back').boundingBox();
    assert.ok(!back || back.x+back.width<=box.x-5, 'Athleticism local Back and All guides must not overlap');
   }
  }
 },320);
 await check('Gamer Fit and Run Strong preserve Hub access while reading',async p=>{
  for(const guide of ['gamer-fit','run-strong']){
   await p.goto(host+'/guides/'+guide+'/',{waitUntil:'domcontentloaded'});
   const header=p.locator('.topbar').first();
   assert.equal(await header.evaluate(el=>getComputedStyle(el).position),'sticky',guide+': top navigation should remain visible');
   await p.evaluate(()=>window.scrollTo(0,1200));
   const link=p.locator('.topbar .bfit-hub-link');
   assert.equal(await link.isVisible(),true,guide+': Hub link should remain visible');
  }
 });
 await check('Athleticism advises new athletes before the schedule choices',async p=>{
  await p.goto(host+'/guides/athleticism/',{waitUntil:'domcontentloaded'});
  await p.locator('.home-three [data-action="nav"][data-to="build"]').click();
  const note=p.locator('#app .bfit-readiness');
  assert.equal(await note.isVisible(),true);
  assert.match(await note.innerText(),/New to sprinting or jumping/);
  assert.match(await note.innerText(),/Starter/);
  await note.locator('button[data-action="lesson"][data-lesson="getting"]').click();
  assert.match(await p.locator('#app').innerText(),/Your first workout, start to finish/);
 });
 await check('Gamer Fit makes its short first workout easy to reach',async p=>{
  await p.goto(host+'/guides/gamer-fit/',{waitUntil:'domcontentloaded'});
  const start=p.locator('#guide-entry-choices a[href="#first-workout"]');
  assert.equal(await start.count(),1);
  await start.click();
  assert.match(await p.locator('#first-workout').innerText(),/Start here: do this workout today/);
  assert.match(await p.locator('#first-workout').innerText(),/one set/i);
 });
 await check('Coaching comparison opens without hiding the training example',async p=>{
  await p.goto(host+'/',{waitUntil:'domcontentloaded'});
  const entry = p.getByRole('link', {name: 'Explore one-on-one coaching'});
  assert.equal(await entry.isVisible(), true);
  await p.goto(host + new URL(await entry.getAttribute('href')).pathname.replace('/bfit', ''));
  const comparison=p.locator('details.coaching-compare');
  assert.equal(await comparison.getAttribute('open'),null);
  assert.equal(await comparison.locator('.coaching-table').isVisible(),false);
  assert.equal(await p.locator('.sample-checkin').isVisible(),true);
  await comparison.locator('summary').click();
  assert.equal(await comparison.locator('.coaching-table').isVisible(),true);
  assert.match(await comparison.innerText(),/Premium/);
  assert.match(await comparison.innerText(),/Elite/);
 });
 await check('Hub nutrition links open the requested disclosure',async p=>{
  await p.goto(host+'/#nutrition-coaching',{waitUntil:'load'});
  await p.locator('#nutrition-coaching[open]').waitFor({state:'visible'});
  await p.locator('#nutrition-coaching a[href="#nutrition-qualifications"]').click();
  await p.locator('#nutrition-qualifications[open]').waitFor({state:'visible'});
  assert.match(await p.locator('#nutrition-qualifications').innerText(),/RD and RDN are equivalent/);
 });
 await check('Gamer Fit keeps secondary reading paths behind a working disclosure',async p=>{
  await p.goto(host+'/guides/gamer-fit/',{waitUntil:'domcontentloaded'});
  assert.equal(await p.locator('.guide-entry-grid > a[data-start-path]:visible').count(),2);
  const topics=p.locator('.bfit-topic-browser');
  assert.equal(await topics.locator('[data-start-path="book1"]').isVisible(),false);
  await topics.locator('summary').click();
  for(const book of ['book1','book2','book3'])assert.equal(await topics.locator('[data-start-path="'+book+'"]').isVisible(),true);
  await topics.locator('[data-start-path="book1"]').click();
  assert.equal(await p.locator('body').getAttribute('data-focus-path'),'book1');
 });
 await check('Nutrition coaching link opens the coaching chapter and dashboard',async p=>{
  await p.goto(host+'/guides/foundation/#nutrition-coaching',{waitUntil:'load'});
  assert.equal(await p.locator('#nutrition-coaching').isVisible(),true);
  assert.equal(await p.locator('#nutrition-coaching a[href=\"../../#nutrition-coaching\"]').count(),1);
  await p.getByText('Explore the coaching dashboard',{exact:true}).click();
  assert.equal(await p.locator('#demoRows').isVisible(),true);
 });
 await check('Run Strong first session is separate from faster-running examples',async p=>{
  await p.goto(host+'/guides/run-strong/',{waitUntil:'domcontentloaded'});
  assert.match(await p.locator('#first-run').innerText(),/20 minutes/);
  assert.match(await p.locator('#first-run').innerText(),/30 sec easy run/i);
  assert.match(await p.locator('#ten-minute-runner').innerText(),/10 minutes/i);
 });

 await check('Gamer Fit separates a movement break from a training session',async p=>{
  await p.goto(host+'/guides/gamer-fit/',{waitUntil:'load'});
  await p.locator('.bfit-start-options a[href="#ch14-topic-3"]').click();
  await p.locator('#ch14-topic-3').waitFor({state:'visible'});
  await p.locator('a[href="#guide-entry-choices"]').filter({hasText:'Choose another movement break'}).click();
  await p.locator('.bfit-start-options a[href="#first-workout"]').click();
  await p.locator('#first-workout').waitFor({state:'visible'});
  assert.match(await p.locator('#first-workout').innerText(),/15–25 MINUTES/);
 });
 await check('Run Strong starting routes lead to existing sessions',async p=>{
  await p.goto(host+'/guides/run-strong/',{waitUntil:'load'});
  assert.equal(await p.locator('.bfit-running-start a').count(),2);
  await p.locator('.bfit-running-start a[href="#first-run"]').click();
  await p.locator('#first-run').waitFor({state:'visible'});
  assert.match(await p.locator('#first-run').innerText(),/full sentences/);
 });
} catch(e){errors.push('runner: '+e.message)}
finally{if(browser)await browser.close();server.kill()}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}
else console.log('PASS first-time routes, Hub navigation, readiness, and beginner workout entry points');

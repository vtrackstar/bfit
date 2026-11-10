// BFit guide interface regression checks for design/navigation refinements.
// Runs without changing user data; the browser is a fresh local test profile.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
const host='http://127.0.0.1:8789';
const server=spawn('python3',['-m','http.server','8789','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=t=>new Promise(r=>setTimeout(r,t));
let browser,errors=[];
async function ready(){for(let i=0;i<60;i++){try{if((await fetch(host+'/')).ok)return;}catch{}await sleep(200);}throw Error('Local server not available');}
async function check(name,fn) {
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true});
 const runtime=[];page.on('pageerror',e=>runtime.push(e.message));
 try{await fn(page);assert.deepEqual(runtime,[]);console.log('PASS '+name);}
 catch(e){errors.push(name+': '+e.message);console.error('FAIL '+name+': '+e.message);}
 finally{await page.close();}
}
try {
 await ready();browser=await chromium.launch({headless:true});
 await check('Foundation Options and reset confirmation stay usable',async page=>{
   await page.goto(host+'/guides/foundation/',{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('#reset').count(),1);
   assert.equal(await page.locator('#reset').isVisible(),false);
   await page.locator('.header-options summary').click();
   assert.equal(await page.locator('#reset').isVisible(),true);
   await page.locator('#reset').click();
   assert.equal(await page.locator('#resetPanel').isVisible(),true);
   await page.locator('#keepChoices').click();
   assert.equal(await page.locator('#resetPanel').isVisible(),false);
 });
 await check('Athleticism navigation keeps lessons and workouts accessible',async page=>{
   await page.goto(host+'/guides/athleticism/',{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('.home-three .path-choice').count(),3);
   assert.equal(await page.locator('header.top nav > button[data-to="learn"]').isVisible(),false);
   await page.locator('.nav-more summary').click();
   const learn=page.locator('.nav-more-links button[data-to="learn"]');
   assert.equal(await learn.isVisible(),true);
   await learn.click();
   assert.ok((await page.locator('#app').innerText()).length>150);
 });
 await check('Athleticism coaching page links to public Lounge and both coaching tiers',async page=>{
   await page.goto(host+'/guides/athleticism/',{waitUntil:'domcontentloaded'});
   await page.locator('.nav-more summary').click();
   await page.locator('.nav-more-links button[data-to="coaching"]').click();
   const content=await page.locator('#app').innerText();
   assert.match(content,/Premium/);
   assert.match(content,/Elite/);
   assert.equal(await page.locator('#app a[href="https://discord.gg/9yfqjvZPg"]').count(),1);
   assert.equal(await page.locator('#app a[href="https://vtrackstar.github.io/bfit/coaching/"]').count(),1);
 });
 await check('Gamer Fit has a compact header and a functional contents drawer',async page=>{
   await page.goto(host+'/guides/gamer-fit/',{waitUntil:'domcontentloaded'});
   assert.equal((await page.locator('.topbar-title').innerText()).trim(),'Gamer Fit');
   assert.equal(await page.locator('.topbar-foundation').count(),0);
   assert.equal(await page.locator('.menu-toggle').isVisible(),true);
   await page.locator('.menu-toggle').click();
   assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
   assert.equal(await page.locator('#sidebar').isVisible(),true);
 });
 await check('Run Strong secondary menu exposes print and offline guide',async page=>{
   await page.goto(host+'/guides/run-strong/',{waitUntil:'domcontentloaded'});
   assert.equal(await page.locator('.top-tools summary').isVisible(),true);
   assert.equal(await page.locator('a[download="BFit_Run_Strong_Guide.html"]').isVisible(),false);
   await page.locator('.top-tools summary').click();
   assert.equal(await page.locator('a[download="BFit_Run_Strong_Guide.html"]').isVisible(),true);
   assert.equal(await page.locator('#print-guide').isVisible(),true);
   assert.equal(await page.locator('a[href="#first-run"]').count()>0,true);
 });
} catch(e){errors.push('Runner: '+e.message);}
finally {if(browser)await browser.close();server.kill();}
if(errors.length){console.error('Guide UI regression failures: '+errors.join(' | '));process.exitCode=1;}
else console.log('PASS guide interface refinements: Foundation, Athleticism, Gamer Fit, Run Strong.');

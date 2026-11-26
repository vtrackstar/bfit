// Real Chromium checks for the development 5K guide. No live site or user data.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
const host='http://127.0.0.1:8795',url=host+'/milestones/first-5k/',key='bfit-first-5k-dev-v1',folder='qa-screenshots/first-5k';
await fs.mkdir(folder,{recursive:true});
const server=spawn('python3',['-m','http.server','8795','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let browser,failures=[],results=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS '+name);}catch(e){failures.push(name+': '+e.message);results.push({name,pass:false,error:e.message});console.error('FAIL '+name+': '+e.message);}}
async function pageFor(viewport,fn){const context=await browser.newContext({viewport,acceptDownloads:true});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));try{await fn(page,context);assert.deepEqual(errors,[],'Uncaught browser errors');}finally{await context.close();}}
const state=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);
async function load(page){const response=await page.goto(url,{waitUntil:'load'});assert.equal(response.status(),200);}
async function intake(page){await page.locator('#walk').selectOption('30');await page.locator('#ready').check();await page.locator('#intake button[type=submit],#intake button:not([type])').last().click();await page.locator('#dashboard').waitFor({state:'visible'});}
async function prescribe(page){await page.locator('#recovery').selectOption('normal');await page.locator('#symptoms').selectOption('none');await page.locator('#pre button').click();await page.locator('#workout').waitFor({state:'visible'});}
async function overflow(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=2,'Unexpected horizontal overflow');}
async function axe(page,label){const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();await fs.writeFile(folder+'/axe-'+label+'.json',JSON.stringify(a.violations,null,2));assert.equal(a.violations.length,0,a.violations.map(v=>v.id+': '+v.nodes.map(n=>n.target.join(' ')).join(', ')).join('\n'));}
try{
 let ready=false;for(let i=0;i<50;i++){try{if((await fetch(url)).ok){ready=true;break;}}catch{}await sleep(200);}assert.ok(ready,'Local server unavailable');browser=await chromium.launch({headless:true});
 for(const width of [320,390,768,1366]){
 await check('Layout and navigation '+width+'px',()=>pageFor({width,height:900},async page=>{
 await load(page);await overflow(page);assert.equal(await page.locator('h1').count(),1);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#startHere');
 await page.locator('.jump a[href="#learn"]').click();assert.equal(new URL(page.url()).hash,'#learn');await page.locator('#learn details summary').first().click();await overflow(page);
 await page.locator('#historyOptions > summary').click();await overflow(page);await page.screenshot({path:folder+'/layout-'+width+'.png',fullPage:true});await page.locator('#historyOptions > summary').click();await intake(page);await prescribe(page);await overflow(page);await page.screenshot({path:folder+'/workout-'+width+'.png',fullPage:true});
 }));}
 await check('Native required fields and accessibility',()=>pageFor({width:390,height:844},async page=>{await load(page);await page.locator('#intake button').last().click();assert.equal(await page.locator('#ready').evaluate(el=>el.validity.valueMissing),true);assert.equal(await state(page),null);await axe(page,'intake');await intake(page);await prescribe(page);await axe(page,'workout');}));
 await check('Timer, native reload, cancellation and recovery',()=>pageFor({width:390,height:844},async page=>{
 await load(page);await intake(page);await prescribe(page);await page.locator('#discard').click();assert.equal((await state(page)).active,null);await prescribe(page);
 await page.clock.install();await page.locator('#start').click();await page.clock.runFor(10000);await page.locator('#pause').click();let s=await state(page);assert.ok(s.active.actual[0]>=9&&s.active.actual[0]<=12);const saved=s.active.actual[0];await page.clock.runFor(20000);assert.equal((await state(page)).active.actual[0],saved);
 await page.reload();assert.equal((await state(page)).active.actual[0],saved);await page.locator('#start').click();await page.clock.runFor(1200000);await page.locator('#logging').waitFor({state:'visible'});s=await state(page);assert.equal(s.active.finished,true);await page.locator('#effort').selectOption('comfortable');await page.locator('#postSymptoms').selectOption('none');await page.locator('#done').check();await page.locator('#logForm button[type=submit],#logForm button:not([type])').last().click();await page.locator('#pending').waitFor({state:'visible'});
 await page.reload();await page.locator('#nextRecovery').selectOption('normal');await page.locator('#nextSymptoms').selectOption('none');await page.locator('#recoverForm button').click();assert.ok((await state(page)).pending,'Same day recovery must be blocked');await page.clock.setSystemTime(new Date(Date.now()+86400000));await page.locator('#recoverForm button').click();assert.equal((await state(page)).state.history.length,1);assert.equal((await state(page)).pending,null);
 }));
 await check('Actual JSON download and file import',()=>pageFor({width:1366,height:900},async(page,context)=>{
 await load(page);await intake(page);const pending=page.waitForEvent('download');await page.locator('#export').click();const download=await pending;assert.equal(download.suggestedFilename(),'bfit-first-5k-progress.json');const buffer=await fs.readFile(await download.path());const saved=JSON.parse(buffer);assert.equal(saved.state.goal,'runwalk');await page.evaluate(k=>localStorage.removeItem(k),key);await page.reload();await page.locator('#importFile').setInputFiles({name:'progress.json',mimeType:'application/json',buffer});await page.locator('#import').click();await page.locator('#dashboard').waitFor({state:'visible'});assert.deepEqual(await state(page),saved);
 await page.locator('#replaceConfirm').check();await page.locator('#importFile').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{invalid')});await page.locator('#import').click();await page.waitForTimeout(150);assert.deepEqual(await state(page),saved);
 }));
 await check('Certificate popup and real PDF rendering',()=>pageFor({width:1366,height:900},async(page,context)=>{
 await load(page);await intake(page);await page.evaluate(k=>{const x=JSON.parse(localStorage.getItem(k)),day=Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000)-1;const r={day,lane:'practice',prescriptionId:'test-fixture',runSec:2100,mainSec:2100,totalSec:2580,longestBout:2100,fasterSec:0,mainDistanceM:5000,runningDistanceM:5000,continuousDistanceM:5000,strategy:'continuous',completed:true,check:{effort:'comfortable',recovery:'normal',symptoms:'none'},comparable:true};Object.assign(x.state,{history:[r],lastDay:day,completed:true,completion:r});localStorage.setItem(k,JSON.stringify(x));},key);
 await page.reload();await page.locator('#celebration').waitFor({state:'visible'});await page.locator('#certificateName').fill('Test Runner');await page.evaluate(()=>{const open=window.open.bind(window);window.open=(...args)=>{const w=open(...args);if(w)w.print=()=>{w.__printRequested=true;};return w;};});const pending=page.waitForEvent('popup');await page.locator('#certificate').click();const popup=await pending;await popup.locator('h2').waitFor();assert.match(await popup.locator('body').innerText(),/Test Runner/);assert.match(await popup.locator('body').innerText(),/35:00/);assert.equal(await popup.evaluate(()=>window.__printRequested),true);await popup.pdf({path:folder+'/certificate.pdf',format:'Letter',printBackground:true});assert.ok((await fs.stat(folder+'/certificate.pdf')).size>1000);await popup.screenshot({path:folder+'/certificate.png'});await popup.close();
 }));
}finally{if(browser)await browser.close();server.kill();await fs.writeFile(folder+'/results.json',JSON.stringify({results,failures},null,2));}
if(failures.length)process.exitCode=1;

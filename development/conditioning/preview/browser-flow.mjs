import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';
const root=resolve('development/conditioning');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(root+'/'))throw Error('path');const data=await readFile(path.endsWith('/')?path+'index.html':path);res.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.html':'text/html'})[extname(path)]??'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/preview/index.html';
const browser=await chromium.launch({headless:true});
const KEY='bfit.conditioning.preview.v1';
const read=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const check=async(page,text)=>{await page.getByText(text,{exact:false}).first().waitFor({timeout:5000});};
const startDate=new Date('2026-11-26T12:00:00Z');
async function setup(page){
 await page.clock.setFixedTime(startDate);await page.goto(url);await page.locator('[name=day1]').waitFor();
 await page.locator('[name=setup]').fill('Fictional bike');await page.locator('[name=mode]').selectOption('bike');
 await page.locator('[name=goal]').selectOption('B');await page.locator('[name=comfortableMinutes]').fill('5');
 await page.locator('[name=existingHard]').selectOption('false');await page.locator('[name=restricted]').selectOption('false');await page.locator('[name=vigorousSuitable]').selectOption('true');
 await page.getByRole('button',{name:'Save my plan'}).click();await check(page,'Plan saved.');
}
async function begin(page,method){await page.locator('#start-workout [name=recovery]').selectOption('normal');await page.locator('#start-workout [name=method]').selectOption(method);await page.getByRole('button',{name:'Check today’s workout'}).click();}
const errors=[];
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'UTC',acceptDownloads:true});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await setup(page);
 assert.equal(await page.locator('section[id^=chapter-]').count(),10);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'mobile horizontal overflow');
 await begin(page,'manual');const state=await read(page);assert.equal(state.app.active.ticket.dose.minutes,5);
 for(let i=0;i<3;i++)await page.locator('[name=phase'+i+']').fill('300');
 await page.locator('#feedback [name=effort]').fill('3');await page.locator('#feedback [name=quality]').selectOption('true');await page.locator('#feedback [name=confirmed]').check();
 await page.getByRole('button',{name:'Save workout'}).click();await check(page,'Workout saved.');
 assert.equal((await read(page)).app.history.logs[0].status,'full');
 assert.equal(await page.locator('form.recover').count(),0);
 await page.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));await page.reload();
 await page.locator('form.recover [name=recovery]').selectOption('normal');await page.getByRole('button',{name:'Save recovery'}).click();
 assert.equal((await read(page)).app.history.logs[0].recovery,'normal');
 await page.locator('[data-move]').first().click();const move=page.locator('#move-form [name=day]');await move.selectOption({index:0});await page.getByRole('button',{name:'Save new day'}).click();await check(page,'Training day updated.');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download backup'}).click();const file=await download;assert.match(file.suggestedFilename(),/conditioning-preview.json/);
 const backup=JSON.stringify(await read(page));const restoreContext=await browser.newContext({timezoneId:'UTC'});const restored=await restoreContext.newPage();restored.on('pageerror',e=>errors.push(e.message));await restored.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));await restored.goto(url);await restored.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});await check(restored,'Backup restored.');assert.equal((await read(restored)).app.history.logs.length,1);await restoreContext.close();
 console.log('PASS mobile setup, manual workout, next-day recovery, reschedule, download and restore');
 const timerContext=await browser.newContext({timezoneId:'UTC'});const timer=await timerContext.newPage();timer.on('pageerror',e=>errors.push(e.message));await setup(timer);await begin(timer,'timer');await timer.getByRole('button',{name:'Start phase'}).click();await timer.waitForTimeout(1200);await timer.getByRole('button',{name:'Pause',exact:true}).click();assert.equal((await read(timer)).app.active.timer.state,'paused');await timer.reload();await timer.getByRole('button',{name:'Resume',exact:true}).click();await timer.waitForTimeout(1200);await timer.getByRole('button',{name:'Stop for concerning symptoms'}).click();await timer.locator('#feedback [name=effort]').fill('2');await timer.locator('#feedback [name=quality]').selectOption('false');await timer.locator('#feedback [name=confirmed]').check();await timer.getByRole('button',{name:'Save workout'}).click();assert.equal((await read(timer)).app.history.logs[0].warning,true);await timer.reload();assert.equal((await read(timer)).app.history.logs[0].warning,true);console.log('PASS timer pause, reload, resume, symptom stop and persistence');await timerContext.close();
 const safetyContext=await browser.newContext({timezoneId:'UTC'});const safe=await safetyContext.newPage();safe.on('pageerror',e=>errors.push(e.message));await setup(safe);await safe.locator('#start-workout [name=recovery]').selectOption('normal');await safe.locator('#start-workout [name=warning]').check();await safe.getByRole('button',{name:'Check today’s workout'}).click();assert.equal((await read(safe)).app.history.logs[0].warning,true);await safe.reload();await begin(safe,'manual');await check(safe,'Seek appropriate medical assessment');assert.equal((await read(safe)).app.active,null);await safetyContext.close();console.log('PASS pre-start warning survives reload and blocks workout');
 assert.deepEqual(errors,[]);await ctx.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}

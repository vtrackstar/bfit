import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium, webkit } from 'playwright';
const root=resolve('.');
const server=createServer(async(req,res)=>{try{const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!path.startsWith(root+'/'))throw Error('path');const data=await readFile(path.endsWith('/')?path+'index.html':path);res.setHeader('Content-Type',({'.mjs':'text/javascript','.css':'text/css','.html':'text/html'})[extname(path)]??'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url='http://127.0.0.1:'+server.address().port+'/guides/conditioning/index.html';
const engine=process.env.BFIT_BROWSER??'chromium';
assert(['chromium','webkit'].includes(engine),'Unknown browser engine');
const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true});
console.log('Browser engine: '+engine);
const KEY='bfit.conditioning.public.v1';
const read=page=>page.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
const check=async(page,text)=>{await page.getByText(text,{exact:false}).first().waitFor({timeout:5000});};
const startDate=new Date('2026-11-26T12:00:00Z');
async function setup(page){
 await page.clock.setFixedTime(startDate);await page.goto(url);await page.locator('[name=day1]').waitFor({state:'attached'});
 assert.equal(await page.locator('.setup-step:visible').count(),1);
 await page.locator('[name=mode]').selectOption('bike');await page.locator('[name=goal]').selectOption('B');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await page.locator('#swim-fields').isVisible(),false);
 await page.getByRole('button',{name:'Continue',exact:true}).click();assert.equal(await page.locator('#setup-count').textContent(),'Step 2 of 5');
 await page.locator('[name=setup]').fill('Fictional bike');await page.locator('[name=comfortableMinutes]').fill('5');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('[name=existingHard]').selectOption('false');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.locator('[name=restricted]').selectOption('false');await page.locator('[name=vigorousSuitable]').selectOption('true');
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await page.locator('#advanced-fields').isVisible(),false);
 assert.equal(await page.locator('#setup-count').textContent(),'Step 5 of 5');
 await page.getByRole('button',{name:'Save my plan'}).click();await check(page,'Plan saved.');assert.equal(await page.locator('#hero-next').textContent(),'Open today’s workout');assert.equal(await page.locator('#next-link').getAttribute('href'),'#workout');
}
async function begin(page,method){await page.locator('#start-workout [name=recovery]').selectOption('normal');await page.locator('#start-workout [name=method]').selectOption(method);await page.getByRole('button',{name:'Check today’s workout'}).click();}
const errors=[];
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'UTC',acceptDownloads:true});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await setup(page);
 assert.equal(await page.locator('section[id^=chapter-]').count(),10);
 assert.equal(await page.locator('[name=mode] option[value=swim]').count(),0);
 assert.equal(await page.locator('[name=specialization] option[value=repeat-hard]').count(),0);
 assert.equal(await page.locator('[name=hardOptIn]').isVisible(),false);
 const good=await read(page);assert.equal(good.kind,'bfit-conditioning-public');assert.equal(good.settings.profile.hardOptIn,false);
 const wrongContext=await browser.newContext({timezoneId:'UTC'});const wrong=await wrongContext.newPage();await wrong.clock.setFixedTime(startDate);await wrong.goto(url);
 for(const bad of [{...good,kind:undefined},{...good,settings:{...good.settings,profile:{...good.settings.profile,mode:'swim'}}},{...good,settings:{...good.settings,profile:{...good.settings.profile,hardOptIn:true}}}]){
 await wrong.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});
 await check(wrong,'Unsupported conditioning backup');assert.equal(await read(wrong),null);
 }
 await wrongContext.close();console.log('PASS production scope and preview/unsupported backup rejection');

 const before=JSON.stringify(await read(page));
 for(const [v,expected] of [['90','8 min main block · 25%'],['60','6 min main block · 33%'],['30','4 min main block · 50%']]){
 await page.locator('#compare-rest').selectOption(v);assert((await page.locator('#density-result').textContent()).includes(expected));assert.equal(await page.locator('#density-b span').count(),8);}
 assert.equal(JSON.stringify(await read(page)),before,'education must not modify plan');
 for(const id of ['oxygen-figure','pacing-figure','lag-figure','repeatability-figure'])assert.equal(await page.locator('#'+id+' svg[role=img]').count(),1);
 console.log('PASS educational comparison arithmetic, accessible figure markup and saved-plan isolation');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'mobile horizontal overflow');
 await page.locator('#next-link').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'workout');await begin(page,'manual');assert.equal(await page.locator('#hero-next').textContent(),'Resume workout');const state=await read(page);assert.equal(state.app.active.ticket.dose.minutes,5);
 for(let i=0;i<3;i++)await page.locator('[name=phase'+i+']').fill('300');
 await page.locator('#feedback details summary').click();await page.locator('#feedback [name=unit]').selectOption('rpm');await page.locator('#feedback [name=output]').fill('80');await page.locator('#feedback [name=effort]').fill('3');await page.locator('#feedback [name=quality]').selectOption('true');await page.locator('#feedback [name=confirmed]').check();
 await page.getByRole('button',{name:'Save workout'}).click();await check(page,'Workout saved.');
 assert.equal((await read(page)).app.history.logs[0].status,'full');assert.equal((await read(page)).app.history.logs[0].output,80);assert.equal((await read(page)).app.history.logs[0].unit,'rpm');
 assert.equal(await page.locator('form.recover').count(),0);
 await page.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));await page.reload();
 assert.equal(await page.locator('#hero-next').textContent(),'Report recovery');await page.locator('#next-link').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'recovery-reports');await page.locator('form.recover [name=recovery]').selectOption('normal');await page.getByRole('button',{name:'Save recovery'}).click();
 assert.equal((await read(page)).app.history.logs[0].recovery,'normal');assert.equal(await page.locator('#hero-next').textContent(),'See my schedule');
 await page.locator('[data-move]').first().click();const move=page.locator('#move-form [name=day]');await move.selectOption({index:0});await page.getByRole('button',{name:'Save new day'}).click();await check(page,'Training day updated.');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download backup'}).click();const file=await download;assert.match(file.suggestedFilename(),/conditioning.json/);
 const backup=JSON.stringify(await read(page));const restoreContext=await browser.newContext({timezoneId:'UTC'});const restored=await restoreContext.newPage();restored.on('pageerror',e=>errors.push(e.message));await restored.clock.setFixedTime(new Date('2026-11-27T12:00:00Z'));await restored.goto(url);await restored.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});await check(restored,'Backup restored.');assert.equal((await read(restored)).app.history.logs.length,1);await restoreContext.close();
 console.log('PASS mobile setup, manual workout, next-day recovery, reschedule, download and restore');
 const timerContext=await browser.newContext({timezoneId:'UTC'});const timer=await timerContext.newPage();timer.on('pageerror',e=>errors.push(e.message));await setup(timer);await begin(timer,'timer');await timer.getByRole('button',{name:'Start phase'}).click();await timer.waitForTimeout(1200);await timer.getByRole('button',{name:'Pause',exact:true}).click();assert.equal((await read(timer)).app.active.timer.state,'paused');await timer.reload();await timer.getByRole('button',{name:'Resume',exact:true}).click();await timer.waitForTimeout(1200);await timer.getByRole('button',{name:'Stop for concerning symptoms'}).click();await timer.locator('#feedback [name=effort]').fill('2');await timer.locator('#feedback [name=quality]').selectOption('false');await timer.locator('#feedback [name=confirmed]').check();await timer.getByRole('button',{name:'Save workout'}).click();assert.equal((await read(timer)).app.history.logs[0].warning,true);await timer.reload();assert.equal((await read(timer)).app.history.logs[0].warning,true);console.log('PASS timer pause, reload, resume, symptom stop and persistence');await timerContext.close();
 const earlyContext=await browser.newContext({timezoneId:'UTC'});const early=await earlyContext.newPage();early.on('pageerror',e=>errors.push(e.message));await setup(early);await begin(early,'manual');await early.getByRole('link',{name:'See setup and movement instructions'}).click();assert.equal(await early.locator('#movement-help').evaluate(el=>el.open),true);await early.locator('[name=phase0]').fill('300');await early.locator('[name=phase1]').fill('60');await early.locator('[name=earlyCooldown]').fill('120');await early.locator('#feedback [name=effort]').fill('3');await early.locator('#feedback [name=quality]').selectOption('true');await early.locator('#feedback [name=reason]').selectOption('time');await early.locator('#feedback [name=confirmed]').check();await early.getByRole('button',{name:'Save workout'}).click();const earlyLog=(await read(early)).app.history.logs[0];assert.equal(earlyLog.status,'shortened');assert.deepEqual(earlyLog.actual.at(-1),{type:'cool',seconds:120,earlyCooldown:true});await earlyContext.close();console.log('PASS movement reference, manual early cooldown and actual-only record');
 const safetyContext=await browser.newContext({timezoneId:'UTC'});const safe=await safetyContext.newPage();safe.on('pageerror',e=>errors.push(e.message));await setup(safe);await safe.locator('#start-workout [name=recovery]').selectOption('normal');await safe.locator('#start-workout [name=warning]').check();await safe.getByRole('button',{name:'Check today’s workout'}).click();assert.equal((await read(safe)).app.history.logs[0].warning,true);await safe.reload();assert.equal(await safe.locator('#hero-next').textContent(),'Review safety guidance');await safe.locator('#next-link').click();assert.equal(await safe.evaluate(()=>document.activeElement.id),'safety-review');await begin(safe,'manual');await check(safe,'Seek appropriate medical assessment');assert.equal((await read(safe)).app.active,null);await check(safe,'Returning after a safety pause');await safe.getByText('Record an outside activity already completed',{exact:true}).click();await safe.locator('#outside [name=activity]').fill('Fictional clinician-directed activity');await safe.locator('#outside [name=minutes]').fill('5');await safe.locator('#outside [name=intensity]').selectOption('easy');assert.equal(await safe.locator('#outside [name=replace]').count(),0);await safe.locator('#outside button[type=submit]').click();assert.equal((await read(safe)).app.history.external.length,1);await safe.reload();await begin(safe,'manual');await check(safe,'Seek appropriate medical assessment');assert.equal((await read(safe)).app.active,null);await safetyContext.close();console.log('PASS pre-start warning survives reload and blocks workout');
 for(const width of [320,390,1366]){
 const navContext=await browser.newContext({viewport:{width,height:844},timezoneId:'UTC'});const nav=await navContext.newPage();nav.on('pageerror',e=>errors.push(e.message));await nav.goto(url);await nav.locator('[name=day1]').waitFor({state:'attached'});
 assert(await nav.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'page overflow at '+width);
 assert.equal(await nav.locator('#next-action').isVisible(),false);
 assert.equal(await nav.locator('#hero-next').getAttribute('href'),'#plan');
 if(width<=760){await nav.locator('#contents summary').click();await nav.locator('#contents a[href="#chapter-5"]').click();assert.equal(await nav.locator('#contents').evaluate(el=>el.open),false);}
 else await nav.locator('#contents a[href="#chapter-5"]').click();
 assert.equal(new URL(nav.url()).hash,'#chapter-5');await nav.locator('header a[href="#top"]').click();assert.equal(new URL(nav.url()).hash,'#top');
 await nav.locator('#hero-next').click();assert.equal(await nav.evaluate(()=>document.activeElement.id),'plan');
 await navContext.close();
 }
 console.log('PASS navigation, focus and horizontal overflow at 320, 390 and 1366 pixels');
 // Cross-mode journeys use fictional inputs and do not ask anyone to exercise.
 for(const scenario of [
 {mode:"walk",goal:"A",minutes:"0",budget:"20",expected:"bouts",easy:true},
 {mode:"run",goal:"A",minutes:"10",budget:"20",block:"Choose walking"},
 {mode:"circuit",goal:"B",minutes:"5",budget:"20",block:"Learn the movements"},
 {mode:"circuit",goal:"B",minutes:"5",budget:"20",familiar:true,expected:"circuit"},
 {mode:"walk",goal:"A",minutes:"0",budget:"5",block:"There isn’t enough time"},
 {mode:"bike",goal:"B",minutes:"10",budget:"20",restricted:true,block:"Seek appropriate medical assessment"}
 ]){
 const profileCtx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'UTC'});const p=await profileCtx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.clock.setFixedTime(startDate);await p.goto(url);
 await p.locator('[name=mode]').selectOption(scenario.mode);await p.locator('[name=goal]').selectOption(scenario.goal);
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 assert.equal(await p.locator('#swim-fields').isVisible(),scenario.mode==='swim');
 assert.equal(await p.locator('#run-fields').isVisible(),scenario.mode==='run');
 assert.equal(await p.locator('#circuit-fields').isVisible(),scenario.mode==='circuit');
 await p.locator('[name=setup]').fill('Fictional '+scenario.mode);
 await p.locator('[name=comfortableMinutes]').fill(scenario.minutes);
 if(scenario.water)await p.locator('[name=waterCompetent]').check();
 if(scenario.familiar)await p.locator('[name=movementsFamiliar]').check();
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 await p.locator('[name=minutes]').fill(scenario.budget);await p.locator('[name=existingHard]').selectOption('false');
 await p.getByRole('button',{name:'Continue',exact:true}).click();
 await p.locator('[name=restricted]').selectOption(scenario.restricted?'true':'false');await p.locator('[name=vigorousSuitable]').selectOption(scenario.restricted?'false':'true');
 await p.getByRole('button',{name:'Continue',exact:true}).click();await p.getByRole('button',{name:'Save my plan'}).click();
 await begin(p,'manual');
 const state=await read(p);
 if(scenario.block){assert.equal(state.app.active,null);await check(p,scenario.block);}
 else {assert.equal(state.app.active.ticket.dose.kind,scenario.expected);if(scenario.easy)assert(state.app.active.ticket.dose.effort[1]<=3);if(scenario.expected==='swim'){assert.equal(state.app.active.method,'manual');assert.equal(await p.locator('#feedback [name=lengths]').count(),1);} }
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'profile overflow: '+scenario.mode);
 await profileCtx.close();console.log('PASS browser profile '+scenario.mode+' '+(scenario.block?'blocked as expected':'starts '+scenario.expected));
 }
 assert.deepEqual(errors,[]);await ctx.close();
}finally{await browser.close();await new Promise(r=>server.close(r));}

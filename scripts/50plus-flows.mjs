// Test BFit Keep Moving: 50+ guide on a local static server.
// Run: node scripts/50plus-flows.mjs
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const host='http://127.0.0.1:8797';
const server=spawn('python3',['-m','http.server','8797','--bind','127.0.0.1'],{stdio:'ignore'});
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
const errors=[];
let browser;
async function ready(){
 for(let i=0;i<60;i++){try{if((await fetch(host+'/')).ok)return;}catch{}await sleep(200);}
 throw Error('Static server did not start');
}
async function check(name,fn,width=390){
 const context=await browser.newContext({viewport:{width,height:844},acceptDownloads:true});
 const page=await context.newPage(),pageErrors=[];
 page.on('pageerror',e=>pageErrors.push(e.message));
 try {
  await page.goto(host+'/guides/50-plus/',{waitUntil:'load'});
  await fn(page);
  assert.deepEqual(pageErrors,[]);
  console.log('PASS '+name);
 } catch(e){errors.push(name+': '+e.message);console.error('FAIL '+name+': '+e.message);}
 finally{await context.close();}
}
try{
 await ready();browser=await chromium.launch({headless:true});
 for(const width of [320,390,768,1366]){
  await check('Responsive layout '+width+'px',async p=>{
   assert.equal(await p.locator('h1').count(),1);
   assert.equal(await p.locator('.bfit-hub-link').innerText(),'BFit Hub');
   const guideExit=p.locator('.bfit-guide-switch');
   assert.equal(await guideExit.isVisible(),true,'All guides return should be available during reading');
   assert.match(await guideExit.innerText(),/All guides/);
   assert.equal(await guideExit.getAttribute('href'),'https://vtrackstar.github.io/bfit/');
   const exitBounds=await guideExit.boundingBox();
   assert.ok(exitBounds&&exitBounds.height>=44&&exitBounds.x>=0&&exitBounds.x+exitBounds.width<=width+1,'All guides exit is outside the viewport');
   assert.equal(await p.locator('a[href="#build"]').count()>0,true);
   assert.ok(await p.locator('#weekPlan .day').count()>=2);
   const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,'Horizontal overflow '+overflow+'px');
  },width);
 }
 await check('Priorities update, cap at three, and build functional recommendations',async p=>{
  await p.locator('[data-goal][value="balance"]').check();
  await p.locator('[data-goal][value="stairs"]').check();
  await p.locator('[data-goal][value="carry"]').check();
  assert.equal(await p.locator('#goalResults .goal-result').count(),3);
  await p.locator('[data-goal][value="floor"]').click();
  assert.equal(await p.locator('[data-goal][value="floor"]').isChecked(),false);
  assert.equal(await p.locator('#goalResults .goal-result').count(),3);
 });
 await check('Single activity picker generates strength, cardio and a 2-day week',async p=>{
  await p.selectOption('#days','2');
  await p.selectOption('#ageGroup','65-plus');
  await p.selectOption('#strengthStyle','home');
  await p.locator('[data-activity][value="swimming"]').check();
  await p.locator('[data-activity][value="walking"]').uncheck();
  await p.locator('[data-activity][value="pickleball"]').check();
  assert.equal(await p.locator('#weekPlan .day').count(),2);
  assert.match(await p.locator('#planSummary').innerText(),/Swimming or water walking/);
  assert.match(await p.locator('#strengthRoutine').innerText(),/Sit-to-stand from a stable chair/);
  assert.match(await p.locator('#planExerciseDetails').innerText(),/one set of 6–10/i);
  assert.match(await p.locator('#ageAdvice').innerText(),/65 and older/);
  await p.reload();
  assert.equal(await p.inputValue('#days'),'2');
  assert.equal(await p.inputValue('#ageGroup'),'65-plus');
  assert.equal(await p.locator('[data-activity][value="swimming"]').isChecked(),true);
  assert.equal(await p.locator('[data-activity][value="pickleball"]').isChecked(),true);
  assert.equal(await p.locator('#weekPlan .day').count(),2);
 });
 await check('Activity selection has no duplicate questions and limits choices to three',async p=>{
  assert.equal(await p.locator('#mainCardio,#tryChoices').count(),0);
  assert.equal(await p.locator('[data-activity]').count(),9);
  await p.locator('[data-activity][value="golf"]').check();
  await p.locator('[data-activity][value="cycling"]').check();
  await p.locator('[data-activity][value="swimming"]').click();
  assert.equal(await p.locator('[data-activity][value="swimming"]').isChecked(),false);
  assert.equal(await p.locator('[data-activity]:checked').count(),3);
  await p.locator('[data-activity][value="walking"]').uncheck();
  await p.locator('[data-activity][value="cycling"]').uncheck();
  assert.match(await p.locator('#planSummary').innerText(),/Suggested cardio:.*Walking/s);
 });
 await check('Six named exercise walkthroughs, warmup and external demos are visible',async p=>{
  assert.equal(await p.locator('.move-card').count(),6);
  assert.match(await p.locator('#first-workout').innerText(),/Warm up for 3–5 minutes/);
  assert.match(await p.locator('#first-workout').innerText(),/repetition.*set/s);
  assert.ok(await p.locator('.move-card a[target="_blank"]').count()>=4);
  assert.equal(await p.locator('.activity-browser').getAttribute('open'),null);
 });
 await check('Recent falls or dizziness routes away from a generic workout',async p=>{
  await p.locator('[data-goal][value="stairs"]').check();
  await p.locator('[data-activity][value="pickleball"]').check();
  await p.selectOption('#confidence','review');
  assert.equal(await p.locator('#safetyNote').isVisible(),true);
  assert.equal(await p.locator('#movementSafety').isVisible(),true);
  assert.match(await p.locator('#planSummary').innerText(),/healthcare professional|physical therapist/i);
  assert.equal(await p.locator('#weekPlan .day').count(),2);
  assert.doesNotMatch(await p.locator('#weekPlan').innerText(),/try pickleball|full-body strength/i);
  assert.match(await p.locator('#planExerciseDetails').innerText(),/Wait for a safe starting plan/);
  assert.doesNotMatch(await p.locator('#goalResults').innerText(),/Try first:/);
 });
 await check('Builder covers age, steadiness, 2–7 days and strength choices',async p=>{
  const summary=await p.evaluate(()=>{
   let n=0,failures=[],age=document.getElementById('ageGroup'),conf=document.getElementById('confidence'),days=document.getElementById('days'),style=document.getElementById('strengthStyle');
   const set=(el,value)=>{el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));};
   for(const a of ['50-64','65-plus'])for(const c of ['steady','support','review'])for(const d of ['2','3','4','5','6','7'])for(const t of ['machines','dumbbells','home']){
    set(age,a);set(conf,c);set(days,d);set(style,t);n++;
    const count=document.querySelectorAll('#weekPlan .day').length;
    const text=document.getElementById('planSummary').innerText;
    if(c==='review'){
      if(count!==2||!text.includes('healthcare professional'))failures.push('risk '+[a,c,d,t].join('/'));
    } else if(count!==Number(d)||!text.includes('starting week'))failures.push('normal '+[a,c,d,t].join('/'));
   }
   return {n,failures};
  });
  assert.equal(summary.n,108);
  assert.deepEqual(summary.failures,[]);
 });
 await check('Plan download, backup, and restore',async p=>{
  await p.selectOption('#days','6');
  await p.locator('[data-goal][value="floor"]').check();
  const d1=p.waitForEvent('download');await p.locator('#savePlan').click();const plan=await d1;
  assert.equal(plan.suggestedFilename(),'BFit-50plus-week.txt');
  assert.match(fs.readFileSync(await plan.path(),'utf8'),/YOUR EXERCISES \/ NEXT STEPS/);
  await p.locator('#deviceOptions summary').click();
  const d2=p.waitForEvent('download');await p.locator('#backup').click();const backup=await d2;
  assert.equal(backup.suggestedFilename(),'BFit-50plus-answers.json');
  const path=await backup.path();
  await p.evaluate(()=>localStorage.clear());
  await p.reload();
  assert.equal(await p.inputValue('#days'),'4');
  await p.locator('#deviceOptions summary').click();
  await p.locator('#restore').setInputFiles(path);
  assert.equal(await p.inputValue('#days'),'6');
  assert.equal(await p.locator('[data-goal][value="floor"]').isChecked(),true);
 });
 await check('Four-week reviews persist without a login',async p=>{
  await p.selectOption('#weekReview','3');
  await p.locator('#reviewChecks input[value="schedule"]').check();
  await p.selectOption('#confidenceRating','4');
  await p.locator('#saveReview').click();
  await p.reload();
  await p.selectOption('#weekReview','3');
  assert.equal(await p.locator('#reviewChecks input[value="schedule"]').isChecked(),true);
  assert.equal(await p.inputValue('#confidenceRating'),'4');
 });
} catch(e){errors.push('Test setup: '+e.message);console.error(e);}
finally{if(browser)await browser.close();server.kill();}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}

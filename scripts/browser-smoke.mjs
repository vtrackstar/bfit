// Headless browser smoke test, run by GitHub Actions on a local HTTP server.
// Does not verify external exercise-library or questionnaire destinations.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const host = 'http://127.0.0.1:8765';
const guidePages = [
  { name: 'Hub', url: '/', selector: '#guides .card', min: 5 },
  { name: 'Weekend Warrior', url: '/guides/weekend-warrior/', selector: 'main h1', min: 1 },
  { name: 'Build Your Glutes', url: '/guides/build-your-glutes/', selector: 'main h1', min: 1 },
  { name: 'Your First Push-Up', url: '/milestones/first-push-up/', selector: 'main h1', min: 1 },
  { name: 'Your First 5K', url: '/milestones/first-5k/', selector: 'main h1', min: 1 },
  { name: 'Your First Pull-Up', url: '/milestones/first-pull-up/', selector: 'main h1', min: 1 },
  { name: 'Foundation', url: '/guides/foundation/', selector: '#main', min: 1 },
  { name: 'Athleticism', url: '/guides/athleticism/', selector: '#app', min: 1 },
  { name: 'Gamer Fit', url: '/guides/gamer-fit/', selector: '#main-content', min: 1 },
  { name: 'Run Strong', url: '/guides/run-strong/', selector: '#start', min: 1 },
  { name: 'Conditioning', url: '/guides/conditioning/', selector: '#setup', min: 1 },
  { name: 'Keep Moving 50+ intro', url: '/guides/50-plus/', selector: '#why', min: 1 },
  { name: 'Keep Moving 50+ activities', url: '/guides/50-plus/activities/', selector: '#start', min: 1 },
  { name: 'Keep Moving 50+ plan', url: '/guides/50-plus/plan/', selector: '#weekPlan .day', min: 2 },
  { name: 'Keep Moving 50+ progress', url: '/guides/50-plus/progress/', selector: '#weekReview', min: 1 }
];
const screens = [
  {name:'desktop',width:1366,height:900},
  {name:'mobile',width:390,height:844}
];
const folder = 'qa-screenshots';
fs.mkdirSync(folder,{recursive:true});
const errors = [];
const server = spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const sleep = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function waitForServer() {
  for(let i=0;i<45;i++) {
    try { const r=await fetch(host+'/');if(r.ok)return; } catch {}
    await sleep(200);
  }
  throw Error('Local server did not start');
}
try {
  await waitForServer();
  browser = await chromium.launch({headless:true});
  for(const screen of screens){
    for(const guide of guidePages){
      const page = await browser.newPage({viewport:{width:screen.width,height:screen.height},acceptDownloads:true});
      const pageErrors = [];
      page.on('pageerror', e=>pageErrors.push(e.message));
      try {
        const response = await page.goto(host+guide.url,{waitUntil:'domcontentloaded',timeout:45000});
        await page.waitForTimeout(650);
        if(response.status()!==200) throw Error('HTTP '+response.status());
        const match=page.locator(guide.selector);
        const count=await match.count();
        if(count < guide.min) throw Error('Expected '+guide.min+' instances of '+guide.selector+'; found '+count);
        const ui=await page.evaluate(()=>{
          const body=document.body;
          return {text:body.innerText.length,overflow:Math.max(0,document.documentElement.scrollWidth-window.innerWidth),title:document.title};
        });
        if(ui.text < 130) throw Error('Page has too little readable content: '+ui.text);
        if(guide.name!=='Hub'){
          const hubLink=page.locator('a[href="https://vtrackstar.github.io/bfit/"]').first();
          let reached=false;
          for(let i=0;i<18;i++){
            await page.keyboard.press('Tab');
            reached=await hubLink.evaluate(el=>el===document.activeElement);
            if(reached)break;
          }
          if(!reached || !await hubLink.isVisible()) throw Error('Hub link unreachable from initial keyboard navigation');
          if(!await hubLink.evaluate(el=>{
            const r=el.getBoundingClientRect();
            return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
          }))throw Error('Focused Hub link is obscured');
          if(!await page.getByRole('link',{name:/hub/i}).count())throw Error('Hub link lacks an accessible name');
        }
        if(guide.name==='Athleticism' && screen.name==='desktop') {
          const btn=page.locator('button[data-action="nav"][data-to="learn"]').first();
          if(await btn.isVisible()){await btn.click();await page.waitForTimeout(200);}
          if((await page.locator('#app').innerText()).length<100)throw Error('Athleticism content did not render');
        }
        if(guide.name==='Gamer Fit' && screen.name==='desktop'){
          const a=page.locator('a.gg-first-cta').first();
          if(await a.isVisible()){await a.click();await page.waitForTimeout(150);}
        }
        if(guide.name==='Run Strong' && screen.name==='desktop'){
          const a=page.locator('a[href="#first-run"]').first();
          if(await a.count() && await a.isVisible()){await a.click();await page.waitForTimeout(150);}
        }
        await page.screenshot({path:path.join(folder,guide.name.toLowerCase().replaceAll(' ','-')+'-'+screen.name+'.png'),animations:'disabled'});
        if(pageErrors.length)throw Error('JavaScript runtime error(s): '+pageErrors.slice(0,3).join(' | '));
        if(ui.overflow>8)console.warn('WARN '+guide.name+' '+screen.name+' horizontal overflow: '+ui.overflow+'px (may be a deliberate wide table)');
        console.log('PASS '+guide.name+' '+screen.name+': '+ui.title+'; '+ui.text+' chars');
      }catch(e){errors.push(guide.name+' '+screen.name+': '+e.message);console.error('FAIL '+guide.name+' '+screen.name+': '+e.message);}
      finally{await page.close();}
    }
  }
}catch(e){errors.push('Runner: '+e.message);console.error('FAIL Runner: '+e.message);}
finally{if(browser)await browser.close();server.kill();}
if(errors.length){console.error(errors.length+' browser check(s) failed');process.exitCode=1;}
else console.log('PASS: desktop/mobile page-load and basic navigation checks. External links and detailed workout exports still require additional testing.');

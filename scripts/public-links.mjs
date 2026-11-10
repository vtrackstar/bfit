import { chromium } from 'playwright';
import fs from 'node:fs';
// Lightweight, non-blocking check of public destinations.
// An HTTP error or bot challenge does not necessarily prove a link is broken.
// Run: node scripts/public-links.mjs
const urls = [
  ['Hub', 'https://vtrackstar.github.io/bfit/'],
  ['Foundation', 'https://vtrackstar.github.io/bfit/guides/foundation/'],
  ['Athleticism', 'https://vtrackstar.github.io/bfit/guides/athleticism/'],
  ['Gamer Fit', 'https://vtrackstar.github.io/bfit/guides/gamer-fit/'],
  ['Run Strong', 'https://vtrackstar.github.io/bfit/guides/run-strong/'],
  ['Exercise library', 'https://bfit-exercise-movement-library.balouissaint.chatgpt.site/'],
  ['Coaching availability', 'https://vtrackstar.github.io/bfit/coaching/'],
  ['Coaching form, currently paused (owner-side check)', 'https://forms.gle/f11PGA7PCUKaxrgq9'],
  ['Instagram', 'https://www.instagram.com/_trainwithbfit/'],
  ['TikTok', 'https://www.tiktok.com/@_trainwithbfit'],
  ['Twitch', 'https://www.twitch.tv/gamewithbfit'],
  ['BFit Lounge Discord', 'https://discord.gg/9yfqjvZPg']
];
for (const [name,url] of urls) {
  try {
    let r=await fetch(url,{method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(12000)});
    if (r.status===405 || r.status===403) r=await fetch(url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(12000)});
    const label=/\/closedform(?:\?|$)/.test(r.url)?'PAUSED':r.ok?'OK':'REVIEW';
    console.log(label+' '+name+': HTTP '+r.status+'; destination '+r.url);
  }catch(e){console.log('REVIEW '+name+': '+e.message);}
}
console.log('Public-link results are observational; browser or provider restrictions may affect these statuses.');


// Read-only browser check of representative direct links. A matching name in the page
// is useful evidence, but does not independently validate an exercise video.
const libraryBase='https://bfit-exercise-movement-library.balouissaint.chatgpt.site/';
const samples=[
  ['BFIT-00001','Goblet Squat'],
  ['BFIT-00014','A-Skip'],
  ['BFIT-00176','Easy Run'],
  ['BFIT-00193','Short-Lever Copenhagen Hold'],
  ['BFIT-00228','Single-Leg Hop-and-Stick']
];
let browser;
try {
  browser=await chromium.launch({headless:true});
  fs.mkdirSync('qa-screenshots',{recursive:true});
  for(const [id,name] of samples) {
    const page=await browser.newPage({viewport:{width:390,height:844}});
    try {
      const response=await page.goto(libraryBase+'#'+id,{waitUntil:'domcontentloaded',timeout:20000});
      await page.waitForFunction(name => [...document.querySelectorAll('h1,h2,h3,h4')].some(e => {
        const r=e.getBoundingClientRect();
        return e.textContent.trim().toLowerCase().includes(name.toLowerCase()) && r.bottom>0 && r.top<window.innerHeight;
      }),name,{timeout:6500}).catch(()=>{});
      const state=await page.evaluate(name => {
        const body=document.body.innerText||'';
        const target=document.querySelector(':target');
        const dialog=document.querySelector('dialog[open],[role="dialog"][aria-modal="true"]');
        const matches=[...document.querySelectorAll('h1,h2,h3,h4')].filter(e=>e.textContent.trim().toLowerCase().includes(name.toLowerCase()));
        const targetRect=(matches.find(e=>e.textContent.trim().toLowerCase()===name.toLowerCase())||matches[0])?.getBoundingClientRect();
        const targetVisible=!!targetRect && targetRect.bottom>0 && targetRect.top<window.innerHeight;
        return {
          title:document.title,
          length:body.length,
          targetText:target?.innerText?.slice(0,100)||'',
          dialogText:dialog?.innerText?.slice(0,160)||'',
          headings:[...document.querySelectorAll('h1,h2')].filter(x=>x.getClientRects().length).slice(0,4).map(x=>x.innerText.slice(0,80)),
          visibleText:body.slice(0,350),
          scrollY:Math.round(window.scrollY),
          intendedHeadingVisible:targetVisible,
          intendedHeadingTop:targetRect?Math.round(targetRect.top):null,
          hash:location.hash,
          visibleHeadings:[...document.querySelectorAll('h1,h2,h3')].filter(x=>{let y=x.getBoundingClientRect();return y.top>=0&&y.top<window.innerHeight&&y.bottom>0;}).slice(0,6).map(x=>x.innerText.slice(0,90)),
          topVisibleText:(document.elementFromPoint(window.innerWidth/2,Math.round(window.innerHeight/2))?.closest('article,section,div')?.innerText||'').slice(0,160)
        };
      },name);
      const found=(await page.locator('body').innerText()).toLowerCase().includes(name.toLowerCase());
      const noLogin=!/sign in to continue|sign in with google|log in to continue/i.test(state.visibleText);
      const result= response?.ok() && page.url().endsWith('#'+id) && found && noLogin && state.intendedHeadingVisible ? 'PASS' : 'REVIEW';
      console.log(result+' Library deep link '+id+' ('+name+'): HTTP '+(response?.status()||'unknown')+'; name on page '+found+'; no sign-in text '+noLogin+'; '+JSON.stringify({scrollY:state.scrollY,hash:state.hash,intendedHeadingVisible:state.intendedHeadingVisible,intendedHeadingTop:state.intendedHeadingTop,visibleHeadings:state.visibleHeadings}).slice(0,650));
      await page.screenshot({path:'qa-screenshots/library-'+id+'.png',fullPage:false,animations:'disabled'});
    } catch(e) {
      console.log('REVIEW Library deep link '+id+': '+e.message);
    } finally {await page.close();}
  }
} catch(e) {console.log('REVIEW Library browser probe: '+e.message);}
finally {if(browser) await browser.close();}
console.log('Library deep-link candidates require a human check of the opened exercise card and demonstration; name presence alone does not prove the intended card opened.');

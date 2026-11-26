// Read the complete Gamer Fit HTML in the CI checkout; no user data, uploads or external submissions.
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const file='guides/gamer-fit/index.html';
const source=fs.readFileSync(file,'utf8');
const inlineData=[...source.matchAll(/data:[^"'\s<>]+/g)].map(m=>m[0]);
console.log(JSON.stringify({sourceBytes:Buffer.byteLength(source),gzipBytes:gzipSync(source).length,inlineDataCount:inlineData.length,inlineDataBytes:inlineData.reduce((n,x)=>n+Buffer.byteLength(x),0)},null,2));
const port=8796,base='http://127.0.0.1:'+port;
const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
  let ready=false;
  for(let i=0;i<60;i++){try{if((await fetch(base+'/')).ok){ready=true;break}}catch{}await new Promise(r=>setTimeout(r,200))}
  assert.ok(ready,'Local server unavailable');
  browser=await chromium.launch({headless:true});
  for(const width of [320,390,1366]){
    const context=await browser.newContext({viewport:{width,height:844}});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    // Isolate first-party page behavior. Do not load remote embeds or analytics.
    await page.route('**/*',r=>r.request().url().startsWith(base)||r.request().url().startsWith('data:')?r.continue():r.abort());
    const response=await page.goto(base+'/guides/gamer-fit/',{waitUntil:'load'});
    assert.equal(response.status(),200);
    const report=await page.evaluate(()=>{
      const n=performance.getEntriesByType('navigation')[0];
      const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      return {width:innerWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,domElements:document.querySelectorAll('*').length,domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),loadMs:Math.round(n.loadEventEnd),documentTransferBytes:n.transferSize,visibleHeadings:[...document.querySelectorAll('h1,h2,h3')].filter(visible).map(e=>e.textContent.trim().slice(0,160)).slice(0,30),entry:document.querySelector('#guide-entry-choices')?.innerText,firstWorkout:document.querySelector('#first-workout')?.innerText.slice(0,2200)};
    });
    console.log('GAMER_FIT '+JSON.stringify(report));
    assert.ok(report.overflow<=2,'Page overflow at '+width+'px');
    assert.deepEqual(errors,[]);
    const start=page.locator('#guide-entry-choices a[href="#first-workout"]');
    assert.equal(await start.count(),1);
    await start.click();
    assert.match(await page.locator('#first-workout').innerText(),/one set/i);
    if(width===390){
      const cdp=await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});
      await page.goto(base+'/guides/gamer-fit/',{waitUntil:'load'});
      const timing=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {loadMs:Math.round(n.loadEventEnd),domContentLoadedMs:Math.round(n.domContentLoadedEventEnd),transferBytes:n.transferSize}});
      console.log('GAMER_FIT throttled local 1.6 Mbps (not production CDN or actual device): '+JSON.stringify(timing));
    }
    await context.close();
  }
}finally{if(browser)await browser.close();server.kill()}
console.log('PASS Gamer Fit local first-entry, layout and source/performance report. Human comprehension, remote demo playback and physical mobile performance remain separate.');

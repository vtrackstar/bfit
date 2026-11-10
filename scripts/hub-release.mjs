// Focused publishing checks for the BFit hub and its guide entry points.
// Runs against the same repository revision under test, using a local static server.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const host = 'http://127.0.0.1:8788';
const expected = [
  { name: 'Foundation', slug: 'foundation' },
  { name: 'Athleticism', slug: 'athleticism' },
  { name: 'Gamer Fit', slug: 'gamer-fit' },
  { name: 'Run Strong', slug: 'run-strong' }
];
const social = {
  'Instagram': 'https://www.instagram.com/_trainwithbfit/',
  'TikTok': 'https://www.tiktok.com/@_trainwithbfit',
  'Twitch': 'https://www.twitch.tv/gamewithbfit',
  'Discord': 'https://discord.gg/9yfqjvZPg'
};
const screens = [
  { label: 'small-phone', width: 320, height: 700 },
  { label: 'phone', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'small-laptop', width: 1024, height: 768 },
  { label: 'desktop', width: 1366, height: 900 }
];
const folder = 'qa-screenshots';
fs.mkdirSync(folder, { recursive: true });
let browser;
let failures = [];
const server = spawn('python3', ['-m', 'http.server', '8788', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function ready() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(host + '/')).ok) return; } catch {}
    await sleep(200);
  }
  throw Error('Static server failed to start');
}
async function check(name, fn) {
  try { await fn(); console.log('PASS ' + name); }
  catch (e) { failures.push(name + ': ' + e.message); console.error('FAIL ' + name + ': ' + e.message); }
}
try {
  await ready();
  browser = await chromium.launch({ headless: true });
  for (const screen of screens) {
    await check('Hub at ' + screen.label + ' (' + screen.width + 'px)', async () => {
      const page = await browser.newPage({viewport:{width:screen.width,height:screen.height}});
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        const response = await page.goto(host + '/', {waitUntil:'load'});
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('main').count(), 1);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('#guides a.card').count(), 4);
        assert.equal(await page.locator('#guides .card--coming[disabled]').count(), 2);
        assert.equal(await page.locator('a[href="#coaching"]').count() > 0, true, 'Coaching must be easy to find from hub nav');
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          navRows: [...document.querySelectorAll('.site-nav-links a')].map(a=>Math.round(a.getBoundingClientRect().top)),
          lang: document.documentElement.lang,
          title: document.title,
          cards: [...document.querySelectorAll('#guides .card')].map(a => {
            const r=a.getBoundingClientRect();
            return {name:a.textContent.trim(), width:r.width, left:r.left, right:r.right, height:r.height};
          })
        }));
        assert.equal(metrics.lang, 'en');
        assert.match(metrics.title, /BFit Training Hub/);
        assert.ok(metrics.overflow <= 2, 'Unexpected page-wide horizontal overflow: '+metrics.overflow+'px');
        if (screen.width <= 390) {
          assert.ok(metrics.navRows.every(y=>y===metrics.navRows[0]), 'Header navigation wraps to multiple rows on phone');
        }
        for (const card of metrics.cards) {
          assert.ok(card.width > 200 && card.height > 100, 'Unusable guide card size: '+card.name);
          assert.ok(card.left >= -1 && card.right <= screen.width + 1, 'Guide card spills beyond viewport: '+card.name);
        }
        for (const fragment of ['guides','coaching','connect']) {
          const nav = page.locator('nav a[href="#'+fragment+'"]');
          assert.equal(await nav.count(), 1, 'Missing header navigation to #'+fragment);
          await nav.click();
          assert.equal(new URL(page.url()).hash, '#'+fragment, 'Nav did not open #'+fragment);
          assert.ok(await page.locator('#'+fragment).isVisible(), 'Section not visible: '+fragment);
        }
        for (const [name, dest] of Object.entries(social)) {
          const link = page.locator('#connect a[href="'+dest+'"]');
          assert.equal(await link.count(), 1, name+' link missing');
          assert.ok(await link.isVisible(), name+' link hidden');
          assert.equal(await link.getAttribute('target'), '_blank', name+' should open new tab');
          assert.match(await link.getAttribute('rel') || '', /\bnoopener\b/, name+' should use noopener');
        }
        assert.equal(await page.locator('#coaching a[href="https://forms.gle/f11PGA7PCUKaxrgq9"]').count(), 1);
        await page.screenshot({path:path.join(folder,'hub-release-'+screen.label+'.png'),fullPage:true,animations:'disabled'});
        assert.deepEqual(errors, [], 'Browser JavaScript errors');
      } finally { await page.close(); }
    });
  }
  await check('Hub keyboard navigation and guide-card activation', async () => {
    const page=await browser.newPage({viewport:{width:1366,height:900}});
    try {
      await page.goto(host+'/');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')), '#main-content');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')), '#guides');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')), '#coaching');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')), '#connect');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')), 'guides/foundation/');
      await page.keyboard.press('Enter');
      await page.waitForURL('**/guides/foundation/');
      assert.match(await page.title(), /Foundation/i);
    } finally { await page.close(); }
  });
  await check('Four guide cards open correct pages and each has a hub return link', async () => {
    for (let i=0;i<expected.length;i++) {
      const page=await browser.newPage({viewport:{width:390,height:844}});
      try {
        await page.goto(host+'/');
        await page.locator('#guides a.card').nth(i).click();
        await page.waitForURL('**/guides/'+expected[i].slug+'/');
        assert.ok((await page.title()).length>0);
        assert.ok(await page.locator('a[href="https://vtrackstar.github.io/bfit/"]').count() > 0,
          'Guide lacks a hub return link: '+expected[i].name);
        assert.ok((await page.locator('body').innerText()).length>150,'Guide rendered no content: '+expected[i].name);
      } finally { await page.close(); }
    }
  });
  await check('Hub WCAG 2.1 A and AA accessibility scan', async () => {
    // axe-core/playwright requires a standalone browser context rather than browser.newPage().
    const context = await browser.newContext({viewport:{width:390,height:844}});
    const page = await context.newPage();
    try {
      await page.goto(host+'/');
      const result = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      if (result.violations.length) {
        throw Error(result.violations.map(v=>v.id+' ('+v.impact+'): '+v.nodes.map(n=>n.target.join(' ')).join(', ')).join(' | '));
      }
    } finally { await context.close(); }
  });
} catch (e) {
  failures.push('Runner: ' + e.message);
  console.error('FAIL runner: ' + e.message);
} finally {
  if(browser) await browser.close();
  server.kill();
}
if (failures.length) {
  console.error('Hub publishing gate failed: '+failures.join(' || '));
  process.exitCode=1;
} else {
  console.log('PASS hub publishing gate: responsive layout, navigation, keyboard, guide entry, required links, WCAG A/AA automated scan.');
  console.log('Note: This does not verify external provider behavior, manual screen-reader use, physical devices, or actual checkout and form submissions.');
}

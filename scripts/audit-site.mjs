// Run with: node scripts/audit-site.mjs
// Dependency-free static checks. These do not replace a real browser test.
import fs from 'node:fs';
import vm from 'node:vm';

const base = 'https://vtrackstar.github.io/bfit/';
const paths = ['index.html','guides/foundation/index.html','guides/athleticism/index.html','guides/gamer-fit/index.html','guides/run-strong/index.html','coaching/index.html'];
const pages = new Map(paths.map(path => [path, fs.readFileSync(path, 'utf8')]));
const errors = [];
let scriptsChecked = 0, jsonChecked = 0, linksChecked = 0, anchorsChecked = 0;
const add = (path, message) => errors.push(path + ': ' + message);
const canonicalFor = path => base + (path === 'index.html' ? '' : path.slice(0, -'index.html'.length));
const attr = (tag, key) => {
  const m = tag.match(new RegExp('\\b' + key + '\\s*=\\s*(["\\x27])([^"\\x27]*)\\1', 'i'));
  return m ? m[2] : null;
};
for (const [path, html] of pages) {
  const expected = canonicalFor(path);
  if (!/<!doctype\s+html\s*>/i.test(html.slice(0, 2000))) add(path, 'missing doctype');
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) add(path, 'missing viewport');
  if (!html.includes('<link rel="canonical" href="' + expected + '">')) add(path, 'missing or wrong canonical');
  if (!/<\/html>\s*$/i.test(html)) add(path, 'missing end tag');
  if (path !== 'index.html' && !html.includes(base)) add(path, 'missing hub link');
  if (path !== 'coaching/index.html' && /https:\/\/forms\.gle\/f11PGA7PCUKaxrgq9/.test(html)) add(path, 'closed form linked directly; use coaching status page');
  if (path === 'coaching/index.html') {
    if (!/Coaching inquiries are paused/i.test(html)) add(path, 'coaching intake pause notice missing');
    if (/href=["']https:\/\/forms\.gle\//i.test(html)) add(path, 'paused intake should not send visitors to the closed form');
  } else for (const required of [
    'https://www.instagram.com/_trainwithbfit/',
    'https://www.tiktok.com/@_trainwithbfit',
    'https://www.twitch.tv/gamewithbfit',
    'https://discord.gg/9yfqjvZPg',
    'https://vtrackstar.github.io/bfit/coaching/'
  ]) {
    if (!html.includes(required)) add(path, 'missing shared social, community or coaching destination: '+required);
  }
  if (/Discord access is shared privately with coaching clients/i.test(html))
    add(path, 'outdated private-only Discord wording');
  if (/Individual Coaching and Individual Coaching/i.test(html))
    add(path, 'outdated duplicated coaching name');
  if (path !== 'coaching/index.html' && (!/\bPremium\b/i.test(html) || !/\bElite\b/i.test(html)))
    add(path, 'missing current Premium/Elite plan names');

  if (/https:\/\/(?:foundation-training-skill-tree|bfit-run-strong|bfit-gamer-fit)\.stormy-lamp-8931\.chatgpt\.site/gi.test(html)) add(path, 'outdated guide host');
  if (html.includes('bfit-exercise-movement-library.stormy-lamp-8931.chatgpt.site')) add(path, 'old exercise-library host (use bfit-exercise-movement-library.balouissaint.chatgpt.site)');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
  scripts.forEach((m,i) => {
    const type = attr(m[1],'type') || 'text/javascript';
    if (type === 'application/json') {
      try { JSON.parse(m[2]); jsonChecked++; }
      catch(e) { add(path, 'invalid JSON script ' + i + ': ' + e.message); }
    } else if (['text/javascript','module','application/javascript'].includes(type)) {
      try { new vm.Script(m[2], {filename: path + '#script-' + i}); scriptsChecked++; }
      catch(e) { add(path, 'invalid JavaScript script ' + i + ': ' + e.message); }
    }
  });
  const staticHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
  const ids = new Set();
  for (const m of staticHtml.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    if (ids.has(m[1])) add(path, 'duplicate static ID: ' + m[1]);
    ids.add(m[1]);
  }
  for (const m of staticHtml.matchAll(/<a\b[^>]*>/gi)) {
    const tag = m[0], href = attr(tag, 'href');
    if (!href) { add(path, 'anchor without href: ' + tag.slice(0,90)); continue; }
    if (/^javascript:/i.test(href)) { add(path, 'javascript URL'); continue; }
    if (/target\s*=\s*["']_blank["']/i.test(tag) && !/rel\s*=\s*["'][^"']*noopener/i.test(tag)) add(path, 'new-tab link missing noopener');
    if (href === '#' || href.startsWith('mailto:') || href.startsWith('tel:') || href.includes('$'+'{')) continue;
    let dest;
    try { dest = new URL(href,expected); } catch { add(path, 'invalid URL: ' + href); continue; }
    linksChecked++;
    if (href.startsWith('#')) {
      anchorsChecked++;
      if (!ids.has(decodeURIComponent(href.slice(1)))) add(path,'missing static anchor: '+href);
    }
    if (dest.origin !== 'https://vtrackstar.github.io' || !dest.pathname.startsWith('/bfit/')) continue;
    const sub = decodeURIComponent(dest.pathname.slice('/bfit/'.length));
    const target = sub === '' ? 'index.html' : sub.endsWith('/') ? sub + 'index.html' : sub;
    if (!pages.has(target)) add(path, 'site link targets missing file: '+href);
  }
}
console.log('Checked '+pages.size+' pages; '+scriptsChecked+' JS scripts; '+jsonChecked+' JSON scripts; '+linksChecked+' links; '+anchorsChecked+' static anchors.');
if (errors.length) {
  for (const err of errors) console.error('FAIL: '+err);
  process.exitCode = 1;
} else {
  console.log('PASS: syntax, static links, metadata and IDs');
  console.log('Real browser interactions, responsive behavior and external destinations still need manual testing.');
}

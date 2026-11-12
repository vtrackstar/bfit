// Keep the editorial improvements from silently regressing.
// Run alongside the source and browser QA: node scripts/editorial-smoke.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';

const paths=['index.html','guides/foundation/index.html','guides/athleticism/index.html','guides/gamer-fit/index.html','guides/run-strong/index.html'];
const pages=Object.fromEntries(paths.map(p=>[p,fs.readFileSync(p,'utf8')]));
const hub=pages['index.html'];
const foundation=pages['guides/foundation/index.html'];
const athleticism=pages['guides/athleticism/index.html'];
const gamer=pages['guides/gamer-fit/index.html'];
const running=pages['guides/run-strong/index.html'];
for(const [path,html] of Object.entries(pages)){
  assert.ok(html.includes('https://vtrackstar.github.io/bfit/coaching/'),path+' missing coaching availability link');
  assert.ok(!html.includes('https://forms.gle/f11PGA7PCUKaxrgq9'),path+' links directly to a closed inquiry form');
}
assert.ok(!hub.includes('See the questionnaire for check-in schedules'), 'stale hub questionnaire invitation');
assert.ok(hub.includes('When coaching applications reopen'), 'hub does not clarify paused enrollment');
assert.ok(!foundation.includes('See the coaching questionnaire'), 'stale Foundation price comparison');
assert.ok(!athleticism.includes('Use these four weeks to practice the movements and track how you respond.'), 'duplicated Week 4 text');
const boxCount=[...gamer.matchAll(/class="tldr-box\b/g)].length;
const nextCount=[...gamer.matchAll(/class="tldr-next"/g)].length;
assert.ok(boxCount>=18, 'Gamer Fit lost chapter quick summaries');
assert.ok(nextCount>=17, 'Gamer Fit lost next-chapter links');
assert.equal([...gamer.matchAll(/<strong>Key takeaway:<\/strong>/g)].length,0, 'Gamer Fit has outdated double-summary template');
assert.equal([...gamer.matchAll(/<strong>Do this:<\/strong>/g)].length,0, 'Gamer Fit has outdated double-summary template');
for(const term of ['37/47-second surge targets','2 × 6-minute threshold example']){
 assert.ok(running.includes(term),'Run Strong lost specific teaching example: '+term);
}
console.log('PASS: coaching pause language, Gamer Fit chapter structure, and key coaching examples');

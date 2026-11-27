// Validate the in-repo Exercise & Movement Library's static release and stable BFIT links.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const base='exercise-library/';
const html=fs.readFileSync(base+'index.html','utf8');
const snapshot=JSON.parse(fs.readFileSync(base+'catalog.json','utf8'));
const embedded=html.match(/<script type="application\/json" id="catalog">([\s\S]*?)<\/script>/);
assert.ok(embedded,'Missing embedded offline catalog');
const inline=JSON.parse(embedded[1]);
assert.deepEqual(inline,snapshot,'Embedded and machine-readable catalog snapshots differ');
assert.equal(snapshot.schema_version,'1.1');
assert.equal(snapshot.entries.length,226,'Unexpected reviewed library snapshot size');
assert.equal(new Set(snapshot.entries.map(x=>x.id)).size,snapshot.entries.length,'Duplicate BFIT IDs');
assert.ok(snapshot.entries.every(x=>/^BFIT-\d{5}$/.test(x.id)&&x.name&&x.steps),'Invalid BFIT ID or missing instructions');
for(const id of ['BFIT-00001','BFIT-00014','BFIT-00126','BFIT-00176','BFIT-00193','BFIT-00228'])assert.ok(snapshot.entries.some(x=>x.id===id),'Missing stable anchor '+id);
assert.ok(html.includes('<link rel="canonical" href="https://vtrackstar.github.io/bfit/exercise-library/">'));
assert.ok(html.includes('href="https://vtrackstar.github.io/bfit/"'),'Missing hub return link');
for(const fn of ['app.js','catalog-feed.js','feed-config.js']){const js=fs.readFileSync(base+fn,'utf8');new vm.Script(js,{filename:fn});assert.ok(html.includes('src="'+fn+'"'),'Script not loaded: '+fn);}
assert.ok(fs.readFileSync(base+'app.js','utf8').includes("location.hash"),'Missing BFIT hash navigation');
assert.ok(fs.readFileSync('index.html','utf8').includes('href="exercise-library/"'),'Hub does not link to local library');
const pages=['index.html','guides/foundation/index.html','guides/gamer-fit/index.html','guides/run-strong/index.html','guides/athleticism/index.html','guides/50-plus/progress/index.html'];
for(const p of pages)assert.ok(!/bfit-exercise-movement-library\.[\w-]+\.chatgpt\.site/.test(fs.readFileSync(p,'utf8')),'Stale library host in '+p);
console.log('PASS Exercise Library: '+snapshot.entries.length+' unique IDs, snapshot integrity, scripts, hub and guide links');

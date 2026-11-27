import assert from 'node:assert/strict';
import {buildPlan,feedback,estimateSeconds,needsRecheck} from '../guides/build-your-mobility/engine.mjs';
const p=buildPlan({mode:'targeted',area:'hips',minutes:10});
const left=p.find(i=>i.key==='hip-in'&&i.side==='left'),right=p.find(i=>i.key==='hip-in'&&i.side==='right');
assert.ok(left&&right);
const a=feedback(left,'comfortable',true,false,'2026-11-01T12:00:00Z');
const b=feedback(a,'comfortable',true,false,'2026-11-03T12:00:00Z');
assert.equal(b.level,2);assert.equal(right.level,1);
assert.equal(feedback(a,'comfortable',true,false,'2026-11-01T13:00:00Z'),a);
const paused=feedback(b,'pain',true,true,'2026-11-04T12:00:00Z');assert.ok(paused.paused);
assert.equal(feedback(paused,'comfortable'),paused);
assert.ok(buildPlan({mode:'targeted',area:'hips',previous:[paused]}).find(i=>i.key==='hip-in'&&i.side==='left').paused);
assert.equal(buildPlan({mode:'complement',area:'hips',existing:['hip-in','hip-out','knee-lift']}).length,0);
assert.ok(buildPlan({minutes:5}).reduce((sum,i)=>sum+estimateSeconds(i),0)<=300);
const maint=feedback(left,'comfortable',true,true,'2026-11-01T12:00:00Z');assert.ok(maint.maintain);
assert.equal(feedback(maint,'comfortable',true,false,'2026-11-03T12:00:00Z').level,maint.level);
assert.ok(needsRecheck(a,'2026-11-20T12:00:00Z')); const returned=feedback(a,'comfortable',true,false,'2026-11-20T12:00:00Z'); assert.equal(returned.recheck,false); assert.equal(returned.streak,0); assert.equal(feedback(returned,'comfortable',true,false,'2026-11-22T12:00:00Z').streak,1);
assert.equal(feedback(a,'comfortable',false,false,'2026-11-03T12:00:00Z').streak,0);
console.log('Mobility engine checks passed');

// Optional strength work must never silently replace general movement practice.
assert.equal(buildPlan({mode:'targeted',area:'lateral',minutes:15}).some(i=>i.key==='lateral-strength'),false);
const strength=buildPlan({mode:'targeted',area:'lateral',movement:'lateral-strength',strength:true,minutes:10,difficulty:'hold'});
assert.equal(strength.length,2);
assert.ok(strength.every(i=>i.key==='lateral-strength'&&i.level===0));
assert.equal(buildPlan({mode:'complement',area:'lateral',movement:'lateral-strength',strength:true,existing:['lateral-strength']}).length,0);
assert.equal(buildPlan({mode:'targeted',area:'hips',movement:'hip-out',side:'left'}).length,1);
assert.equal(buildPlan({mode:'targeted',area:'hips',movement:'hip-out',side:'left'})[0].key,'hip-out');
assert.equal(feedback(left,'uncontrolled',true,true,'2026-11-05T12:00:00Z').maintain,false);
console.log('Mobility strength and targeted selection checks passed');

// Routine rebuilds must not silently discard achieved goals.
const rebuilt=buildPlan({mode:'targeted',area:'hips',minutes:5,previous:[maint],now:'2026-11-03T12:00:00Z'}).find(i=>i.key==='hip-in'&&i.side==='left');
assert.ok(rebuilt.maintain);
const changed=buildPlan({mode:'targeted',area:'hips',movement:'hip-in',side:'left',difficulty:'return',previous:[rebuilt]})[0];
assert.equal(changed.maintain,false);
const short=buildPlan({minutes:5});
assert.ok(short.some(i=>i.key==='reach')&&short.some(i=>i.key==='hinge')&&short.some(i=>i.key==='foot'));
let slow=buildPlan({mode:'targeted',area:'ankles',movement:'calf-raise',strength:true,difficulty:'return'})[0];
assert.equal(slow.level,0);
for(const day of [1,3,5,7,9,11])slow=feedback(slow,'comfortable',true,false,'2026-11-'+String(day).padStart(2,'0')+'T12:00:00Z');
assert.equal(slow.level,3);
assert.equal(slow.reps,4);
let hold=buildPlan({mode:'targeted',area:'ankles',movement:'calf-raise',strength:true,difficulty:'hold'})[0];
for(const day of [1,3,5,7,9,11])hold=feedback(hold,'comfortable',true,false,'2026-11-'+String(day).padStart(2,'0')+'T12:00:00Z');
assert.equal(hold.level,2);
console.log('Maintenance, balanced short routine, return and eccentric progression checks passed');

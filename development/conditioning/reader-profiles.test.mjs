import assert from 'node:assert/strict';
import { phases, seconds } from './engine.mjs';
import { appNew, appCurrent, appStart, appSave, appRecovery, appOutside, appCalendarEdit, appNextCycle, appBackup, appRestore, appReport } from './app-state.mjs';
const base={mode:"bike",goal:"B",setup:"bike",restricted:false,vigorousSuitable:true,existingHard:false,recovery:"normal",comfortableMinutes:5};
let count=0;const check=(name,f)=>{f();count++;console.log("PASS "+name);};
function perform(a,p,slot,budget,changes={}){
 const id="work-"+slot.day,r=appStart(a,p,slot.id,slot.day,budget,id,"manual");
 if(!r.app.active)return {a,action:r.action,dose:null};
 const d=r.app.active.ticket.dose,actual=d.kind==="swim"?{lengths:d.lengths,swimSeconds:null,restSeconds:null}:phases(d);
 if(d.kind!=="swim")assert(seconds(d)<=budget,"land time budget exceeded");
 const next=appSave(r.app,{confirmed:true,status:"full",actual,effort:d.effort[1],quality:true,warning:false,pain:false,recoveryExtended:false,...changes},slot.day);
 return {a:appRestore(appBackup(appRecovery(next,id,"normal",slot.day+1),slot.day+1),slot.day+1),dose:d,action:r.action};
}
function simulate(p,days,budget,cycles=3,optional=null){
 let a=appNew(100,days,optional),trace=[],holds=[];
 for(let k=0;k<cycles;k++){
  if(k)a=appNextCycle(a,100+28*k,days,optional,100+28*k);
  for(const sl of appCurrent(a).calendar.slots){
   const r=perform(a,p,sl,budget);a=r.a;
   if(r.dose)trace.push({dose:r.dose,day:sl.day,kind:sl.kind});else holds.push({day:sl.day,action:r.action});
  }
 }
 return {a,trace,holds};
}
check("inactive walker uses manageable short efforts over 12 weeks",()=>{
 const r=simulate({...base,mode:"walk",setup:"level walk",goal:"A",comfortableMinutes:0},[0,3],1800);
 assert.equal(r.trace[0].dose.kind,"bouts");assert.equal(r.trace[0].dose.minutes,1);assert(r.trace.every(x=>x.dose.effort[1]<=5));assert(r.trace.some(x=>x.dose.kind==="steady"));assert(r.trace.every(x=>x.dose.mode==="walk"));
});
check("busy lifter with existing demanding work never receives intervals",()=>{
 const r=simulate({...base,mode:"bike",existingHard:true,comfortableMinutes:20},[0,3],1200);
 assert(r.trace.length>0);assert(r.trace.every(x=>x.dose.kind!=="interval"&&x.dose.effort[1]<=5));assert(r.trace.every(x=>seconds(x.dose)<=1200));
});
check("recreational basketball replacement cannot add same-day demand",()=>{
 let a=appNew(100,[0,3]);const s=appCurrent(a).calendar.slots[0];
 a=appOutside(a,{id:"game",day:100,activity:"Basketball",minutes:60,intensity:"hard"},100);
 assert.equal(appStart(a,base,s.id,100,1800,"work").action,"outside-work-or-rest");
 a=appCalendarEdit(a,"replace",s.id,"game",100);assert.equal(appReport(a,100,100).primary.external,1);assert.equal(appReport(a,100,100).primary.full,0);
});
check("experienced cyclist still establishes recorded baseline before hard work",()=>{
 const r=simulate({...base,comfortableMinutes:60,hardOptIn:true},[0,3],5400,12);
 assert.equal(r.trace[0].dose.kind,"steady");assert(r.trace[0].dose.effort[1]<=3);
 const i=r.trace.findIndex(x=>x.dose.effort[1]===8);assert(i>0);assert(r.trace.slice(0,i).filter(x=>x.dose.id==="b120x4").length>=2);
});
check("optional sessions stay easy and distinct from primary attendance",()=>{
 const r=simulate({...base,goal:"A"},[0,3],1800,2,5);
 assert(r.trace.filter(x=>x.kind==="optional").length>0);assert(r.trace.filter(x=>x.kind==="optional").every(x=>x.dose.effort[1]<=3));
 assert.equal(appReport(r.a,100,156).primary.full,8);
});
check("switching activity cannot transfer bike progression into running",()=>{
 const r=simulate({...base,comfortableMinutes:30},[0,3],5400,2);
 const a=appNextCycle(r.a,156,[0,3],null,156),sl=appCurrent(a).calendar.slots[0];
 assert.equal(appStart(a,{...base,mode:"run",setup:"road",recentRun:false},sl.id,156,1800,"run").action,"walk-or-run-guide");
 const q=perform(a,{...base,mode:"walk",setup:"park",comfortableMinutes:0},sl,1800);
 assert.equal(q.dose.kind,"bouts");assert.equal(q.dose.minutes,1);
});
check("missed weeks do not create catch-up sessions or a harder return",()=>{
 let a=appNew(100,[0,3]);const slots=appCurrent(a).calendar.slots;
 const first=perform(a,base,slots[0],1800);a=first.a;
 const second=perform(a,base,slots[1],1800);a=second.a;
 const r=perform(a,base,slots[5],1800);assert(r.dose);assert(r.dose.effort[1]<=second.dose.effort[1]);
 assert(appReport(r.a,100,slots[5].day).primary.missed>=3);
 assert.equal(appStart(r.a,base,slots[2].id,slots[5].day+1,1800,"late").action,"missed-no-catchup");
});
check("current fatigue blocks training even after successful past recovery",()=>{
 const r=simulate(base,[0,3],1800,1);const a=appNextCycle(r.a,128,[0,3],null,128),sl=appCurrent(a).calendar.slots[0];
 for(const recovery of ["extra","limiting"])assert.equal(appStart(a,{...base,recovery},sl.id,128,1800,"tired").action,"recover-or-rest");
});
check("restricted exercise cannot be unlocked by advanced preferences",()=>{
 const a=appNew(100,[0]),sl=appCurrent(a).calendar.slots[0];
 assert.equal(appStart(a,{...base,restricted:true,comfortableMinutes:60,hardOptIn:true},sl.id,100,5400,"restricted").action,"medical-review");
});
check("very short available time cannot cut warm-up or recovery to force a visit",()=>{
 const a=appNew(100,[0]),sl=appCurrent(a).calendar.slots[0];
 assert.equal(appStart(a,{...base,comfortableMinutes:0},sl.id,100,300,"short").app.active,null);
});
console.log(count+" reader profile checks passed");

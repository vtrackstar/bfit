import { interval, phases, reduce, recommend, success } from './engine.mjs';
import { trainingView } from './calendar.mjs';
import { appNew, appCurrent, appStart, appSave, appRecovery, appReport, appBackup, appRestore, appNextCycle, appCalendarEdit } from './app-state.mjs';

function integrationTests(){
 const out=[],check=(n,b)=>{if(!b)throw Error(n);out.push(n)},fails=f=>{try{f();return false}catch{return true}};
 const p={mode:"bike",goal:"B",setup:"bike1",restricted:false,vigorousSuitable:true,existingHard:false,recovery:"normal",comfortableMinutes:5};
 const base=appNew(100,[0,3],5);
 const get=(app,profile,day,budget=3600)=>{const sl=appCurrent(app).calendar.slots.find(x=>x.day===day);return appStart(app,profile,sl.id,day,budget,"session-"+day,"manual")};
 const finish=(app,day,extra={})=>{const d=app.active.ticket.dose;return appSave(app,{confirmed:true,status:"full",actual:phases(d),effort:d.effort[1],quality:true,warning:false,pain:false,recoveryExtended:false,...extra},day)};
 let state=base,day=100,all=[];
 for(let cycle=0;cycle<7;cycle++){
  if(cycle>0)state=appNextCycle(state,100+28*cycle,[0,3],5,100+28*cycle);
  for(const slot of appCurrent(state).calendar.slots.filter(x=>x.kind==="primary")){
   day=slot.day;const r=get(state,p,day);if(!r.app.active)throw Error("journey blocked "+day+" "+r.action);
   all.push(r.app.active.ticket.dose);state=finish(r.app,day);state=appRecovery(state,"session-"+day,"normal",day+1);state=appRestore(appBackup(state,day+1),day+1);
  }
 }
 check("56 primary visits across seven four-week cycles",state.history.logs.length===56&&state.cycles.length===7);
 check("beginner starts easy",all[0].effort[1]===3&&all[1].effort[1]===3);
 check("base before intervals",all.findIndex(x=>x.kind==="interval")>all.findIndex(x=>x.kind==="steady"&&x.minutes>=15));
 check("controlled intervals emerge without maximal effort",all.some(x=>x.id==="bridge30")&&all.every(x=>x.effort[1]<=7));
 check("full attendance not inflated by optional",appReport(state,100,day+1).primary.full===8&&appReport(state,100,day+1).optional.full===0);
 check("history preserved through repeated backups",appRestore(appBackup(state,day+1),day+1).history.logs.length===56);
 let one=appNew(100,[0]);for(const sl of appCurrent(one).calendar.slots){const x=get(one,p,sl.day);one=finish(x.app,sl.day);one=appRecovery(one,"session-"+sl.day,"normal",sl.day+1);}
 check("normal one-day weekly cadence progresses",one.history.logs[2].dose.minutes>one.history.logs[0].dose.minutes);
 const active=get(base,p,100).app;
 check("known restriction blocks start",get(base,{...p,restricted:true},100).app.active===null);
 check("known condition uncertain suitability blocks start",get(base,{...p,knownCondition:true,vigorousSuitable:false},100).app.active===null);
 check("unfamiliar run does not silently log walking",get(base,{...p,mode:"run",setup:"track",recentRun:false},100).app.active===null);
 check("unprepared optional five minutes not forced",get(base,{...p,comfortableMinutes:1},105).app.active===null);
 const zero={confirmed:true,status:"skipped",actual:[],effort:null,quality:false,warning:false,pain:false,recoveryExtended:false};
 let pain=appSave(active,{...zero,pain:true,reason:"pain"},100);
 check("zero-work pain blocks mode",get(pain,p,103).app.active===null);
 check("pain cannot be bypassed by new setup",get(pain,{...p,setup:"bike2"},103).app.active===null);
 let warning=appSave(active,{...zero,warning:true,reason:"symptoms"},100);
 check("warning survives backup and blocks modes",get(appRestore(appBackup(warning,103),103),{...p,mode:"walk",setup:"path"},103).action==="medical-review");
 check("manual symptoms cannot be logged without flag",fails(()=>appSave(active,{...zero,reason:"symptoms"},100)));
 let fatigued=finish(active,100);fatigued=appRecovery(fatigued,"session-100","extra",101);
 const moved=appCalendarEdit(fatigued,"move",appCurrent(fatigued).calendar.slots.find(x=>x.day===103).id,101,101);
 check("recent extra fatigue blocks across slots",get(moved,p,101).app.active===null);
 check("later recovered day resumes without rewriting prior report",get(fatigued,p,103).app.active!==null&&fatigued.history.logs[0].recovery==="extra");
 const d=interval("bike","b60x4"),rd=reduce(d);
 check("reduced dose not full original readiness",!success({dose:rd,status:"full",effort:6,quality:true,recovery:"normal"}));
 const l=(dose,day)=>({dose,day,setup:p.setup,status:"full",effort:dose.effort[1],quality:true,recovery:"normal"});
 check("A cannot drift into B ladder without steady readiness",recommend({...p,goal:"A",tempoOptIn:true},d,[l(d,98),l(d,95)],100).action==="hold-cap");
 const hard=interval("bike","b120x4");
 check("A cannot unlock hard from B history",recommend({...p,goal:"A",tempoOptIn:true,hardOptIn:true},hard,[l(hard,98),l(hard,95)],100).dose===null);
 const tempo=interval("bike","tempo300x2");
 check("B cannot silently follow tempo",recommend(p,tempo,[l(tempo,98),l(tempo,95)],100).dose===null);
 let optional=get(base,p,105).app;optional=finish(optional,105);optional=appRecovery(optional,"session-105","normal",106);
 check("optional report separate",appReport(optional,100,106).optional.full===1&&appReport(optional,100,106).primary.full===0);
 check("optional never supplies primary readiness",trainingView(optional.history).logs.length===0);
 return out;
}

const results=integrationTests();for(const n of results)console.log('PASS '+n);console.log(results.length+' integrated checks passed');

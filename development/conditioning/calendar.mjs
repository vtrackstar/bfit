import { screen, steady, steadyGate, fitTime } from './engine.mjs';
import { validateState, visit, addLog } from './workflow.mjs';

/* Local calendar day IDs; planned slots are distinct from actual activity. */
const CYCLE_VERSION=1;
const dayOK=n=>Number.isInteger(n)&&n>=0&&n<=1000000;
const demand=l=>l.dose?.kind==="interval"||l.dose?.kind==="circuit"&&l.dose.effort[1]>5;
const externalDemand=l=>["challenging","hard","unknown"].includes(l.intensity);
function cycleAssert(ok,msg){if(!ok)throw Error(msg);}
function makeCycle(start,primaryOffsets,optionalOffset=null){
 cycleAssert(dayOK(start)&&dayOK(start+27),"Invalid start");
 cycleAssert(Array.isArray(primaryOffsets)&&primaryOffsets.length>=1&&primaryOffsets.length<=2&&primaryOffsets.every(x=>Number.isInteger(x)&&x>=0&&x<=6)&&new Set(primaryOffsets).size===primaryOffsets.length,"Choose one or two distinct days");
 cycleAssert(optionalOffset===null||Number.isInteger(optionalOffset)&&optionalOffset>=0&&optionalOffset<=6&&!primaryOffsets.includes(optionalOffset),"Invalid optional day");
 const sorted=primaryOffsets.slice().sort((a,b)=>a-b),slots=[];
 for(let week=0;week<4;week++){
  sorted.forEach((offset,i)=>slots.push({id:start+":"+week+":p"+(i+1),week,index:i,kind:"primary",day:start+7*week+offset}));
  if(optionalOffset!==null)slots.push({id:start+":"+week+":optional",week,index:2,kind:"optional",day:start+7*week+optionalOffset});
 }
 return {version:CYCLE_VERSION,start,primaryOffsets:sorted,optionalOffset,slots:slots.sort((a,b)=>a.day-b.day)};
}
function validateCycle(c){
 cycleAssert(c&&c.version===CYCLE_VERSION&&Array.isArray(c.slots),"Invalid cycle");
 const base=makeCycle(c.start,c.primaryOffsets,c.optionalOffset);
 cycleAssert(c.slots.length===base.slots.length,"Invalid slot count");
 const dates=new Set();
 for(const b of base.slots){const s=c.slots.find(x=>x.id===b.id);cycleAssert(s&&s.week===b.week&&s.index===b.index&&s.kind===b.kind&&dayOK(s.day)&&s.day>=c.start+7*b.week&&s.day<=c.start+7*b.week+6&&!dates.has(s.day),"Invalid slot/date");dates.add(s.day);}
 return true;
}
function validateLinks(c,s,replacements,now){
 validateCycle(c);validateState(s,now);cycleAssert(Array.isArray(replacements),"Invalid replacements");
 const ids=new Set(),externalIds=new Set();
 for(const l of s.logs.filter(l=>l.plannedId&&c.slots.some(x=>x.id===l.plannedId))){
  const slot=c.slots.find(x=>x.id===l.plannedId);
  cycleAssert(!ids.has(slot.id)&&l.source!=="prior"&&l.day===slot.day&&!!l.optional===(slot.kind==="optional"),"Invalid scheduled record");ids.add(slot.id);
 }
 for(const r of replacements){const slot=c.slots.find(x=>x.id===r.slotId),ext=s.external.find(x=>x.id===r.externalId);
  cycleAssert(slot&&slot.kind==="primary"&&ext&&ext.day===slot.day&&ext.intensity!=="unknown"&&!ids.has(slot.id)&&!externalIds.has(ext.id),"Invalid or duplicate replacement");ids.add(slot.id);externalIds.add(ext.id);
 }
 return true;
}
function slotStatus(c,s,replacements,now){
 validateLinks(c,s,replacements,now);
 return c.slots.map(slot=>{const l=s.logs.find(l=>l.plannedId===slot.id),r=replacements.find(r=>r.slotId===slot.id);return {...slot,status:l?l.status:r?"external":slot.day<now?"missed":slot.day===now?"due":"upcoming"};}).sort((a,b)=>a.day-b.day);
}
function reschedule(c,s,replacements,id,newDay,now){
 const slot=slotStatus(c,s,replacements,now).find(x=>x.id===id);
 cycleAssert(slot&&["due","upcoming"].includes(slot.status)&&dayOK(newDay)&&newDay>=now&&newDay>=c.start+slot.week*7&&newDay<=c.start+slot.week*7+6,"Choose a future day in the same week");
 cycleAssert(!c.slots.some(x=>x.id!==id&&x.day===newDay),"Day already has a slot");
 const n={...c,slots:c.slots.map(x=>x.id===id?{...x,day:newDay}:x).sort((a,b)=>a.day-b.day)};validateLinks(n,s,replacements,now);return n;
}
function replaceWithExternal(c,s,replacements,slotId,externalId,now){
 const next=[...replacements,{slotId,externalId}];validateLinks(c,s,next,now);return next;
}
function trainingView(s){return {...s,logs:s.logs.filter(l=>!l.optional||l.warning||l.pain)};}
function scheduledVisit(c,s,replacements,p,id,now,budget){
 const slot=slotStatus(c,s,replacements,now).find(x=>x.id===id);
 if(p.currentSevere===true)return {action:"emergency",dose:null};
 if(s.logs.some(l=>l.warning)||p.warning===true)return {action:"medical-review",dose:null};
 if(p.pain===true||s.logs.some(l=>l.dose?.mode===p.mode&&l.pain))return {action:"pause-mode",dose:null};
 if(p.postIllness===true)return {action:"reassess-after-illness",dose:null};
 if(!slot||slot.status!=="due")return {action:slot?.status==="missed"?"missed-no-catchup":"not-due",dose:null};
 if(s.logs.some(l=>l.source!=="prior"&&l.status!=="skipped"&&l.day===now))return {action:"already-trained-today",dose:null};
 if(s.external.some(l=>l.day===now&&externalDemand(l)))return {action:"outside-work-or-rest",dose:null};
 const view=trainingView(s);
 const adjacent=s.logs.some(l=>l.source!=="prior"&&l.status!=="skipped"&&l.day===now-1&&demand(l))||s.external.some(l=>l.day===now-1&&externalDemand(l))||p.adjacentDemand===true;
 const latest=s.logs.filter(l=>l.source!=="prior"&&l.status!=="skipped"&&l.day<now).sort((a,b)=>b.day-a.day)[0];
 const recovery=latest&&latest.recovery!=="normal"?latest.recovery:p.recovery;
 if(recovery==="limiting"||recovery==="extra")return {action:"recover-or-rest",dose:null};
 if(slot.kind==="optional"){
  if(recovery!=="normal"||!["walk","march","bike","row","elliptical","stairs","run"].includes(p.mode)||p.mode==="run"&&p.recentRun!==true||screen(p)!=="ok")return {action:"optional-rest",dose:null};
  const comfortable=Number.isFinite(p.comfortableMinutes)?Math.floor(p.comfortableMinutes):0;
  const confirmed=view.logs.filter(l=>l.dose.mode===p.mode&&l.setup===p.setup&&l.dose.kind==="steady"&&l.status==="full"&&l.quality&&!l.pain&&!l.warning&&l.day<now&&now-l.day<=28);
  const n=Math.min(5,Math.max(0,comfortable,...confirmed.map(l=>l.dose.minutes)));
  if(n<5)return {action:"optional-rest",dose:null};
  const fit=fitTime(steady(p.mode,n,1,"steady2"),budget);
  return {...fit,slotId:id,optional:true,recommendation:"optional-easy"};
 }
 const days=c.primaryOffsets.length,ready=steadyGate(view.logs,p.mode,15,now,p.setup),tempoReady=steadyGate(view.logs,p.mode,25,now,p.setup);
 const lastPrimary=view.logs.filter(l=>l.plannedId&&l.status!=="skipped"&&l.dose.mode===p.mode&&l.setup===p.setup).sort((a,b)=>b.day-a.day)[0];
 const wantsInterval=p.goal==="B"&&ready||p.goal==="A"&&p.tempoOptIn===true&&tempoReady;
 const chooseInterval=!!(wantsInterval&&(days===2?slot.index===1:p.externalSteady===true||lastPrimary&&["steady","bouts"].includes(lastPrimary.dose.kind)));
 let target=p.mode==="circuit"?"circuit":p.mode==="swim"?"steady":chooseInterval?"interval":slot.index===1?"steady2":"steady";
 if(chooseInterval&&days===1&&target==="interval"&&p.goal==="A")target="steady";
 const profile={...p,days,slot:target,recovery,adjacentDemand:adjacent,alternatePrepared:days===1&&chooseInterval};
 const result=visit(view,profile,now,budget);
 if(!result.dose)return {...result,slotId:id,optional:false};
 if(result.dose.kind==="interval"&&(!chooseInterval||adjacent||recovery!=="normal"))return {action:"easy-or-rest",dose:null,slotId:id};
 return {...result,slotId:id,optional:false};
}
function saveScheduled(c,s,replacements,p,id,now,budget,actual){
 const proposed=scheduledVisit(c,s,replacements,p,id,now,budget);
 cycleAssert(proposed.dose,"No eligible session");
 cycleAssert(actual&&actual.source!=="prior"&&actual.recovery==="unknown"&&(actual.recoveryDay===null||actual.recoveryDay===undefined),"Recovery must be reported later");
 const log={...actual,day:now,setup:p.setup,dose:proposed.dose,plannedId:id,optional:proposed.optional};
 const n=addLog(s,log,now);validateLinks(c,n,replacements,now);return n;
}
function skipScheduled(c,s,replacements,id,now){
 const slot=slotStatus(c,s,replacements,now).find(x=>x.id===id);
 cycleAssert(slot&&slot.status==="due","No due slot");
 const d=steady("walk",1,1,"steady");
 const log={id:"skip:"+id,day:now,setup:"not-performed",dose:d,plannedId:id,optional:slot.kind==="optional",source:"manual",status:"skipped",actual:[],effort:null,quality:false,recovery:"unknown",warning:false,pain:false,recoveryExtended:false};
 const n=addLog(s,log,now);validateLinks(c,n,replacements,now);return n;
}
function cycleReview(c,s,replacements,now){
 const rows=slotStatus(c,s,replacements,now),primary=rows.filter(x=>x.kind==="primary"),optional=rows.filter(x=>x.kind==="optional");
 const tally=group=>Object.fromEntries(["full","shortened","skipped","external","missed","due","upcoming"].map(k=>[k,group.filter(x=>x.status===k).length]));
 return {start:c.start,end:c.start+27,reviewDue:now>=c.start+28,plannedPrimary:primary.length,plannedOptional:optional.length,primary:tally(primary),optional:tally(optional),outsideLogged:s.external.filter(x=>x.day>=c.start&&x.day<=Math.min(now,c.start+27)).length};
}

export { makeCycle, validateCycle, validateLinks, slotStatus, reschedule, replaceWithExternal, trainingView, scheduledVisit, saveScheduled, skipScheduled, cycleReview };

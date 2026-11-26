import { phases } from './engine.mjs';
import { canonical, observed, addLog } from './workflow.mjs';
import { scheduledVisit, validateLinks } from './calendar.mjs';

/* Pure phase timer. Caller supplies monotonic milliseconds, visibility events and
   local calendar day. No elapsed time is inferred across a suspended browser. */
const MAX_TICK_GAP=3000;
const sessionCopy=x=>JSON.parse(JSON.stringify(x));
function timerAssert(ok,message){if(!ok)throw Error(message);}
function timeOK(n){return Number.isSafeInteger(n)&&n>=0;}
function beginTicket(c,s,replacements,p,id,day,budget,sessionId){
 timerAssert(typeof sessionId==="string"&&sessionId.length>0&&sessionId.length<=120&&!s.logs.some(l=>l.id===sessionId),"Invalid session ID");
 const r=scheduledVisit(c,s,replacements,p,id,day,budget);
 if(!r.dose)return {action:r.action,ticket:null};
 const ticket={version:1,id:sessionId,slotId:id,day,cycleStart:c.start,setup:p.setup,dose:sessionCopy(r.dose),optional:!!r.optional};
 return {action:r.action,ticket};
}
function makeTimer(ticket){
 timerAssert(ticket?.version===1&&canonical(ticket.dose)&&ticket.dose.kind!=="swim","Use manual logging for swimming");
 return {version:1,ticket:sessionCopy(ticket),index:0,elapsedMs:0,targetMs:phases(ticket.dose)[0].seconds*1000,actual:[],state:"ready",lastMs:null,interrupted:false,extended:false,early:false,reason:null,warning:false,pain:false};
}
function timerPhase(t){return phases(t.ticket.dose)[t.index];}
function timerStart(t,ms){
 timerAssert(["ready","paused","interrupted"].includes(t.state)&&timeOK(ms),"Cannot start");
 return {...t,state:"running",lastMs:ms};
}
function timerTick(t,ms){
 if(t.state!=="running")return t;
 timerAssert(timeOK(ms),"Invalid time");
 const delta=ms-t.lastMs;
 if(delta<0||delta>MAX_TICK_GAP)return {...t,state:"interrupted",lastMs:null,interrupted:true};
 const elapsedMs=Math.min(t.targetMs,t.elapsedMs+delta);
 return {...t,elapsedMs,state:elapsedMs===t.targetMs?"awaiting":"running",lastMs:elapsedMs===t.targetMs?null:ms};
}
function timerPause(t,ms){
 const n=timerTick(t,ms);
 return n.state==="running"?{...n,state:"paused",lastMs:null}:n;
}
function timerHidden(t){
 // Visibility changes do not credit the gap since the last confirmed tick.
 return t.state==="running"?{...t,state:"interrupted",lastMs:null,interrupted:true}:t;
}
function completedPhase(t){
 const s=Math.floor(t.elapsedMs/1000),p=timerPhase(t);
 return s>0?{type:p.type,seconds:s,...(t.early&&p.type==="cool"?{earlyCooldown:true}:{})}:null;
}
function timerAdvance(t){
 timerAssert(t.state==="awaiting","Finish this phase first");
 const p=completedPhase(t),actual=p?[...t.actual,p]:t.actual.slice(),list=phases(t.ticket.dose);
 if(t.index===list.length-1)return {...t,actual,state:"finished",lastMs:null};
 const index=t.index+1;return {...t,index,actual,elapsedMs:0,targetMs:list[index].seconds*1000,state:"ready",lastMs:null};
}
function timerExtend(t,extraSeconds){
 const p=timerPhase(t);
 timerAssert(["running","paused","awaiting"].includes(t.state)&&p.type==="recovery"&&!t.extended&&Number.isInteger(extraSeconds)&&extraSeconds>=1&&extraSeconds<=p.seconds,"One bounded recovery extension");
 return {...t,targetMs:t.targetMs+extraSeconds*1000,extended:true,state:t.state==="awaiting"?"paused":t.state,lastMs:t.state==="awaiting"?null:t.lastMs};
}
function timerEnd(t,reason,withCooldown=false){
 timerAssert(!["finished"].includes(t.state)&&["time","fatigue","other","pain","symptoms"].includes(reason),"Invalid ending");
 const p=completedPhase(t),actual=p?[...t.actual,p]:t.actual.slice(),plan=phases(t.ticket.dose);
 const warning=reason==="symptoms"||t.warning,pain=reason==="pain"||t.pain;
 // Never require continued activity after symptoms or pain. No time is inferred.
 if(withCooldown&&!warning&&!pain&&t.index<plan.length-1&&actual.length>0)
  return {...t,index:plan.length-1,actual,elapsedMs:0,targetMs:plan[plan.length-1].seconds*1000,state:"ready",lastMs:null,early:!(t.index===plan.length-2&&t.elapsedMs===t.targetMs),reason,warning,pain};
 return {...t,actual,state:"finished",lastMs:null,reason:warning?"symptoms":pain?"pain":t.reason??reason,warning,pain};
}
function timerResult(t,feedback){
 timerAssert(t.state==="finished"&&feedback?.confirmed===true,"Confirm actual workout before saving");
 const actual=sessionCopy(t.actual),d=t.ticket.dose;
 const status=actual.length===0?"skipped":observed(d,actual,"full")?"full":"shortened";
 const warning=t.warning||feedback.warning===true,pain=t.pain||feedback.pain===true;
 timerAssert(typeof feedback.quality==="boolean"&&typeof feedback.warning==="boolean"&&typeof feedback.pain==="boolean","Complete workout feedback");
 const recoveryExtended=actual.some((a,i)=>a.type==="recovery"&&a.seconds>phases(d)[i].seconds);
 const l={source:"timer",status,actual,effort:status==="skipped"?null:feedback.effort,quality:feedback.quality&&!warning&&!pain,recovery:"unknown",recoveryDay:null,warning,pain,recoveryExtended,timingInterrupted:t.interrupted,...(t.reason?{reason:t.reason}:feedback.reason?{reason:feedback.reason}:{}),...(status!=="skipped"&&feedback.output!==undefined?{output:feedback.output,unit:feedback.unit}:{})};
 return l;
}
function saveTicket(c,s,replacements,ticket,feedback,now){
 validateLinks(c,s,replacements,now);
 timerAssert(ticket?.version===1&&ticket.cycleStart===c.start&&canonical(ticket.dose)&&Number.isInteger(ticket.day)&&ticket.day<=now,"Invalid ticket");
 const slot=c.slots.find(x=>x.id===ticket.slotId);
 timerAssert(slot&&slot.day===ticket.day&&!!ticket.optional===(slot.kind==="optional"),"Slot changed; preserve the actual record before resolving schedule");
 timerAssert(!s.logs.some(l=>l.plannedId===slot.id||l.id===ticket.id)&&!replacements.some(x=>x.slotId===slot.id),"Already recorded or replaced");
 timerAssert(feedback&&["timer","manual"].includes(feedback.source)&&feedback.recovery==="unknown"&&(feedback.recoveryDay===null||feedback.recoveryDay===undefined),"Recovery must be reported later");
 const l={...feedback,id:ticket.id,day:ticket.day,setup:ticket.setup,dose:sessionCopy(ticket.dose),plannedId:ticket.slotId,optional:ticket.optional};
 const n=addLog(s,l,now);validateLinks(c,n,replacements,now);return n;
}
function saveTimer(c,s,replacements,t,feedback,now){
 return saveTicket(c,s,replacements,t.ticket,timerResult(t,feedback),now);
}
function saveManual(c,s,replacements,ticket,feedback,now){
 timerAssert(feedback?.confirmed===true,"Confirm actual activity");
 timerAssert(feedback.source===undefined||feedback.source==="manual","Manual provenance only");
 const {confirmed,...record}=feedback;
 return saveTicket(c,s,replacements,ticket,{...record,source:"manual",recovery:"unknown",recoveryDay:null},now);
}

export { beginTicket, makeTimer, timerPhase, timerStart, timerTick, timerPause, timerHidden, timerAdvance, timerExtend, timerEnd, timerResult, saveTicket, saveTimer, saveManual };

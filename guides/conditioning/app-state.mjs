import { phases, key, success, steady, swim, circuit, MODES } from './engine.mjs';
import { emptyState, validateState, observed, actualTotals, updateRecovery, addExternal, addLog } from './workflow.mjs';
import { makeCycle, validateLinks, reschedule, replaceWithExternal, skipScheduled, cycleReview } from './calendar.mjs';
import { beginTicket, makeTimer, timerStart, timerTick, timerPause, timerHidden, timerAdvance, timerExtend, timerEnd, saveTimer, saveManual } from './timer.mjs';

/* Single application state, independent of browser UI and clock.
   Imported exercise is self-report; never infer medical clearance from backup. */
const APP_VERSION=1, APP_KEY="bfit.conditioning.v1";
const appClone=x=>JSON.parse(JSON.stringify(x));
const appEq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const appInt=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
function appAssert(ok,msg){if(!ok)throw Error(msg);}
function fields(o,allowed){return o&&typeof o==="object"&&!Array.isArray(o)&&Object.keys(o).every(k=>allowed.includes(k));}
function validProfile(p){
 const booleans=["restricted","vigorousSuitable","currentSevere","warning","pain","postIllness","waterCompetent","recentRun","movementsFamiliar","externalSteady","adjacentDemand","hardOptIn","tempoOptIn","knownCondition","alternatePrepared","rebaseline"];
 return fields(p,["mode","goal","setup","existingHard","recovery","comfortableMinutes","specialization","poolLength","poolUnit","days","slot",...booleans])&&MODES.includes(p.mode)&&["A","B"].includes(p.goal)&&typeof p.setup==="string"&&p.setup.trim().length>0&&p.setup.length<=120&&booleans.every(k=>p[k]===undefined||typeof p[k]==="boolean")&&(p.existingHard===undefined||typeof p.existingHard==="boolean")&&(p.recovery===undefined||["normal","extra","limiting","unknown"].includes(p.recovery))&&(p.comfortableMinutes===undefined||appInt(p.comfortableMinutes,0,120))&&(p.specialization===undefined||["power","repeat","repeat-hard"].includes(p.specialization))&&(p.poolLength===undefined||Number.isFinite(p.poolLength)&&p.poolLength>0&&p.poolLength<=100)&&(p.poolUnit===undefined||["m","yd"].includes(p.poolUnit))&&(p.days===undefined||appInt(p.days,0,3))&&(p.slot===undefined||["steady","steady2","interval","circuit"].includes(p.slot));
}
function appNew(start,days,optional=null){
 return {version:APP_VERSION,revision:0,history:emptyState(start),cycles:[{calendar:makeCycle(start,days,optional),replacements:[],reviewedDay:null}],active:null};
}
function appCurrent(a){return a.cycles[a.cycles.length-1];}
function appTicketValid(a,active,now){
 appAssert(fields(active,["ticket","profile","budget","timer","method"])&&["timer","manual"].includes(active.method),"Invalid active session");
 const {ticket,profile,budget,timer}=active,c=appCurrent(a);
 appAssert(validProfile(profile),"Invalid profile values");
 appAssert(fields(ticket,["version","id","slotId","day","cycleStart","setup","dose","optional"])&&ticket.version===1&&appInt(ticket.day,0,now)&&appInt(budget,1,86400),"Invalid ticket");
 const r=beginTicket(c.calendar,a.history,c.replacements,profile,ticket.slotId,ticket.day,budget,ticket.id);
 appAssert(r.ticket&&appEq(r.ticket,ticket),"Active prescription does not match eligibility");
 if(active.method==="manual"){appAssert(timer===null,"Manual session has no timer");return;}
 appAssert(timer&&appEq(timer.ticket,ticket)&&timer.version===1,"Invalid timer ticket");
 appAssert(fields(timer,["version","ticket","index","elapsedMs","targetMs","actual","state","lastMs","interrupted","extended","early","reason","warning","pain"]),"Unknown timer fields");
 const pp=phases(ticket.dose),p=pp[timer.index];
 appAssert(p&&appInt(timer.index,0,pp.length-1)&&appInt(timer.elapsedMs,0,timer.targetMs)&&appInt(timer.targetMs,p.seconds*1000,p.seconds*(p.type==="recovery"?2000:1000)),"Invalid phase time");
 appAssert(["ready","running","paused","awaiting","interrupted","finished"].includes(timer.state)&&["interrupted","extended","early","warning","pain"].every(k=>typeof timer[k]==="boolean")&&(timer.reason===null||["time","fatigue","other","pain","symptoms"].includes(timer.reason)),"Invalid timer status");
 appAssert(timer.state==="running"?appInt(timer.lastMs,0,Number.MAX_SAFE_INTEGER):timer.lastMs===null,"Invalid running clock");
 appAssert(timer.state!=="awaiting"||timer.elapsedMs===timer.targetMs,"Incomplete phase boundary");
 appAssert(!timer.warning&&!timer.pain||timer.state==="finished","Stop flagged session");
 appAssert(Array.isArray(timer.actual)&&timer.actual.length<=pp.length,"Invalid actual phases");
 const extCount=timer.actual.filter((x,i)=>x.type==="recovery"&&x.seconds>pp[i].seconds).length;
 const activeExt=timer.state!=="finished"&&p.type==="recovery"&&timer.targetMs>p.seconds*1000?1:0;
 appAssert(extCount+activeExt<=1&&(!extCount&&!activeExt||timer.extended),"Invalid recovery extension");
 if(timer.state==="finished"){
  const status=timer.actual.length===0?"skipped":observed(ticket.dose,timer.actual,"full")?"full":"shortened";
  appAssert(observed(ticket.dose,timer.actual,status),"Invalid finished record");
 }else if(timer.early){
  appAssert(timer.index===pp.length-1&&timer.actual.length>0&&timer.actual.length<pp.length&&observed(ticket.dose,timer.actual,"shortened"),"Invalid early cooldown");
 }else{
  appAssert(timer.actual.length===timer.index&&timer.actual.every((x,i)=>x.type===pp[i].type&&appInt(x.seconds,pp[i].seconds,pp[i].seconds*(x.type==="recovery"?2:1))&&!x.earlyCooldown),"Invalid completed prefix");
 }
}
function appValidate(a,now){
 appAssert(fields(a,["version","revision","history","cycles","active"])&&a.version===APP_VERSION&&appInt(a.revision,0,Number.MAX_SAFE_INTEGER),"Unsupported app version");
 validateState(a.history,now);
 appAssert(fields(a.history,["version","started","logs","external"]),"Unknown history fields");
 for(const l of a.history.logs){appAssert(fields(l,["id","day","setup","dose","source","status","actual","effort","quality","recovery","recoveryDay","warning","pain","recoveryExtended","timingInterrupted","output","unit","reason","plannedId","optional"]),"Unknown workout fields");appAssert(l.optional===undefined||typeof l.optional==="boolean","Invalid optional flag");appAssert(l.plannedId===undefined||typeof l.plannedId==="string"&&l.plannedId.length<=120,"Invalid slot ID");}
 for(const l of a.history.external)appAssert(fields(l,["id","day","activity","minutes","intensity"]),"Unknown outside activity fields");
 appAssert(Array.isArray(a.cycles)&&a.cycles.length>=1&&a.cycles.length<=260,"Invalid cycles");
 const ids=new Set(),ext=new Set();
 for(let i=0;i<a.cycles.length;i++){
  const c=a.cycles[i];appAssert(fields(c,["calendar","replacements","reviewedDay"])&&c.calendar.start>=a.history.started&&c.calendar.start<=now&&(i===0||c.calendar.start>=a.cycles[i-1].calendar.start+28),"Invalid cycle order");
  validateLinks(c.calendar,a.history,c.replacements,now);
  appAssert(c.reviewedDay===null||appInt(c.reviewedDay,c.calendar.start+28,now),"Review date invalid");
  for(const sl of c.calendar.slots){appAssert(!ids.has(sl.id),"Duplicate slot");ids.add(sl.id);}
  for(const r of c.replacements){appAssert(!ext.has(r.externalId),"Duplicate outside activity");ext.add(r.externalId);}
 }
 for(const l of a.history.logs){appAssert(!l.plannedId||ids.has(l.plannedId),"Orphan scheduled record");}
 if(a.active!==null)appTicketValid(a,a.active,now);
 return true;
}
function appChange(a,patch,now){const n={...a,...patch,revision:a.revision+1};appValidate(n,now);return n;}
function appStart(a,p,slotId,day,budget,id,method="timer"){
 appValidate(a,day);appAssert(a.active===null,"Finish or save active session first");
 if(!validProfile(p))return {action:"complete-setup",app:a};
 if(p.mode==="swim"&&(!Number.isFinite(p.poolLength)||p.poolLength<=0||p.poolLength>100||!["m","yd"].includes(p.poolUnit)))return {action:"choose-pool",app:a};
 const c=appCurrent(a),r=beginTicket(c.calendar,a.history,c.replacements,p,slotId,day,budget,id);
 if(!r.ticket)return {action:r.action,app:a};
 const actualMethod=r.ticket.dose.kind==="swim"?"manual":method;
 appAssert(["timer","manual"].includes(actualMethod),"Invalid recording method");
 const active={ticket:r.ticket,profile:appClone(p),budget,method:actualMethod,timer:actualMethod==="timer"?makeTimer(r.ticket):null};
 return {action:r.action,app:appChange(a,{active},day)};
}
function appTimer(a,command,now,ms=0,value){
 appValidate(a,now);appAssert(a.active?.method==="timer","No active timer");
 const t=a.active.timer;
 // An older session may be saved but not continued on a later calendar date.
 if(now!==a.active.ticket.day&&!["end","hidden"].includes(command))throw Error("Save earlier workout before continuing");
 let next;
 switch(command){
 case "start":next=timerStart(t,ms);break;case "tick":next=timerTick(t,ms);break;
 case "pause":next=timerPause(t,ms);break;case "hidden":next=timerHidden(t);break;
 case "advance":next=timerAdvance(t);break;case "extend":next=timerExtend(t,value);break;
 case "end":next=timerEnd(t,value.reason,now===a.active.ticket.day&&!!value.cooldown);break;
 default:throw Error("Unknown timer command");}
 return appChange(a,{active:{...a.active,timer:next}},now);
}
function appSave(a,feedback,now){
 appValidate(a,now);appAssert(a.active,"No active workout");
 const c=appCurrent(a),x=a.active;
 const h=x.method==="timer"?saveTimer(c.calendar,a.history,c.replacements,x.timer,feedback,now):saveManual(c.calendar,a.history,c.replacements,x.ticket,feedback,now);
 return appChange(a,{history:h,active:null},now);
}
function appRecovery(a,id,recovery,now){
 appValidate(a,now);appAssert(!a.active,"Finish active session before editing history");
 const prior=a.history.logs.find(l=>l.id===id);
 appAssert(prior&&prior.status!=="skipped"&&prior.source!=="prior","No eligible recovery record");
 // Do not turn a previously reported poor recovery into progression evidence.
 const h=updateRecovery(a.history,id,recovery,now);
 const corrected=prior.recovery!=="unknown"&&prior.recovery!==recovery;
 return appChange(a,{history:corrected?{...h,logs:h.logs.map(l=>l.id===id?{...l,timingInterrupted:true,quality:false}:l)}:h},now);
}
function appCorrect(a,id,patch,now){
 appValidate(a,now);appAssert(!a.active,"Finish active session first");
 const l=a.history.logs.find(x=>x.id===id);
 appAssert(l&&l.source!=="prior"&&l.status!=="skipped"&&fields(patch,["effort","quality","warning","pain","output","unit"]),"Invalid correction");
 appAssert(!(l.warning&&patch.warning===false)&&!(l.pain&&patch.pain===false),"Safety flags cannot be removed");
 const updated={...l,...patch,warning:l.warning||patch.warning===true,pain:l.pain||patch.pain===true,quality:false,timingInterrupted:true,recovery:"unknown",recoveryDay:null};
 return appChange(a,{history:{...a.history,logs:a.history.logs.map(x=>x.id===id?updated:x)}},now);
}
function appSafetyHold(a,mode,setup,id,kind,now){
 appValidate(a,now);appAssert(!a.active&&MODES.includes(mode)&&["warning","pain"].includes(kind),"Invalid safety record");
 const dose=mode==="swim"?swim():mode==="circuit"?circuit():steady(mode,1);
 // Zero exercise, unplanned safety event: never counts as attendance or a performed activity.
 const l={id,day:now,setup,dose,source:"manual",status:"skipped",actual:[],effort:null,quality:false,recovery:"unknown",recoveryDay:null,warning:kind==="warning",pain:kind==="pain",recoveryExtended:false,reason:kind==="warning"?"symptoms":"pain"};
 return appChange(a,{history:addLog(a.history,l,now)},now);
}
function appOutside(a,l,now){
 appValidate(a,now);appAssert(!a.active,"Finish active session before adding activity");
 return appChange(a,{history:addExternal(a.history,l,now)},now);
}
function appCalendarEdit(a,command,id,value,now){
 appValidate(a,now);appAssert(!a.active,"Finish active session before changing schedule");
 const c=appCurrent(a);let n,h=a.history;
 if(command==="move")n={...c,calendar:reschedule(c.calendar,h,c.replacements,id,value,now)};
 else if(command==="replace"){appAssert(!h.logs.some(l=>l.warning||l.pain),"Outside activity cannot replace a guide workout during a safety pause");n={...c,replacements:replaceWithExternal(c.calendar,h,c.replacements,id,value,now)};}
 else if(command==="skip"){n=c;h=skipScheduled(c.calendar,h,c.replacements,id,now);}
 else throw Error("Unknown calendar command");
 return appChange(a,{cycles:[...a.cycles.slice(0,-1),n],history:h},now);
}
function appNextCycle(a,start,days,optional,now){
 appValidate(a,now);appAssert(!a.active&&start===now&&start>=appCurrent(a).calendar.start+28,"Complete or finish current cycle first");
 return appChange(a,{cycles:[...a.cycles,{calendar:makeCycle(start,days,optional),replacements:[],reviewedDay:null}]},now);
}
function appAcknowledge(a,start,now){
 appValidate(a,now);appAssert(!a.active&&a.cycles.some(c=>c.calendar.start===start&&now>=start+28),"Review not yet due");
 return appChange(a,{cycles:a.cycles.map(c=>c.calendar.start===start?{...c,reviewedDay:now}:c)},now);
}
function appReport(a,start,now){
 appValidate(a,now);const c=a.cycles.find(x=>x.calendar.start===start);appAssert(c,"Unknown cycle");
 const end=Math.min(now,start+27),slots=new Set(c.calendar.slots.map(x=>x.id));
 const logs=a.history.logs.filter(l=>slots.has(l.plannedId)&&l.day<=end&&l.status!=="skipped");
 const byMode={},groups=new Map();
 for(const l of logs){
  const t=actualTotals(l),m=byMode[l.dose.mode]??={workSeconds:0,recoverySeconds:0,knownTotalSeconds:0,unknownTotalVisits:0,unknownWorkVisits:0,unknownRecoveryTimeVisits:0,lengthsByPool:{}};
  m.workSeconds+=t.work;m.recoverySeconds+=t.recovery;m.knownTotalSeconds+=t.total??0;m.unknownTotalVisits+=Number(t.total===null);m.unknownWorkVisits+=Number(t.unknown);
  if(l.dose.kind==="swim"){m.unknownRecoveryTimeVisits+=Number(l.actual.restSeconds===null);const k=l.dose.pool+" "+l.dose.unit;m.lengthsByPool[k]=(m.lengthsByPool[k]??0)+l.actual.lengths;}
  if(l.optional||!success(l)||l.dose.reduced||!Number.isFinite(l.output)||!l.unit)continue;
  const k=JSON.stringify([key(l.dose),l.setup,l.unit,l.effort]);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(l);
 }
 const comparisons=[];
 for(const ls of groups.values()){
  ls.sort((x,y)=>x.day-y.day);const first=ls[0],last=ls[ls.length-1];
  if(first.day===last.day)continue;
  comparisons.push({mode:first.dose.mode,setup:first.setup,unit:first.unit,firstDay:first.day,lastDay:last.day,first:first.output,last:last.output,change:last.output-first.output,interpretation:"Comparable reported output; not proof of adaptation"});
 }
 const outside=a.history.external.filter(x=>x.day>=start&&x.day<=end);
 return {...cycleReview(c.calendar,a.history,c.replacements,now),reviewedDay:c.reviewedDay,byMode,comparisons,unknownRecovery:logs.filter(l=>l.recovery==="unknown").length,warningRecords:a.history.logs.filter(l=>l.day>=start&&l.day<=end&&l.warning).length,outsideKnownMinutes:outside.reduce((n,x)=>n+(x.minutes??0),0),outsideUnknownMinutes:outside.filter(x=>x.minutes===null).length};
}
function appBackup(a,now){appValidate(a,now);return JSON.stringify(a);}
function appRestore(raw,now){
 appAssert(typeof raw==="string"&&raw.length<=8000000,"Invalid backup size");let a=JSON.parse(raw);appValidate(a,now);
 if(a.active?.method==="timer"&&a.active.timer.state==="running")a=appChange(a,{active:{...a.active,timer:timerHidden(a.active.timer)}},now);
 return a;
}
function appPersist(storage,a,now,expectedRevision=null){
 const raw=appBackup(a,now);
 try{
  const old=storage.getItem(APP_KEY);
  if(expectedRevision===null?!!old:(!old||JSON.parse(old).revision!==expectedRevision))return {ok:false,reason:"storage-conflict"};
  storage.setItem(APP_KEY,raw);return {ok:true};
 }catch{return {ok:false,reason:"storage-unavailable"};}
}
function appLoad(storage,now){
 try{const raw=storage.getItem(APP_KEY);return raw?{ok:true,app:appRestore(raw,now)}:{ok:true,app:null};}
 catch{return {ok:false,reason:"storage-or-backup-invalid"};}
}

export { APP_KEY, validProfile, appNew, appCurrent, appValidate, appStart, appTimer, appSave, appRecovery, appCorrect, appSafetyHold, appOutside, appCalendarEdit, appNextCycle, appAcknowledge, appReport, appBackup, appRestore, appPersist, appLoad };

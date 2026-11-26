import { MODES, screen, steady, interval, bouts, swim, circuit, phases, seconds, key, recent, success, latestDistinct, historicalPair, initial, schedule, fitTime, recommend } from './engine.mjs';

const VERSION=1;
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const plain=v=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const str=v=>typeof v==="string"&&v.length>0&&v.length<=120;
function assert(ok,msg){if(!ok)throw Error(msg);}
function canonical(d){
 if(!plain(d)||!MODES.includes(d.mode)||!["steady","interval","bouts","swim","circuit"].includes(d.kind)||!["steady","interval","circuit","steady2"].includes(d.slot))return false;
 try{
 let b;
 if(d.reduced===true){if(!plain(d.original)||d.original.reduced||!canonical(d.original)||!["time","recovery"].includes(d.reductionReason))return false;const o=d.original;if(d.mode!==o.mode||d.slot!==o.slot||d.kind!==o.kind)return false;
 if(d.kind==="interval"){b={...o,n:d.n,effort:d.effort};if(!integer(d.n,1,o.n)||!(JSON.stringify(d.effort)===JSON.stringify(o.effort)||o.effort[1]===8&&JSON.stringify(d.effort)==="[5,6]"))return false;}
 if(d.kind==="steady"||d.kind==="bouts"){if(!integer(d.minutes,1,o.minutes)||!(JSON.stringify(d.effort)===JSON.stringify(o.effort)||JSON.stringify(d.effort)==="[2,3]"))return false;b={...o,minutes:d.minutes,effort:d.effort};}
 if(d.kind==="swim"){if(!integer(d.lengths,1,o.lengths))return false;b={...o,lengths:d.lengths};}
 if(d.kind==="circuit"){b={...o,rounds:2,n:8,w:20};}
 return !!b&&key(b)===key(d);}
 if(d.kind==="steady"){if(["swim","circuit"].includes(d.mode))return false;b=steady(d.mode,d.minutes,d.level,d.slot);}
 if(d.kind==="bouts"){if(["swim","circuit"].includes(d.mode)||!integer(d.minutes,1,5))return false;b={...bouts(d.mode,d.minutes),slot:d.slot};}
 if(d.kind==="interval")b=interval(d.mode,d.id,d.slot);
 if(d.kind==="swim")b=swim(d.lengths,d.unit,d.pool);
 if(d.kind==="circuit")b=circuit(d.rounds,d.variant);
 return !!b&&key(b)===key(d);
 }catch{return false;}
}
function observed(d,actual,status){
 if(!canonical(d)||!["full","shortened","skipped"].includes(status))return false;
 if(status==="skipped")return Array.isArray(actual)&&actual.length===0;
 if(d.kind==="swim")return plain(actual)&&integer(actual.lengths,1,d.lengths)&&(status!=="full"||actual.lengths===d.lengths)&&(status!=="shortened"||actual.lengths<d.lengths)&&(actual.swimSeconds===null||integer(actual.swimSeconds,1,7200))&&(actual.restSeconds===null||integer(actual.restSeconds,0,7200));
 const plan=phases(d);if(!Array.isArray(actual)||!actual.length||actual.length>plan.length)return false;
 const early=actual[actual.length-1]?.earlyCooldown===true;
 if(early&&(status!=="shortened"||actual.length<2||actual.length>=plan.length&&actual.slice(0,-1).every((a,i)=>a.seconds>=plan[i].seconds)))return false;
 for(let i=0;i<actual.length;i++){
  const a=actual[i],jump=early&&i===actual.length-1,p=jump?plan[plan.length-1]:plan[i];
  if(!plain(a)||a.type!==p.type||!integer(a.seconds,0,p.type==="recovery"?p.seconds*2:p.seconds)||(!jump&&a.earlyCooldown!==undefined)||jump&&a.seconds===0)return false;
  if(i<actual.length-1&&!(early&&i===actual.length-2)&&a.seconds<p.seconds)return false;
 }
 const complete=!early&&actual.length===plan.length&&actual.every((a,i)=>a.seconds>=plan[i].seconds);
 return status==="full"?complete:actual.some(a=>a.seconds>0)&&!complete;
}
function validateLog(l,now){
 if(!plain(l)||!str(l.id)||!integer(l.day,0,now)||!str(l.setup)||!canonical(l.dose)||!["timer","manual","prior"].includes(l.source)||!["full","shortened","skipped"].includes(l.status)||!["normal","extra","limiting","unknown"].includes(l.recovery)||typeof l.quality!=="boolean"||typeof l.warning!=="boolean"||typeof l.pain!=="boolean"||typeof l.recoveryExtended!=="boolean")return false;
 if(l.resolved!==undefined)return false;
 if(l.reason==="symptoms"&&!l.warning||l.reason==="pain"&&!l.pain)return false;
 if(l.recovery==="unknown"){if(l.recoveryDay!==undefined&&l.recoveryDay!==null)return false;}else if(!integer(l.recoveryDay,l.day+1,now)||l.status==="skipped")return false; // never accept self-cleared historical warning flags
 if(l.status==="skipped"){if(l.effort!==null)return false;}else if(!integer(l.effort,0,10))return false;
 if(l.dose.kind==="swim"&&l.source==="timer")return false;
 if(!observed(l.dose,l.actual,l.status))return false;
 const ext=l.dose.kind!=="swim"&&l.status!=="skipped"&&l.actual.some((a,i)=>a.type==="recovery"&&a.seconds>phases(l.dose)[i].seconds);
 if(l.timingInterrupted!==undefined&&typeof l.timingInterrupted!=="boolean")return false;
 if(ext!==l.recoveryExtended)return false;
 if(l.output!==undefined&&(!Number.isFinite(l.output)||l.output<0||!["rpm","watts","m","km","mi","seconds","m/s","km/h","mph","spm"].includes(l.unit)))return false;
 if(l.reason!==undefined&&!["time","fatigue","other","pain","symptoms"].includes(l.reason))return false;
 return true;
}
function validateState(s,now){
 assert(plain(s)&&s.version===VERSION&&integer(s.started,0,now)&&Array.isArray(s.logs)&&s.logs.length<=5000,"Invalid state/version");
 const ids=new Set();for(const l of s.logs){assert(validateLog(l,now)&&(l.source==="prior"?l.day>=Math.max(0,s.started-28):l.day>=s.started)&&!ids.has(l.id),"Invalid or duplicate log");ids.add(l.id);}
 assert(Array.isArray(s.external)&&s.external.length<=5000,"Invalid external history");
 for(const l of s.external){assert(plain(l)&&str(l.id)&&integer(l.day,s.started,now)&&str(l.activity)&&["easy","steady","challenging","hard","unknown"].includes(l.intensity)&&(l.minutes===null||integer(l.minutes,1,1440))&&!ids.has(l.id),"Invalid external log");ids.add(l.id);}
 return true;
}
function emptyState(day){assert(integer(day,0,1000000),"Invalid date");return {version:VERSION,started:day,logs:[],external:[]};}
function restore(json,now){assert(typeof json==="string"&&json.length<=8000000,"Invalid backup");const s=JSON.parse(json);validateState(s,now);return s;}
function backup(s,now){validateState(s,now);return JSON.stringify(s);}
function addLog(s,l,now){const n={...s,logs:[...s.logs,l]};validateState(n,now);return n;}
function addExternal(s,l,now){if(s.external.some(x=>x.day===l.day&&x.activity.trim().toLowerCase()===l.activity?.trim().toLowerCase()))return s;const n={...s,external:[...s.external,l]};validateState(n,now);return n;}
function updateRecovery(s,id,recovery,now){assert(["normal","extra","limiting","unknown"].includes(recovery),"Invalid recovery");const l=s.logs.find(x=>x.id===id);assert(l&&now>l.day,"Next-day response not due");const n={...s,logs:s.logs.map(x=>x.id===id?{...x,recovery,recoveryDay:recovery==="unknown"?null:now}:x)};validateState(n,now);return n;}
function actualTotals(l){if(l.status==="skipped")return {work:0,recovery:0,total:0,unknown:false};if(l.dose.kind==="swim"){return {work:l.actual.swimSeconds??0,recovery:l.actual.restSeconds??0,total:null,unknown:l.actual.swimSeconds===null};}return {work:l.actual.filter(a=>a.type==="work").reduce((n,a)=>n+a.seconds,0),recovery:l.actual.filter(a=>a.type==="recovery").reduce((n,a)=>n+a.seconds,0),total:l.actual.reduce((n,a)=>n+a.seconds,0),unknown:false};}
function review(s,now,days=28){validateState(s,now);assert(integer(days,1,365),"Invalid review interval");const logs=s.logs.filter(l=>l.day>now-days&&l.source!=="prior"),external=s.external.filter(l=>l.day>now-days);const byMode={};for(const l of logs){const t=actualTotals(l);const m=byMode[l.dose.mode]??={workSeconds:0,recoverySeconds:0,completedLengths:0,unknownWorkLogs:0};m.workSeconds+=t.work;m.recoverySeconds+=t.recovery;if(l.dose.kind==="swim"&&l.status!=="skipped")m.completedLengths+=l.actual.lengths;m.unknownWorkLogs+=Number(t.unknown);}
 return {days,full:logs.filter(l=>l.status==="full").length,shortened:logs.filter(l=>l.status==="shortened").length,skipped:logs.filter(l=>l.status==="skipped").length,unknownRecovery:logs.filter(l=>l.status!=="skipped"&&l.recovery==="unknown").length,byMode,externalVisits:external.length,externalKnownMinutes:external.reduce((a,l)=>a+(l.minutes??0),0),externalUnknownMinutes:external.filter(l=>l.minutes===null).length,reviewDue:now-s.started>=28};}
function visit(s,p,now,budget){
 validateState(s,now);
 if(p.currentSevere===true)return {action:"emergency",dose:null};
 if(s.logs.some(l=>l.warning))return {action:"medical-review",dose:null};
 const safety=screen(p);if(["medical-review","pause-mode","emergency"].includes(safety))return {action:safety,dose:null};
 if(!str(p.setup)||!integer(p.days,0,3)||!["A","B"].includes(p.goal)||!MODES.includes(p.mode)||!["steady","steady2","interval","circuit"].includes(p.slot))return {action:"complete-setup",dose:null};
 if(p.postIllness===true)return {action:"reassess-after-illness",dose:null};
 let profile={...p,existingHard:p.existingHard===false&&!s.external.some(l=>l.day>now-7&&l.day<=now&&["challenging","hard","unknown"].includes(l.intensity))?false:true};
 const relevant=s.logs.filter(l=>l.dose.mode===p.mode&&l.dose.slot===p.slot&&l.setup===p.setup&&l.source!=="prior"&&l.status!=="skipped").sort((a,b)=>b.day-a.day);
 const last=relevant[0];if(s.logs.some(l=>l.dose.mode===p.mode&&l.pain))return {action:"pause-mode",dose:null};
 let pick;
 if(last){
  if(last.day===now)return {action:"already-trained-slot",dose:null};
  if(last.recovery==="unknown"&&(last.dose.kind==="interval"||last.dose.effort[1]>5))return {action:"check-recovery",dose:null};
  if(p.mode==="swim"&&p.waterCompetent!==true)return {action:"lessons-or-land",dose:null};
  if(p.mode==="run"&&p.recentRun!==true)return {action:"walk-or-run-guide",dose:null};
  if(p.mode==="circuit"&&p.movementsFamiliar!==true)return {action:"learn-movements",dose:null};
  if(last.dose.kind==="interval"&&last.dose.effort[1]===8&&!historicalPair(s.logs,interval(p.mode,"b120x4",p.slot),now,p.setup)&&!historicalPair(s.logs,interval(p.mode,"hard120x3",p.slot),now,p.setup)&&!historicalPair(s.logs,last.dose,now,p.setup))return {action:"reassess-hard",dose:null};
  pick=recommend(profile,last.dose,s.logs,now);
 }else pick=initial(profile,s.logs,now);
 if(!pick.dose)return pick;
 if(p.slot==="steady2"&&["steady","bouts"].includes(pick.dose.kind)&&pick.dose.slot!=="steady2")pick={...pick,dose:{...pick.dose,slot:"steady2",...(pick.dose.original?{original:{...pick.dose.original,slot:"steady2"}}:{})}};
 if(pick.dose.mode!==p.mode)return {action:pick.action,dose:null};
 if(pick.dose.kind==="interval"&&p.slot!=="interval"||pick.dose.kind==="circuit"&&p.slot!=="circuit")return {action:"reassess-slot",dose:null};
 const routed=schedule(profile,pick.dose);if(!routed.dose)return routed;
 if(!canonical(routed.dose))return {action:"reassess-dose",dose:null};
 const isDemanding=routed.dose.kind==="interval"||routed.dose.kind==="circuit"&&routed.dose.effort[1]>5;
 if(isDemanding&&s.logs.some(l=>l.source!=="prior"&&l.status!=="skipped"&&l.day===now&&(l.dose.kind==="interval"||l.dose.kind==="circuit"&&l.dose.effort[1]>5)))return {action:"already-demanding-today",dose:null};
 const fit=fitTime(routed.dose,budget);if(fit.dose&&!canonical(fit.dose))return {action:"reassess-dose",dose:null};return {...fit,recommendation:pick.action};
}

export { canonical, observed, validateLog, validateState, emptyState, restore, backup, addLog, addExternal, updateRecovery, actualTotals, review, visit };

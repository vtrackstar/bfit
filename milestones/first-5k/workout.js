"use strict";
(function(){
const E=globalThis.BFit5K,F=globalThis.BFit5KCore,C=globalThis.BFitRunningCalculator,$=id=>document.getElementById(id);
const key="bfit-first-5k-dev-v1",day=()=>Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000);
let data={version:1,state:null,active:null,pending:null},running=false,lastTick=0,handle=null;
const msg=t=>{$("status").textContent=t;},show=(id,v)=>{$(id).hidden=!v;},val=id=>$(id).value,num=id=>val(id)===""?null:Number(val(id)),fmt=n=>C.format(Math.max(0,n));
function save(){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){msg("Progress could not be saved on this device. Export your progress before leaving.");return false;}}
function validateSnapshot(x,today){
 const fail=()=>{throw Error("This progress file is incomplete, inconsistent or from an unsupported version.");};
 const int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 const finite=(v,a,b)=>typeof v==="number"&&Number.isFinite(v)&&v>=a&&v<=b;
 const goal=v=>["runwalk","continuous"].includes(v);
 const record=r=>F.validRecord(r)&&int(r.day,today-3650,today)&&finite(r.totalSec,0,86400)&&typeof r.completed==="boolean"&&["practice","easy","long"].includes(r.lane)&&typeof r.prescriptionId==="string"&&["easy","comfortable","hardEarly","hardLate","incomplete"].includes(r.check?.effort)&&["normal","mild","heavy","limited","unknown"].includes(r.check?.recovery)&&["none","localized","sharp","unsure","urgent"].includes(r.check?.symptoms)&&!(r.strategy==="continuous"&&(Math.abs(r.runSec-r.mainSec)>.001||Math.abs(r.longestBout-r.runSec)>.001))&&!(r.strategy==="walk"&&r.runSec!==0);
 const workout=p=>p&&typeof p.id==="string"&&["practice","easy","long"].includes(p.lane)&&Array.isArray(p.runs)&&Array.isArray(p.rests)&&p.runs.length<=500&&p.rests.length<=500&&p.runs.every(v=>finite(v,.001,86400))&&p.rests.every(v=>finite(v,0,86400))&&[p.runs.length,Math.max(0,p.runs.length-1)].includes(p.rests.length)&&finite(p.tail,0,86400)&&finite(p.runSec,0,86400)&&finite(p.mainSec,.001,86400)&&finite(p.totalSec,.001,86400)&&Math.abs(p.runSec-p.runs.reduce((a,b)=>a+b,0))<.001&&Math.abs(p.mainSec-p.runSec-p.rests.reduce((a,b)=>a+b,0)-p.tail)<.001&&Math.abs(p.totalSec-p.mainSec-(p.runSec?480:0))<.001&&p.longestBout===Math.max(0,...p.runs);
 const decision=d=>d&&workout(d.workout)&&["train","bridge","budget-bridge","repeat","reduce","recovery","attempt"].includes(d.action)&&(!d.feature||d.feature==="assessment"&&finite(d.assessment?.durationSec,1,d.workout.runs[0])||d.feature==="goal-pace"&&finite(d.pacePractice?.seconds,1,d.workout.runs[0])&&finite(d.pacePractice?.paceSecKm,1,36000));
 if(!x||x.version!==1||!x.state||x.active&&x.pending)fail();
 const s=x.state;
 if(s.action!=="start"||!goal(s.goal)||![2,3].includes(s.days)||![2,3].includes(s.requestedDays)||!int(s.level,0,14)||!int(s.index,0,s.days-1)||!int(s.week,1,10000)||!(s.walkMin===null||int(s.walkMin,5,30))||!int(s.goalRevision,0,100000)||!(s.ack===null||s.ack===s.goalRevision)||!(s.goalTimeSec===null||finite(s.goalTimeSec,600,10800))||typeof s.paused!=="boolean"||!Array.isArray(s.history)||s.history.length>4000||!s.history.every(record)||!s.history.every((r,i)=>!i||r.day>s.history[i-1].day)||s.lastDay!==(s.history.at(-1)?.day??null)||!Array.isArray(s.cycleRecords)||s.cycleRecords.length!==s.index||!s.cycleRecords.every(r=>record(r)&&s.history.some(h=>h.day===r.day&&h.prescriptionId===r.prescriptionId&&h.runSec===r.runSec))||!int(s.recoveryRemaining??0,0,3)||!finite(s.extensionSec??0,0,86400))fail();
 if(s.transitionRow&&(!Array.isArray(s.transitionRow)||s.transitionRow.length!==s.days||!s.transitionRow.every(workout)))fail();
 if(s.completed&&(!record(s.completion)||!F.achievement(s.completion)[s.goal]||!s.history.some(r=>r.day===s.completion.day&&F.achievement(r)[s.goal])))fail();
 if(x.active){const a=x.active;if(!decision(a.decision)||!int(a.day,today-3650,today)||a.day<=(s.lastDay??-Infinity)||!Array.isArray(a.phases)||JSON.stringify(a.phases)!==JSON.stringify(phases(a.decision))||!int(a.index,0,a.phases.length)||!Array.isArray(a.actual)||a.actual.length>a.phases.length||!a.actual.every((v,i)=>finite(v,0,a.phases[i].sec))||a.phases.some((p,i)=>i<a.index&&Math.abs((a.actual[i]??0)-p.sec)>.001||i>a.index&&(a.actual[i]??0)>0)||typeof a.finished!=="boolean")fail();}
 if(x.pending){const p=x.pending;if(!decision(p.decision)||!record(p.record)||p.record.day<=(s.lastDay??-Infinity)||p.record.prescriptionId!==p.decision.workout.id||p.record.lane!==p.decision.workout.lane||!p.details||p.record.runSec>p.decision.workout.runSec+.001||p.record.mainSec>p.decision.workout.mainSec+.001||p.record.totalSec>p.decision.workout.totalSec+.001)fail();if(p.details.measurement)C.normalize(p.details.measurement);}
 return x;
}
function historyEntry(){
 const records=[];
 for(let i=0;i<6;i++){const d=num("histDay"+i),r=num("histRun"+i),m=num("histMain"+i),b=num("histBout"+i),recovery=val("histRecovery"+i);if([d,r,m,b].every(v=>v===null)&&!recovery)continue;
 if(!Number.isInteger(d)||d<1||d>14||![r,m,b].every(v=>Number.isFinite(v)&&v>0)||r>180||m>240||b>r||r>m||!["normal","mild","heavy","limited","unknown"].includes(recovery)||r===m&&b!==r)throw Error("Check recent run "+(i+1)+": enter the date, running time, main session time, longest run and recovery.");
 records.push({day:day()-d,lane:"practice",prescriptionId:"intake-history-"+d,runSec:r*60,mainSec:m*60,totalSec:m*60,longestBout:b*60,fasterSec:0,mainDistanceM:null,runningDistanceM:null,continuousDistanceM:null,strategy:r===m?"continuous":"runwalk",completed:true,check:{effort:"comfortable",recovery,symptoms:recovery==="limited"?"unsure":"none"},comparable:false,source:"self-reported-intake"});
 }
 records.sort((a,b)=>a.day-b.day);if(new Set(records.map(r=>r.day)).size!==records.length)throw Error("Enter only one recent session per day.");return records;
}
try{const raw=localStorage.getItem(key);if(raw)data=validateSnapshot(JSON.parse(raw),day());}catch(e){msg("Saved progress could not be loaded. Keep your backup file and contact BFit before replacing it.");}
function phases(d){
 const p=d.workout,list=[],add=(kind,sec,bout=null)=>{if(sec>0)list.push({kind,sec,bout});};
 if(p.runSec)add("Warm-up walk",300);
 p.runs.forEach((r,i)=>{let feature=i===0?(d.feature==="assessment"?d.assessment.durationSec:d.feature==="goal-pace"?d.pacePractice.seconds:0):0;feature=Math.min(r,feature);add(d.feature==="assessment"?"Comfortable assessment":"Target pace practice",feature,i);add("Comfortable run",r-feature,i);add("Walk",p.rests[i]??0);});
 add("Walk",p.tail);if(p.runSec)add("Cool-down walk",180);
 return list;
}
function totals(a){
 let runSec=0,mainSec=0,totalSec=0,longestBout=0,bouts={};
 a.phases.forEach((p,i)=>{const n=a.actual[i]??0;totalSec+=n;if(!["Warm-up walk","Cool-down walk"].includes(p.kind))mainSec+=n;if(p.bout!==null){runSec+=n;bouts[p.bout]=(bouts[p.bout]??0)+n;longestBout=Math.max(longestBout,bouts[p.bout]);}});
 return {runSec,mainSec,totalSec,longestBout,strategy:runSec===0?"walk":Math.abs(runSec-mainSec)<.001?"continuous":"runwalk"};
}
function paintTimer(){const a=data.active;if(!a)return;const p=a.phases[a.index];$("phase").textContent=p?p.kind:"Workout timer finished";$("clock").textContent=fmt(p?Math.ceil(p.sec-(a.actual[a.index]??0)):0);$("start").disabled=running||!p;$("pause").disabled=!running;}
function stop(){running=false;clearInterval(handle);handle=null;paintTimer();}
function tick(){if(!running||!data.active)return;const a=data.active,now=performance.now();let delta=Math.max(0,(now-lastTick)/1000);lastTick=now;
// Do not assume workout occurred when browser was suspended. Pause for gaps over 5 seconds.
if(delta>5){stop();save();msg("Timer paused while the page was inactive. Resume when ready.");return;}
while(delta>0&&a.index<a.phases.length){const p=a.phases[a.index],used=a.actual[a.index]??0,n=Math.min(delta,p.sec-used);a.actual[a.index]=used+n;delta-=n;if(a.actual[a.index]>=p.sec-.00001){a.actual[a.index]=p.sec;a.index++;}}
if(a.index>=a.phases.length){stop();a.finished=true;render();}paintTimer();save();}
function render(){const s=data.state,a=data.active,p=data.pending;show("setup",!s);show("dashboard",!!s);if(!s)return;
$("summary").textContent="Training phase "+(s.level+1)+" · "+s.days+" days per week · "+(s.goal==="continuous"?"Run continuously":"Run and walk")+(s.paused?" · Training paused":"")+(s.completed?" · 5K completed":"");
show("goalSettings",!a&&!p&&!s.paused);show("checkin",!a&&!p&&!s.completed&&!s.paused);show("workout",!!a&&!a.finished&&!p);show("logging",!!a&&a.finished&&!p);show("pending",!!p);
const review=E.paceReview(s,s.history,day());show("notice",review.notice&&!a&&!p&&!s.paused);
if(a&&!a.finished){$("workoutTitle").textContent=a.decision.workout.lane==="long"?"Longer outing":"Practice workout";$("workoutInfo").textContent=fmt(a.decision.workout.totalSec)+" total · "+fmt(a.decision.workout.runSec)+" running";$("steps").replaceChildren(...a.phases.map(x=>{const li=document.createElement("li");li.textContent=x.kind+" · "+fmt(x.sec);return li;}));paintTimer();}
if(a?.finished){const t=totals(a);$("actual").textContent=fmt(t.runSec)+" running · "+fmt(t.mainSec)+" main workout · "+fmt(t.totalSec)+" total";}
const q=E.progressReview(s,s.history,day());$("progress").textContent=q.completed+" workouts in the last four weeks · "+fmt(q.runSec)+" running · longest recovered running bout "+fmt(q.longestBoutSec);
$("numbers").textContent=q.weeks.map((w,i)=>"Week "+(i+1)+": "+fmt(w.runSec)+" running, "+w.completed+" completed workouts").join("\n");
if(s.paused)msg(s.pauseReason==="urgent"?"Stop exercise. Seek urgent medical assessment. If symptoms are severe or ongoing, call emergency services.":"Training is paused. Seek appropriate medical guidance for concerning or persistent symptoms. This preview cannot clear a health hold.");
}
function measurement(){const distance=num("distance"),timeSec=num("recordTime"),pm=num("paceMin"),ps=num("paceSec"),speed=num("speed");if([distance,timeSec,pm,ps,speed].every(x=>x===null))return null;return {distance:distance===null?null:{value:distance,unit:val("unit")},timeSec,pace:pm===null&&ps===null?null:{seconds:(pm??0)*60+(ps??0),per:val("paceUnit")},speed:speed===null?null:{value:speed,unit:val("speedUnit")},scope:val("scope"),timeBasis:val("basis"),surface:val("surface")};}
function bind(id,fn){$(id).addEventListener("submit",ev=>{ev.preventDefault();try{fn();}catch(e){msg(e.message);}});}
bind("intake",()=>{const s=E.start({goal:val("goal"),walkMin:Number(val("walk")),days:Number(val("days")),goalTimeSec:num("target")===null?null:num("target")*60,healthHold:!$("ready").checked},historyEntry(),day());if(s.action!=="start"){msg(s.reason);return;}data.state=s;save();render();});
bind("goalForm",()=>{if(data.active||data.pending)return;data.state=E.changeGoal(data.state,val("newGoal"),num("newTarget")===null?null:num("newTarget")*60,data.state.history,day());save();render();});
$("ack").onclick=()=>{data.state=E.ack(data.state);save();render();};
bind("pre",()=>{if(data.active||data.pending)return;const s=data.state,d=E.next(s,s.history,day(),{recovery:val("recovery"),symptoms:val("symptoms"),hardActivityToday:$("other").checked,assessmentRequested:$("assess").checked,paceRequested:$("pace").checked});data.state=d.state;msg(d.reason);if(d.workout){const {state,...decision}=d;data.active={decision,day:day(),phases:phases(d),index:0,actual:[],finished:false};}save();render();});
$("start").onclick=()=>{if(!data.active||running||data.active.finished)return;if(data.active.day!==day()){msg("This workout is from an earlier day. Finish and log it before starting another.");return;}running=true;lastTick=performance.now();handle=setInterval(tick,200);paintTimer();};
$("pause").onclick=()=>{tick();stop();save();};
$("finish").onclick=()=>{tick();stop();if(!data.active)return;data.active.finished=true;save();render();};
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running){tick();stop();save();}});
$("convert").onclick=()=>{try{const m=measurement();if(!m)throw Error("Enter a measurement first.");const n=C.normalize(m);$("conversion").textContent=[n.distanceM===null?null:Math.round(n.distanceM)+" m",n.timeSec===null?null:fmt(n.timeSec),n.paceSecKm===null?null:fmt(n.paceSecKm)+"/km",n.paceSecMile===null?null:fmt(n.paceSecMile)+"/mile"].filter(Boolean).join(" · ");}catch(e){$("conversion").textContent=e.message;}};
bind("logForm",()=>{const a=data.active,t=totals(a),m=measurement();if(m)C.normalize(m);if(t.totalSec<=0)throw Error("Start the timer before logging a workout.");const reached=m?.distance&&C.normalize(m).distanceM>=5000&&m.timeBasis==="elapsed"&&["running-only","runwalk"].includes(m.scope);const completed=$("done").checked&&(t.mainSec>=a.decision.workout.mainSec-1||reached);const record={...t,day:a.day,lane:a.decision.workout.lane,prescriptionId:a.decision.workout.id,fasterSec:0,mainDistanceM:null,runningDistanceM:null,continuousDistanceM:null,completed,check:{effort:val("effort"),recovery:"unknown",symptoms:val("postSymptoms")},comparable:false};const details={measurement:m,representative:$("representative").checked,pacePracticeSec:a.decision.feature==="goal-pace"?a.actual[a.phases.findIndex(p=>p.kind==="Target pace practice")]??0:0};
if(record.check.symptoms!=="none"){data.state=E.log(data.state,record,a.decision,details);data.active=null;}else{data.pending={record,decision:a.decision,details};data.active=null;}save();render();});
bind("recoverForm",()=>{const p=data.pending;if(!p)return;if(day()<=p.record.day&&val("nextSymptoms")==="none"&&val("nextRecovery")!=="limited"){msg("Confirm recovery tomorrow, after seeing how your body responds.");return;}p.record.check.recovery=val("nextRecovery");p.record.check.symptoms=val("nextSymptoms");data.state=E.log(data.state,p.record,p.decision,p.details);data.pending=null;save();render();});
$("export").onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),a=document.createElement("a");a.href=url;a.download="bfit-first-5k-progress.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$("import").onclick=async()=>{try{if(running||data.active||data.pending)throw Error("Finish and log the current workout before importing.");if(data.state?.paused)throw Error("Import cannot replace a current health hold.");const file=$("importFile").files?.[0];if(!file||file.size>2000000)throw Error("Choose a BFit JSON file under 2 MB.");if(data.state&&!$("replaceConfirm").checked)throw Error("Confirm that you want to replace saved progress.");const incoming=validateSnapshot(JSON.parse(await file.text()),day());if(incoming.state.history.some(r=>["pause","urgent"].includes(F.check(r.check)))&&!incoming.state.paused)throw Error("This file contains unresolved symptom history.");if(running||data.active||data.pending||data.state?.paused)throw Error("Current training state changed; import cancelled.");localStorage.setItem(key,JSON.stringify(incoming));data=incoming;$("replaceConfirm").checked=false;render();msg("Progress imported. Review your saved workout before continuing.");}catch(e){msg(e.message);}};
render();
})();
"use strict";
(function(){
const E=globalThis.BFit5K,F=globalThis.BFit5KCore,C=globalThis.BFitRunningCalculator,$=id=>document.getElementById(id);
const key="bfit-first-5k-dev-v1",day=()=>Math.floor(Date.UTC(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())/86400000);
let data={version:1,state:null,active:null,pending:null},running=false,lastTick=0,handle=null;
const msg=t=>{$("status").textContent=t;},show=(id,v)=>{$(id).hidden=!v;},val=id=>$(id).value,num=id=>val(id)===""?null:Number(val(id)),fmt=n=>C.format(Math.max(0,n));
function save(){try{localStorage.setItem(key,JSON.stringify(data));return true;}catch(e){msg("Progress could not be saved on this device. Export your progress before leaving.");return false;}}
try{const raw=localStorage.getItem(key);if(raw){const x=JSON.parse(raw);if(x.version!==1||!x.state||!Array.isArray(x.state.history)||!x.state.history.every(F.validRecord))throw Error("Unsupported saved data");data=x;}}catch(e){msg("Saved progress could not be loaded. Exported files are not yet importable in this preview.");}
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
bind("intake",()=>{const s=E.start({goal:val("goal"),walkMin:Number(val("walk")),days:Number(val("days")),goalTimeSec:num("target")===null?null:num("target")*60,healthHold:!$("ready").checked},[],day());if(s.action!=="start"){msg(s.reason);return;}data.state=s;save();render();});
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
render();
})();
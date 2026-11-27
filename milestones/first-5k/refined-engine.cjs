"use strict";
const reference=function reference(E){
 // Original BFit prescriptions, not copied competitor schedules.
 // Each tuple: total running seconds, maximum bout seconds, between-bout walk seconds,
 // minimum main duration seconds. Warmup/cooldown add 480 seconds.
 const common=[
 [[180,30,90,720],[180,30,90,720],[240,30,90,960]],
 [[240,40,80,720],[240,40,80,720],[300,50,80,960]],
 [[360,60,75,810],[300,60,75,720],[420,90,90,1020]],
 [[480,120,90,840],[360,90,90,720],[540,120,90,1080]]
 ];
 const rw=[
 [[600,120,90,1080],[480,120,90,900],[720,120,90,1380]],
 [[720,150,90,1200],[600,120,90,1080],[900,150,90,1560]],
 [[840,180,90,1260],[720,150,90,1200],[1080,180,90,1740]],
 [[960,180,90,1440],[840,180,90,1260],[1260,180,90,1980]],
 [[1080,180,90,1620],[900,180,90,1380],[1440,180,90,2160]],
 [[1080,180,90,1620],[960,180,90,1440],[1620,180,90,2520]],
 [[1200,180,90,1800],[960,180,90,1440],[1800,180,90,2700]],
 [[1200,180,90,1800],[1080,180,90,1620],[1920,180,90,2940]],
 [[1200,180,90,1800],[1080,180,90,1620],[2100,180,90,3240]],
 [[1200,180,90,1800],[1080,180,90,1620],[2280,180,90,3480]],
 [[1200,180,90,1800],[1080,180,90,1620],[2400,180,90,3660]]
 ];
 const continuous=[
 [[600,180,90,960],[480,120,90,900],[720,240,120,1200]],
 [[720,300,120,1020],[600,180,90,1020],[900,360,120,1380]],
 [[900,420,120,1140],[720,300,120,1080],[1080,540,120,1440]],
 [[1080,600,120,1200],[840,420,120,1080],[1200,720,120,1500]],
 [[1200,900,120,1320],[960,600,120,1200],[1440,960,120,1560]],
 [[1320,1080,120,1440],[1080,720,120,1320],[1560,1200,120,1680]],
 [[1440,1320,120,1560],[1200,900,120,1320],[1680,1560,120,1800]],
 [[1500,1500,0,1500],[1200,1200,0,1200],[1800,1800,0,1800]],
 [[1560,1560,0,1560],[1320,1320,0,1320],[2100,2100,0,2100]],
 [[1620,1620,0,1620],[1320,1320,0,1320],[2400,2400,0,2400]],
 [[1620,1620,0,1620],[1320,1320,0,1320],[2700,2700,0,2700]]
 ];
 const make=(id,t)=>{const [run,bout,rest,main]=t;const runs=[],rests=[];let left=run;while(left){let n=Math.min(left,bout);runs.push(n);left-=n;if(left)rests.push(rest);}const base=run+rests.reduce((a,b)=>a+b,0);return E.workout(id,runs,rests,Math.max(0,main-base),{pattern:rest?{run:bout,walk:rest}:null});};
 function plan(goal,days){if(!["runwalk","continuous"].includes(goal)||![2,3].includes(days))throw Error("Invalid plan");return [...common,...(goal==="runwalk"?rw:continuous)].map((row,i)=>{const slots=days===2?[0,2]:[0,1,2];return slots.map(j=>({...make(goal+"-w"+(i+1)+"-"+j,row[j]),lane:["practice","easy","long"][j]}));});}
 const sum=(a,k)=>a.reduce((s,x)=>s+x[k],0), max=(a,k)=>Math.max(0,...a.map(x=>x[k]??0));
 // Split the actual recovered practice prescription into two smaller doses.
 // Keep the long outing familiar, count the extra warm-up/cooldown, and
 // retain the current reference level during the transition cycle.
 function transition(s,records){
 const practice=records.find(r=>r.lane==="practice"),long=records.find(r=>r.lane==="long");
 if(!practice||!long||!practice.runSec||!long.runSec)return null;
 const original=plan(s.goal,2)[s.level];
 if(practice.runSec<original[0].runSec||long.runSec<original[1].runSec)return null;
 const first=original[0],last=original[1],half=Math.floor(first.runSec/2);
 const a=make("frequency-practice-"+s.level,[half,Math.min(first.longestBout,half),first.pattern?.walk??90,Math.floor(first.mainSec/2)]);
 const b=make("frequency-easy-"+s.level,[first.runSec-half,Math.min(first.longestBout,first.runSec-half),first.pattern?.walk??90,Math.ceil(first.mainSec/2)]);
 const row=[{...a,lane:"practice"},{...b,lane:"easy"},{...last,lane:"long"}];
 if(sum(row,"runSec")>sum(records,"runSec")||sum(row,"totalSec")>sum(records,"totalSec")+480)return null;
 return row;
 }
 function currentRow(s,h,d){
 if(s.transitionRow)return s.transitionRow;
 const row=plan(s.goal,s.days)[Math.min(s.level,14)];
 if(s.level<14)return row;
 // Extend the last long outing only after two recent recovered exposures at
 // the current duration. A time ceiling works even when distance is unknown.
 const g=E.good(h,d,28).filter(r=>r.lane==="long"&&r.runSec>0&&(s.goal!=="continuous"||r.strategy==="continuous")).sort((a,b)=>b.day-a.day);
 const last=row.at(-1),ext=s.extensionSec??0,base=last.mainSec+ext;
 if(!ext&&g.filter(r=>r.mainSec>=last.mainSec-1).length<2)return row;
 const target=base;
 const q=s.goal==="continuous"?E.continuous("extension-"+target,target):E.rhythm("extension-"+target,last.pattern.run,last.pattern.walk,target);
 return [...row.slice(0,-1),{...q,lane:"long"}];
 }
 function start(intake,h=[],day=0){
 const base=E.initial(intake,h,day);if(base.action!=="start")return base;
 const days=intake.days;const rows=plan(intake.goal,days),g=E.good(h,day,14),run=g.filter(r=>r.runSec>0);
 // New runner initially uses 2 days; third day is an explicit later transition.
 const n=base.days;
 let level=0;
 if(run.length>=4){const recent=E.good(h,day,14);const half=[recent.filter(r=>r.day>day-7),recent.filter(r=>r.day<=day-7)];const wk=Math.min(...half.map(r=>sum(r,"runSec")));const found=plan(intake.goal,n).findLastIndex(row=>sum(row,"runSec")<=wk&&max(row,"runSec")<=max(run,"runSec")&&max(row,"longestBout")<=max(run,"longestBout")&&max(row,"mainSec")<=max(run,"mainSec"));level=Math.max(0,found);}
 return {action:"start",goal:intake.goal,days:n,requestedDays:days,level,index:0,week:1,walkMin:intake.walkMin<30&&!run.length?Math.max(5,Math.floor(intake.walkMin/5)*5):null,goalTimeSec:intake.goalTimeSec??null,goalRevision:0,ack:null,history:E.recent(h,day,30),cycleRecords:[],lastDay:E.recent(h,day,30).sort((a,b)=>b.day-a.day)[0]?.day??null,paused:false,returnHold:false};
 }
 function reassessGoal(s,goal,time=null,h=s.history??[],day=s.lastDay??0){
 if(!["runwalk","continuous"].includes(goal)||time!==null&&(!Number.isFinite(time)||time<=0)||!Number.isInteger(day))throw Error("Invalid goal");
 const rows=E.recent(h,day,30).sort((a,b)=>b.day-a.day),g=E.good(h,day,14).filter(r=>r.runSec>0&&!r.fasterSec);
 const pause=s.paused||rows.some(r=>r.unresolved)||rows[0]&&["pause","urgent"].includes(E.check(rows[0].check));
 const bouts=max(g,"longestBout"),run=max(g,"runSec"),main=max(g,"mainSec");
 const windows=[g.filter(r=>r.day>day-7),g.filter(r=>r.day<=day-7)];
 const regular=windows.every(w=>new Set(w.map(r=>r.day)).size>=2);
 const wk=Math.min(...windows.map(w=>sum(w,"runSec")));
 const level=regular?plan(goal,s.days).findLastIndex(row=>sum(row,"runSec")<=wk&&max(row,"runSec")<=run&&max(row,"longestBout")<=bouts&&max(row,"mainSec")<=main):-1;
 // A controlled assessment replaces part of a familiar session; no pace-only advancement.
 const assessmentSec=pause?null:[1200,600,300,120].find(n=>n<=bouts)??null;
 return {goal,time,level:Math.max(0,level),status:pause?"pause":regular?"history-supported":"needs-recent-training",assessmentSec,optional:true,weeklyRunSec:regular?wk:null,longestBoutSec:bouts,reason:pause?"Resolve symptoms before assessing.":regular?"Use recent training to select the new starting point.":"Build recent comparable training before advancing."};
 }
 function changeGoal(s,goal,time=null,h=s.history??[],day=s.lastDay??0){
 const review=reassessGoal(s,goal,time,h,day);
 if(goal===s.goal)return {...s,goalTimeSec:time,goalRevision:s.goalRevision+1,ack:null,goalReview:review,paused:s.paused||review.status==="pause"};
 return {...s,goal,goalTimeSec:time,goalRevision:s.goalRevision+1,ack:null,index:0,cycleRecords:[],level:review.level,transitionRow:null,extensionSec:0,completed:false,completion:null,goalReview:review,paused:s.paused||review.status==="pause"};
 }
 function progressReview(s,h=s.history??[],day=s.lastDay??0){
 const rows=E.recent(h,day,28),done=rows.filter(r=>r.completed===true),recovered=E.good(h,day,28);
 const weeks=Array.from({length:4},(_,i)=>{const end=day-7*(3-i),w=rows.filter(r=>r.day<=end&&r.day>end-7);return {runSec:sum(w,"runSec"),totalSec:sum(w,"totalSec"),completed:w.filter(r=>r.completed===true).length};});
 return {completed:done.length,runSec:sum(rows,"runSec"),totalSec:sum(rows,"totalSec"),longestBoutSec:max(recovered,"longestBout"),longestMeasuredDistanceM:recovered.some(r=>r.mainDistanceM!=null)?max(recovered,"mainDistanceM"):null,weeks,analyticsCollapsed:true};
 }
 // Review actual exposure in the prospective seven-day window. Include
 // incomplete sessions. Reference rows never count as completed workload.
 function loadReview(s,h,d,p){
 const actual=E.recent(h,d-1,6),previous=E.recent(h,d-7,7),last14=E.recent(h,d-1,14);
 // Use the highest actual seven-day exposure in the prior 21 days,
// excluding the prospective window. Avoid treating a partial week as a full baseline.
 const older=E.recent(h,d-7,21);
 const windows=Array.from({length:15},(_,i)=>older.filter(r=>r.day<=d-7-i&&r.day>d-14-i));
 const latest=E.recent(h,d-1,28).sort((a,b)=>b.day-a.day);
 const gap=latest.length?d-latest[0].day:0;
 const returning=gap>=8||s.recoveryRemaining>0||latest.slice(0,2).some(r=>E.check(r.check)!=="success"||!r.completed);
 const completedCycle=latest.slice(0,s.days);
 const cycleOK=!returning&&completedCycle.length===s.days&&completedCycle.every(r=>r.completed&&E.check(r.check)==="success"&&r.check.recovery==="normal")&&completedCycle[0].day-completedCycle.at(-1).day<=6&&gap<=5;
 const recentWindows=returning?[]:windows;
 const baselineRun=Math.max(sum(previous,"runSec"),sum(last14,"runSec")/2,...recentWindows.map(w=>sum(w,"runSec")),cycleOK?sum(completedCycle,"runSec"):0);
 const baselineTotal=Math.max(sum(previous,"totalSec"),sum(last14,"totalSec")/2,...recentWindows.map(w=>sum(w,"totalSec")),cycleOK?sum(completedCycle,"totalSec"):0);
 const run=sum(actual,"runSec"),total=sum(actual,"totalSec");
 // Provisional coaching review corridors, not validated injury thresholds.
 // A new runner may establish the first low-dose reference week.
 const introductory=s.walkMin===null&&E.good(h,d-1,14).filter(r=>r.runSec>0).length<2&&s.level===0;
 const initial=plan(s.goal,s.days)[0];
 const recovered=E.good(h,d-1,14).filter(r=>r.runSec>0);
 const regular=!returning&&recovered.length>=2&&recovered.slice().sort((a,b)=>b.day-a.day).slice(0,2).every(r=>r.check.recovery==="normal");
 // Reference-supported small early doses need room for both sessions and
 // warm-up/cooldown, without a separate increase rule fighting the plan.
 const runBudget=introductory?sum(initial,"runSec"):baselineRun+Math.max(regular?240:120,Math.min(600,baselineRun*.30));
 const totalBudget=s.walkMin!==null&&!latest.length?s.walkMin*60*s.days:introductory?sum(initial,"totalSec"):Math.max(s.walkMin!==null&&s.level===0&&latest.every(r=>r.runSec===0&&r.completed&&E.check(r.check)==="success")&&gap<=5?Math.min(s.walkMin,latest[0]?.mainSec/60||s.walkMin)*60*s.days:0,baselineTotal+Math.max(regular?900:600,Math.min(1200,baselineTotal*.30)));
 const count=actual.length;
 return {runSec:run+p.runSec,totalSec:total+p.totalSec,runBudget,totalBudget,count:count+1,allowed:count<s.days&&run+p.runSec<=runBudget+1&&total+p.totalSec<=totalBudget+1};
 }
 function fitBudget(s,h,d,p){
 const review=loadReview(s,h,d,p);
 if(review.allowed)return {workout:p,review,changed:false};
 if(review.count>s.days)return {workout:null,review,changed:true};
 const baseRun=sum(E.recent(h,d-1,6),"runSec"),baseTotal=sum(E.recent(h,d-1,6),"totalSec");
 const maxRun=Math.floor(review.runBudget-baseRun),maxMain=Math.floor(review.totalBudget-baseTotal-(p.runSec?480:0));
 if(maxMain<60||p.runSec&&maxRun<Math.min(30,p.runSec))return {workout:null,review,changed:true};
 if(!p.runSec){const q={...E.walk("budget-walk-"+Math.min(p.mainSec,maxMain),Math.min(p.mainSec,maxMain)),lane:p.lane};return {workout:q,review:loadReview(s,h,d,q),changed:true};}
 // Truncate familiar intervals in order; do not make them faster or longer.
 const runs=[],rests=[];let remaining=Math.min(maxRun,maxMain),left=maxMain;
 for(let i=0;i<p.runs.length&&remaining>0&&left>0;i++){
 const n=Math.min(p.runs[i],remaining,left);if(n<=0)break;runs.push(n);remaining-=n;left-=n;
 if(i<p.runs.length-1&&remaining>0){const w=Math.min(p.rests[i]??0,left);rests.push(w);left-=w;}
 }
 if(rests.length===runs.length&&rests.length)rests.pop();
 if(!runs.length)return {workout:null,review,changed:true};
 const used=sum(runs.map(x=>({x})),"x")+sum(rests.map(x=>({x})),"x");
 const q={...E.workout("budget-"+p.id,runs,rests,Math.max(0,Math.min(p.mainSec,maxMain)-used),{pattern:p.pattern,distanceGoal:p.distanceGoal}),lane:p.lane};
 const checked=loadReview(s,h,d,q);return {workout:checked.allowed?q:null,review:checked,changed:true};
 }
 function recoveryDose(p,history,d,factor=.75){
 const recovered=E.good(history,d,28).sort((a,b)=>b.day-a.day),last=recovered.find(r=>r.lane===p.lane)??recovered[0];
 if(!last)return {...E.walk("recovery-walk",Math.min(600,p.mainSec)),lane:p.lane};
 const run=Math.min(p.runSec,Math.floor(last.runSec*factor)),main=Math.min(p.mainSec,Math.floor(last.mainSec*factor));
 if(run<=0||main<60)return {...E.walk("recovery-walk",Math.max(60,main)),lane:p.lane};
 const bout=Math.max(1,Math.min(p.longestBout,Math.floor(last.longestBout*factor),run));
 const rest=p.pattern?.walk??90;
 let dose=Math.min(run,main);
 while(dose>1&&dose+Math.max(0,Math.ceil(dose/bout)-1)*rest>main)dose--;
 return {...make("recovery-"+p.lane+"-"+dose,[dose,Math.min(bout,dose),rest,main]),lane:p.lane,distanceGoal:5000};
 }
 function next(s,h,d,context={}){
 const result=(action,workout,reason,extra={})=>{
 if(!workout)return {action,workout,state:s,reason,...extra};
 const fit=fitBudget(s,h,d,workout);
 if(!fit.workout)return {action:"rest",workout:null,state:s,reason:"Allow more recovery before the next running session.",load:fit.review};
 return {action:fit.changed?"budget-bridge":action,workout:fit.workout,state:s,reason:fit.changed?"Today’s workout stays within the amount of running you have recently handled.":reason,load:fit.review,...extra};
 };
 // Current symptoms take priority over scheduling and completion; the caller must persist returned state.
 if(context.symptoms==="urgent")return {action:"urgent",workout:null,state:{...s,paused:true,pauseReason:"urgent"},reason:"Seek urgent medical assessment."};
 if(context.symptoms&&context.symptoms!=="none"||context.recovery==="limited")return {action:"pause",workout:null,state:{...s,paused:true,pauseReason:"symptoms"},reason:"Address symptoms before running."};
 if(s.paused)return result(s.pauseReason==="urgent"?"urgent":"pause",null,"Resolve health or symptom concerns.");
 if(s.completed)return result("complete",null,"Your selected 5K milestone is complete.");
 if(s.action!=="start")return result("pause",null,"Resolve health or symptom concerns.");
 const all=E.recent(h,d,90).sort((a,b)=>b.day-a.day),last=all[0];
 if(all.some(r=>r.unresolved)||last&&["pause","urgent"].includes(E.check(last.check)))return result("pause",null,"Pause and assess symptoms.");
 if(last&&d-last.day<2)return result("rest",null,"Rest between workouts.");
 
 if(context.recovery==="unknown")return result("hold",null,"Confirm recovery.");
 if(context.hardActivityYesterday||context.hardActivityToday||context.recovery==="heavy")return result("rest",null,"Allow recovery from other activity before running.");
 if(last&&E.check(last.check)==="hold"||last?.check?.recovery==="unknown")return result("hold",null,"Confirm recovery.");
 let row=currentRow(s,h,d),p=row[s.index%row.length];
 // Distance ceiling applies to every measured outing, including ordinary practice.
 if(p.runSec)p={...p,distanceGoal:5000};
 if(s.walkMin!==null)p={...E.walk("walk-"+s.walkMin,s.walkMin*60),lane:p.lane};
 const g=E.good(h,d,30),run=g.filter(r=>r.runSec>0),prior=g.filter(r=>r.day>=d-14);
 if(last&&d-last.day>=28)return result("reassess",null,"Reassess recent activity.");
 if(last&&(d-last.day>=8||E.check(last.check)==="reduce"||last.completed!==true)){
 return result("reduce",recoveryDose(p,h,d),"Your recent workout or time away calls for a shorter, familiar session today.",{recoveryTrigger:true});
 }
 if(s.recoveryRemaining>0)return result("recovery",recoveryDose(p,h.filter(r=>r.day<(s.recoveryStartDay??d)),d,.85),"Keep today’s workout manageable while you rebuild your routine.");
 if(last&&(d-last.day>=6||E.check(last.check)==="repeat")){
 return result("repeat",recoveryDose(p,h,d,.9),"Repeat a manageable workout before adding more.",{recoveryTrigger:true});
 }
 // Late specific preparation: 5K only after two consistent recent weeks and
 // a comparable near-distance effort. No calendar deadline forces an attempt.
 if(!context.deferAttempt&&s.walkMin===null&&p.lane==="long"&&E.ready(h,d,s.goal).ready){
 const near=g.filter(r=>r.lane==="long"&&r.day>d-14&&r.comparable!==false&&r.mainDistanceM>=4500&&r.mainDistanceM<5000&&r.runSec>0&&(s.goal!=="continuous"||r.strategy==="continuous"&&r.continuousDistanceM>=4500&&r.longestBout===r.mainSec)).sort((a,b)=>b.day-a.day)[0];
 if(near){const cap=E.ready(h,d,s.goal).cap;const q=s.goal==="continuous"?E.continuous("finish-5k",cap,{distanceGoal:5000}):E.rhythm("finish-5k",Math.min(180,near.longestBout),90,cap,{distanceGoal:5000});if(q.runSec<=near.runSec+180)return result("attempt",{...q,lane:"long"},"Your recent training supports an optional 5K attempt. Stop at 5 km or the time limit.");}
 }
 // Reference steps are candidates, not automatic prescriptions. Compare the
 // observed current running dose and longest bout, and interpolate if necessary.
 if(p.runSec&&run.length){
 const latest=run.sort((a,b)=>b.day-a.day)[0],maxRun=max(prior,"runSec"),maxBout=max(prior,"longestBout"),maxMain=max(prior,"mainSec");
 const increment=Math.max(60,Math.min(240,Math.ceil(maxRun*.25/30)*30));
 const boutInc=Math.max(30,Math.min(300,Math.ceil(maxBout*.50/15)*15));
 const limitRun=maxRun+increment,limitBout=maxBout+boutInc,limitMain=maxMain+300;
 const distanceRef=max(run,"runningDistanceM"),proj=latest.runningDistanceM&&latest.runSec?latest.runningDistanceM*p.runSec/latest.runSec:null;
 const flag=proj&&distanceRef&&proj>distanceRef*1.10?"review":"within-or-unknown";
 // Keep a visible caution flag; small absolute progressions can be considered
 // after repeated recovery, but large observed-distance jumps need a bridge.
 const distCap=proj&&distanceRef&&proj>distanceRef*1.30&&proj-distanceRef>200?Math.floor(distanceRef*1.30*latest.runSec/latest.runningDistanceM):Infinity;
 let dose=Math.min(p.runSec,limitRun,distCap),bout=Math.min(p.longestBout,limitBout,dose),main=Math.min(p.mainSec,limitMain);
 if(dose<p.runSec||bout<p.longestBout||main<p.mainSec){
 const rest=p.pattern?.walk??90;const runs=[],rests=[];let left=dose;
 while(left>0){let n=Math.min(left,bout);runs.push(n);left-=n;if(left)rests.push(rest);}
 const base=dose+sum(rests.map(x=>({x})),"x");
 if(base>limitMain)return result("repeat",recoveryDose(p,h,d,.95),"Repeat a familiar session so the next increase is smaller.",{flag});
 const q=E.strategy(p)==="continuous"&&dose===bout?E.continuous("bridge-"+p.id+"-"+dose,dose,{distanceGoal:5000}):E.workout("bridge-"+p.id+"-"+dose+"-"+bout,runs,rests,Math.max(0,Math.max(base,main)-base),{pattern:rest?{run:bout,walk:rest}:null,distanceGoal:5000});
 return result("bridge",{...q,lane:p.lane},"Take a smaller step toward the next workout, based on your recent running.",{flag,target:p});
 }
 return result("train",p,"Today’s workout follows your current training stage and recent recovery.",{flag});
 }
 return result("train",p,"Today’s workout follows your current training stage and recent recovery.");
 }
 function log(s,record,decision){
 if(!E.validRecord(record))throw Error("Invalid record");
 if(s.history.some(r=>r.day===record.day)||s.lastDay!==null&&record.day<=s.lastDay)throw Error("Duplicate or out-of-order workout");
 if(record.strategy==="continuous"&&(record.runSec!==record.mainSec||record.longestBout!==record.runSec)||record.strategy==="walk"&&record.runSec!==0)throw Error("Inconsistent running strategy");
 if(!decision.workout||record.prescriptionId!==decision.workout.id||record.lane!==decision.workout.lane)throw Error("Record does not match prescribed session");
 const c=E.check(record.check);let next={...s,lastDay:record.day,history:[...s.history,record]};
 if(c==="urgent"||c==="pause")return {...next,paused:true,pauseReason:c==="urgent"?"urgent":"symptoms"};
 if(c!=="success"||!record.completed)return {...next,recoveryRemaining:c==="reduce"||!record.completed?s.days:next.recoveryRemaining??0};
 const recovering=!!decision.recoveryTrigger||s.recoveryRemaining>0;
 if(decision.recoveryTrigger){next.recoveryRemaining=Math.max(0,s.days-1);next.recoveryStartDay=record.day;}
 else if(s.recoveryRemaining>0)next.recoveryRemaining=s.recoveryRemaining-1;

 if(E.achievement(record)[s.goal])return {...next,completed:true,completion:record};
 if(s.walkMin!==null){const records=[...s.cycleRecords,record],n=records.length;if(n>=s.days){const ready=records.every(r=>r.mainSec>=s.walkMin*60-1)&&!recovering;return {...next,walkMin:ready?(s.walkMin>=30?null:Math.min(30,s.walkMin+5)):s.walkMin,cycleRecords:[],index:0,week:s.week+1};}return {...next,cycleRecords:records,index:s.index+1};}
 // A successfully recovered session advances the schedule independently of
 // workload or developmental level. Assess the full cycle against its reference.
 const records=[...s.cycleRecords,{...record,recovering,adjusted:recovering||["reduce","repeat","bridge","budget-bridge","recovery"].includes(decision.action)}];let idx=s.index+1;
 if(idx>=s.days){
 const target=currentRow(s,next.history,record.day);
 const referenceReady=target.every(p=>records.some(r=>r.lane===p.lane&&r.runSec>=p.runSec*.95&&r.longestBout>=p.longestBout*.95&&r.mainSec>=p.mainSec*.90&&!r.recovering));
 let days=s.days,level=referenceReady?Math.min(14,s.level+1):s.level,transitionRow=s.transitionRow??null,extensionSec=s.extensionSec??0;
 const recent=E.good(next.history,record.day,14).filter(r=>r.runSec>0&&r.check.recovery==="normal");
 if(referenceReady&&s.days===2&&s.requestedDays===3&&s.level>=1&&[recent.filter(r=>r.day>record.day-7),recent.filter(r=>r.day<=record.day-7)].every(w=>new Set(w.map(r=>r.day)).size>=2)){
 const split=transition(s,records);
 if(split){days=3;level=s.level;transitionRow=split;}
 }
 if(s.transitionRow){level=s.level;if(referenceReady){transitionRow=null;const nextRow=plan(s.goal,s.days)[Math.min(14,s.level+1)];const recentRun=sum(records,"runSec"),recentTotal=sum(records,"totalSec");if(sum(nextRow,"runSec")<=recentRun+240&&sum(nextRow,"totalSec")<=recentTotal+900&&max(nextRow,"longestBout")<=max(records,"longestBout")+30)level=Math.min(14,s.level+1);}}
 if(referenceReady&&s.level===14&&!s.transitionRow){
 const base=plan(s.goal,s.days)[14].at(-1).mainSec+extensionSec;
 const recovered=E.good(next.history,record.day,28).filter(r=>r.lane==="long"&&r.mainSec>=base-1&&r.check.recovery==="normal"&&(s.goal!=="continuous"||r.strategy==="continuous"));
 if(new Set(recovered.map(r=>r.day)).size>=2)extensionSec+=Math.min(180,Math.max(60,Math.floor(base*.08/30)*30));
 }
 return {...next,days,level,transitionRow,extensionSec,index:0,cycleRecords:[],week:s.week+1};
 }
 return {...next,index:idx,cycleRecords:records};
 }
 return {plan,start,next,log,changeGoal,reassessGoal,progressReview,transition,currentRow,loadReview,fitBudget,recoveryDose,ack:s=>({...s,ack:s.goalRevision})};
};
module.exports=reference(require("./engine.cjs"));

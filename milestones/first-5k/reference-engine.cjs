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
 function start(intake,h=[],day=0){
 const base=E.initial(intake,h,day);if(base.action!=="start")return base;
 const days=intake.days;const rows=plan(intake.goal,days),g=E.good(h,day,14),run=g.filter(r=>r.runSec>0);
 // New runner initially uses 2 days; third day is an explicit later transition.
 const n=base.days;
 let level=0;
 if(run.length>=4){const recent=E.good(h,day,14);const half=[recent.filter(r=>r.day>day-7),recent.filter(r=>r.day<=day-7)];const wk=Math.min(...half.map(r=>sum(r,"runSec")));const found=plan(intake.goal,n).findLastIndex(row=>sum(row,"runSec")<=wk&&max(row,"runSec")<=max(run,"runSec")&&max(row,"longestBout")<=max(run,"longestBout")&&max(row,"mainSec")<=max(run,"mainSec"));level=Math.max(0,found);}
 return {action:"start",goal:intake.goal,days:n,requestedDays:days,level,index:0,week:1,walkMin:intake.walkMin<30&&!run.length?Math.max(5,Math.floor(intake.walkMin/5)*5):null,goalTimeSec:intake.goalTimeSec??null,goalRevision:0,ack:null,history:[],cycleRecords:[],lastDay:null,paused:false,returnHold:false};
 }
 function changeGoal(s,goal,time=null){if(!["runwalk","continuous"].includes(goal))throw Error("Invalid goal");return {...s,goal,goalTimeSec:time,goalRevision:s.goalRevision+1,ack:null,index:0,cycleRecords:[],level:Math.min(s.level,3),completed:false,completion:null};}
 function next(s,h,d){
 const result=(action,workout,reason,extra={})=>({action,workout,state:s,reason,...extra});
 if(s.completed)return result("complete",null,"Your selected 5K milestone is complete.");
 if(s.action!=="start"||s.paused)return result("pause",null,"Resolve health or symptom concerns.");
 const all=E.recent(h,d,90).sort((a,b)=>b.day-a.day),last=all[0];
 if(all.some(r=>r.unresolved)||last&&["pause","urgent"].includes(E.check(last.check)))return result("pause",null,"Pause and assess symptoms.");
 if(last&&d-last.day<2)return result("rest",null,"Rest between workouts.");
 if(last&&E.check(last.check)==="hold"||last?.check?.recovery==="unknown")return result("hold",null,"Confirm recovery.");
 let row=plan(s.goal,s.days)[Math.min(s.level,14)],p=row[s.index%row.length];
 // Distance ceiling applies to every measured outing, including ordinary practice.
 if(p.runSec)p={...p,distanceGoal:5000};
 if(s.walkMin!==null)p={...E.walk("walk-"+s.walkMin,s.walkMin*60),lane:p.lane};
 const g=E.good(h,d,30),run=g.filter(r=>r.runSec>0),prior=g.filter(r=>r.day>=d-14);
 if(last&&d-last.day>=28)return result("reassess",null,"Reassess recent activity.");
 if(last&&(d-last.day>=8||E.check(last.check)==="reduce")){
 const base=run.slice().sort((a,b)=>b.day-a.day)[0];let q=E.reduced(p);
 if(base&&q.runSec>base.runSec)q=E.byId("A1");
 return result("reduce",{...q,lane:p.lane},"Return to a reduced familiar dose.");
 }
 if(last&&(d-last.day>=5||E.check(last.check)==="repeat")){
 const q=E.reduced(p);return result("repeat",{...q,lane:p.lane},"Use a manageable familiar workout.");
 }
 // Late specific preparation: 5K only after two consistent recent weeks and
 // a comparable near-distance effort. No calendar deadline forces an attempt.
 if(s.walkMin===null&&p.lane==="long"&&E.ready(h,d,s.goal).ready){
 const near=g.filter(r=>r.lane==="long"&&r.mainDistanceM>=4500&&r.mainDistanceM<5000&&(s.goal!=="continuous"||r.strategy==="continuous")).sort((a,b)=>b.day-a.day)[0];
 if(near){const cap=E.ready(h,d,s.goal).cap;const q=s.goal==="continuous"?E.continuous("finish-5k",cap,{distanceGoal:5000}):E.rhythm("finish-5k",Math.min(180,near.longestBout),90,cap,{distanceGoal:5000});if(q.runSec<=near.runSec+180)return result("attempt",{...q,lane:"long"},"Stop at 5 km or the time limit.");}
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
 if(base>limitMain)return result("repeat",{...E.reduced(p),lane:p.lane},"Use an intermediate recovered dose.",{flag});
 const q=E.workout("bridge-"+p.id+"-"+dose+"-"+bout,runs,rests,Math.max(0,Math.max(base,main)-base),{pattern:rest?{run:bout,walk:rest}:null,distanceGoal:5000});
 return result("bridge",{...q,lane:p.lane},"Use a smaller step toward the reference workout.",{flag,target:p});
 }
 return result("train",p,"Follow the current reference workout.",{flag});
 }
 return result("train",p,"Follow the current reference workout.");
 }
 function log(s,record,decision){
 if(!E.validRecord(record))throw Error("Invalid record");
 if(!decision.workout||record.prescriptionId!==decision.workout.id||record.lane!==decision.workout.lane)throw Error("Record does not match prescribed session");
 const c=E.check(record.check);let next={...s,lastDay:record.day,history:[...s.history,record]};
 if(c==="urgent"||c==="pause")return {...next,paused:true};
 if(c!=="success"||!record.completed)return next;
 if(E.achievement(record)[s.goal])return {...next,completed:true,completion:record};
 if(s.walkMin!==null){const n=s.cycleRecords.length+1;if(n>=s.days){return {...next,walkMin:s.walkMin>=30?null:Math.min(30,s.walkMin+5),cycleRecords:[],index:0,week:s.week+1};}return {...next,cycleRecords:[...s.cycleRecords,record],index:s.index+1};}
 if(["reduce","repeat","bridge"].includes(decision.action)){
 // A successful bridge is evidence but does not unlock the reference row.
 return next;
 }
 const records=[...s.cycleRecords,record];let idx=s.index+1;
 if(idx>=s.days){
 let days=s.days;
 // Only add a third session after two weeks of regular recovered running,
 // then return to a reference row with no larger weekly running dose.
 let level=Math.min(14,s.level+1);
 if(s.days===2&&s.requestedDays===3&&s.level>=1&&E.good(next.history,record.day,14).filter(r=>r.runSec>0).length>=4){
 const old=sum(plan(s.goal,2)[s.level],"runSec");
 const eligible=plan(s.goal,3).findLastIndex(row=>sum(row,"runSec")<=old&&max(row,"longestBout")<=max(plan(s.goal,2)[s.level],"longestBout"));
 if(eligible>=0){days=3;level=eligible;}
 }
 return {...next,days,level,index:0,cycleRecords:[],week:s.week+1};
 }
 return {...next,index:idx,cycleRecords:records};
 }
 return {plan,start,next,log,changeGoal,ack:s=>({...s,ack:s.goalRevision})};
};
module.exports=reference(require("./engine.cjs"));

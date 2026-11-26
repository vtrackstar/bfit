"use strict";
const simulate = function simulate(E,S){
 const ok=E.successCheck;
 function record(p,day,lane,pace,opts={}){
  let left=p.mainSec,meters=0,runM=0,runSec=0,longest=0,mainSec=0;
  const take=(sec,run)=>{const rate=1000/(pace+(run?0:180)),limit=p.distanceGoal===null?Infinity:Math.max(0,(p.distanceGoal-meters)/rate),t=Math.min(left,sec,Math.ceil(limit));left-=t;mainSec+=t;meters+=t*rate;if(run){runSec+=t;runM+=t*rate;longest=Math.max(longest,t);}};
  for(let i=0;i<p.runs.length&&left>0;i++){take(p.runs[i],true);take(p.rests[i]??0,false);}if(left>0)take(p.tail,false);
  const strategy=runSec===0?"walk":runSec===mainSec?"continuous":"runwalk";
  return {day,lane,prescriptionId:p.id,runSec,mainSec,totalSec:mainSec+(runSec?480:0),longestBout:longest,fasterSec:0,mainDistanceM:Math.floor(meters+1e-7),runningDistanceM:Math.floor(runM+1e-7),continuousDistanceM:strategy==="continuous"?Math.floor(runM+1e-7):null,strategy,check:ok,completed:true,comparable:true,...opts};
 }
 function journey(name,intake,pace,{seed=null,miss=[],switchWeek=null,limit=60}={}){
  let h=[],trace=[],done=null;
  if(seed)for(let w=0;w<4;w++)for(const [i,d] of E.schedule(intake.days).days.entries())h.push(record(seed,973+w*7+d,i===0?"practice":i===intake.days-1?"long":"easy",pace));
  let s=S.start(intake,h,1000);
  for(let w=1;w<=limit;w++){
   if(w===switchWeek)s=S.goalChange(s,"continuous");
   if(miss.includes(w))continue;
   const days=E.schedule(s.days).days;
   for(const day of days){
    const d=1001+(w-1)*7+day,x=S.next(s,h,d);
    if(!x.workout){trace.push({week:w,day:d,action:x.action,reason:x.reason});if(x.action==="reassess")s=S.start({...intake,goal:s.goal},h,d);continue;}
    s=x.state;const r=record(x.workout,d,x.lane,pace);h.push(r);
    trace.push({week:w,day:d,lane:x.lane,action:x.action,lever:x.lever??null,runMin:r.runSec/60,boutMin:r.longestBout/60,mainMin:r.mainSec/60,distanceM:r.mainDistanceM,flag:x.flag??null,reason:x.reason});
    if(E.achievement(r)[s.goal]){done={week:w,day:d,distanceM:r.mainDistanceM,runMin:r.runSec/60,mainMin:r.mainSec/60,strategy:r.strategy};break;}
   }
   if(done)break;
  }
  return {name,done,trace,final:{goal:s.goal,practice:s.practice?.id,long:s.long?.id,practiceRun:s.practice?.runSec,longRun:s.long?.runSec,longBout:s.long?.longestBout,longMain:s.long?.mainSec}};
 }
 const journeys=[
 journey("Walking entry to run-walk",{walkMin:10,goal:"runwalk",days:2},480),
 journey("New runner to run-walk",{walkMin:30,goal:"runwalk",days:2},480),
 journey("New runner to continuous",{walkMin:30,goal:"continuous",days:2},480),
 journey("Slow continuous runner",{walkMin:30,goal:"continuous",days:2},540,{seed:E.byId("C10")}),
 journey("Goal change",{walkMin:30,goal:"runwalk",days:2},480,{seed:E.byId("B7"),switchWeek:8}),
 journey("Interrupted training",{walkMin:30,goal:"runwalk",days:3},480,{miss:[5,6,12]})
 ];
 const tests=[];const check=(name,fn)=>{try{tests.push({name,pass:!!fn()})}catch(e){tests.push({name,pass:false,error:String(e)})}};
 const a=E.byId("A1"),s=S.start({walkMin:30,goal:"runwalk",days:2},[],1000);
 check("No adjacent running days",()=>S.next(s,[record(a,1000,"practice",480)],1001).action==="rest");
 check("Pain overrides progression",()=>S.next(s,[record(a,1000,"practice",480,{check:{...ok,symptoms:"sharp"}})],1003).action==="pause");
 check("Unknown recovery blocks workout",()=>!S.next(s,[record(a,1000,"practice",480,{check:{...ok,recovery:"unknown"}})],1003).workout);
 check("Missed 14 days reduces dose",()=>S.next(s,[record(a,1000,"practice",480)],1014).workout.runSec<a.runSec);
 check("Four-week review doesn't alter dose",()=>S.blockReview(s,[],1028).state===s);
 check("Acknowledgment resets with goal change",()=>S.goalChange(S.ack(s),"continuous",1800).noticeAck===null);
 check("Two comparable days with distinct IDs can qualify",()=>{const h=[record(a,1000,"practice",480),record({...a,id:"different"},1003,"long",480),record(a,1006,"practice",480),record(a,1009,"long",480)];return S.next({...s,started:980},h,1013,{lane:"practice"}).action==="progress";});
 check("Initial history not replaced by goal time",()=>S.start({walkMin:30,goal:"continuous",days:2,goalTimeSec:1200},[],1000).practice.id==="A1");
 return {journeys,tests,summary:{complete:journeys.filter(x=>x.done).length,total:journeys.length,passed:tests.filter(x=>x.pass).length,checks:tests.length}};
};
const result=simulate(require("./engine.cjs"),require("./session-engine.cjs"));
console.log(JSON.stringify(result,null,2));
if(result.tests.some(t=>!t.pass))process.exitCode=1;

"use strict";
// Scripted journeys; no physiological prediction.
const journeys = function journeys(E){
 const ok=E.successCheck;
 function record(p,day,lane,pace,opts={}){
  // Different walking/running speeds, so mixed distance is not a proxy for running distance.
  const runPace=pace,walkPace=pace+180;
  let remaining=p.mainSec,meters=0,runM=0,runSec=0,longest=0,mainSec=0;
  const take=(s,isRun)=>{
   const rate=1000/(isRun?runPace:walkPace);
   const limit=p.distanceGoal===null?Infinity:Math.max(0,(p.distanceGoal-meters)/rate);
   const t=Math.min(s,remaining,Math.ceil(limit));remaining-=t;mainSec+=t;meters+=t*rate;
   if(isRun){runSec+=t;runM+=t*rate;longest=Math.max(longest,t);}
  };
  for(let i=0;i<p.runs.length&&remaining>0;i++){take(p.runs[i],true);take(p.rests[i]??0,false);}
  if(remaining>0)take(p.tail,false);
  const strategy=runSec===0?"walk":runSec===mainSec?"continuous":"runwalk";
  return {day,lane,prescriptionId:p.id,runSec,mainSec,totalSec:mainSec+(runSec?480:0),longestBout:longest,fasterSec:Math.min(p.fasterSec,runSec),mainDistanceM:Math.floor(meters+1e-7),runningDistanceM:Math.floor(runM+1e-7),continuousDistanceM:strategy==="continuous"?Math.floor(runM+1e-7):null,strategy,check:ok,completed:true,comparable:true,...opts};
 }
 function journey(name,intake,pace,{weeks=80,seed=null,miss=[],switchWeek=null,third=false}={}){
  let h=[],s,trace=[],done=null;
  if(seed)for(let w=0;w<4;w++)for(const [i,d] of E.schedule(intake.days).days.entries())h.push(record(seed,973+w*7+d,i===0?"practice":i===intake.days-1?"long":"easy",pace));
  s=E.initial(intake,h,1000);
  for(let w=1;w<=weeks;w++){
   if(switchWeek===w)s={...s,goal:"continuous"};
   const start=1001+(w-1)*7,p=E.weekly(s);if(!p)break;
   let reentered=false;
   for(const q of p.sessions){
    if(miss.includes(w))continue;
    const d=start+q.day,previous=h.at(-1),gap=previous?d-previous.day:3;
    const re=E.reentry(q,gap);
    if(re.action==="reassess"){s=E.initial(intake,h,d);reentered=true;break;}
    if(!re.workout)continue;
    // The prototype has no persistent return state; explicitly apply returned workout
    // for this simulation. Never mark a return prescription as the old target.
    let workout=re.workout;
    if(re.holdProgression&&re.action!=="repeat"){reentered=true;s={...s,[q.lane]:workout};}
    const r=record(workout,d,q.lane,pace);
    h.push(r);
    const a=E.achievement(r);
    if(a[s.goal]){done={week:w,day:d,distanceM:r.mainDistanceM,runMinutes:r.runSec/60,mainMinutes:r.mainSec/60,strategy:r.strategy};break;}
   }
   if(done){trace.push({week:w,action:"complete",goal:s.goal});break;}
   const focus=w%2?"practice":"long";
   const review=reentered?{action:"return",state:s,reason:"Return dose applied; progression held."}:E.review(s,h,start+6,{weekNumber:w,focus,wantThird:third});
   trace.push({week:w,action:review.action,reason:review.reason,practice:s.practice.id,long:s.long.id,days:s.days,goal:s.goal,runMinutes:p.runSec/60,longMinutes:s.long.mainSec/60});
   s=review.state;
  }
  return {name,done,trace,final:{practice:s.practice?.id,long:s.long?.id,goal:s.goal,days:s.days},records:h.length};
 }
 return [
  journey("Walking entry to run-walk 5K",{walkMin:10,goal:"runwalk",days:2},480),
  journey("New runner to run-walk 5K",{walkMin:30,goal:"runwalk",days:2},480),
  journey("New runner to continuous 5K",{walkMin:30,goal:"continuous",days:2},480),
  journey("Slow continuous runner",{walkMin:30,goal:"continuous",days:2},540,{seed:E.byId("C10")}),
  journey("Goal change from run-walk to continuous",{walkMin:30,goal:"runwalk",days:2},480,{seed:E.byId("B7"),switchWeek:8}),
  journey("Interrupted training and three-day request",{walkMin:30,goal:"runwalk",days:3},480,{miss:[5,6,12],third:true})
 ];
};
const results=journeys(require("./engine.cjs"));
console.log(JSON.stringify(results,null,2));

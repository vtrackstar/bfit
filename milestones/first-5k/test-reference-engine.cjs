"use strict";
const test=function test(E,R){
 const sum=(a,k)=>a.reduce((s,x)=>s+x[k],0),max=(a,k)=>Math.max(0,...a.map(x=>x[k]??0));
 function rec(p,d,pace,override={}){
 let distance=0,running=0,runSec=0,mainSec=0,longest=0;
 function take(sec,isRun){const rate=1000/(pace+(isRun?0:180));const t=Math.min(sec,p.distanceGoal?Math.max(0,(p.distanceGoal-distance)/rate):Infinity);distance+=t*rate;mainSec+=t;if(isRun){running+=t*rate;runSec+=t;longest=Math.max(longest,t);}}
 p.runs.forEach((x,i)=>{take(x,true);take(p.rests[i]??0,false)});take(p.tail,false);
 const strategy=runSec===0?"walk":runSec===mainSec?"continuous":"runwalk";
 return {day:d,lane:p.lane,prescriptionId:p.id,runSec,mainSec,totalSec:mainSec+(runSec?480:0),longestBout:longest,fasterSec:0,mainDistanceM:Math.round(distance),runningDistanceM:Math.round(running),continuousDistanceM:strategy==="continuous"?Math.round(distance):null,strategy,completed:true,check:E.successCheck,comparable:true,...override};
 }
 const tests=[],check=(name,fn)=>{try{tests.push({name,pass:!!fn()})}catch(e){tests.push({name,pass:false,error:String(e)})}};
 const workloads=[];
 for(const goal of ["runwalk","continuous"])for(const days of [2,3]){
 const rows=R.plan(goal,days);
 workloads.push({goal,days,weeks:rows.map((r,i)=>({week:i+1,runMin:sum(r,"runSec")/60,longestBoutMin:max(r,"longestBout")/60,longMainMin:max(r,"mainSec")/60,totalMin:sum(r,"totalSec")/60}))});
 check(goal+" "+days+" day arithmetic",()=>rows.length===15&&rows.every(r=>r.length===days&&r.every(p=>p.mainSec===sum(p.runs.map(x=>({x})),"x")+sum(p.rests.map(x=>({x})),"x")+p.tail&&p.totalSec===p.mainSec+480&&p.longestBout<=p.runSec)));
 }
 function journey(name,intake,pace,{miss=[],seed=null,switchWeek=null,limit=35}={}){
 let h=[],trace=[],done=null;
 if(seed)for(let w=0;w<4;w++)for(let i=0;i<2;i++)h.push(rec({...seed,lane:i?"long":"practice"},973+w*7+[1,5][i],pace));
 let s=R.start(intake,h,1000);
 for(let w=1;w<=limit;w++){
 if(w===switchWeek)s=R.changeGoal(s,"continuous");
 if(miss.includes(w))continue;
 const days=E.schedule(s.days).days;
 for(const slot of days){
 const d=1001+(w-1)*7+slot,decision=R.next(s,h,d);
 if(!decision.workout){trace.push({week:w,action:decision.action});continue;}
 const r=rec(decision.workout,d,pace);h.push(r);s=R.log(s,r,decision);
 trace.push({week:w,level:s.level+1,days:s.days,lane:r.lane,action:decision.action,runMin:r.runSec/60,boutMin:r.longestBout/60,mainMin:r.mainSec/60,distanceM:r.mainDistanceM,flag:decision.flag??null});
 if(E.achievement(r)[s.goal]){done={week:w,distanceM:r.mainDistanceM,strategy:r.strategy,minutes:r.mainSec/60,lane:r.lane};break;}
 }if(done)break;
 }
 return {name,done,final:{level:s.level+1,days:s.days,index:s.index,goal:s.goal},trace};
 }
 const journeys=[journey("Walking foundation",{walkMin:10,goal:"runwalk",days:3},480),journey("Beginner run-walk 3 days",{walkMin:30,goal:"runwalk",days:3},480),journey("Beginner continuous 3 days",{walkMin:30,goal:"continuous",days:3},480),journey("Slow established runner",{walkMin:30,goal:"continuous",days:2},540,{seed:E.byId("C10")}),journey("Goal change",{walkMin:30,goal:"runwalk",days:3},480,{switchWeek:8}),journey("Interrupted training",{walkMin:30,goal:"runwalk",days:3},480,{miss:[5,6,12]}),journey("Two-day beginner",{walkMin:30,goal:"runwalk",days:2},480)];
 const a=R.start({walkMin:30,goal:"runwalk",days:2},[],1000),p=R.next(a,[],1000).workout;
 check("Pain pauses",()=>!R.next(a,[rec(p,1000,480,{check:{...E.successCheck,symptoms:"sharp"}})],1003).workout);
 check("Unknown recovery holds",()=>!R.next(a,[rec(p,1000,480,{check:{...E.successCheck,recovery:"unknown"}})],1003).workout);
 check("No adjacent sessions",()=>R.next(a,[rec(p,1000,480)],1001).action==="rest");
 check("Acknowledgment reset",()=>R.changeGoal(R.ack(a),"continuous").ack===null);
 check("All journey finishes stop at 5K",()=>journeys.every(j=>j.done&&j.done.distanceM===5000));
 check("Run-walk journeys finish using breaks",()=>journeys.filter(j=>j.final.goal==="runwalk").every(j=>j.done?.strategy==="runwalk"));
 check("Continuous journeys finish nonstop",()=>journeys.filter(j=>j.final.goal==="continuous").every(j=>j.done?.strategy==="continuous"));
 return {workloads,journeys,tests,summary:{completed:journeys.filter(x=>x.done).length,total:journeys.length,passed:tests.filter(x=>x.pass).length,checks:tests.length}};
};
const result=test(require("./engine.cjs"),require("./reference-engine.cjs"));
console.log(JSON.stringify(result,null,2));
if(result.tests.some(x=>!x.pass))process.exitCode=1;

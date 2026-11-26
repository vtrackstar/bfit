"use strict";
const testEngine = function testEngine(E){
  const checks=[],profiles=[],failures=[];
  const ok=E.successCheck,easy={...ok,effort:"easy"};
  const check=(name,fn)=>{try{if(!fn())throw Error("assertion returned false");checks.push({name,pass:true});}catch(err){checks.push({name,pass:false,detail:String(err)});failures.push(name);}};
  const scenario=(name,fn)=>{try{const r=fn();profiles.push({name,...r});}catch(err){profiles.push({name,error:String(err)});failures.push(name);}};
  const assert=(v,msg)=>{if(!v)throw Error(msg);};
  const record=(p,day,lane="practice",opts={})=>{
    const mode=E.strategy(p),pace=opts.pace??480,measure=opts.measure??false;
    const mainSec=measure&&p.distanceGoal!==null?Math.min(p.mainSec,Math.ceil(p.distanceGoal*pace/1000)):p.mainSec;
    let left=mainSec,runSec=0,longestBout=0;
    for(let i=0;i<p.runs.length&&left>0;i++){const run=Math.min(left,p.runs[i]);runSec+=run;longestBout=Math.max(longestBout,run);left-=run;left-=Math.min(left,p.rests[i]??0);}
    const d=measure?Math.round(mainSec*1000/pace):null,rd=measure?Math.round(runSec*1000/pace):null;
    const out={day,lane,prescriptionId:p.id,runSec,mainSec,totalSec:mainSec+(p.runSec?480:0),longestBout,fasterSec:Math.min(runSec,p.fasterSec),mainDistanceM:d,runningDistanceM:rd,continuousDistanceM:mode==="continuous"?d:null,strategy:mode,check:ok,completed:true,comparable:true,...opts};
    return out;
  };
  const history=(p,lastDay=1000,days=2,opts={})=>{
    // Two or four fully completed seven-day windows ending before review day.
    const out=[];
    for(let i=0;i<4;i++)for(const [j,day] of E.schedule(days).days.entries())out.push(record(p,lastDay-27+i*7+day,j===days-1?"long":j===0?"practice":"easy",opts));
    return out;
  };
  const intake=(walkMin=30,goal="runwalk",days=2)=>({walkMin,goal,days});
  const state=(p,goal="runwalk",days=2,long=p,requestedDays=days)=>({action:"start",goal,days,requestedDays,practice:p,easy:p,long});
  const trace=(s,h=[],opt={})=>{
    let current=s,log=[...h];const weeks=[];
    for(let w=1;w<=(opt.weeks??4);w++){
      const start=1001+(w-1)*7,plan=E.weekly(current,opt.hard??[]);
      if(!plan){weeks.push({week:w,action:current.action,reason:current.reason});break;}
      const rr=plan.sessions.map((p,i)=>record(p,start+p.day,p.lane,{measure:opt.measure??false,pace:opt.pace??480,...(opt.feedback?.(w,p,i)??{})}));
      log.push(...rr);
      const result=E.review(current,log,start+6,{weekNumber:w,focus:opt.focus?.(w)??(w%2===1?"practice":"long"),hardLegDays:opt.hard??[],approvedCaution:opt.approvedCaution??false,wantPace:opt.wantPace??false,goalTimeSec:opt.goalTimeSec??null,wantThird:opt.wantThird??false});
      weeks.push({week:w,practice:current.practice.id,long:current.long.id,days:current.days,plannedRunMin:plan.runSec/60,plannedTotalMin:plan.totalSec/60,longestBoutMin:Math.max(...plan.sessions.map(p=>p.longestBout))/60,longestOutingMin:current.long.mainSec/60,action:result.action,reason:result.reason,flag:result.flag??null});
      assert(plan.sessions.every(p=>p.runSec<=p.mainSec&&p.mainSec<=p.totalSec&&p.longestBout<=p.runSec),"Invalid generated totals");
      assert(!result.state||result.action!=="progress"||["practice","long"].filter(k=>result.state[k].id!==current[k].id).length===1,"Progress changed multiple lanes");
      if(result.action==="pause"||result.action==="reassess")break;
      current=result.state;
    }
    return {weeks,final:current};
  };
  const A1=E.byId("A1"),A4=E.byId("A4"),C6=E.byId("C6");
  scenario("01 sedentary beginner",()=>{
    const s=E.initial(intake(10),[],1000);assert(s.practice.id==="W10","Expected W10");
    const r=trace(s);assert(r.weeks.some(w=>w.action==="progress"),"Walking progression stalled");return r;
  });
  scenario("02 active non-runner",()=>{
    const s=E.initial(intake(),[],1000);assert(s.practice.id==="A1"&&s.days===2,"Expected conservative intro");
    const r=trace(s);assert(r.weeks[0].plannedRunMin===6,"Wrong initial weekly minutes");return r;
  });
  scenario("03 fit cyclist, no recent running",()=>{
    const s=E.initial(intake(60,"continuous",3),[],1000);assert(s.practice.id==="A1"&&s.days===2,"Aerobic fitness caused premature running entry");
    return trace(s,[],{feedback:()=>({check:easy})});
  });
  scenario("04 strength-trained beginner",()=>{
    const s=E.initial(intake(),[],1000),r=trace(s,[],{hard:[1,4],feedback:(w,p)=>w===2&&p.lane==="practice"?{check:{...ok,recovery:"heavy"}}:{}});
    assert(!E.schedule(2,[1,4]).hardSameDay,"Avoidable hard-leg overlap");
    assert(r.weeks.some(w=>w.action==="reduce"),"Heavy legs did not reduce training");return r;
  });
  scenario("05 fast adapter",()=>{
    const h=history(A4,1000,2,{check:easy});const s=E.initial(intake(),h,1000);
    assert(s.practice.id==="A4","Recent history should support A4");
    const r=trace(s,h,{feedback:()=>({check:easy}),focus:()=>"practice"});
    assert(r.weeks[1].practice==="B0","Expected same-volume 90-second bridge");
    assert(E.byId("B0").runSec===360&&E.byId("B0").totalSec===1200,"Bridge changes exposure totals");return r;
  });
  scenario("06 struggling beginner",()=>{
    const r=trace(state(A1),[],{feedback:(w,p)=>w<=2&&p.lane==="practice"?{completed:false,runSec:Math.min(30,p.runSec),longestBout:Math.min(15,p.longestBout),check:{...ok,effort:"incomplete"}}:{}});
    assert(r.weeks.some(w=>w.action==="reduce"),"Incomplete workout not reduced");return r;
  });
  scenario("07 slow continuous runner",()=>{
    const p=E.continuous("slow-30",1800),h=history(p,1000,2,{measure:true,pace:540});
    const r=trace(state(p,"continuous"),h,{measure:true,pace:540,focus:()=>"long"});
    const near=E.continuous("slow-4.5",2430),hNear=history(near,1000,2,{measure:true,pace:540});
    const readiness=E.ready(hNear,1000,"continuous"),candidate=E.longCandidate(near,hNear,1000,"continuous",p);
    assert(!readiness.ready&&readiness.expected===2700,"4.5km at slow pace should not automatically qualify");
    assert(candidate.workout.mainSec<=2610,"Exceeded personalized duration ceiling");return {...r,nearDistanceCheck:readiness,capMinutes:candidate.workout.mainSec/60};
  });
  scenario("08 run-walk participant with 4km endurance",()=>{
    const long=E.repeat("rw-four-k",8,180,120),h=history(long,1000,2,{measure:true,pace:600});
    const s=state(E.byId("B5"),"runwalk",2,long),c=E.longCandidate(long,h,1000,"runwalk",s.practice);
    assert(c.workout.distanceGoal>4000&&c.workout.longestBout<=180,"Distance progression incorrectly requires longer bouts");
    assert(c.workout.mainSec<=c.cap,"Distance exceeds time cap");
    const r=trace(s,h,{measure:true,pace:600,focus:()=>"long",weeks:12});
    assert(r.weeks.some(w=>w.action==="progress"),"Run-walk distance warning still stalls progression");
    assert(r.final.long.longestBout<=180,"Long outing changed rhythm unexpectedly");
    return {...r,candidate:{distanceM:c.workout.distanceGoal,timeCapMin:c.workout.mainSec/60,longestBoutMin:c.workout.longestBout/60}};
  });
  scenario("09 returning runner after several months",()=>{
    const h=history(C6,900,2,{measure:true});
    const s=E.initial(intake(30,"continuous",3),h,1000);assert(s.practice.id==="A1"&&s.days===2,"Stale performance used for entry");return trace(s,h);
  });
  scenario("10 eight-week event deadline",()=>{
    const s=E.initial({...intake(),eventDays:56},[],1000);
    assert(s.practice.id===A1.id,"Date changed starting dose");return trace(s);
  });
  scenario("11 inconsistent runner",()=>{
    const gaps=[1,3,5,7,8,10,14,27,28].map(n=>({gapDays:n,...E.reentry(A4,n)}));
    assert(JSON.stringify(gaps.map(x=>x.action))===JSON.stringify(["rest","normal","repeat","repeat","reduce","reduce","return","return","reassess"]),"Gap boundary failure");
    assert(gaps.filter(x=>["reduce","return"].includes(x.action)).every(x=>x.workout.runSec<A4.runSec&&x.workout.longestBout<=A4.longestBout),"Reentry increased load");
    assert(E.reentry(A4,14,"pain",false).action==="pause","Unresolved symptoms not blocked");
    return {gaps:gaps.map(x=>({gapDays:x.gapDays,action:x.action,runMinutes:x.workout?x.workout.runSec/60:null,holdProgression:x.holdProgression}))};
  });
  scenario("12 ambitious runner, unrealistic time goal",()=>{
    const h=history(C6,1000,2,{measure:true,pace:480,representative:true}),s=E.initial(intake(30,"continuous",2),h,1000);
    assert(!E.paceOption(s,h,1000,1500,E.weekly(s)).eligible,"Unsupported pace authorized");
    const r=trace(s,h,{wantPace:true,goalTimeSec:1500,measure:true,pace:480,weeks:12});
    assert(r.weeks.some(w=>w.action==="progress"),"Ineligible pace still stalls easy progression");
    assert(r.weeks.every(w=>w.action!=="pace"),"Unsupported pace introduced");
    return r;
  });
  check("All library arithmetic and positive prescriptions",()=>E.library.every(p=>p.runSec===p.runs.reduce((a,b)=>a+b,0)&&p.mainSec===p.runSec+p.rests.reduce((a,b)=>a+b,0)+p.tail&&p.totalSec===p.mainSec+(p.runSec?480:0)&&p.longestBout<=p.runSec&&p.mainSec>0));
  check("20-minute intro contains 3 actual running minutes",()=>A1.totalSec===1200&&A1.runSec===180);
  check("B3 to B4 preserves running minutes and lengthens bout",()=>E.byId("B3").runSec===E.byId("B4").runSec&&E.byId("B4").longestBout>E.byId("B3").longestBout);
  check("B8 to B9 reduces running volume while extending bouts",()=>E.byId("B9").runSec<E.byId("B8").runSec&&E.byId("B9").longestBout>E.byId("B8").longestBout);
  check("C4 to C5 reduces volume for continuous progression",()=>E.byId("C5").runSec<E.byId("C4").runSec&&E.byId("C5").longestBout>E.byId("C4").longestBout);
  check("Safety overrides easy effort including incomplete urgent report",()=>E.check({...easy,symptoms:"sharp"})==="pause"&&E.check({symptoms:"urgent"})==="urgent");
  check("Unknown or missing recovery blocks advancement",()=>E.check({...easy,recovery:"unknown"})!=="success"&&E.check({effort:"easy",symptoms:"none"})!=="success");
  check("Mild soreness may qualify for standard exposure",()=>E.check({...ok,recovery:"mild"})==="success");
  check("Unresolved health limitation blocks intake",()=>E.initial({...intake(),healthHold:true},[],1000).action==="pause");
  check("Reject invalid records and mixed distance contradictions",()=>!E.validRecord({...record(A1,1000),runSec:-1})&&!E.validRecord({...record(A1,1000),mainDistanceM:500,runningDistanceM:600}));
  check("No running on same or consecutive day",()=>E.gap(0)==="rest"&&E.gap(1)==="rest");
  check("Schedule includes spacing across weekly boundary",()=>[2,3].every(n=>E.schedule(n).days.every((d,i,a)=>i?d-a[i-1]>=2:7-a.at(-1)+d>=2)));
  check("10% is a caution, not a diagnostic threshold",()=>E.distanceCaution(1101,1000)==="review"&&E.distanceCaution(1100,1000)==="within-reference"&&E.distanceCaution(1000,0)==="unknown");
  check("Time-only longer outings can continue without GPS",()=>{const c=E.longCandidate(A1,[],1000,"runwalk",A1);return c.workout.mainSec>A1.mainSec&&c.workout.distanceGoal===null&&c.workout.longestBout<=A1.longestBout;});
  check("Walking and run-walk distance not treated as running-only distance",()=>{const p=E.repeat("mixed",8,180,120),h=history(p,1000,2,{measure:true,pace:600,runningDistanceM:null});return E.longCandidate(p,h,1000,"runwalk",p).flag==="unknown";});
  check("Measured time limit wins over distance",()=>{const p=E.continuous("p",2400),h=history(p,1000,2,{measure:true,pace:600});return E.longCandidate(p,h,1000,"continuous",p).workout.mainSec<=2580;});
  check("Prescribed dose cap with distance achievement is not mandatory extra running",()=>{const p=E.continuous("cap",2700,{distanceGoal:4750}),r=record(p,1000,"long",{measure:true,mainDistanceM:4750,runningDistanceM:4750,continuousDistanceM:4750,runSec:2550,longestBout:2550,mainSec:2550,totalSec:3030});return E.achieved(r,p);});
  check("A failed distance target still logs completed time but does not qualify as distance success",()=>{const p=E.continuous("cap",2700,{distanceGoal:4750}),r=record(p,1000,"long",{measure:true,mainDistanceM:4500,runningDistanceM:4500,continuousDistanceM:4500});return !E.achieved(r,p)&&r.completed;});
  check("Third day preserves weekly running dose and counts extra walking",()=>{const s=state(E.byId("B3"),"runwalk",2,E.byId("B3"),3),h=history(E.byId("B3")),next=E.thirdDay(s,h,1000);return !!next&&next.days===3&&E.weekly(next).runSec===E.weekly(s).runSec&&E.weekly(next).totalSec===E.weekly(s).totalSec+480;});
  check("No third day from zero recent running",()=>!E.thirdDay(state(A1,"runwalk",2,A1,3),[],1000));
  check("Pace eligibility uses four weeks of actual running and plausible recent pace",()=>{const p=E.continuous("ref",1800),h=history(p,1000,2,{measure:true,pace:420,representative:true}),s=state(p,"continuous");return E.paceOption(s,h,1000,2100,E.weekly(s)).eligible&&!E.paceOption(s,h,1000,1800,E.weekly(s)).eligible&&!E.paceOption(s,h.slice(-2),1000,2100,E.weekly(s)).eligible;});
  check("Goal pace is replacement with 9 minutes, not added training",()=>{const p=E.continuous("ref",1800),h=history(p,1000,2,{measure:true,pace:420,representative:true}),s=state(p,"continuous"),x=E.paceOption(s,h,1000,2100,E.weekly(s));return x.eligible&&x.workout.fasterSec===540&&x.workout.runSec<=p.runSec&&x.workout.totalSec<=p.totalSec;});
  check("Actual 5K achievement distinguishes walking, run-walk and continuous",()=>{const p=E.continuous("five",2100),r=record(p,1000,"long",{measure:true,pace:420}),a=E.achievement(r),b=E.achievement({...r,strategy:"runwalk",continuousDistanceM:3000}),c=E.achievement({...r,strategy:"walk",runSec:0,longestBout:0,runningDistanceM:0,continuousDistanceM:null});return a.distance&&a.continuous&&b.runwalk&&!b.continuous&&c.walk&&!c.runwalk;});
  check("4.75 km near-distance and normal recovery supports readiness",()=>{const p=E.continuous("near",2565),h=history(p,1000,2,{measure:true,pace:540});return E.ready(h,1000,"continuous").ready;});
  check("Missing completion does not grant progress",()=>{const h=[record(A1,996,"practice"),record(A1,999,"long",{completed:false})];return E.review(state(A1),h,1000).action==="repeat";});
  check("Pain has priority over volume or goal pace",()=>{const h=[record(A1,996,"practice"),record(A1,999,"long",{check:{...easy,symptoms:"localized"}})];return E.review(state(A1),h,1000,{wantPace:true,goalTimeSec:1500}).action==="pause";});
  check("Week four does not force advancement",()=>{const h=[record(A1,996,"practice"),record(A1,999,"long")];return E.review(state(A1),h,1000,{weekNumber:4}).action==="repeat";});
  check("Routine progression changes only one lane",()=>{const h=[record(A1,996,"practice"),record(A1,999,"long")],r=E.review(state(A1),h,1000);return r.action==="progress"&&r.state.practice.id==="A2"&&r.state.long.id==="A1"&&r.state.easy.id==="A1";});
  check("Distance caution requires explicit review before progression",()=>{const h=[record(A1,996,"practice",{measure:true,pace:480}),record(A1,999,"long",{measure:true,pace:480})];return E.review(state(A1),h,1000).action==="review-distance"&&E.review(state(A1),h,1000,{approvedCaution:true}).action==="progress";});
  return {version:2,notes:"Scripted outcomes in fictional profiles; not a prediction of physiological adaptation, injury risk or completion time.",summary:{profiles:profiles.length,profileFailures:profiles.filter(p=>p.error).length,checks:checks.length,checkFailures:checks.filter(c=>!c.pass).length},failures,profiles,checks};
};
const results = testEngine(require("./engine.cjs"));
console.log(JSON.stringify(results,null,2));
if(results.failures.length)process.exitCode=1;

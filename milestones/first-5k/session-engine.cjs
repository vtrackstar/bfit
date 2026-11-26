"use strict";
// Session-based review candidate; retain engine.cjs as comparison baseline.
const sessionEngine = function sessionEngine(E){
  const sum=a=>a.reduce((s,x)=>s+x,0), max=(a,k)=>Math.max(0,...a.map(r=>r[k]??0));
  // Candidate coaching settings, not experimentally validated thresholds.
  const settings={initialHold:4,exposureDays:14,distanceDays:30,minimumSpacing:2,weeklyRunIncreaseMin:120,weeklyRunIncreaseMax:480,weeklyTotalIncrease:900,minimumDistanceReference:500};
  const good=(h,d,n=14)=>E.good(h,d,n).filter(r=>!r.fasterSec);
  const key=p=>[p.runs.join(","),p.rests.join(","),p.tail,p.distanceGoal??""].join("|");
  const pattern=(id,r,w,n)=>E.repeat(id,n,r,w);
  const recent=(h,d)=>E.recent(h,d,30).sort((a,b)=>b.day-a.day);
  const supported=(r,p)=>r.runSec>=p.runSec&&r.longestBout>=p.longestBout&&r.mainSec>=p.mainSec;
  const comparable=(r,p)=>r.runSec>=p.runSec*.80&&r.longestBout>=p.longestBout*.75&&r.mainSec>=p.mainSec*.75;
  const unique=r=>new Set(r.map(x=>x.day)).size;
  const cap=(n,l,h)=>Math.max(l,Math.min(h,n));
  function makeDose(id,run,bout,main,rest){
    if(run<=0)return E.walk(id,main);
    bout=Math.min(run,bout);
    if(bout===run&&main===run)return E.continuous(id,run);
    const runs=[],rests=[];let left=run;
    while(left>0){const x=Math.min(left,bout);runs.push(x);left-=x;if(left>0)rests.push(rest);}
    const base=run+sum(rests);
    if(base>main)return null;
    return E.workout(id,runs,rests,main-base,{pattern:{run:bout,walk:rest}});
  }
  function start(intake,h=[],day=0){
    const base=E.initial(intake,h,day);
    if(base.action!=="start")return base;
    return {...base,started:day,holdUntil:null,goalRevision:0,goalTimeSec:intake.goalTimeSec??null,noticeAck:null,planRevision:0,lastChange:null};
  }
  function goalChange(s,goal,time=null){
    if(!["runwalk","continuous"].includes(goal)||time!==null&&(!Number.isFinite(time)||time<=0))throw Error("Invalid goal");
    return {...s,goal,goalTimeSec:time,goalRevision:s.goalRevision+1,noticeAck:null};
  }
  function ack(s){return {...s,noticeAck:s.goalRevision};}
  function chooseLane(s,h,d){
    const r=recent(h,d).filter(x=>x.lane==="practice"||x.lane==="easy"||x.lane==="long");
    const lanes=s.days===3?["practice","easy","long"]:["practice","long"];
    if(!r.length)return lanes[0];
    return lanes[(lanes.indexOf(r[0].lane)+1)%lanes.length];
  }
  function projectedDistance(p,reference){
    if(!reference||!reference.runningDistanceM||!reference.runSec)return null;
    return reference.runningDistanceM*p.runSec/reference.runSec;
  }
  function distanceReview(p,h,d,baseline){
    const known=good(h,d,30).filter(r=>r.runningDistanceM>0&&r.runSec>0);
    const ref=max(known,"runningDistanceM"),nearest=known.find(r=>r.prescriptionId===baseline.id)??known.sort((a,b)=>b.day-a.day)[0];
    const proposed=projectedDistance(p,nearest);
    if(proposed===null||!ref)return {flag:"unknown",allowed:true};
    const delta=proposed-ref;
    if(delta<=ref*.10+1e-8)return {flag:"within-reference",allowed:true,delta,ref};
    // The cohort did not establish a safe increment, particularly below 500 m.
    // A limited absolute increase can be considered in the introductory range
    // only after repeated normal recovery. Other cautions trigger smaller doses.
    const early=ref<500&&p.runSec<=baseline.runSec+60&&delta<=100&&unique(good(h,d).filter(r=>r.runSec>0&&r.check.recovery==="normal"))>=2;
    return {flag:early?"contextual-intro-review":"review",allowed:early,delta,ref};
  }
  function recentWeekLimit(p,s,h,d){
    const recent7=E.recent(h,d-1,7),prior7=E.recent(h,d-1,14).filter(r=>r.day<=d-8);
    const rollingRun=sum(recent7.map(r=>r.runSec)),rollingTotal=sum(recent7.map(r=>r.totalSec));
    // Compare projected rolling exposure with the greater of two recent observed
    // weekly doses and the current familiar planned dose. Count only actual work
    // and remove the session that falls outside the prospective 7-day window.
    const projected=E.recent(h,d-1,6);
    const baselineRun=Math.max(rollingRun,sum(prior7.map(r=>r.runSec)),E.weekly(s).runSec);
    const baselineTotal=Math.max(rollingTotal,sum(prior7.map(r=>r.totalSec)),E.weekly(s).totalSec);
    const increment=cap(Math.ceil(baselineRun*.15/30)*30,settings.weeklyRunIncreaseMin,settings.weeklyRunIncreaseMax);
    return sum(projected.map(r=>r.runSec))+p.runSec<=baselineRun+increment&&sum(projected.map(r=>r.totalSec))+p.totalSec<=baselineTotal+settings.weeklyTotalIncrease;
  }
  function candidates(p,s,h,d,lane){
    const list=[],g=good(h,d),maxRun=max(g,"runSec"),maxBout=max(g,"longestBout");
    const add=(x,lever,reason)=>{if(x&&key(x)!==key(p))list.push({workout:x,lever,reason});};
    if(!p.runSec){
      if(p.mainSec<1800){
        for(const inc of [300,180,120,60])add(E.walk("walk-"+Math.min(1800,p.mainSec+inc),Math.min(1800,p.mainSec+inc)),"duration","Build comfortable walking time.");
      }else if(unique(g.filter(r=>r.mainSec>=1800))>=2)add(E.byId("A1"),"running-exposure","Introduce a short, easy running rhythm.");
      return list;
    }
    if(lane==="easy")return list;
    const cont=E.strategy(p)==="continuous";
    if(lane==="long"){
      // Transfer a demonstrated rhythm, keeping the running dose comparable.
      const pr=s.practice,prSuccess=g.filter(r=>r.longestBout>=pr.longestBout&&r.runSec>=Math.min(pr.runSec,p.runSec));
      if(pr.longestBout>p.longestBout&&unique(prSuccess)>=2){
        const bout=Math.min(pr.longestBout,p.runSec,Math.max(p.longestBout+30,Math.floor(pr.longestBout*.75)));
        const run=Math.min(p.runSec,maxRun),rest=pr.pattern?.walk??120;
        if(s.goal==="continuous"&&pr.runs.length===1&&pr.runSec<=p.runSec)add(E.continuous("transfer-cont-"+pr.runSec,pr.runSec),"bout","Use the continuous dose you have already demonstrated.");
        if(bout>p.longestBout){
          const n=makeDose("transfer-"+run+"-"+bout+"-"+p.mainSec,run,bout,p.mainSec,rest);
          add(n,"bout","Use a familiar longer running rhythm without adding running time.");
        }
      }
      const comparableLong=g.filter(r=>r.lane==="long"&&r.mainDistanceM>=1000&&r.comparable!==false&&r.strategy===E.strategy(p)).sort((a,b)=>b.day-a.day);
      const last=comparableLong[0];
      const base=last?Math.min(last.mainSec,p.mainSec):p.mainSec;
      // Grow the longer outing using existing rhythm, or continuous running if
      // already demonstrated. Distance goal is derived from recent actual pace.
      for(const inc of [180,120,90,60,30,15]){
        const seconds=base+inc;
        if(seconds<=base)continue;
        let target=null;
        if(last&&comparableLong.length>=2){
          const pace=last.mainSec*1000/last.mainDistanceM;
          const incM=Math.min(250,Math.floor(inc*1000/pace/25)*25);
          if(incM>0)target=Math.min(5000,last.mainDistanceM+incM);
          if(target!==null&&target<=last.mainDistanceM)target=null;
        }
        if(cont)add(E.continuous("long-"+seconds+"-"+(target??"time"),seconds,{distanceGoal:target}),"duration","Extend a comfortable continuous outing.");
        else if(p.pattern){
          add(E.rhythm("long-rhythm-"+p.pattern.run+"-"+p.pattern.walk+"-"+seconds+"-"+(target??"time"),p.pattern.run,p.pattern.walk,seconds,{distanceGoal:target}),"duration","Extend your familiar run–walk rhythm.");
        }
        if(!cont&&seconds>p.mainSec)add(E.workout("long-walk-"+seconds,p.runs,p.rests,p.tail+seconds-p.mainSec,{pattern:p.pattern,distanceGoal:target}),"duration","Add comfortable walking time while keeping running familiar.");
      }
    }else{
      // Select from a library, but generated intermediate doses can always
      // continue using their actual volume and bout, not a special ID.
      const r=p.longestBout,w=p.pattern?.walk??120;
      if(cont){
        for(const inc of [180,120,90,60,30])add(E.continuous("practice-cont-"+(p.runSec+inc),p.runSec+inc),"duration","Extend comfortable continuous running.");
      }else{
        const step=r<60?10:r<180?30:r<600?60:120;
        // Prefer a longer bout with similar volume, then more volume using
        // the familiar rhythm. Keep intermediate candidates in both directions.
        for(const delta of [step,Math.max(5,Math.floor(step/2))]){
          const bout=Math.min(p.runSec,r+delta);
          if(bout>r){
            let count=Math.max(1,Math.floor(p.runSec/bout)),run=count*bout;
            if(run<p.runSec*.70){count=Math.ceil(p.runSec/bout);run=count*bout;}
            if(run<=p.runSec+Math.min(60,delta)){
              const duration=Math.max(p.mainSec,run+Math.max(0,count-1)*w);
              add(makeDose("practice-bout-"+run+"-"+bout+"-"+duration,run,bout,duration,w),"bout","Build the ability to run for longer before walking.");
            }
          }
        }
        for(const inc of [Math.min(120,Math.max(30,r)),60,30,15,5]){
          const run=p.runSec+inc,bout=r;
          const count=Math.ceil(run/bout);
          const main=Math.max(p.mainSec,run+Math.max(0,count-1)*w);
          add(makeDose("practice-volume-"+run+"-"+bout+"-"+main,run,bout,main,w),"volume","Accumulate more running at a familiar effort.");
        }
        if(p.runSec>=600&&p.longestBout>=p.runSec*.65)add(E.continuous("practice-cont-"+p.runSec,p.runSec),"bout","Try continuous running at a familiar total dose.");
      }
    }
    // Avoid a low-volume bout bridge that makes it harder to build total work.
    return list.filter(x=>x.workout.runSec>=p.runSec*.70&&x.workout.longestBout>=p.longestBout||x.lever==="running-exposure");
  }
  function next(s,h,d,{lane=chooseLane(s,h,d),gapReason="life",resolved=true,wantPace=false}={}){
    const result=(action,workout,reason,extra={})=>({action,workout,lane,state:s,reason,...extra});
    if(s.action!=="start")return result(s.action,null,s.reason);
    if(!["practice","easy","long"].includes(lane)||lane==="easy"&&s.days!==3)throw Error("Invalid lane");
    const rows=recent(h,d),last=rows[0],p=s[lane];
    if(!resolved||rows.some(r=>r.unresolved)||last&&["pause","urgent"].includes(E.check(last.check)))return result("pause",null,"Resolve concerning symptoms before continuing.",{urgent:last&&E.check(last.check)==="urgent"});
    if(last&&d-last.day<2)return result("rest",null,"Allow a recovery day between running workouts.");
    if(last&&E.check(last.check)==="reduce"){
      const q=E.reduced(p);return result("reduce",q,"Reduce running while you recover.",{state:{...s,[lane]:q,holdUntil:d+2}});
    }
    if(last&&E.check(last.check)!=="success")return result("repeat",null,"Confirm recovery before the next running workout.");
    if(last&&d-last.day>=5){
      const r=E.reentry(p,d-last.day,gapReason,resolved);
      if(!r.workout)return result(r.action,null,"Return-to-training review.");
      return result(r.action,r.workout,"Return with a familiar or reduced dose.",{state:{...s,[lane]:r.workout,holdUntil:d+2}});
    }
    if(wantPace&&s.goalTimeSec&&lane==="practice"){
      const opt=E.paceOption(s,h,d,s.goalTimeSec,E.weekly(s));
      if(opt.eligible&&recentWeekLimit(opt.workout,s,h,d))return result("pace",opt.workout,opt.reason);
    }
    const g=good(h,d),same=g.filter(r=>comparable(r,p)),initial=g.filter(r=>r.runSec>0).length<settings.initialHold&&s.started!==undefined&&d-s.started<14&&p.runSec>0;
    // Need two comparable recovered days for progression; no same-ID rule.
    if((unique(same)<2&&unique(g.filter(r=>r.lane===lane&&r.prescriptionId===p.id))<2)||initial||s.holdUntil!==null&&d<=s.holdUntil)return result("repeat",p,"Consolidate familiar work and recovery.");
    if(s.lastChange!==null&&d-s.lastChange<3)return result("repeat",p,"Consolidate the most recent training adjustment.");
    if(lane==="easy")return result("repeat",p,"Keep this session comfortable.");
    // Never allow a near-distance result to bypass symptom/recovery checks.
    if(lane==="long"&&E.ready(h,d,s.goal).ready){
      const prior=g.filter(r=>r.lane==="long"&&r.strategy===E.strategy(p)&&r.mainDistanceM>=4500).sort((a,b)=>b.day-a.day)[0];
      if(prior){
        const ready=E.ready(h,d,s.goal),sec=ready.cap;
        const q=E.strategy(p)==="continuous"?E.continuous("first-5k-"+sec,sec,{distanceGoal:5000}):p.pattern?E.rhythm("first-5k-"+sec,p.pattern.run,p.pattern.walk,sec,{distanceGoal:5000}):null;
        if(q&&recentWeekLimit(q,s,h,d)&&distanceReview(q,h,d,p).allowed)return result("attempt",q,"Practice your 5K using the familiar rhythm and duration limit.",{state:{...s,[lane]:q,lastChange:d}});
      }
    }
    const maxRun=max(g,"runSec"),maxBout=max(g,"longestBout");
    const checks=[];
    for(const c of candidates(p,s,h,d,lane)){
      const q=c.workout;
      // Absolute per-session guardrails are coaching choices. Avoid compounding
      // a bout increase with a large increase in running volume.
      const maxIncrease=maxRun===0?180:Math.min(180,Math.max(60,Math.ceil(maxRun*.15/30)*30));
      if(q.runSec>maxRun+maxIncrease||q.mainSec>Math.max(max(g,"mainSec"),p.mainSec)+300||q.longestBout>maxBout+Math.max(30,Math.min(180,Math.ceil(maxBout*.25/15)*15)))continue;
      if(p.runSec&&q.longestBout>p.longestBout&&q.runSec>p.runSec+60)continue;
      const review=distanceReview(q,h,d,p);
      checks.push(review.flag);
      if(!review.allowed||!recentWeekLimit(q,s,h,d))continue;
      return result("progress",q,c.reason,{lever:c.lever,flag:review.flag,state:{...s,[lane]:q,lastChange:d,planRevision:s.planRevision+1}});
    }
    return result("repeat",p,"Keep the familiar workout; a suitable increase is not yet supported.",{flags:checks});
  }
  function blockReview(s,h,d){
    const g=E.recent(h,d,28);
    return {state:s,sessions:g.length,runMinutes:sum(g.map(r=>r.runSec))/60,longestBoutMinutes:max(g,"longestBout")/60,longestDistanceM:max(g,"mainDistanceM"),goal:s.goal,notice:s.goalTimeSec&&s.noticeAck!==s.goalRevision?"review-goal-pace":null};
  }
  return {start,next,goalChange,ack,blockReview,chooseLane,settings,candidates,distanceReview,recentWeekLimit};
};
module.exports = sessionEngine(require("./engine.cjs"));

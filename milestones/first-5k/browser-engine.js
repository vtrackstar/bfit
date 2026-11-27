/* Generated from reviewed development modules. */
(function(){const modules=Object.create(null),cache=Object.create(null);
modules["./engine.cjs"]=function(module,exports,require){
"use strict";
// BFit programming review prototype. Not a released training program.
const createEngine = function createEngine(){
  "use strict";
  // All times are seconds, distances are meters, and day is an integer day index.
  // These are review-candidate rules, not validated injury thresholds.
  const sum=a=>a.reduce((x,y)=>x+y,0), num=x=>typeof x==="number"&&Number.isFinite(x)&&x>=0, pos=x=>num(x)&&x>0, max=(a,k)=>Math.max(0,...a.map(x=>x[k]??0));
  const clamp=(x,l,h)=>Math.min(h,Math.max(l,x));
  function workout(id,runs,rests,tail=0,extras={}){
    if(!id||!Array.isArray(runs)||!Array.isArray(rests)||runs.some(x=>!pos(x))||rests.some(x=>!num(x))||!num(tail)||!(rests.length===runs.length||rests.length===Math.max(0,runs.length-1)))throw Error("Invalid prescription: "+id);
    const runSec=sum(runs), mainSec=runSec+sum(rests)+tail;
    if(!pos(mainSec))throw Error("Empty workout: "+id);
    const out={id,runs:[...runs],rests:[...rests],tail,runSec,mainSec,totalSec:mainSec+(runSec?480:0),longestBout:Math.max(0,...runs),fasterSec:0,distanceGoal:null,pattern:null,...extras};
    if(!num(out.fasterSec)||out.fasterSec>runSec||!(out.distanceGoal===null||pos(out.distanceGoal)))throw Error("Invalid extra dose");
    return out;
  }
  const repeat=(id,n,r,w,between=false)=>workout(id,Array(n).fill(r),Array(between?n-1:n).fill(w),0,{pattern:{run:r,walk:w}});
  const continuous=(id,s,extras={})=>workout(id,[s],[],0,extras);
  const walk=(id,s,extras={})=>workout(id,[],[],s,extras);
  const W=[5,10,15,20,25,30].map(m=>walk("W"+m,m*60));
  const P=[
    repeat("A0",6,15,105),repeat("A0a",6,20,100),repeat("A0b",6,25,95),repeat("A1",6,30,90),repeat("A2",6,40,80),repeat("A3",6,50,70),repeat("A4",6,60,60),repeat("A5",7,60,60),repeat("A6",8,60,60),
    repeat("B0",4,90,120,true),repeat("B1",5,90,90),repeat("B2",4,120,120),repeat("B3",5,120,120),repeat("B4",4,150,120),repeat("B5",4,180,120),repeat("B6",3,240,120),repeat("B7",3,300,120),repeat("B8",3,360,120),repeat("B8a",2,420,180),repeat("B9",2,480,180),
    repeat("C1",2,540,180,true),repeat("C2",2,600,180,true),workout("C3",[720,480],[180]),workout("C4",[900,300],[180]),continuous("C5",1080),continuous("C6",1200),continuous("C7",1320),continuous("C8",1500),continuous("C9",1680),continuous("C10",1800)
  ];
  const library=[...W,...P], byId=id=>library.find(p=>p.id===id);
  const successCheck={effort:"comfortable",recovery:"normal",symptoms:"none"};
  const check=c=>{
    if(c?.symptoms==="urgent")return "urgent";
    if(["localized","sharp","unsure"].includes(c?.symptoms)||c?.recovery==="limited")return "pause";
    if(!c||!["easy","comfortable","hardEarly","hardLate","incomplete"].includes(c.effort)||!["normal","mild","heavy","limited","unknown"].includes(c.recovery)||c.symptoms!=="none")return "hold";
    if(c.effort==="incomplete"||c.effort==="hardEarly"||c.recovery==="heavy")return "reduce";
    if(c.effort==="hardLate"||c.recovery==="unknown")return "repeat";
    return "success";
  };
  function validRecord(r){
    return !!r&&Number.isInteger(r.day)&&[r.runSec,r.mainSec,r.totalSec,r.longestBout,r.fasterSec].every(num)&&r.longestBout<=r.runSec&&r.runSec<=r.mainSec&&r.mainSec<=r.totalSec&&r.fasterSec<=r.runSec&&[r.mainDistanceM,r.runningDistanceM,r.continuousDistanceM].every(x=>x==null||num(x))&&(r.runningDistanceM==null||r.mainDistanceM==null||r.runningDistanceM<=r.mainDistanceM)&&(r.continuousDistanceM==null||r.runningDistanceM==null||r.continuousDistanceM<=r.runningDistanceM)&&(r.runSec>0||!r.runningDistanceM&&!r.continuousDistanceM)&&["walk","runwalk","continuous"].includes(r.strategy);
  }
  const recent=(h,d,n=30)=>h.filter(r=>validRecord(r)&&r.day<=d&&r.day>d-n);
  const good=(h,d,n=30)=>recent(h,d,n).filter(r=>r.completed===true&&check(r.check)==="success"&&!r.unresolved);
  const distinctDays=h=>new Set(h.map(r=>r.day)).size;
  const total=(h,k)=>sum(h.map(r=>r[k]));
  function bounds(h,d){
    const g=good(h,d),w=recent(h,d,7);
    return {runSec:max(g,"runSec"),mainSec:max(g,"mainSec"),totalSec:max(g,"totalSec"),longestBout:max(g,"longestBout"),mainDistanceM:max(g,"mainDistanceM"),runningDistanceM:max(g,"runningDistanceM"),continuousDistanceM:max(g,"continuousDistanceM"),weekRunSec:total(w,"runSec"),weekTotalSec:total(w,"totalSec"),weekFasterSec:total(w,"fasterSec")};
  }
  function supported(p,r){return p.runSec<=r.runSec&&p.longestBout<=r.longestBout&&p.mainSec<=r.mainSec&&p.totalSec<=r.totalSec;}
  function initial(intake,h=[],day=0){
    if(!["runwalk","continuous"].includes(intake.goal)||!num(intake.walkMin)||![2,3].includes(intake.days))throw Error("Invalid intake");
    if(intake.healthHold||recent(h,day,14).some(r=>r.unresolved||["pause","urgent"].includes(check(r.check))))return {action:"pause",reason:"Resolve health/pain concerns before starting."};
    const g=good(h,day,14),running=g.filter(r=>r.runSec>0),previous=g.filter(r=>r.day<=day-7),current=g.filter(r=>r.day>day-7);
    let p,days=2;
    if(intake.walkMin<30&&!running.length){
      p=W.filter(x=>x.mainSec<=intake.walkMin*60).at(-1);
      if(!p)return {action:"hold",reason:"Use an individualized comfortable walking start below five minutes."};
    }else if(!running.length){
      p=byId("A1");
    }else{
      if(intake.days===3&&distinctDays(previous.filter(r=>r.runSec>0))>=3&&distinctDays(current.filter(r=>r.runSec>0))>=3)days=3;
      const weeklyMin=Math.min(total(previous,"runSec"),total(current,"runSec"));
      const timeMin=Math.min(total(previous,"totalSec"),total(current,"totalSec"));
      const supportedSet=P.filter(x=>running.some(r=>supported(x,r)));
      // With two consistent weeks, retain only a dose whose weekly totals fit the records.
      // With sparse history, use no more than half the most recently tolerated running dose
      // over each of two days; never treat cycling or an old PB as running exposure.
      if(weeklyMin>0&&timeMin>0){
        p=supportedSet.filter(x=>x.runSec*days<=weeklyMin&&x.totalSec*days<=timeMin).at(-1);
      }else{
        const latest=running.slice().sort((a,b)=>b.day-a.day)[0];
        p=supportedSet.filter(x=>x.runSec*2<=latest.runSec&&x.longestBout<=latest.longestBout).at(-1);
      }
      if(!p){
        const latest=running.slice().sort((a,b)=>b.day-a.day)[0];
        p=latest.runSec>=90&&latest.longestBout>=15?byId("A0"):walk("W-custom",Math.max(60,Math.min(600,intake.walkMin*60)));
        if(p.runSec&&!supported(p,latest))p=walk("W-custom",Math.max(60,Math.min(600,intake.walkMin*60)));
      }
    }
    return {action:"start",goal:intake.goal,requestedDays:intake.days,days,practice:p,easy:p,long:p};
  }
  // Repeated weekly schedule with at least one non-running day between sessions,
  // including the boundary between weeks. Hard lower-body work is a preference
  // constraint; if no workable arrangement exists, return a conflict for review.
  function schedule(days,hardLegDays=[],preferred=null){
    if(![2,3].includes(days)||hardLegDays.some(x=>!Number.isInteger(x)||x<0||x>6))throw Error("Invalid schedule");
    const sets=[];
    for(let a=0;a<7;a++)for(let b=a+2;b<7;b++){
      if(days===2&&7-b+a>=2)sets.push([a,b]);
      if(days===3)for(let c=b+2;c<7;c++)if(7-c+a>=2)sets.push([a,b,c]);
    }
    const cost=arr=>sum(arr.map(d=>sum(hardLegDays.map(l=>d===l?10:((d-l+7)%7===1||(l-d+7)%7===1)?1:0))));
    const pref=Array.isArray(preferred)?sets.find(x=>x.every((n,i)=>n===preferred[i])&&x.length===preferred.length):null;
    const best=sets.sort((a,b)=>cost(a)-cost(b)||Math.abs(a[0]-1)-Math.abs(b[0]-1)||Math.abs(a.at(-1)-5)-Math.abs(b.at(-1)-5))[0];
    const chosen=pref&&cost(pref)<=cost(best)?pref:best;
    return {days:chosen,conflict:cost(chosen)>0,hardSameDay:chosen.some(d=>hardLegDays.includes(d))};
  }
  function weekly(state,hardLegDays=[],preferred=null){
    if(state.action!=="start")return null;
    const s=schedule(state.days,hardLegDays,preferred);
    const lanes=state.days===2?["practice","long"]:["practice","easy","long"];
    const sessions=lanes.map((lane,i)=>({...state[lane],lane,day:s.days[i]}));
    return {sessions,runSec:total(sessions,"runSec"),totalSec:total(sessions,"totalSec"),fasterSec:total(sessions,"fasterSec"),schedule:s};
  }
  function gap(days,reason="life",resolved=true){
    if(!Number.isInteger(days)||days<0)throw Error("Invalid gap");
    if(!resolved||["pain","concerning illness"].includes(reason))return "pause";
    if(days<2)return "rest";
    if(days<=4)return "normal";
    if(days<=7)return "repeat";
    if(days<=13)return "reduce";
    if(days<=27)return "return";
    return "reassess";
  }
  function reduced(p){
    if(p.runSec===0)return walk("return-walk-"+Math.max(60,Math.floor(p.mainSec*.75)),Math.max(60,Math.floor(p.mainSec*.75)));
    if(p.longestBout<=15&&p.runSec<=90)return walk("return-walk-600",600);
    const runs=p.runs.map(x=>Math.max(1,Math.floor(x*.75))),rests=p.rests.slice();
    const pattern=p.pattern?{run:Math.max(1,Math.floor(p.pattern.run*.75)),walk:p.pattern.walk}:null;
    return workout("reduced-"+p.id,runs,rests,Math.floor(p.tail*.75),{pattern});
  }
  function reentry(p,days,reason="life",resolved=true){
    const action=gap(days,reason,resolved);
    return {action,workout:["reduce","return"].includes(action)?reduced(p):["normal","repeat"].includes(action)?p:null,holdProgression:action!=="normal"};
  }
  const distanceCaution=(proposed,previous)=>!pos(proposed)||!pos(previous)?"unknown":proposed>previous*1.10+1e-8?"review":"within-reference";
  function achieved(r,p){
    if(!validRecord(r)||r.completed!==true||check(r.check)!=="success"||r.prescriptionId!==p.id)return false;
    if(p.distanceGoal!==null)return r.mainDistanceM>=p.distanceGoal&&r.mainSec<=p.mainSec&&r.runSec<=p.runSec&&r.longestBout<=p.longestBout;
    return r.runSec>=p.runSec&&r.mainSec>=p.mainSec&&r.longestBout>=p.longestBout;
  }
  function exposures(h,d,p){return good(h,d,28).filter(r=>achieved(r,p));}
  function nextPractice(p,h,d,accelerate=false){
    if(p.runSec===0){
      const n=W.find(x=>x.mainSec>p.mainSec);
      return n??(distinctDays(good(h,d,28).filter(r=>r.mainSec>=1800))>=2?byId("A1"):p);
    }
    if(accelerate&&p.id==="A4")return byId("B0"); // 6 minutes running, 20 total, longer bouts.
    if(p.id==="A6")return byId("B1");
    if(p.id==="B0")return byId("B1");
    const idx=P.findIndex(x=>x.id===p.id);
    if(idx>=0)return P[idx+1]??p;
    // A regression is not a dead end: restore the closest supported library
    // dose; if none, increment running by a small amount in its current rhythm.
    const n=P.filter(x=>x.runSec<=p.runSec+60&&x.longestBout<=p.longestBout+30&&x.mainSec<=p.mainSec+120&&x.runSec>=p.runSec&&x.longestBout>=p.longestBout).sort((a,b)=>a.runSec-b.runSec||a.longestBout-b.longestBout)[0];
    if(n)return n;
    if(strategy(p)==="continuous"&&p.runSec<1800)return continuous("bridge-cont-"+Math.min(1800,p.runSec+30),Math.min(1800,p.runSec+30));
    if(p.pattern){
      // A generated dose can develop independently of library IDs. Add work
      // at the familiar rhythm first, or extend a bout with comparable volume.
      const r=p.pattern.run,w=p.pattern.walk;
      const target=Math.min(1800,p.runSec+Math.min(90,Math.max(15,Math.ceil(p.runSec*.15/5)*5)));
      if(target>p.runSec){
        const runs=[],rests=[];let left=target;
        while(left>0){let part=Math.min(r,left);runs.push(part);left-=part;if(left>0)rests.push(w);}
        return workout("bridge-rhythm-"+r+"-"+w+"-"+target,runs,rests,0,{pattern:{run:r,walk:w}});
      }
    }
    return p;
  }
  function rhythm(id,run,rest,main,extras={}){
    if(!pos(run)||!pos(rest)||!pos(main))throw Error("Invalid rhythm");
    const runs=[],rests=[];let left=main;
    while(left>0){
      const r=Math.min(run,left);runs.push(r);left-=r;
      const w=Math.min(rest,left);rests.push(w);left-=w;
    }
    return workout(id,runs,rests,0,{pattern:{run,walk:rest},...extras});
  }
  const strategy=p=>p.runSec===0?"walk":p.runs.length===1&&p.rests.every(x=>x===0)&&p.tail===0?"continuous":"runwalk";
  function measuredPace(records){
    const p=records.filter(r=>pos(r.mainDistanceM)&&pos(r.mainSec)&&r.comparable!==false).slice().sort((a,b)=>b.day-a.day).slice(0,3).map(r=>r.mainSec*1000/r.mainDistanceM).sort((a,b)=>a-b);
    if(p.length<2)return null;
    return p.length===2?(p[0]+p[1])/2:p[1];
  }
  const durationIncrement=s=>Math.min(180,Math.max(60,Math.floor(s*.10/30)*30));
  function longCandidate(p,h,d,goal,practice){
    if(p.runSec===0){
      const n=nextPractice(p,h,d);
      return {workout:n,reason:"Develop comfortable walking or begin running when ready.",flag:"unknown"};
    }
    const mode=strategy(p),g=good(h,d,30);
    // Continuous route: use a pattern already demonstrated during practice at
    // similar or lower long-outing running volume, before lengthening the outing.
    if((goal==="continuous"||p.longestBout<180)&&mode!=="continuous"&&practice&&practice.longestBout>p.longestBout&&distinctDays(g.filter(r=>achieved(r,practice)))>=2){
      if(strategy(practice)==="continuous"&&practice.runSec<=p.runSec){
        return {workout:continuous("adopt-cont-"+practice.runSec,practice.runSec),reason:"Use the proven continuous-running dose; keep the other sessions unchanged.",flag:"unknown"};
      }
      if(practice.pattern&&practice.pattern.run<=p.runSec){
        let n=rhythm("adopt-"+practice.pattern.run+"-"+p.mainSec,practice.pattern.run,practice.pattern.walk,p.mainSec);
        if(n.runSec>p.runSec){
          let t=p.mainSec;
          while(t>0&&n.runSec>p.runSec){t=Math.max(1,t-15);n=rhythm("adopt-"+practice.pattern.run+"-"+t,practice.pattern.run,practice.pattern.walk,t);}
        }
        if(n.longestBout>p.longestBout&&n.runSec<=p.runSec)return {workout:n,reason:"Use a familiar longer running rhythm without adding running volume.",flag:"unknown"};
      }
    }
    const comparable=g.filter(r=>r.lane==="long"&&r.strategy===mode&&r.comparable!==false&&pos(r.mainDistanceM)&&r.mainDistanceM>=1000).sort((a,b)=>b.day-a.day);
    const latest=comparable[0],pace=measuredPace(comparable);
    // Anchor on the most recent successfully completed comparable outing,
    // not a historic best. The plan is a time ceiling and optional distance goal.
    const baseline=latest?Math.min(p.mainSec,latest.mainSec):p.mainSec;
    const hardCap=baseline+durationIncrement(baseline);
    let cap=hardCap;
    if(cap<=p.mainSec&&p.distanceGoal===null)return {workout:p,reason:"Reestablish the planned time before increasing the duration.",flag:"unknown",cap};
    let target=null,expected=null,reason="Extend the familiar outing by time; measure distance if available.";
    if(latest&&pace!==null){
      const inc=Math.min(250,Math.max(50,Math.floor(latest.mainDistanceM*.05/25)*25));
      target=Math.min(5000,latest.mainDistanceM+inc);
      // If a distance target was not achieved, keep it instead of incrementing.
      if(p.distanceGoal!==null&&latest.mainDistanceM<p.distanceGoal)target=p.distanceGoal;
      expected=Math.ceil(target*pace/1000);
      if(expected>cap){reason="Distance target would exceed the duration limit; extend time first.";target=null;}
      else {
        cap=Math.min(hardCap,Math.max(baseline,expected+15));
        reason="Stop when the distance target or time limit is reached, whichever comes first.";
      }
    }
    const build=(seconds,meters)=>{
      const suffix=seconds+"-"+(meters??"time");
      if(mode==="continuous")return continuous("L-cont-"+suffix,seconds,{distanceGoal:meters});
      if(p.pattern)return rhythm("L-rw-"+p.pattern.run+"-"+p.pattern.walk+"-"+suffix,p.pattern.run,p.pattern.walk,seconds,{distanceGoal:meters});
      return workout("L-time-"+suffix,p.runs,p.rests,p.tail+Math.max(0,seconds-p.mainSec),{distanceGoal:meters});
    };
    const reference=max(g,"runningDistanceM");
    const flagFor=n=>distanceCaution(latest&&pos(latest.runningDistanceM)&&pos(latest.runSec)?latest.runningDistanceM*n.runSec/latest.runSec:null,reference);
    let n=build(cap,target);
    // Look for a smaller real increase before asking for a manual review.
    // A distance goal remains attached only when its estimated duration fits.
    if(flagFor(n)==="review"){
      for(let seconds=cap-15;seconds>baseline;seconds-=15){
        const meters=pace!==null&&latest?Math.min(5000,Math.floor(seconds*1000/pace/25)*25):null;
        const smaller=build(seconds,meters!==null&&meters>latest.mainDistanceM?meters:null);
        if(smaller.mainSec>baseline&&flagFor(smaller)!=="review"){
          n=smaller;cap=seconds;expected=n.distanceGoal!==null?Math.ceil(n.distanceGoal*pace/1000):null;
          reason="Use a smaller duration or distance increase within recent running exposure.";
          break;
        }
      }
      if(flagFor(n)==="review"&&mode==="runwalk"&&latest&&p.runSec<=latest.runSec&&hardCap>p.mainSec){
        const tail=Math.min(60,hardCap-p.mainSec);
        n=workout("L-walk-tail-"+(p.mainSec+tail),p.runs,p.rests,p.tail+tail,{pattern:p.pattern});
        cap=n.mainSec;expected=null;reason="Keep the running dose familiar and add a short walking finish.";
      }
    }
    return {workout:n,reason,cap,expected,flag:flagFor(n)};
  }
  function paceOption(state,h,d,goalTimeSec,plan){
    if(state.goal!=="continuous"||!pos(goalTimeSec)||!plan)return {eligible:false,reason:"Optional continuous time goal only."};
    const g=good(h,d,30);
    const fourWeeks=[0,1,2,3].every(i=>distinctDays(g.filter(r=>r.runSec>0&&r.day>d-7*(i+1)&&r.day<=d-7*i))>=2);
    const ref=g.filter(r=>r.representative===true&&r.comparable!==false&&r.strategy==="continuous"&&r.mainDistanceM>=3000&&r.longestBout===r.mainSec&&pos(r.mainSec)&&r.check.recovery==="normal").sort((a,b)=>b.day-a.day)[0];
    if(!fourWeeks||!ref)return {eligible:false,reason:"Need four consistent weeks and a recent representative continuous effort; do not prescribe a maximal test just to qualify."};
    const goalPace=goalTimeSec/5,demonstrated=ref.mainSec*1000/ref.mainDistanceM;
    if(goalPace<demonstrated)return {eligible:false,goalPace,demonstrated,reason:"Requested pace is faster than the demonstrated reference; keep current-fitness training."};
    const candidate={...repeat("goal-pace",3,180,120,true),fasterSec:540,goalPace},old=plan.sessions.find(p=>p.lane==="practice");
    if(!old||candidate.runSec>old.runSec||candidate.longestBout>old.longestBout||candidate.totalSec>old.totalSec)return {eligible:false,reason:"Pace practice must fit inside a familiar training dose."};
    return {eligible:true,workout:candidate,goalPace,demonstrated,reason:"Replace one session; keep effort controlled and slow or stop if needed."};
  }
  function ready(h,d,goal){
    const g=good(h,d,30),consistent=[0,1].every(i=>distinctDays(g.filter(r=>r.runSec>0&&r.day>d-7*(i+1)&&r.day<=d-7*i))>=2);
    if(!consistent)return {ready:false,reason:"Build recent consistency."};
    const near=g.filter(r=>r.lane==="long"&&r.day>d-14&&r.comparable!==false&&r.mainDistanceM>=4500&&r.mainDistanceM<5000&&r.runSec>0&&(goal!=="continuous"||r.strategy==="continuous"&&r.continuousDistanceM>=4500&&r.longestBout===r.mainSec)).sort((a,b)=>b.day-a.day)[0];
    if(!near)return {ready:false,reason:"Need a recent comfortable measured outing near 5 km using the chosen strategy."};
    const expected=Math.ceil(near.mainSec*5000/near.mainDistanceM),cap=near.mainSec+durationIncrement(near.mainSec);
    if(expected>cap)return {ready:false,expected,cap,reason:"Build duration further before attempting the distance."};
    if(goal==="continuous"&&near.longestBout+durationIncrement(near.longestBout)<expected)return {ready:false,reason:"Build continuous duration."};
    return {ready:true,expected,cap,reason:"Optional 5K attempt replaces the longer outing; stop early if symptoms or effort require it."};
  }
  function achievement(r){
    if(!validRecord(r)||r.mainDistanceM<5000)return {distance:false,runwalk:false,continuous:false,walk:false};
    return {distance:true,runwalk:r.runSec>0&&["runwalk","continuous"].includes(r.strategy),continuous:r.strategy==="continuous"&&r.continuousDistanceM>=5000&&r.longestBout===r.mainSec,walk:r.strategy==="walk"&&r.runSec===0};
  }
  // Only redistribute an existing dose; extra warm-up/cooldown walking is
  // explicit. This is a separate frequency change, not also a volume increase.
  function thirdDay(state,h,d,hard=[]){
    if(state.days!==2||state.requestedDays!==3||!state.practice.runSec||state.practice.distanceGoal!==null)return null;
    const g=good(h,d,14);
    if(![0,1].every(i=>distinctDays(g.filter(r=>r.runSec>0&&r.day>d-7*(i+1)&&r.day<=d-7*i))>=2)||g.some(r=>r.check.recovery!=="normal"))return null;
    if(schedule(3,hard).hardSameDay)return null;
    const p=state.practice;let a,b;
    if(p.runs.length>=2){
      const k=Math.ceil(p.runs.length/2);
      a=workout("split-a-"+p.id,p.runs.slice(0,k),p.rests.slice(0,k),0,{pattern:p.pattern});
      b=workout("split-b-"+p.id,p.runs.slice(k),p.rests.slice(k),p.tail,{pattern:p.pattern});
    }else if(p.runSec>=600){
      const k=Math.ceil(p.runSec/2);a=continuous("split-a-"+p.id,k);b=continuous("split-b-"+p.id,p.runSec-k);
    }else return null;
    const next={...state,days:3,practice:a,easy:b},before=weekly(state,hard),after=weekly(next,hard);
    return after.runSec<=before.runSec&&after.totalSec<=before.totalSec+480?next:null;
  }
  function review(state,h,day,opt={}){
    const {weekNumber=1,focus="practice",hardLegDays=[],approvedCaution=false,wantPace=false,goalTimeSec=null,wantThird=false}=opt;
    if(!["practice","long"].includes(focus))throw Error("Unknown focus");
    const plan=weekly(state,hardLegDays);if(!plan)return {action:state.action,state,reason:state.reason};
    const r=recent(h,day,7);
    const result=(action,reason,extra={})=>({action,state,reason,...extra});
    if(r.some(x=>check(x.check)==="urgent"))return result("pause","Urgent symptoms: stop and seek urgent medical help.",{urgent:true});
    if(r.some(x=>x.unresolved||check(x.check)==="pause"))return result("pause","Pause running and assess concerning symptoms.");
    if(r.some(x=>check(x.check)==="reduce")){
      const bad=r.filter(x=>check(x.check)==="reduce").sort((a,b)=>b.day-a.day)[0],lane=["practice","easy","long"].includes(bad.lane)?bad.lane:"practice";
      return result("reduce","Reduce the difficult session; keep other prescriptions stable.",{state:{...state,[lane]:reduced(state[lane])},lever:lane});
    }
    if(r.some(x=>check(x.check)!=="success"||!x.completed)||distinctDays(r)<state.days||plan.schedule.hardSameDay)return result("repeat","Hold until completion, recovery and scheduling fit are confirmed.");
    // Match each prescribed lane, allowing a distance session to end at the cap.
    const allDone=plan.sessions.every(p=>r.some(x=>x.lane===p.lane&&x.prescriptionId===p.id&&(achieved(x,p)||p.distanceGoal!==null&&x.completed&&check(x.check)==="success"&&x.mainSec<=p.mainSec)));
    if(!allDone)return result("repeat","Confirm actual prescribed sessions before advancing.");
    if(weekNumber%4===0)return result("repeat","Four-week review: consolidate; reduce if recovery requires it.");
    if(wantThird){
      const next=thirdDay(state,h,day,hardLegDays);
      if(next)return result("frequency","Redistribute running exposure; count added walking warm-up/cooldown.",{state:next,lever:"frequency"});
    }
    let paceDeferred=null;
    if(wantPace){
      const pace=paceOption(state,h,day,goalTimeSec,plan);
      if(pace.eligible)return result("pace",pace.reason,{substitute:pace.workout,lever:"pace"});
      paceDeferred=pace.reason;
      // Optional pace work must never veto an otherwise eligible easy progression.
    }
    const p=state[focus],same=exposures(h,day,p),last=same.slice().sort((a,b)=>b.day-a.day)[0];
    const near=good(h,day,14).filter(x=>x.runSec>=p.runSec&&x.longestBout>=p.longestBout&&x.mainSec>=p.mainSec&&x.check.recovery==="normal"&&x.day!==last?.day);
    const accelerate=!!last&&p.runSec>0&&last.check.effort==="easy"&&last.check.recovery==="normal"&&distinctDays(near)>=1;
    const comparablePractice=focus==="practice"&&!!last&&distinctDays(near)>=1;
    if(distinctDays(same)<2&&!accelerate&&!comparablePractice){
      // A longer outing that reached its duration cap but not its distance
      // can build time after two recovered attempts at that same cap.
      const capExposures=p.distanceGoal!==null&&distinctDays(good(h,day,28).filter(x=>x.prescriptionId===p.id&&x.lane===focus&&x.mainSec>=p.mainSec))>=2;
      if(!capExposures)return result("repeat","Need another comparable successful exposure.");
    }
    const c=focus==="long"?longCandidate(p,h,day,state.goal,state.practice):{workout:nextPractice(p,h,day,accelerate),reason:accelerate?"Easy recovered training plus recent running exposure supports a modest reassessment.":"Two successful exposures support progression.",flag:"unknown"};
    let n=c.workout,reason=c.reason;
    if(n.id===p.id)return result("repeat",c.reason,{paceDeferred});
    const actualRun=total(r,"runSec"),actualTotal=total(r,"totalSec"),runCap=actualRun===0?180:clamp(Math.ceil(actualRun*.15/30)*30,60,180);
    const b=bounds(h,day);
    const reference=last&&pos(last.runningDistanceM)&&p.runSec>0?last:null;
    const flagFor=x=>distanceCaution(reference?reference.runningDistanceM*x.runSec/reference.runSec:null,b.runningDistanceM);
    const fits=x=>{
      const plan=weekly({...state,[focus]:x},hardLegDays);
      return plan.runSec<=actualRun+runCap&&plan.totalSec<=actualTotal+300&&x.totalSec<=p.totalSec+300;
    };
    const meaningful=x=>x.runSec>p.runSec||x.longestBout>p.longestBout||x.mainSec>p.mainSec||x.distanceGoal!==null&&x.distanceGoal>(p.distanceGoal??0);
    if(!fits(n)||(!approvedCaution&&(c.flag==="review"||flagFor(n)==="review"))){
      const options=[];
      // Smaller continuous increases retain the current running strategy.
      if(strategy(p)==="continuous"&&strategy(n)==="continuous"){
        for(let s=Math.min(n.runSec,p.runSec+180);s>p.runSec;s-=15)options.push(continuous("bridge-cont-"+s,s));
      }else if(p.runSec&&p.pattern){
        // Prefer a same-volume or small-volume bridge toward the longer bout.
        if(n.longestBout>p.longestBout){
          for(let bout=Math.min(n.longestBout,p.longestBout+30);bout>p.longestBout;bout-=5){
            const count=Math.max(1,Math.floor(p.runSec/bout));
            options.push(repeat("bridge-bout-"+count+"-"+bout+"-"+p.pattern.walk,count,bout,p.pattern.walk,true));
          }
        }
        // A short additional running bout can fit when extending the full rhythm does not.
        for(let extra=Math.min(60,p.pattern.run);extra>=5;extra-=5)options.push(workout("bridge-extra-"+p.id+"-"+extra,[...p.runs,extra],p.rests.length===p.runs.length?[...p.rests]:[...p.rests,p.pattern.walk],p.tail,{pattern:p.pattern}));
        for(let s=Math.min(p.mainSec+180,Math.max(n.mainSec,p.mainSec+15));s>p.mainSec;s-=15)options.push(rhythm("bridge-time-"+p.pattern.run+"-"+p.pattern.walk+"-"+s,p.pattern.run,p.pattern.walk,s));
        if(focus==="long")options.push(workout("bridge-walk-"+(p.mainSec+60),p.runs,p.rests,p.tail+60,{pattern:p.pattern}));
      }else if(!p.runSec&&!n.runSec){
        for(let s=Math.min(n.mainSec,p.mainSec+300);s>p.mainSec;s-=30)options.push(walk("bridge-walk-"+s,s));
      }else if(!p.runSec&&n.runSec){
        for(let k=6;k>=1;k--)options.push(repeat("bridge-intro-"+k,k,15,105));
      }
      const smaller=options.find(x=>meaningful(x)&&fits(x)&&(approvedCaution||flagFor(x)!=="review")&&x.fasterSec===0);
      if(!smaller)return result("repeat","Keep the current dose; no smaller suitable progression fits recent work and recovery.",{paceDeferred});
      n=smaller;reason="Use a smaller intermediate workout that fits recent training.";
    }
    const next={...state,[focus]:n};
    const flag=flagFor(n)==="review"||n===c.workout&&c.flag==="review"?"review":flagFor(n);
    if(flag==="review"&&!approvedCaution)return result("review-distance","Running-distance change needs review; a percentage is not a safety guarantee.",{candidate:n,flag});
    return result("progress",reason,{state:next,lever:focus,flag,paceDeferred});
  }
  return {workout,repeat,continuous,walk,rhythm,library,byId,check,validRecord,recent,good,bounds,initial,schedule,weekly,gap,reentry,reduced,achieved,exposures,nextPractice,distanceCaution,longCandidate,paceOption,ready,achievement,thirdDay,review,strategy,successCheck};
};
module.exports = createEngine();

};
modules["./refined-engine.cjs"]=function(module,exports,require){
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

};
modules["./training-features.cjs"]=function(module,exports,require){
"use strict";
const features=function features(R,E,C){
 const good=(h,d,n=28)=>E.good(h,d,n).filter(r=>r.check.recovery==="normal");
 const max=(h,k)=>Math.max(0,...h.map(r=>r[k]??0));
 const positive=x=>Number.isFinite(x)&&x>0;
 function paceReview(s,h,d){
 const g=good(h,d-1,28),ref=g.filter(r=>r.representative===true&&r.comparable===true&&r.strategy==="continuous"&&r.mainDistanceM>=3000&&r.runSec===r.mainSec&&r.longestBout===r.runSec&&positive(r.mainSec)&&r.measurement?.scope==="running-only"&&r.measurement?.timeBasis==="elapsed"&&r.measurement?.derived?.distance===false).sort((a,b)=>b.day-a.day)[0];
 const consistent=[0,1,2,3].every(i=>new Set(g.filter(r=>r.runSec>0&&r.day>d-1-7*(i+1)&&r.day<=d-1-7*i).map(r=>r.day)).size>=2);
 const goalPace=positive(s.goalTimeSec)?s.goalTimeSec/5:null,demonstrated=ref?ref.mainSec*1000/ref.mainDistanceM:null;
 const eligible=s.goal==="continuous"&&!!goalPace&&consistent&&!!ref&&goalPace>=demonstrated&&!s.paused&&!s.recoveryRemaining&&!s.transitionRow&&!s.completed;
 return {eligible,goalPaceSecKm:goalPace,demonstratedSecKm:demonstrated,referenceDay:ref?.day??null,notice:!!goalPace&&!eligible&&s.ack!==s.goalRevision,reason:eligible?"Your recent running supports controlled practice at this pace.":"Keep building current fitness; your target stays saved."};
 }
 function assessmentReview(s,h,d,p=null){
 const g=good(h,d-1,14).filter(r=>r.runSec>0&&!r.fasterSec),bout=Math.min(max(g,"longestBout"),p?p.runs[0]??0:Infinity);
 return {durationSec:s.paused||s.recoveryRemaining?null:[1200,600,300,120].find(n=>n<=bout)??null,optional:true};
 }
 function next(s,h,d,context={}){
 const base=R.next(s,h,d,context),review=paceReview(base.state,h,d);
 const out={...base,paceReview:review,assessmentReview:assessmentReview(base.state,h,d,base.workout)};
 if(base.action!=="train"||!base.workout||base.workout.lane!=="practice"||s.transitionRow||context.recovery!=="normal"||context.symptoms!=="none")return out;
 const p=base.workout,g=good(h,d-1,14).filter(r=>r.runSec>0),recent=E.recent(h,d-1,7);
 if(g.length<2)return out;
 if(context.assessmentRequested===true){
 const duration=out.assessmentReview.durationSec;
 if(!duration||recent.some(r=>r.assessment&&d-r.day<7))return out;
 return {...out,feature:"assessment",assessment:{durationSec:duration,boutIndex:0,startOffsetSec:0,effort:"comfortable",replacesPartOfWorkout:true}};
 }
 if(context.paceRequested===true&&review.eligible&&!recent.some(r=>r.fasterSec>0&&d-r.day<7)){
 // One controlled 3-minute segment initially, within the existing first bout.
 // A conservative pace guard and familiar workload are mandatory.
 if(p.runs[0]<180||p.runSec>max(g,"runSec")||p.longestBout>max(g,"longestBout")||p.mainSec>max(g,"mainSec"))return out;
 return {...out,feature:"goal-pace",pacePractice:{segments:[{boutIndex:0,offsetSec:0,durationSec:180}],seconds:180,paceSecKm:review.goalPaceSecKm,effort:"controlled",stopIfUncomfortable:true}};
 }
 return out;
 }
 function log(s,record,decision,details={}){
 let r={...record};
 if(details.measurement){
 const n=C.normalize(details.measurement);r.measurement=n;
 const mainScope=n.scope==="running-only"&&r.strategy==="continuous"||n.scope==="runwalk"&&r.strategy==="runwalk";
 if(mainScope&&n.timeBasis==="elapsed"&&n.entered.distanceM!==null&&n.timeSec!==null&&Math.abs(n.timeSec-r.mainSec)<=Math.max(2,r.mainSec*.03)){
 r.mainDistanceM=n.entered.distanceM;
 if(r.strategy==="continuous"){r.runningDistanceM=n.entered.distanceM;r.continuousDistanceM=n.entered.distanceM;}else{r.runningDistanceM=null;r.continuousDistanceM=null;}
 r.comparable=n.comparable;
 }else{r.mainDistanceM=null;r.runningDistanceM=null;r.continuousDistanceM=null;r.comparable=false;}
 r.representative=details.representative===true&&r.comparable&&r.measurement.derived.distance===false&&r.strategy==="continuous"&&r.completed&&E.check(r.check)==="success"&&r.check.recovery==="normal";
 }
 if(decision.feature==="assessment"&&details.assessment){
 const n=C.normalize(details.assessment),duration=decision.assessment.durationSec;
 if(n.scope!=="running-only"||n.timeBasis!=="elapsed"||n.timeSec===null||Math.abs(n.timeSec-duration)>2||r.longestBout<duration-2)throw Error("Assessment must match the prescribed running segment");
 r.assessment={measurement:n,durationSec:duration,accepted:r.completed&&E.check(r.check)==="success"&&r.check.recovery==="normal"};
 }
 if(decision.feature==="goal-pace"){
 const sec=details.pacePracticeSec??0;
 if(!Number.isFinite(sec)||sec<0||sec>decision.pacePractice.seconds||sec>r.runSec)throw Error("Invalid pace practice duration");
 r.fasterSec=sec;r.goalPacePractice={targetSecKm:decision.pacePractice.paceSecKm,actualSeconds:sec};
 }else if(details.pacePracticeSec>0)throw Error("Pace practice was not prescribed");
 return R.log(s,r,decision);
 }
 return {...R,next,log,paceReview,assessmentReview};
};
module.exports=features(require("./refined-engine.cjs"),require("./engine.cjs"),require("../../shared/running-calculator.js"));

};
function load(id){if(id==="../../shared/running-calculator.js")return globalThis.BFitRunningCalculator;if(!modules[id])throw Error("Unknown module");if(!cache[id]){const m={exports:{}};modules[id](m,m.exports,load);cache[id]=m;}return cache[id].exports;}globalThis.BFit5K=load("./training-features.cjs");globalThis.BFit5KCore=load("./engine.cjs");})();

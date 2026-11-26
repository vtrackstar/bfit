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

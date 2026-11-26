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

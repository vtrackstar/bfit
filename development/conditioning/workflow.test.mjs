import { steady, interval, swim, phases, success } from './engine.mjs';
import { canonical, observed, validateLog, validateState, emptyState, restore, backup, addLog, addExternal, updateRecovery, actualTotals, review, visit } from './workflow.mjs';

function journeyTests(){
 const checks=[];function check(n,b){if(!b)throw Error(n);checks.push(n);}
 function fails(f){try{f();return false}catch{return true}}
 const p={mode:"bike",goal:"B",slot:"steady",setup:"bike1",days:2,restricted:false,vigorousSuitable:true,existingHard:false,recovery:"normal",hardOptIn:true};
 const entry=(d,day,id,over={})=>({id,day,dose:d,setup:"bike1",source:"manual",status:"full",actual:d.kind==="swim"?{lengths:d.lengths,swimSeconds:null,restSeconds:null}:phases(d),effort:d.effort[1],quality:true,recovery:"normal",warning:false,pain:false,recoveryExtended:false,...over,recoveryDay:(over.recovery??"normal")==="unknown"?null:day+1});
 const record=(state,l,now)=>addLog(state,l,Math.max(now,l.recoveryDay??now));
 let s=emptyState(0);let d=visit(s,{...p,comfortableMinutes:5},1,1800).dose;
 check("inactive initial dose",d.minutes===5&&d.level===1);
 let day=1;let seq=0;
 while(d.level===1&&seq<20){s=record(s,entry(d,day,"a"+seq++),day);day+=3;d=visit(s,p,day,3600).dose;}
 check("full beginner journey to level 2",d.level===2&&d.minutes===15);
 s=record(s,entry(d,day,"b1"),day);day+=3;s=record(s,entry(d,day,"b2"),day);day+=2;
 let intr=visit(s,{...p,slot:"interval"},day,3600).dose;check("interval after base",intr.id==="bridge30");
 s=record(s,entry(intr,day,"int1",{recovery:"unknown"}),day);check("no same-day repeat",visit(s,{...p,slot:"interval"},day,3600).dose===null);
 day++;check("missing recovery blocks",visit(s,{...p,slot:"interval"},day,3600).action==="check-recovery");
 s=updateRecovery(s,"int1","normal",day);day+=3;intr=visit(s,{...p,slot:"interval"},day,3600).dose;check("one success repeats",intr.id==="bridge30");
 s=record(s,entry(intr,day,"int2"),day);day+=3;intr=visit(s,{...p,slot:"interval"},day,3600).dose;check("two successes advance",intr.id==="bridge30x4");
 const copy=restore(backup(s,day),day);check("backup round trip",JSON.stringify(copy)===JSON.stringify(s));
 check("unknown schema rejected",fails(()=>restore(JSON.stringify({...s,version:2}),day)));
 check("duplicate id rejected",fails(()=>addLog(s,s.logs[0],day)));
 check("forged phase rejected",fails(()=>addLog(s,entry(intr,day,"bad",{actual:[{type:"warm",seconds:5000}]}),day)));
 check("noncanonical prescription rejected",!canonical({...intr,n:999}));
 check("review known actual work",review(s,day).byMode.bike.workSeconds>0&&review(s,day).full>0);
 const x=addExternal(s,{id:"game",day,activity:"Basketball",minutes:45,intensity:"hard"},day);
 check("external hard protects schedule",visit(x,{...p,slot:"interval"},day+1,3600).dose===null);
 check("external duplicate dedup",addExternal(x,{id:"game2",day,activity:"basketball",minutes:45,intensity:"hard"},day).external.length===1);
 check("review separates external",review(x,day).externalKnownMinutes===45);
 let z=emptyState(0);const swimDose=swim();z=record(z,entry(swimDose,1,"sw",{setup:"pool"}),1);
 check("swim unknown duration stays unknown",review(z,2).byMode.swim.unknownWorkLogs===1&&review(z,2).byMode.swim.completedLengths===4);
 check("swim timer rejected",!validateLog(entry(swimDose,1,"sw2",{source:"timer"}),2));
 const id=interval("bike","b60x4");const a=phases(id);a[2]={...a[2],seconds:a[2].seconds+60};
 check("extended recovery recorded",validateLog(entry(id,1,"extend",{actual:a,recoveryExtended:true}),2));
 check("extended recovery blocks success",!success(entry(id,1,"extend",{actual:a,recoveryExtended:true})));
 check("false recovery extension rejected",!validateLog(entry(id,1,"extend",{actual:a}),2));
 const w=record(emptyState(0),entry(steady("bike",5),1,"warn",{warning:true}),1);
 check("warning across modes",visit(w,{...p,mode:"walk",setup:"path"},3,1800).action==="medical-review");
 check("cannot import resolved flag",!validateLog({...w.logs[0],resolved:true},3));
 check("post illness route",visit(s,{...p,postIllness:true},day,3600).action==="reassess-after-illness");
 check("mode change conservative",visit(s,{...p,mode:"row",setup:"row1"},day,3600).dose.level===1);
 check("return reduced",visit(s,{...p,slot:"interval"},day+20,3600).dose.reduced===true);
 check("four week review due",review(s,day+28).reviewDue);
 check("prior excluded from attendance",review(record(emptyState(0),entry(steady("bike",15,2),1,"prior",{source:"prior"}),1),2).full===0);
 check("prior evidence can predate signup",record(emptyState(20),entry(steady("bike",15,2),10,"prior-old",{source:"prior"}),20).logs.length===1);
 check("steady second slot retains identity for bouts",visit(emptyState(0),{...p,slot:"steady2",comfortableMinutes:2},1,1800).dose.slot==="steady2");
 check("other same-day demanding slot blocked",visit(record(emptyState(0),entry(interval("bike","b60x4"),1,"other",{recovery:"unknown"}),1),{...p,mode:"circuit",slot:"circuit",movementsFamiliar:true,setup:"home"},1,1800).action==="already-demanding-today");
 check("reject premature recovery on creation",!validateLog(entry(steady("bike",5),5,"early"),5));
 check("reject forged recovery date",!validateLog({...entry(steady("bike",5),5,"early"),recoveryDay:5},6));
 check("allow dated next-day report",validateLog(entry(steady("bike",5),5,"later"),6));
 check("same-day unknown remains valid",validateLog(entry(steady("bike",5),5,"unknown",{recovery:"unknown"}),5));
 check("reject early update",fails(()=>updateRecovery(addLog(emptyState(0),entry(steady("bike",5),1,"today",{recovery:"unknown"}),1),"today","normal",1)));
 return checks;
}
const results=journeyTests(); for(const n of results) console.log('PASS '+n); console.log(results.length+' journey checks passed');

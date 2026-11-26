import { interval, steady, phases, recommend, reduce, fitTime } from './engine.mjs';
import { appNew, appCurrent, appStart, appSave, appRecovery, appReport, appNextCycle } from './app-state.mjs';

function advancedTests(){
 const out=[],check=(n,b)=>{if(!b)throw Error(n);out.push(n)},fails=f=>{try{f();return false}catch{return true}};
 const base={mode:"bike",setup:"bike1",restricted:false,vigorousSuitable:true,existingHard:false,recovery:"normal",comfortableMinutes:10};
 const get=(a,p,sl)=>appStart(a,p,sl.id,sl.day,5400,"v"+sl.day,"manual");
 const done=(a,day,extra={})=>{const d=a.active.ticket.dose;const actual=d.kind==="swim"?{lengths:d.lengths,swimSeconds:null,restSeconds:null}:phases(d);return appRecovery(appSave(a,{confirmed:true,status:"full",actual,effort:d.effort[1],quality:true,warning:false,pain:false,recoveryExtended:false,...extra},day),"v"+day,"normal",day+1)};
 function journey(p,cycles=12){
  let a=appNew(100,[0,3]),trace=[];
  for(let i=0;i<cycles;i++){if(i)a=appNextCycle(a,100+28*i,[0,3],null,100+28*i);for(const sl of appCurrent(a).calendar.slots){const r=get(a,p,sl);if(!r.app.active)throw Error("blocked "+sl.day+" "+r.action);trace.push(r.app.active.ticket.dose);a=done(r.app,sl.day);}}
  return {a,trace};
 }
 const tempo=journey({...base,goal:"A",tempoOptIn:true});
 const ids=x=>x.trace.filter(d=>d.kind==="interval").map(d=>d.id);
 check("tempo route reaches longer controlled bouts",ids(tempo).includes("tempo480x3"));
 check("tempo never enters hard route",tempo.trace.every(d=>d.effort[1]<=7));
 const power=journey({...base,goal:"B",hardOptIn:true});
 const pi=ids(power);
 check("power reaches full ladder",pi.includes("power180x4"));
 check("advanced cap persists with current qualifying evidence",pi.slice(-4).every(x=>x==="power180x4"));
 check("hard starts only after controlled pair",pi.indexOf("hard120x3")>1&&pi.slice(pi.indexOf("hard120x3")-2,pi.indexOf("hard120x3")).every(x=>x==="b120x4"));
 const repeat=journey({...base,goal:"B",specialization:"repeat"});
 check("controlled repeat reaches eight repetitions",ids(repeat).includes("repeat30x8")&&repeat.trace.every(d=>d.effort[1]<=7));
 const rh=journey({...base,goal:"B",hardOptIn:true,specialization:"repeat-hard"});
 const ri=ids(rh);
 check("hard repeat route reaches cap",ri.includes("repeatHard30x8"));
 check("hard repeat after two controlled repeat sessions",ri.slice(ri.indexOf("repeatHard30x5")-2,ri.indexOf("repeatHard30x5")).every(x=>x==="repeat30x6"));
 check("hard repeat has hard entry pair",ri.filter(x=>x==="hard120x3").length>=2);
 const noHard=journey({...base,goal:"B",hardOptIn:false});
 check("hard opt-in required over entire journey",noHard.trace.every(d=>d.effort[1]<=7));
 const one=appNew(100,[0]),sl=appCurrent(one).calendar.slots[0];
 check("swim requires chosen pool",get(one,{...base,goal:"B",mode:"swim",waterCompetent:true},sl).action==="choose-pool");
 check("no swimming if not competent",get(one,{...base,goal:"B",mode:"swim",waterCompetent:false,poolLength:25,poolUnit:"yd"},sl).app.active===null);
 const swimmer={...base,goal:"B",mode:"swim",setup:"pool",waterCompetent:true,poolLength:25,poolUnit:"yd"};
 const swimming=journey(swimmer,2);
 check("swimming stays easy and manual lengths",swimming.trace.every(d=>d.kind==="swim"&&d.unit==="yd"&&d.pool===25&&d.effort[1]===3)&&swimming.trace[2].lengths===5);
 check("swim unknown time not fabricated",appReport(swimming.a,100,156).byMode.swim.unknownWorkVisits===8);
 let sp=appNew(100,[0,3]);let r=get(sp,swimmer,appCurrent(sp).calendar.slots[0]);sp=done(r.app,100);r=get(sp,swimmer,appCurrent(sp).calendar.slots[1]);sp=done(r.app,103);
 r=get(sp,{...swimmer,poolLength:50,poolUnit:"m"},appCurrent(sp).calendar.slots[2]);
 check("pool change resets length prescription",r.app.active.ticket.dose.lengths===4&&r.app.active.ticket.dose.pool===50);
 const cp={...base,goal:"B",mode:"circuit",setup:"home",movementsFamiliar:true};
 const circuits=journey(cp,2);
 check("circuits progress separately to three rounds",circuits.trace[0].rounds===2&&circuits.trace[2].rounds===3&&circuits.trace.every(d=>d.kind==="circuit"));
 check("unfamiliar circuit blocked",get(one,{...cp,movementsFamiliar:false},sl).app.active===null);
 const last=interval("bike","power180x3"),steadyDose=steady("bike",35,3),log=(d,day,extra={})=>({dose:d,day,setup:"bike1",status:"full",recovery:"normal",quality:true,effort:d.effort[1],...extra});
 const evidence=[log(last,98),log(steadyDose,99),log(steadyDose,96)];
 check("incompatible goal holds even before a matching pair",recommend({...base,goal:"A",tempoOptIn:true},last,evidence,100).dose===null);
 check("explicit goal rebaseline returns controlled entry",recommend({...base,goal:"A",tempoOptIn:true,rebaseline:true},last,evidence,100).dose.id==="bridge30");
 check("withdraw hard opt-in returns controlled entry",recommend({...base,goal:"B",hardOptIn:false},last,evidence,100).dose.id==="bridge30");
 const reduced=reduce(interval("bike","b60x4"));const short=fitTime(reduced,960).dose;
 check("time limit preserves recovery reduction",short&&short.reductionReason==="recovery");
 return out;
}

const results=advancedTests();for(const n of results)console.log('PASS '+n);console.log(results.length+' advanced checks passed');

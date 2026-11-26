"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,p),"utf8");
const harness=async function harness(html,js,bundle,calc){
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);const tests=[],check=(name,fn)=>{try{tests.push({name,pass:!!fn()})}catch(e){tests.push({name,pass:false,error:String(e)})}};
 let clock=0,date=Date.UTC(2026,10,26,12),store={},download="",interval=null,env;
 const NativeDate=Date;class FakeDate extends NativeDate{constructor(...a){super(...(a.length?a:[date]));}static now(){return date;}}
 function boot(){
 const elements={};for(const id of ids){elements[id]={value:"",checked:false,hidden:false,disabled:false,textContent:"",children:[],listeners:{},addEventListener(n,f){this.listeners[n]=f;},replaceChildren(...x){this.children=x;},click(){this.onclick?.();}};}
 const defaults={goal:"runwalk",walk:"30",days:"2",newGoal:"runwalk",unit:"km",paceUnit:"km",speedUnit:"kmh",scope:"unknown",basis:"unknown",surface:"unknown"};for(const [id,v] of Object.entries(defaults))elements[id].value=v;
 const doc={hidden:false,listeners:{},getElementById:id=>elements[id],createElement:tag=>({textContent:"",click(){download=this.download??"";}}),addEventListener(n,f){this.listeners[n]=f;}};
 const g={};new Function("globalThis","module",calc)(g,undefined);new Function("globalThis",bundle)(g);const localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v};const url={createObjectURL:()=>"blob:mock",revokeObjectURL:()=>{}};
 new Function("globalThis","document","localStorage","Date","performance","setInterval","clearInterval","setTimeout","URL","Blob",js)(g,doc,localStorage,FakeDate,{now:()=>clock},f=>{interval=f;return 1;},()=>{interval=null;},()=>{},url,class{});
 const set=(id,v)=>{if(typeof v==="boolean")elements[id].checked=v;else elements[id].value=String(v);};const submit=id=>elements[id].listeners.submit({preventDefault(){}}),click=id=>elements[id].click(),state=()=>JSON.parse(Object.values(store)[0]??"null");return {elements,doc,g,set,submit,click,state};
 }
 const advance=n=>{for(let i=0;i<n;i++){clock+=1000;interval?.();}};
 env=boot();const set=(id,v)=>env.set(id,v),submit=id=>env.submit(id),click=id=>env.click(id),state=()=>env.state();
 check("Setup initial view",()=>!env.elements.setup.hidden&&env.elements.dashboard.hidden);
 set("ready",true);submit("intake");
 check("Onboarding generates persisted plan",()=>state().state.goal==="runwalk"&&state().state.days===2&&!env.elements.dashboard.hidden);
 set("recovery","normal");set("symptoms","none");submit("pre");
 check("Workout renders 20-minute initial session",()=>state().active.phases.reduce((n,p)=>n+p.sec,0)===1200&&!env.elements.workout.hidden);
 click("start");advance(10);click("pause");
 check("Pause records only elapsed time",()=>state().active.actual[0]===10&&env.elements.clock.textContent==="4:50");
 advance(20);check("Paused timer does not advance",()=>state().active.actual[0]===10);
 env=boot();check("Reload restores paused workout",()=>!env.elements.workout.hidden&&env.elements.clock.textContent==="4:50"&&!env.elements.start.disabled);
 click("start");advance(300);check("Resume crosses into run interval",()=>state().active.index===1&&state().active.actual[1]===10);
 env.doc.hidden=true;env.doc.listeners.visibilitychange();check("Hidden page pauses timer",()=>interval===null);
 env.doc.hidden=false;click("start");advance(890);check("Timer finishes automatically",()=>state().active.finished&&!env.elements.logging.hidden);
 set("distance",1.2);set("recordTime",720);set("scope","runwalk");set("basis","elapsed");set("surface","track");click("convert");check("Distance/time conversion rendered",()=>env.elements.conversion.textContent.includes("10:00/km"));
 set("effort","comfortable");set("postSymptoms","none");set("done",true);submit("logForm");
 check("Workout pending next-day recovery",()=>!!state().pending&&state().state.history.length===0&&!env.elements.pending.hidden);
 set("nextRecovery","normal");set("nextSymptoms","none");submit("recoverForm");check("Same-day recovery blocked",()=>!!state().pending);
 env=boot();check("Pending recovery restored",()=>!env.elements.pending.hidden);
 date+=86400000;set("nextRecovery","normal");set("nextSymptoms","none");submit("recoverForm");
 check("Next-day recovery logs exactly once",()=>!state().pending&&state().state.history.length===1&&state().state.history[0].runSec===180);
 check("Next-day adjacent running blocked",()=>{set("recovery","normal");set("symptoms","none");submit("pre");return !state().active});
 date+=86400000;set("recovery","normal");set("symptoms","sharp");submit("pre");
 check("Pre-session pain hold persists",()=>state().state.paused&&!state().active);
 env=boot();check("Reload cannot bypass pain hold",()=>env.elements.checkin.hidden&&state().state.paused);
 click("export");check("Export has expected filename",()=>download==="bfit-first-5k-progress.json");
 
 // Fresh intake: optional recovered history moves the starting point forward.
 const pausedBackup=state();store={};env=boot();set("ready",true);set("goal","continuous");
 for(let i=0;i<4;i++){set("histDay"+i,[2,5,9,12][i]);set("histRun"+i,30);set("histMain"+i,30);set("histBout"+i,30);set("histRecovery"+i,"normal");}
 submit("intake");check("Experienced intake uses four actual recent runs",()=>state().state.level>0&&state().state.history.length===4&&state().state.history.every(r=>r.source==="self-reported-intake"));
 const backup=state();store={};env=boot();set("ready",true);set("histDay0",2);set("histRun0",20);set("histMain0",10);set("histBout0",15);set("histRecovery0","normal");submit("intake");
 check("Invalid history rejected",()=>!state());
 store={};env=boot();set("ready",true);for(let i=0;i<2;i++){set("histDay"+i,2);set("histRun"+i,10);set("histMain"+i,10);set("histBout"+i,10);set("histRecovery"+i,"normal");}submit("intake");
 check("Duplicate history dates rejected",()=>!state());
 const file=x=>({size:JSON.stringify(x).length,text:async()=>JSON.stringify(x)});
 env.elements.importFile.files=[file(backup)];await env.elements.import.onclick();
 check("Valid import restores plan and history",()=>state().state.level===backup.state.level&&state().state.history.length===4);
 env.elements.importFile.files=[file({...backup,state:{...backup.state,level:999}})];set("replaceConfirm",true);await env.elements.import.onclick();
 check("Invalid phase rejected without replacing progress",()=>state().state.level===backup.state.level);
 const corrupt=JSON.parse(JSON.stringify(backup));corrupt.state.history.push(corrupt.state.history.at(-1));env.elements.importFile.files=[file(corrupt)];await env.elements.import.onclick();
 check("Duplicate imported record rejected",()=>state().state.history.length===4);
 set("replaceConfirm",false);env.elements.importFile.files=[file(pausedBackup)];await env.elements.import.onclick();
 check("Replacement requires confirmation",()=>!state().state.paused);
 store={};env=boot();env.elements.importFile.files=[file(pausedBackup)];await env.elements.import.onclick();
 check("Imported symptom hold remains paused",()=>state().state.paused&&env.elements.checkin.hidden);
 env.elements.importFile.files=[file(backup)];set("replaceConfirm",true);await env.elements.import.onclick();
 check("Import cannot clear existing health hold",()=>state().state.paused);
 
// Verify new return workflow after the existing import safety checks.
set("returnWalk",30);submit("returnForm");check("Return without medical advice stays paused",()=>state().state.paused);
set("cleared",true);set("symptomFree",true);submit("returnForm");
check("Cleared return restarts conservatively",()=>!state().state.paused&&state().state.level===0&&state().state.clearanceSelfReported===true&&state().state.history.length===pausedBackup.state.history.length);
env=boot();check("Return checkpoint survives restore",()=>state().state.returnEpoch===Math.floor(date/86400000)&&!env.elements.checkin.hidden);
set("recovery","normal");set("symptoms","none");submit("pre");
check("Return workout uses introductory running dose",()=>state().active?.decision.workout.runSec===180);
 // Completion fixture: seed a measured completed record, then restore and inspect the result.
const completed=JSON.parse(JSON.stringify(backup));const last=completed.state.history.at(-1);const finish={...last,day:Math.floor(date/86400000)-1,runSec:2100,mainSec:2100,totalSec:2580,longestBout:2100,mainDistanceM:5000,runningDistanceM:5000,continuousDistanceM:5000,source:"test-fixture",completed:true,check:env.g.BFit5KCore.successCheck};
completed.state.history.push(finish);completed.state.lastDay=finish.day;completed.state.completed=true;completed.state.completion=finish;
store={"bfit-first-5k-dev-v1":JSON.stringify(completed)};env=boot();
check("Completion panel displays recorded time and distance",()=>!env.elements.celebration.hidden&&env.elements.resultSummary.textContent.includes("35:00")&&env.elements.resultSummary.textContent.includes("5.00 km"));
check("Completion analysis converts average pace",()=>env.elements.resultPace.textContent.includes("7:00/km")&&env.elements.resultPace.textContent.includes("11:16/mile"));
check("Completion stops regular workout recommendations",()=>env.elements.checkin.hidden);

// Use a fresh beginner state for cancellation, not an advanced history at its workload limit.
store={};env=boot();set("ready",true);submit("intake");set("recovery","normal");set("symptoms","none");submit("pre");
check("Unstarted workout can be selected",()=>!!state().active);
click("finish");check("Zero-time finish returns without log",()=>!state().active&&state().state.history.length===0&&!env.elements.checkin.hidden);
set("recovery","normal");set("symptoms","none");submit("pre");click("discard");
check("Explicit cancellation returns to training",()=>!state().active&&state().state.history.length===0);
store={"bfit-first-5k-dev-v1":JSON.stringify(backup)};date+=30*86400000;env=boot();set("recovery","normal");set("symptoms","none");submit("pre");
check("Long absence exposes reassessment",()=>state().state.reentryNeeded&&!env.elements.reentryPanel.hidden&&env.elements.checkin.hidden);
set("reentryWalk",30);submit("reentryForm");check("Reentry requires readiness confirmation",()=>state().state.reentryNeeded);
set("reentryReady",true);submit("reentryForm");check("Reentry preserves history and starts conservatively",()=>!state().state.reentryNeeded&&state().state.level===0&&state().state.history.length===backup.state.history.length);
env=boot();check("Reentry survives reopening",()=>!env.elements.checkin.hidden&&state().state.reentrySelfReported===true);
set("recovery","normal");set("symptoms","none");submit("pre");check("Reentry prescribes introductory dose",()=>state().active?.decision.workout.runSec===180);
return {environment:"Simulated DOM, clock and localStorage; actual controller and engine. Not real-browser or device execution.",tests,passed:tests.filter(x=>x.pass).length,total:tests.length};
};
harness(read("index.html"),read("workout.js"),read("browser-engine.js"),read("../../shared/running-calculator.js")).then(result=>{console.log(JSON.stringify(result,null,2));if(result.passed!==result.total)process.exitCode=1;});

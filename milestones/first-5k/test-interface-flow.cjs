"use strict";
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,p),"utf8");
const harness=function harness(html,js,bundle,calc){
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
 return {environment:"Simulated DOM, clock and localStorage; actual controller and engine. Not real-browser or device execution.",tests,passed:tests.filter(x=>x.pass).length,total:tests.length};
};
const result=harness(read("index.html"),read("workout.js"),read("browser-engine.js"),read("../../shared/running-calculator.js"));console.log(JSON.stringify(result,null,2));if(result.passed!==result.total)process.exitCode=1;

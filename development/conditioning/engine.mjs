/* BFit Conditioning Training — pure engine prototype. Not public or clinical validation. */
const LADDER = {
  "bridge30": {
    "n": 3,
    "w": 30,
    "r": 90,
    "effort": [
      5,
      6
    ],
    "next": "bridge30x4"
  },
  "bridge30x4": {
    "n": 4,
    "w": 30,
    "r": 90,
    "effort": [
      5,
      6
    ],
    "next": "bridge60x3"
  },
  "bridge60x3": {
    "n": 3,
    "w": 60,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "b60x4"
  },
  "b60x4": {
    "n": 4,
    "w": 60,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "b60x5"
  },
  "b60x5": {
    "n": 5,
    "w": 60,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "b60x6"
  },
  "b60x6": {
    "n": 6,
    "w": 60,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "b120x3",
    "gate": "steady25"
  },
  "b120x3": {
    "n": 3,
    "w": 120,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "b120x4"
  },
  "b120x4": {
    "n": 4,
    "w": 120,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": null
  },
  "hard120x3": {
    "n": 3,
    "w": 120,
    "r": 180,
    "effort": [
      8,
      8
    ],
    "next": "power180x2"
  },
  "power180x2": {
    "n": 2,
    "w": 180,
    "r": 180,
    "effort": [
      8,
      8
    ],
    "next": "power180x3"
  },
  "power180x3": {
    "n": 3,
    "w": 180,
    "r": 180,
    "effort": [
      8,
      8
    ],
    "next": "power180x4"
  },
  "power180x4": {
    "n": 4,
    "w": 180,
    "r": 180,
    "effort": [
      8,
      8
    ],
    "next": null
  },
  "repeat30x6": {
    "n": 6,
    "w": 30,
    "r": 90,
    "effort": [
      6,
      7
    ],
    "next": "repeat30x7"
  },
  "repeat30x7": {
    "n": 7,
    "w": 30,
    "r": 90,
    "effort": [
      6,
      7
    ],
    "next": "repeat30x8"
  },
  "repeat30x8": {
    "n": 8,
    "w": 30,
    "r": 90,
    "effort": [
      6,
      7
    ],
    "next": null
  },
  "repeatHard30x5": {
    "n": 5,
    "w": 30,
    "r": 90,
    "effort": [
      8,
      8
    ],
    "next": "repeatHard30x6"
  },
  "repeatHard30x6": {
    "n": 6,
    "w": 30,
    "r": 90,
    "effort": [
      8,
      8
    ],
    "next": "repeatHard30x7"
  },
  "repeatHard30x7": {
    "n": 7,
    "w": 30,
    "r": 90,
    "effort": [
      8,
      8
    ],
    "next": "repeatHard30x8"
  },
  "repeatHard30x8": {
    "n": 8,
    "w": 30,
    "r": 90,
    "effort": [
      8,
      8
    ],
    "next": null
  },
  "tempo60x4": {
    "n": 4,
    "w": 60,
    "r": 120,
    "effort": [
      6,
      7
    ],
    "next": "tempo180x2"
  },
  "tempo180x2": {
    "n": 2,
    "w": 180,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": "tempo300x2"
  },
  "tempo300x2": {
    "n": 2,
    "w": 300,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": "tempo300x3"
  },
  "tempo300x3": {
    "n": 3,
    "w": 300,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": "tempo360x2",
    "gate": "steady35"
  },
  "tempo360x2": {
    "n": 2,
    "w": 360,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": "tempo480x2"
  },
  "tempo480x2": {
    "n": 2,
    "w": 480,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": "tempo480x3"
  },
  "tempo480x3": {
    "n": 3,
    "w": 480,
    "r": 180,
    "effort": [
      6,
      7
    ],
    "next": null
  }
};
const MODES = ["walk","march","bike","row","elliptical","stairs","run","swim","circuit"];
function screen(p={}){if(p.currentSevere===true)return "emergency";if(p.warning===true)return "medical-review";if(p.pain===true)return "pause-mode";if(p.restricted!==false||p.vigorousSuitable!==true)return "easy-only";return "ok";}

function steady(mode,minutes,level=1,slot="steady"){if(!MODES.includes(mode)||!Number.isInteger(minutes)||minutes<1||minutes>45||![1,2,3,4].includes(level))throw Error("invalid steady");return {kind:"steady",mode,slot,level,minutes,effort:level===1?[2,3]:[4,5],warm:level===1&&minutes<5?120:300,cool:level===1&&minutes<5?120:300};}

function interval(mode,id,slot="interval"){if(!MODES.includes(mode)||["swim","circuit"].includes(mode)||!LADDER[id])throw Error("invalid interval");let {n,w,r,effort}=LADDER[id];return {kind:"interval",mode,slot,id,n,w,r,effort:[...effort],warm:effort[1]===8?480:300,cool:300};}

function bouts(mode,minutes=3){return {...steady(mode,minutes),kind:"bouts",bout:60,rest:60,effort:[2,3]};}

function swim(lengths=4,unit="m",pool=25){if(!Number.isInteger(lengths)||lengths<1||lengths>100||!["m","yd"].includes(unit)||!Number.isFinite(pool)||pool<=0||pool>100)throw Error("invalid pool");return {kind:"swim",mode:"swim",slot:"steady",lengths,unit,pool,effort:[2,3],manual:true};}

function circuit(rounds=2,variant="standard"){if(![2,3].includes(rounds))throw Error("invalid rounds");return {kind:"circuit",mode:"circuit",slot:"circuit",variant,rounds,n:rounds*4,w:30,r:30,effort:[4,6],warm:300,cool:300};}

function phases(d){if(d.kind==="swim")return null;const out=[{type:"warm",seconds:d.warm}];if(d.kind==="steady")out.push({type:"work",seconds:d.minutes*60});else if(d.kind==="bouts"){for(let left=d.minutes*60;left>0;left-=d.bout){out.push({type:"work",seconds:Math.min(left,d.bout)},{type:"recovery",seconds:d.rest});}}else if(["interval","circuit"].includes(d.kind)){for(let i=0;i<d.n;i++)out.push({type:"work",seconds:d.w},{type:"recovery",seconds:d.r});}else throw Error("unknown dose");out.push({type:"cool",seconds:d.cool});return out;}

function seconds(d){const a=phases(d);return a===null?null:a.reduce((n,p)=>n+p.seconds,0);}

function key(d){return JSON.stringify([d.mode,d.kind,d.slot,d.id??null,d.minutes??null,d.n??null,d.w??null,d.r??null,d.effort,d.level??null,d.bout??null,d.rest??null,d.lengths??null,d.pool??null,d.unit??null,d.variant??null,d.warm??null,d.cool??null]);}

function recent(log,now){return Number.isFinite(log.day)&&Number.isFinite(now)&&log.day<=now&&now-log.day<=28;}

function success(l){return l.status==="full"&&l.recovery==="normal"&&l.quality===true&&Number.isFinite(l.effort)&&l.effort>=0&&l.effort<=l.dose.effort[1]&&!l.warning&&!l.pain&&!l.recoveryExtended&&!l.reduced&&!l.external;}

function latestDistinct(logs){const seen=new Set();return logs.slice().sort((a,b)=>b.day-a.day).filter(l=>{if(seen.has(l.day))return false;seen.add(l.day);return true;}).slice(0,2);}
function matched(logs,d,now,setup){const last=latestDistinct(logs.filter(l=>l.dose&&l.dose.mode===d.mode&&l.dose.slot===d.slot&&recent(l,now)&&!l.external));return last.length===2&&last.every(l=>key(l.dose)===key(d)&&l.setup===setup&&success(l));}

function steadyGate(logs,mode,minutes,now,setup){return latestDistinct(logs.filter(l=>l.dose&&l.dose.mode===mode&&l.dose.kind==="steady"&&recent(l,now)&&!l.external)).filter(l=>l.dose.minutes>=minutes&&l.setup===setup&&success(l)).length===2;}

function gate(logs,mode,id,now,setup,slot="interval"){return matched(logs,interval(mode,id,slot),now,setup);}

function initial(p,logs=[],now=0){const s=screen(p);if(["emergency","medical-review","pause-mode"].includes(s))return {action:s,dose:null};const m=p.mode;if(!MODES.includes(m))return {action:"choose-mode",dose:null};if(m==="swim")return p.waterCompetent===true?{action:"swim-easy",dose:swim()}:{action:"lessons-or-land",dose:null};if(m==="run"&&p.recentRun!==true)return {action:"walk-or-run-guide",dose:bouts("walk")};if(m==="circuit")return p.movementsFamiliar===true?{action:"circuit",dose:circuit()}:{action:"learn-movements",dose:null};let level=steadyGate(logs,m,35,now,p.setup)?4:steadyGate(logs,m,25,now,p.setup)?3:steadyGate(logs,m,15,now,p.setup)?2:1;if(s!=="ok")level=1;if(level===1){let base=Number.isFinite(p.comfortableMinutes)?Math.max(0,Math.floor(p.comfortableMinutes)):0;return {action:"base",dose:base<5?bouts(m,Math.max(1,Math.min(3,base||1))):steady(m,Math.min(10,base))};}if(p.goal==="B"&&p.slot==="interval"&&p.days!==1&&s==="ok"&&p.existingHard===false){let id="bridge30";for(const candidate of ["bridge30","bridge30x4","bridge60x3","b60x4","b60x5","b60x6"]){if(gate(logs,m,candidate,now,p.setup)){const next=LADDER[candidate].next;if(next!=="b120x3"||level>=3)id=next;}}return {action:"interval",dose:interval(m,id)};}return {action:"steady",dose:steady(m,level===4?35:level===3?25:15,level)};}

function schedule(p,d){if(!d)return {action:"none",dose:null};if(p.days===0)return {action:"no-visit",dose:null};const hard=d.kind==="interval"||d.kind==="circuit"&&d.effort[1]>5;if(hard&&(screen(p)!=="ok"||p.existingHard!==false||p.adjacentDemand===true||p.recovery!=="normal"))return {action:"easy-or-rest",dose:null};if(d.kind==="interval"&&p.days===1&&!p.externalSteady&&!p.alternatePrepared)return {action:"steady-first",dose:null};if(d.kind==="interval"&&d.effort[1]===8&&p.hardOptIn!==true)return {action:"hard-opt-in-required",dose:null};return {action:"scheduled",dose:d};}
function nextVisit(p,d,logs,now,budget){const rec=recommend(p,d,logs,now);if(!rec.dose)return rec;const route=schedule(p,rec.dose);if(!route.dose)return route;const fit=fitTime(route.dose,budget);return {...fit,recommendation:rec.action};}

function fitTime(d,budget){if(!Number.isFinite(budget)||budget<=0)return {action:"reschedule",dose:null};if(d.kind==="swim")return {action:"manual",dose:d};if(seconds(d)<=budget)return {action:"full",dose:d};if(d.kind==="interval"){let n=Math.floor((budget-d.warm-d.cool)/(d.w+d.r));if(n>=1)return {action:"shortened",dose:reducedDose(d,{n:Math.min(n,d.n)},"time")};}if(d.kind==="steady"){let min=Math.floor((budget-d.warm-d.cool)/60);if(min>=1)return {action:"shortened",dose:reducedDose(d,{minutes:Math.min(min,d.minutes)},"time")};}return {action:"easy-or-reschedule",dose:null};}

function reducedDose(d,changes,reason="recovery"){const original=d.original??{...d};delete original.original;return {...d,...changes,reduced:true,reductionReason:reason,original};}
function reduce(d){if(d.kind==="interval")return reducedDose(d,{n:Math.max(1,Math.floor(d.n*.75)),effort:d.effort[1]===8?[5,6]:d.effort});if(d.kind==="steady"||d.kind==="bouts")return reducedDose(d,{minutes:Math.max(1,Math.floor(d.minutes*.75)),effort:[2,3]});if(d.kind==="circuit")return reducedDose(d,{rounds:2,n:8,w:20});if(d.kind==="swim")return reducedDose(d,{lengths:Math.max(1,Math.floor(d.lengths*.75))});return null;}

function recommend(p,d,logs,now){const s=screen(p);if(["emergency","medical-review","pause-mode"].includes(s))return {action:s,dose:null};const relevant=logs.filter(l=>l.dose?.mode===d.mode&&l.dose.slot===d.slot&&!l.external&&l.day<=now).sort((a,b)=>b.day-a.day);const last=relevant[0];if(logs.some(l=>l.warning===true&&l.resolved!==true&&l.day<=now))return {action:"medical-review",dose:null};if(last?.pain)return {action:"pause-mode",dose:null};if(s!=="ok"&&(d.kind==="interval"||d.effort[1]>5))return {action:"easy-or-rest",dose:null};if(last&&now-last.day>=14)return {action:"return-easier",dose:reduce(d)};if(last&&now-last.day>=7)return {action:"repeat-return",dose:d.effort[1]===8?reduce(d):d};if(last&&(last.recovery==="limiting"||last.recovery==="extra"||last.effort>d.effort[1]||last.quality===false||last.reason==="fatigue"))return {action:"reduce",dose:reduce(d)};if(d.reduced){if(!d.original)return {action:"reassess",dose:d};if(d.reductionReason==="time")return {action:"repeat-planned",dose:d.original};const lastTwo=latestDistinct(relevant.filter(l=>recent(l,now)));if(lastTwo.length===2&&lastTwo.every(l=>key(l.dose)===key(d)&&l.setup===p.setup&&success({...l,reduced:false,dose:{...l.dose,reduced:false}}))){if(d.original.effort[1]===8)return {action:"reassess-hard",dose:d};return {action:"restore-planned",dose:d.original};}return {action:"repeat",dose:d};}if(!matched(logs,d,now,p.setup))return {action:"repeat",dose:d};if(d.kind==="interval"){const q=LADDER[d.id];if(d.id==="repeat30x6"&&p.specialization==="repeat-hard"&&p.hardOptIn===true&&s==="ok"&&p.hardPrepared===true)return {action:"specialize",dose:interval(d.mode,"repeatHard30x5",d.slot)};if(q&&q.next&&(!q.gate||steadyGate(logs,d.mode,Number(q.gate.slice(6)),now,p.setup)))return {action:"progress",dose:interval(d.mode,q.next,d.slot)};if(d.id==="b120x4"){if(p.specialization==="repeat")return {action:"specialize",dose:interval(d.mode,"repeat30x6",d.slot)};if(p.hardOptIn===true&&s==="ok")return {action:"progress",dose:interval(d.mode,"hard120x3",d.slot)};}return {action:"hold-cap",dose:d};}if(d.kind==="steady"){const cap={1:15,2:25,3:35,4:45}[d.level];if(d.minutes>=cap&&d.level<4)return {action:"level-review",dose:d};let min=Math.min(cap,d.minutes+(d.minutes<5?1:d.minutes<10?2:3));return {action:min>d.minutes?"progress":"hold-cap",dose:{...d,minutes:min}};}if(d.kind==="bouts")return {action:"progress",dose:d.minutes>=5?steady(d.mode,5):bouts(d.mode,d.minutes+1)};if(d.kind==="swim")return {action:d.lengths<100?"progress":"hold-cap",dose:{...d,lengths:Math.min(100,d.lengths+1)}};if(d.kind==="circuit")return {action:d.rounds<3?"progress":"hold-cap",dose:circuit(Math.min(3,d.rounds+1),d.variant)};return {action:"repeat",dose:d};}

function comparableOutput(a,b){return !!(a&&b&&a.dose&&b.dose&&key(a.dose)===key(b.dose)&&a.setup&&a.setup===b.setup&&a.unit&&a.unit===b.unit&&Number.isFinite(a.output)&&Number.isFinite(b.output));}

function uniqueExternal(entries){const seen=new Set();return entries.filter(e=>{if(!e.external)return true;const k=JSON.stringify([e.day,e.activity]);if(seen.has(k))return false;seen.add(k);return true;});}

function validActual(d,actual,status){let plan=phases(d);if(!plan||!Array.isArray(actual)||!["full","shortened","skipped"].includes(status))return false;if(status==="skipped")return actual.length===0;if(!actual.length||actual.length>plan.length)return false;for(let i=0;i<actual.length;i++){let a=actual[i],p=plan[i];if(a.type!==p.type||!Number.isInteger(a.seconds)||a.seconds<0||a.seconds>p.seconds||(i<actual.length-1&&a.seconds!==p.seconds))return false;}return status==="full"?actual.length===plan.length&&actual.every((a,i)=>a.seconds===plan[i].seconds):actual.some(a=>a.seconds>0);}
export { latestDistinct, reducedDose, nextVisit, screen, steady, interval, bouts, swim, circuit, phases, seconds, key, recent, success, matched, steadyGate, gate, initial, schedule, fitTime, reduce, recommend, comparableOutput, uniqueExternal, validActual };

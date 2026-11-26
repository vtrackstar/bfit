"use strict";
// Shared dependency-free arithmetic; equivalents are not race predictions.
(function(root,factory){if(typeof module==="object"&&module.exports)module.exports=factory();else root.BFitRunningCalculator=factory();})(typeof globalThis!=="undefined"?globalThis:this,function calculator(){
 const units={m:1,km:1000,mi:1609.344};
 const pos=x=>typeof x==="number"&&Number.isFinite(x)&&x>0;
 function duration(h=0,m=0,s=0){if(![h,m,s].every(x=>Number.isInteger(x)&&x>=0)||m>=60||s>=60)throw Error("Enter valid hours, minutes and seconds");return h*3600+m*60+s;}
 function normalize(x){
 const {distance=null,timeSec=null,pace=null,speed=null,scope="unknown",timeBasis="unknown",surface="unknown"}=x;
 if(!["running-only","runwalk","whole-workout","unknown"].includes(scope)||!["elapsed","moving","unknown"].includes(timeBasis)||!["outdoor","track","treadmill","unknown"].includes(surface))throw Error("Invalid measurement context");
 let d=null,t=timeSec,p=null;
 if(distance!==null){if(!pos(distance.value)||!Object.hasOwn(units,distance.unit))throw Error("Invalid distance");d=distance.value*units[distance.unit];}
 if(t!==null&&!pos(t))throw Error("Invalid time");
 if(pace!==null){if(!pos(pace.seconds)||!["km","mi"].includes(pace.per))throw Error("Invalid pace");p=pace.seconds*1000/units[pace.per];}
 if(speed!==null){if(!pos(speed.value)||!["mph","kmh"].includes(speed.unit))throw Error("Invalid speed");const sp=3600/(speed.value*(speed.unit==="mph"?1.609344:1));if(p!==null&&Math.abs(p-sp)/p>.03)throw Error("Pace and speed disagree");p=p??sp;}
 const entered={distanceM:d,timeSec:t,paceSecKm:p,raw:{distance,timeSec,pace,speed}};
 if(d!==null&&t!==null){const calc=t*1000/d;if(p!==null&&Math.abs(calc-p)/calc>.03)throw Error("Distance, time and pace disagree; check recording scope");p=calc;}
 else if(d!==null&&p!==null)t=d*p/1000;
 else if(t!==null&&p!==null)d=t*1000/p;
 if([d,t,p].some(v=>v!==null&&!pos(v))||d===null&&t===null&&p===null)throw Error("Enter valid measurements");
 return {distanceM:d,timeSec:t,paceSecKm:p,paceSecMile:p===null?null:p*1.609344,kmh:p===null?null:3600/p,mph:p===null?null:3600/p/1.609344,scope,timeBasis,surface,entered,derived:{distance:d!==null&&entered.distanceM===null,time:t!==null&&entered.timeSec===null,pace:p!==null&&entered.paceSecKm===null},comparable:scope==="running-only"&&timeBasis==="elapsed"&&surface!=="unknown"&&d!==null&&t!==null};
 }
 function equivalents(n,distances=[200,400,800,1000,1609.344,5000,10000]){if(!pos(n.paceSecKm))return [];return distances.map(distanceM=>{if(!pos(distanceM))throw Error("Invalid split distance");return {distanceM,timeSec:n.paceSecKm*distanceM/1000};});}
 function format(s){if(!Number.isFinite(s)||s<0)return null;let n=Math.round(s);return n>=3600?`${Math.floor(n/3600)}:${String(Math.floor(n%3600/60)).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`:`${Math.floor(n/60)}:${String(n%60).padStart(2,"0")}`;}
 return {duration,normalize,equivalents,format};
});

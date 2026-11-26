import { phases } from '../engine.mjs';
import { observed } from '../workflow.mjs';
// Each metric refers to the main work only, never warm-up or recovery.
// Output is optional and self-reported. No estimate is derived from elapsed time.
const metrics={walk:["m","km","mi","m/s","km/h","mph"],run:["m","km","mi","m/s","km/h","mph"],bike:["rpm","watts","km","mi"],row:["spm","watts","m"],elliptical:["spm","watts"],stairs:["spm"],march:[],swim:[],circuit:[]};
const metricLabels={rpm:"Average pedal cadence (rpm)",watts:"Average work power (watts)",m:"Work distance (meters)",km:"Work distance (km)",mi:"Work distance (miles)","m/s":"Average work speed (m/s)","km/h":"Average work speed (km/h)",mph:"Average work speed (mph)",spm:"Average work strokes or steps per minute"};
function metricOptions(mode){return (metrics[mode]??[]).map(unit=>({unit,label:metricLabels[unit]}));}
function outputRecord(mode,unit,value){
 if((unit===""||unit==null)&&(value===""||value==null))return {};
 if(!(metrics[mode]??[]).includes(unit)||value===""||value==null||!Number.isFinite(Number(value))||Number(value)<0||Number(value)>1000000)throw Error("Choose a measurement and enter a valid value, or leave both blank.");
 return {output:Number(value),unit};
}
function manualLand(d,values,earlyCooldown=""){
 const list=phases(d);
 if(!list||!Array.isArray(values)||values.length!==list.length)throw Error("Invalid phase record");
 const actual=[];let blank=false,extensions=0;
 for(let i=0;i<list.length;i++){
  const v=values[i];if(v===""||v==null||Number(v)===0){blank=true;continue;}
  if(blank)throw Error("Enter the phases you actually performed in order. Use the separate early cooldown field if you stopped the main work early.");
  const p=list[i],s=Number(v);
  if(!Number.isInteger(s)||s<1||s>p.seconds*(p.type==="recovery"?2:1))throw Error("Enter actual seconds within the stated phase limit.");
  if(s>p.seconds)extensions++;
  actual.push({type:p.type,seconds:s});
 }
 if(extensions>1)throw Error("Record at most one planned recovery extension. If you needed more rest, use a shortened record and note fatigue.");
 if(earlyCooldown!==""&&earlyCooldown!=null&&Number(earlyCooldown)!==0){
  const s=Number(earlyCooldown),last=list.at(-1);
  if(!Number.isInteger(s)||s<1||s>last.seconds||!actual.length||actual.length===list.length)throw Error("Enter an early cooldown only after some activity, without duplicating the regular cooldown.");
  // If all preceding phases were completed, this is the regular cooldown.
  const regular=actual.length===list.length-1&&actual.every((a,i)=>a.seconds>=list[i].seconds);
  actual.push({type:"cool",seconds:s,...(regular?{}:{earlyCooldown:true})});
 }
 const status=actual.length===0?"skipped":observed(d,actual,"full")?"full":"shortened";
 if(!observed(d,actual,status))throw Error("Check the completed phases. Only the final performed phase can be partial before stopping or cooling down.");
 return {actual,status,recoveryExtended:extensions>0};
}
export { metricOptions, outputRecord, manualLand };

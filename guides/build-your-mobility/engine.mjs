// Development draft: goal-specific progression, independent of Gamer Fit state.
export const movements=[
{key:'reach',area:'shoulders',name:'Reach overhead',side:true,steps:['Rest hands on a stable table and move hips back gently.','Stand or sit and raise one arm forward and overhead comfortably.','Hold your arm near the end of your comfortable reach for 3 seconds, then lower slowly.','Raise and lower your arm over 4 seconds each way.']},
{key:'turn',area:'upper-back',name:'Turn your chest',side:true,steps:['Sit with feet planted and hands on thighs; turn chest gently.','Cross arms and turn your chest while hips face forward.','Pause for 3 seconds at a comfortable turn, then return.','Return slowly over 4 seconds without leaning.']},
{key:'hip-in',area:'hips',name:'Turn thigh inward',side:true,steps:['Sit on a sturdy chair, knees bent and feet on the floor. Move the working foot a little outward while keeping the working thigh facing forward; do not force it with your other foot.','Keep thigh facing forward; move foot outward and back.','Hold foot outward for 3 seconds, without forcing the knee.','Return your foot over 4 seconds.']},
{key:'hip-out',area:'hips',name:'Turn thigh outward',side:true,steps:['Sit on a sturdy chair, knees bent and feet on the floor. Move the working foot a little inward while keeping the working thigh facing forward; do not force it with your other foot.','Keep thigh facing forward; move foot inward and back.','Hold foot inward for 3 seconds, then return.','Return your foot over 4 seconds.']},
{key:'knee-lift',area:'hips',name:'Lift your knee',side:true,steps:['Sit and support your thigh with your hands as you lift your knee.','Sit and lift your knee without your hands.','Hold knee lifted for 3 seconds, then lower.','Lower your knee over 4 seconds.']},
{key:'side-shift',area:'lateral',name:'Shift weight sideways',side:true,steps:['Hold sturdy support and shift toward one leg, bending that knee slightly.','Use support as needed and return to center smoothly.','Hold the comfortable side shift for 3 seconds.','Return to center over 4 seconds.']},
{key:'ankle',area:'ankles',name:'Move knee forward over foot',side:true,steps:['Face a wall with hands supported; shift front knee forward slightly, heel down.','Move knee forward and back through comfortable range.','Pause at a comfortable forward position for 3 seconds.','Return slowly over 4 seconds.']},
{key:'foot',area:'ankles',name:'Notice foot pressure',side:false,steps:['Sit with feet planted and notice heel and forefoot pressure.','Stand beside support and shift weight gently forward and back.','With support, pause at a comfortable pressure shift for 3 seconds.','Shift back slowly without losing balance.']},
{key:'hinge',area:'hamstrings',name:'Move hips backward',side:false,steps:['Stand near a wall behind you; soften knees and move hips back a little.','Touch hips gently to wall and stand again.','Pause briefly before standing, keeping balance.','Move hips backward slowly over 4 seconds.']},
{key:'hand',area:'hands',name:'Open and close your hand',side:true,steps:['Rest forearm on a table and gently open fingers.','Open and close your hand and touch thumb to each fingertip.','Pause with fingers comfortably spread for 3 seconds.','Close fingers slowly without squeezing hard.']},
{key:'neck',area:'neck',name:'Turn your head',side:true,steps:['Sit supported and turn head a small comfortable amount.','Turn head comfortably and return without forcing.','Pause briefly at a comfortable turn.','Return slowly without forcing.']},
{key:'chair',area:'knees',name:'Stand from a chair',side:false,steps:['Use a sturdy chair and hands as needed to stand and sit.','Stand and sit with the assistance you need.','Pause just before sitting if comfortable and safe.','Sit slowly over 4 seconds using support as needed.']},

{key:'calf-raise',area:'ankles',name:'Supported calf raise',side:false,strength:true,steps:['Hold a sturdy counter with both hands. Rise a small distance onto the balls of both feet, then lower.','Rise onto both forefeet to a comfortable height and lower with control; keep support.','Pause at the top for 3 seconds and lower slowly.','Lower over 4 seconds while keeping your balance.']},
{key:'lateral-strength',area:'lateral',name:'Supported lateral lunge',side:true,strength:true,steps:['Hold a fixed counter. Take a comfortable wide stance and shift a small distance toward the working leg.','Bend the working knee as hips move back, then push through that foot to return. Use support throughout.','Pause for 3 seconds in a comfortable shallow lunge, then return.','Lower over 4 seconds and return smoothly. Do not chase depth.']},
{key:'hinge-strength',area:'hamstrings',name:'Romanian deadlift practice',side:false,strength:true,steps:['Practice an unloaded hip hinge: soften knees, move hips back, then stand.','Hinge with empty hands or two light dumbbells if already familiar with lifting. Keep weights close to thighs.','Pause briefly where you can maintain control, then stand.','Lower over 4 seconds with manageable resistance. Stop before losing control.']},
{key:'knee-strength',area:'hips',name:'Standing supported knee lift',side:true,strength:true,steps:['Hold a sturdy counter, shift weight onto the other leg and lift the working knee slightly.','Lift the working knee to a comfortable height without leaning back; lower slowly.','Hold the knee up for 3 seconds while breathing normally.','Lower over 4 seconds. Maintain hand support as needed.']},
{key:'wall-slide',area:'shoulders',name:'Wall slide',side:false,strength:true,steps:['Face a wall with forearms resting against it at a comfortable height. Slide upward a small distance and return.','Slide forearms upward and down through comfortable range, letting shoulder blades move.','Pause for 3 seconds at a comfortable height, then return.','Slide down slowly over 4 seconds without forcing the shoulders.']},
{key:'wrist-load',area:'hands',name:'Supported wall hand pressure',side:false,strength:true,steps:['Place palms on a wall at a comfortable height and stand close. Gently shift a little weight toward your hands.','Shift toward the wall and return with manageable pressure. Keep feet grounded.','Hold light pressure for 3 seconds, then release.','Gradually release pressure over 4 seconds. Avoid painful wrist positions.']}

];
export const coaching={
  "reach": [
    "Practice reaching a shelf or raising an arm overhead.",
    "Muscular effort around the shoulder or a mild stretch along the side of your body.",
    "Raise the arm only partway; sit if standing is difficult.",
    "Shoulder pinching or sharp pain."
  ],
  "turn": [
    "Practice turning your chest to look or reach to the side.",
    "Gentle effort around your ribs or upper back.",
    "Keep hands on thighs and turn a shorter distance.",
    "Sharp back or rib pain."
  ],
  "hip-in": [
    "Practice turning the thigh inward without twisting the knee.",
    "Effort around the hip; a stretch is optional.",
    "Move the working foot outward a shorter distance.",
    "Groin pinching or knee pain."
  ],
  "hip-out": [
    "Practice turning the thigh outward, as when preparing to sit cross-legged.",
    "Effort around the hip or buttock.",
    "Move the working foot inward a shorter distance.",
    "Groin pinching or knee pain."
  ],
  "knee-lift": [
    "Practice lifting the thigh for stairs or stepping over an object.",
    "Effort at the front of the hip or thigh.",
    "Lift less high or support the thigh with your hands.",
    "Sharp groin pain or pinching."
  ],
  "side-shift": [
    "Practice moving your weight toward one leg.",
    "Pressure under the working foot and effort in the thigh or hip.",
    "Use both hands on support and shift less.",
    "Sharp groin or knee pain, or loss of balance."
  ],
  "ankle": [
    "Practice moving your shin forward over your foot.",
    "A mild calf stretch or effort around the ankle.",
    "Move the knee a shorter distance with the heel down.",
    "Pinching at the front of the ankle or sharp pain."
  ],
  "foot": [
    "Notice how pressure changes under your feet.",
    "Changing pressure under the heel and forefoot.",
    "Stay seated with both feet planted.",
    "New numbness, dizziness or loss of balance."
  ],
  "hinge": [
    "Practice bending at the hips for reaching toward the floor.",
    "Mild tension behind the thighs or effort around the hips.",
    "Stand closer to the wall and move a shorter distance.",
    "Sharp back or leg pain."
  ],
  "hand": [
    "Practice opening your fingers and coordinating your thumb.",
    "Light muscular effort in the hand or forearm.",
    "Move fewer fingers at once or use a smaller motion.",
    "Pain, tingling or locking."
  ],
  "neck": [
    "Practice turning your head to look to the side.",
    "Gentle movement or mild tension around the neck.",
    "Turn a shorter distance without pulling with your hands.",
    "Dizziness, new headache, radiating symptoms or sharp pain."
  ],
  "chair": [
    "Practice standing up and sitting down with control.",
    "Effort in the thighs and buttocks.",
    "Use a higher stable seat or hand support.",
    "Sharp pain, dizziness or loss of balance."
  ],
  "calf-raise": [
    "Build strength for rising onto your toes and controlling the descent.",
    "Effort in the calves.",
    "Rise a shorter distance with both hands supported.",
    "Sharp calf, heel or ankle pain."
  ],
  "lateral-strength": [
    "Build strength while lowering sideways and pushing back to the middle.",
    "Effort in the working thigh and hip; the other inner thigh may feel a mild stretch.",
    "Use a narrower stance and shallower bend.",
    "Sharp groin or knee pain, or instability."
  ],
  "hinge-strength": [
    "Build strength through the hip hinge, including controlled lowering.",
    "Effort in the buttocks and back of the thighs.",
    "Use no weights and shorten the hinge.",
    "Sharp back or leg pain."
  ],
  "knee-strength": [
    "Build control of the raised thigh while standing.",
    "Effort at the front of the lifted hip and in the supporting leg.",
    "Lift less high and keep both hands on support.",
    "Groin pinching or loss of balance."
  ],
  "wall-slide": [
    "Practice overhead movement with light wall support.",
    "Gentle effort around the shoulders and upper back.",
    "Slide a shorter distance.",
    "Shoulder pinching or sharp pain."
  ],
  "wrist-load": [
    "Gradually practice accepting light pressure through your hands.",
    "Light pressure in the palms and muscular effort around the forearms.",
    "Stand closer to the wall and shift less weight.",
    "Wrist pain, tingling or numbness."
  ]
};
export const modes=['general','targeted','control','complement'];
export const identity=item=>item.key+':'+item.side;
export const estimateSeconds=item=>(movements.find(m=>m.key===item.key)?.strength?90:45)+item.reps*(item.level===3?8:item.level===2?7:4);
export function buildPlan({mode='general',area='hips',difficulty='active',minutes=10,side='both',flexible=false,existing=[],previous=[],strength=false,movement='all',now=new Date().toISOString()}={}){
 if(!modes.includes(mode))throw Error('Unknown mode');
 let list=mode==='general'?['foot','ankle','knee-lift','turn','reach','hinge'].map(k=>movements.find(m=>m.key===k)):movements.filter(m=>m.area===area&&(!m.strength||strength));
 if(mode!=='general'&&movement!=='all')list=list.filter(m=>m.key===movement);
 if(mode!=='general'&&strength&&movement==='all')list=[...list.filter(m=>m.strength),...list.filter(m=>!m.strength)];
 if(mode==='complement')list=list.filter(m=>!existing.includes(m.key));
 const level=({assisted:0,active:1,hold:2,return:3,awareness:0,maintain:1}[difficulty]??1);
 const budget=Math.max(5,Math.min(25,Number(minutes)||10))*60;
 let spent=0,plan=[];
 for(const m of list){
 const sides=m.side?(side==='both'?['left','right']:[side==='left'?'left':'right']):['both'];
 const group=sides.map(s=>{
 const prior=previous.find(i=>i.key===m.key&&i.side===s);
 const controlOnly=flexible||mode==='control';
 if(!prior)return {key:m.key,side:s,level:m.strength?0:level,reps:4,streak:0,paused:false,maintain:difficulty==='maintain',controlOnly,history:[]};
 const last=prior.history.at(-1);
 const gap=last?(Date.parse(now)-Date.parse(last.date))/86400000:0;
 return {...prior,maintain:difficulty==='maintain',controlOnly,streak:gap>=7||prior.maintain!==(difficulty==='maintain')||prior.controlOnly!==controlOnly?0:prior.streak,recheck:prior.recheck||gap>=14};
 });
 const cost=group.reduce((a,i)=>a+(i.paused?0:estimateSeconds(i)),0);
 if(spent+cost>budget)continue;
 plan.push(...group);spent+=cost;
 }
 return plan;
}
export function feedback(item,result,recovered=true,goalMet=false,date=new Date().toISOString()){
 if(item.paused)return item;
 if(!['pain','comfortable','challenging','help','uncontrolled'].includes(result))throw Error('Unknown feedback');
 if(item.history.some(h=>h.date.slice(0,10)===date.slice(0,10))&&result!=='pain')return item;
 const next={...item,history:[...item.history,{date,result,recovered,level:item.level,reps:item.reps}]};
 if(result==='pain'){next.paused=true;next.streak=0;return next;}
 if(goalMet&&result==='comfortable'&&recovered){next.maintain=true;next.streak=0;return next;}
 if(result==='help'||result==='uncontrolled'){next.level=Math.max(0,item.level-1);if(item.level===0)next.reps=Math.max(2,item.reps-1);next.streak=0;return next;}
 if(result!=='comfortable'||!recovered||item.maintain){next.streak=0;return next;}
 const last=item.history.at(-1);
 const gap=last?(Date.parse(date)-Date.parse(last.date))/86400000:0;
 if(gap>=14){next.streak=0;next.recheck=true;return next;}
 if(item.recheck){next.recheck=false;next.streak=0;return next;}
 if(gap>=7){next.streak=0;return next;}
 next.streak=item.streak+1;
 if(next.streak>=2){
 if(item.level===0||item.level===1){next.level=item.level+1;}
 else if(item.reps<8){next.reps=item.reps+1;}
 next.streak=0;
 }
 return next;
}
export function instruction(item){const m=movements.find(m=>m.key===item.key);if(!m)return '';const base=item.level>=2?m.steps[1]+' '+m.steps[item.level]:m.steps[item.level];return base+(item.controlOnly?' Stay within your familiar comfortable range; do not aim for extra depth.':'');}
export function needsRecheck(item,now=new Date().toISOString()){const last=item.history.at(-1);return !!item.recheck||!!last&&(Date.parse(now)-Date.parse(last.date))/86400000>=14;}


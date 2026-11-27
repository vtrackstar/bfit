// Development draft: goal-specific progression, independent of Gamer Fit state.
export const movements=[
{key:'reach',area:'shoulders',name:'Reach overhead',side:true,steps:['Rest hands on a stable table and move hips back gently.','Stand or sit and raise one arm forward and overhead comfortably.','Hold your arm near the end of your comfortable reach for 3 seconds, then lower slowly.','Raise and lower your arm over 4 seconds each way.']},
{key:'turn',area:'upper-back',name:'Turn your chest',side:true,steps:['Sit with feet planted and hands on thighs; turn chest gently.','Cross arms and turn your chest while hips face forward.','Pause for 3 seconds at a comfortable turn, then return.','Return slowly over 4 seconds without leaning.']},
{key:'hip-in',area:'hips',name:'Turn thigh inward',side:true,steps:['Sit on a sturdy chair, knee bent; gently guide your foot outward with your other foot if comfortable.','Keep thigh facing forward; move foot outward and back.','Hold foot outward for 3 seconds, without forcing the knee.','Return your foot over 4 seconds.']},
{key:'hip-out',area:'hips',name:'Turn thigh outward',side:true,steps:['Sit on a sturdy chair; gently guide foot inward with your other foot if comfortable.','Keep thigh facing forward; move foot inward and back.','Hold foot inward for 3 seconds, then return.','Return your foot over 4 seconds.']},
{key:'knee-lift',area:'hips',name:'Lift your knee',side:true,steps:['Sit and support your thigh with your hands as you lift your knee.','Sit and lift your knee without your hands.','Hold knee lifted for 3 seconds, then lower.','Lower your knee over 4 seconds.']},
{key:'side-shift',area:'lateral',name:'Shift weight sideways',side:true,steps:['Hold sturdy support and shift toward one leg, bending that knee slightly.','Use support as needed and return to center smoothly.','Hold the comfortable side shift for 3 seconds.','Return to center over 4 seconds.']},
{key:'ankle',area:'ankles',name:'Move knee forward over foot',side:true,steps:['Face a wall with hands supported; shift front knee forward slightly, heel down.','Move knee forward and back through comfortable range.','Pause at a comfortable forward position for 3 seconds.','Return slowly over 4 seconds.']},
{key:'foot',area:'ankles',name:'Notice foot pressure',side:false,steps:['Sit with feet planted and notice heel and forefoot pressure.','Stand beside support and shift weight gently forward and back.','With support, pause at a comfortable pressure shift for 3 seconds.','Shift back slowly without losing balance.']},
{key:'hinge',area:'hamstrings',name:'Move hips backward',side:false,steps:['Stand near a wall behind you; soften knees and move hips back a little.','Touch hips gently to wall and stand again.','Pause briefly before standing, keeping balance.','Move hips backward slowly over 4 seconds.']},
{key:'hand',area:'hands',name:'Open and close your hand',side:true,steps:['Rest forearm on a table and gently open fingers.','Open and close your hand and touch thumb to each fingertip.','Pause with fingers comfortably spread for 3 seconds.','Close fingers slowly without squeezing hard.']},
{key:'neck',area:'neck',name:'Turn your head',side:true,steps:['Sit supported and turn head a small comfortable amount.','Turn head comfortably and return without forcing.','Pause briefly at a comfortable turn.','Return slowly without forcing.']},
{key:'chair',area:'knees',name:'Stand from a chair',side:false,steps:['Use a sturdy chair and hands as needed to stand and sit.','Stand and sit with the assistance you need.','Pause just before sitting if comfortable and safe.','Sit slowly over 4 seconds using support as needed.']}
];
export const modes=['general','targeted','control','complement'];
export const identity=item=>item.key+':'+item.side;
export const estimateSeconds=item=>45+item.reps*(item.level===3?8:item.level===2?7:4);
export function buildPlan({mode='general',area='hips',difficulty='active',minutes=10,side='both',flexible=false,existing=[],previous=[]}={}){
 if(!modes.includes(mode))throw Error('Unknown mode');
 let list=mode==='general'?['foot','ankle','knee-lift','turn','reach','hinge'].map(k=>movements.find(m=>m.key===k)):movements.filter(m=>m.area===area);
 if(mode==='complement')list=list.filter(m=>!existing.includes(m.key));
 const level=({assisted:0,active:1,hold:2,return:3,awareness:0,maintain:1}[difficulty]??1);
 const budget=Math.max(5,Math.min(25,Number(minutes)||10))*60;
 let spent=0,plan=[];
 for(const m of list){
 const sides=m.side?(side==='both'?['left','right']:[side==='left'?'left':'right']):['both'];
 const group=sides.map(s=>previous.find(i=>i.key===m.key&&i.side===s)||{key:m.key,side:s,level:level===1&&(flexible||mode==='control')?1:level,reps:4,streak:0,paused:false,maintain:difficulty==='maintain',controlOnly:flexible||mode==='control',history:[]});
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
 if(goalMet){next.maintain=true;next.streak=0;return next;}
 if(result==='help'||result==='uncontrolled'){next.level=Math.max(0,item.level-1);next.streak=0;return next;}
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
export function instruction(item){return movements.find(m=>m.key===item.key)?.steps[item.level]||'';}

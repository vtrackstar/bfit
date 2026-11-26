
(function(){
'use strict';
var key='bfit-50plus-v1';
var allowedGoals=['balance','floor','reach','stairs','carry','stamina'];
var allowedTry=['walking','cycling','swimming','dance','golf','pickleball','group','pilates','tai-chi'];
var names={walking:'Walking',cycling:'Cycling',swimming:'Swimming or water walking',dance:'Dancing or low-impact aerobics',golf:'Golf',pickleball:'Pickleball',group:'Group fitness',pilates:'Reformer Pilates','tai-chi':'Tai chi or gentle yoga'};
var goals={
 balance:{name:'Staying steady',why:'Practices controlled shifting of weight and taking steps, which contribute to balance and coordination.',start:'Near a sturdy counter, try slow weight shifts with hands supported.',next:'Progress to small supported steps in several directions. Reduce hand support only when safe.'},
 floor:{name:'Bending down and getting up',why:'Combines leg strength, hip movement, and a practiced strategy for getting to or from the floor.',start:'Practice comfortable sit-to-stands and a supported hip hinge.',next:'With appropriate support, learn a half-kneeling transition or assisted floor-to-stand technique. Seek professional guidance if needed.'},
 reach:{name:'Reaching overhead',why:'Practices shoulder movement, positioning, and strength for reaching comfortably.',start:'Try wall slides or comfortable unloaded overhead reaching.',next:'Progress to light, controlled overhead resistance if your shoulders tolerate it.'},
 stairs:{name:'Climbing stairs',why:'Uses leg strength, one-leg control, calf strength, and endurance.',start:'Practice sit-to-stands, calf raises, and low step-ups while holding a railing.',next:'Slowly increase step repetitions or height only when control is good.'},
 carry:{name:'Carrying bags and groceries',why:'Trains gripping, carrying, and keeping your body steady while walking.',start:'Carry one light bag a short distance on level ground.',next:'Try farmer carries with two light loads or a suitcase carry with one, increasing gradually.'},
 stamina:{name:'Walking longer',why:'Improves heart and lung endurance and comfort during longer outings.',start:'Begin with a comfortable walk and a planned turnaround point.',next:'Add a few minutes when the usual walk starts to feel easier.'}
};
var strength={
 machines:{intro:'Machines guide the movement and let you adjust resistance. Ask gym staff to show you how to set the seat, handles, and weight.',items:['Leg press or sit-to-stand from a bench','Seated row','Chest press','Calf raise','Comfortable shoulder press or substitute']},
 dumbbells:{intro:'Handheld weights give you plenty of options. Choose dumbbells or other loads you can move comfortably while staying steady.',items:['Sit-to-stand or goblet squat to a chair','Supported one-arm row','Light floor or incline press','Calf raise with support','Light farmer carry']},
 home:{intro:'A stable chair, wall, and optional resistance band can provide a useful starting strength routine.',items:['Sit-to-stand from a stable chair','Band row or supported pull','Wall push-up','Supported calf raise','Short, controlled carry with a light bag']}
};
var schedule={
 2:[['Tue','strength'],['Sat','combo']],
 3:[['Mon','strength'],['Wed','cardio'],['Sat','combo']],
 4:[['Mon','strength'],['Tue','cardio'],['Thu','strength'],['Sat','explore']],
 5:[['Mon','strength'],['Tue','cardio'],['Wed','balance'],['Fri','strength'],['Sat','explore']],
 6:[['Mon','strength'],['Tue','cardio'],['Wed','balance'],['Thu','strength'],['Fri','cardio'],['Sat','explore']],
 7:[['Mon','strength'],['Tue','cardio'],['Wed','balance'],['Thu','strength'],['Fri','cardio'],['Sat','explore'],['Sun','recovery']]
};
function el(id){return document.getElementById(id);}
function choose(selector){return Array.from(document.querySelectorAll(selector+':checked')).map(function(e){return e.value;});}
function validValue(value,values,fallback){return values.indexOf(String(value))!==-1?String(value):fallback;}
function defaultState(){return {level:'new',ageGroup:'50-64',days:'4',minutes:'20',confidence:'steady',mainCardio:'walking',strengthStyle:'machines',activities:['walking'],goals:[],tries:[],reviews:{}};}
var state=defaultState();
try{var old=JSON.parse(localStorage.getItem(key)||'null');if(old && typeof old==='object') state=normalize(old);}catch(e){}
function cardioOptions(selected){return selected.filter(function(id){return ['walking','cycling','swimming','dance'].includes(id);});}
function preferredCardio(selected,preferred){
 var options=cardioOptions(selected);
 return options.includes(preferred)?preferred:options[0]||'walking';
}
function normalize(s){
 var d=defaultState();
 var selected=Array.isArray(s.activities)?s.activities:[s.mainCardio||'walking'].concat(Array.isArray(s.tries)?s.tries:[]);
 selected=selected.filter(function(x,i,a){return allowedTry.indexOf(x)!==-1&&a.indexOf(x)===i;}).slice(0,3);
 if(!selected.length)selected=['walking'];
 var cardio=preferredCardio(selected,s.mainCardio);
 return {level:validValue(s.level,['new','returning','active'],d.level),ageGroup:validValue(s.ageGroup,['50-64','65-plus'],d.ageGroup),days:validValue(s.days,['2','3','4','5','6','7'],d.days),minutes:validValue(s.minutes,['10','20','30','45'],d.minutes),confidence:validValue(s.confidence,['steady','support','review'],d.confidence),mainCardio:cardio,strengthStyle:validValue(s.strengthStyle,['machines','dumbbells','home'],d.strengthStyle),activities:selected,goals:Array.isArray(s.goals)?s.goals.filter(function(g,i,a){return allowedGoals.indexOf(g)!==-1 && a.indexOf(g)===i;}).slice(0,3):d.goals,tries:selected.filter(function(x){return x!==cardio;}),reviews:s.reviews&&typeof s.reviews==='object'&&!Array.isArray(s.reviews)?s.reviews:{}};
}
function apply(){
 ['level','ageGroup','days','minutes','confidence','strengthStyle'].forEach(function(k){if(el(k))el(k).value=state[k];});
 document.querySelectorAll('[data-goal]').forEach(function(x){x.checked=state.goals.indexOf(x.value)!==-1;});
 document.querySelectorAll('[data-activity]').forEach(function(x){x.checked=state.activities.indexOf(x.value)!==-1;});
}
function persist(){
 try{localStorage.setItem(key,JSON.stringify(state));}
 catch(e){if(el('saveStatus'))el('saveStatus').textContent='Your browser could not save these choices. Download a backup if you want to keep them.';}
}
function update(){
 ['level','ageGroup','days','minutes','confidence','strengthStyle'].forEach(function(k){if(el(k))state[k]=el(k).value;});
 if(document.querySelector('[data-goal]'))state.goals=choose('[data-goal]');
 if(document.querySelector('[data-activity]')){
   state.activities=state.activities.filter(function(x){return !!document.querySelector('[data-activity][value="'+x+'"]:checked');});
   document.querySelectorAll('[data-activity]:checked').forEach(function(x){if(state.activities.indexOf(x.value)===-1)state.activities.push(x.value);});
   if(!state.activities.length){state.activities=['walking'];document.querySelector('[data-activity][value="walking"]').checked=true;}
   var options=cardioOptions(state.activities);
   state.mainCardio=preferredCardio(state.activities,state.mainCardio);
   if(el('preferredCardio')){
     el('preferredCardio').replaceChildren(...options.map(function(id){return new Option(names[id],id);}));
     el('preferredCardio').value=state.mainCardio;
     el('preferredCardioField').hidden=options.length<2;
   }
   state.tries=state.activities.filter(function(x){return x!==state.mainCardio;});
   if(el('activityMessage'))el('activityMessage').textContent=state.activities.length+' of 3 activities selected. '+(!options.length?'Walking will be suggested for cardio.':'You can change your main cardio choice above when you select more than one.');
 }
 if(el('ageAdvice'))el('ageAdvice').textContent=state.ageGroup==='65-plus'?'For adults 65 and older, CDC guidance includes aerobic activity, strength, and balance practice each week. Start at a level that fits you.':'For adults 50–64, regular aerobic activity and strength training are recommended. Balance work can help at any age.';
 if(el('safetyNote'))el('safetyNote').hidden=state.confidence!=='review';
 if(el('movementSafety'))el('movementSafety').hidden=state.confidence!=='review';
 if(el('goalMessage'))el('goalMessage').textContent=state.goals.length+' of 3 priorities selected.';
 if(el('selectionSummary'))el('selectionSummary').textContent='Activity: '+(names[state.mainCardio]||'Walking')+' · Priorities: '+(state.goals.length?state.goals.map(function(x){return goals[x].name;}).join(', '):'None chosen yet')+'. Change these on page 2 if you want.';
 renderGoals();renderStrength();renderPlan();persist();
}
function renderGoals(){
 if(!el('goalResults'))return;
 var clinicianFirst=state.confidence==='review';
 el('goalResults').innerHTML=state.goals.map(function(id){var g=goals[id];
  if(clinicianFirst)return '<article class="goal-result"><h3>'+g.name+'</h3><p>'+g.why+'</p><p class="tip"><strong>Talk through this first:</strong> Ask a healthcare professional which supported movements are safe for you before starting.</p></article>';
  return '<article class="goal-result"><h3>'+g.name+'</h3><p>'+g.why+'</p><p><strong>Try first:</strong> '+g.start+'</p><p class="tip"><strong>When ready:</strong> '+g.next+'</p></article>';
 }).join('')||'<p class="hint">Select a priority to see exercises that connect to everyday life.</p>';
}
function renderStrength(){
 if(!el('strengthRoutine'))return;
 var suggestion=el('firstMovementSuggestion');
 if(state.confidence==='review'){
  suggestion.textContent='Check with your clinician about which movements and support to use for your first session.';
 } else {
  var third=state.goals.includes('reach')?'a comfortable overhead reach':state.goals.includes('stairs')&&state.confidence==='steady'?'a low step-up with a secure railing':'a heel raise holding a sturdy counter';
  suggestion.textContent='Unsure what to pick? Start with standing up from a sturdy chair and a wall push-up. If you have time and the support you need, try '+third+'. You can swap any of these for a movement below that suits you.';
 }
 if(state.confidence==='review'){
  el('strengthIntro').textContent='With recent or repeated falls, or unexplained dizziness, your first step is a healthcare review before starting a new exercise program.';
  el('strengthRoutine').innerHTML='<div class="notice warn"><strong>Discuss a supported starting point first.</strong> Ask which seated or supported movements fit your situation. Examples to discuss are seated marching, ankle movements, and sitting down and standing up with help. Follow that guidance before trying standing balance or floor drills.</div>';
  return;
 }
 var s=strength[state.strengthStyle];
 el('strengthIntro').textContent=s.intro;
 el('strengthRoutine').innerHTML='<h3>Simple full-body starting session</h3><ol class="ex-list">'+s.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ol><p class="hint">Try these exercises on your strength days. Add a supported goal-specific drill from your priorities when appropriate. Start easy, assess how you recover, and progress gradually.</p>';
}
function timeFor(type){
 var m=Number(state.minutes);
 if(state.level==='new') m=Math.min(m,20);
 if(state.level==='returning')m=Math.min(m,30);
 if(type==='balance')return '5–10 minutes';
 if(type==='combo')return Math.max(10,m)+' minutes total, with shorter portions of each activity';
 if(type==='explore')return 'A comfortable introductory session; shorter than '+m+' minutes is fine';
 if(type==='recovery')return 'As little or as much gentle movement as feels comfortable';
 return 'About '+m+' minutes as tolerated';
}
function renderPlan(){
 if(!el('weekPlan'))return;
 var cardioChosen=state.activities.some(function(x){return ['walking','cycling','swimming','dance'].indexOf(x)!==-1;});
 var main=names[state.mainCardio];
 var secondary=state.tries.length?names[state.tries[0]]:main;
 if(state.confidence==='review'){
   var requested=state.activities.map(function(x){return names[x];}).join(', ');
   el('planSummary').innerHTML='<h3>Your next step: discuss a safe starting plan</h3><p>You reported recent or repeated falls or unexplained dizziness. Start with a healthcare professional or physical therapist who can help you choose safe activity. If you feel dizzy now, stop exercising and seek medical guidance.</p><p><strong>Activities you might enjoy later:</strong> '+requested+'.</p>';
   el('weekPlan').innerHTML='<article class="day"><span class="day-name">First</span><strong>Ask about your falls or dizziness</strong><p>Bring up any recent falls, faintness, medications, and activities that feel unsafe. A professional can advise whether an evaluation or supervision is needed.</p></article><article class="day"><span class="day-name">After guidance</span><strong>Ask about seated or supported options</strong><p>Examples to discuss: seated marching, ankle movements, gentle sit-to-stands with help, or supported weight shifts. Follow the specific recommendations you receive.</p></article>';
   el('planExerciseDetails').innerHTML='<h3>Wait for a safe starting plan</h3><p>After a professional has evaluated the falls or dizziness, return to this guide and select exercises that fit their recommendations.</p>';
   return;
 }
 var cards=schedule[Number(state.days)]||schedule[4];
 var count=cards.filter(function(x){return x[1]==='strength'||x[1]==='combo';}).length;
 var strengthDay=0;
 var html=cards.map(function(p){
 var kind=p[1],title='',desc='';
 if(kind==='strength'){title='Full-body strength + supported balance';desc='Follow your chosen strength exercises. '+timeFor(kind)+'.';}
 if(kind==='combo'){title='Full-body strength + '+main.toLowerCase();desc='Split the time between simple resistance exercises, safe balance practice, and easy cardio. '+timeFor(kind)+'.';}
 if(kind==='cardio'){title=main;desc='Move at a comfortable pace. If it becomes moderate exercise, you should still be able to talk. '+timeFor(kind)+'.';}
 if(kind==='balance'){title='Gentle movement + balance';desc='Try supported steps, ankle movement, or a relaxed walk. '+timeFor(kind)+'.';}
 if(kind==='explore'){title=state.tries.length?'Try '+secondary:'Enjoy '+main.toLowerCase();desc=state.tries.length?'Choose a beginner or supported version. Start with a short session and learn the movements first. '+timeFor(kind)+'.':'Repeat an enjoyable activity, or try a new one when you feel ready. '+timeFor(kind)+'.';if(state.confidence==='support'&&state.tries[0]==='pickleball'){title='Explore pickleball safely';desc='Ask about a beginner lesson and discuss quick stops and turns before playing. Choose supported or lower-impact movement today if you feel unsteady.';}}
 if(kind==='recovery'){title='Recovery movement';desc='An easy walk, gentle mobility, or rest depending on how you feel. '+timeFor(kind)+'.';}
 var priorityTip='';
 if((kind==='strength'||kind==='combo') && state.goals.length){
   var choices=state.goals.filter(function(id,i){return i%count===strengthDay;});
   if(!choices.length)choices=[state.goals[strengthDay%state.goals.length]];
   if(choices.length>1)priorityTip='<p>Choose one of these for today:</p>';
   choices.forEach(function(id){var goal=goals[id];priorityTip+='<p><strong>'+goal.name+':</strong> '+goal.start+'</p>';});
   strengthDay++;
 }
 return '<article class="day"><span class="day-name">'+p[0]+'</span><strong>'+title+'</strong><p>'+desc+'</p>'+priorityTip+'</article>';
 }).join('');
 var caution=state.confidence==='support'?'Use stable support for balance work. Consider seated or supported versions first and ask for professional advice if you are unsure about falling.':'Keep balance practice controlled, with stable support nearby.';

 var note='Your starting schedule includes '+count+' strength sessions and '+state.days+' planned activity days. Build cardio time gradually as your comfort and recovery allow.';
 el('planSummary').innerHTML='<h3>Your starting week</h3><p><strong>'+(cardioChosen?'Cardio you selected:':'Suggested cardio:')+'</strong> '+main+' · <strong>Strength:</strong> '+(state.strengthStyle==='home'?'At home':state.strengthStyle==='machines'?'Gym machines':'Dumbbells or kettlebells')+' · <strong>Time:</strong> '+state.minutes+' minutes available per session.</p><p>'+note+'</p><p><strong>Safety:</strong> '+caution+'</p>';
 el('weekPlan').innerHTML=html;
 var list=strength[state.strengthStyle].items.map(function(x){return '<li>'+x+'</li>';}).join('');
 var priority=state.goals.length?'<p><strong>Your everyday priorities:</strong> '+state.goals.map(function(x){return goals[x].name;}).join(', ')+'</p>':'';
 el('planExerciseDetails').innerHTML='<h3>What to do on strength days</h3><p>Warm up with 3–5 minutes of comfortable marching, shoulder rolls, or ankle movement. Then try one set of 6–10 comfortable reps for each suitable movement. Leave about 2–3 more good reps in reserve. Rest as needed.</p><ol class="ex-list">'+list+'</ol>'+priority+'<p class="hint">For the six basic movement walkthroughs, see <a href="#first-workout">Your first strength session</a> above. Use stable support for balance practice.</p>';
}
function fileDownload(name,content,type){
 var blob=new Blob([content],{type:type}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function backup(){fileDownload('BFit-50plus-answers.json',JSON.stringify({version:1,answers:state},null,2),'application/json');el('saveStatus').textContent='A copy of your choices was downloaded. Keep it somewhere you can find it.';}
function planText(){
 var summary=el('planSummary').innerText;
 var days=Array.from(el('weekPlan').querySelectorAll('.day')).map(function(e){return e.innerText.replace(/\n+/g,' — ');}).join('\n');
 var priorities=state.goals.map(function(x){return goals[x].name+': '+(state.confidence==='review'?'Discuss safe exercise options with a healthcare professional':goals[x].start);}).join('\n');
 var exercise=el('planExerciseDetails').innerText;
 return 'BFit 50+ | Keep Moving\n\n'+summary+'\n\nYOUR WEEK\n'+days+'\n\nYOUR EXERCISES / NEXT STEPS\n'+exercise+'\n\nEVERYDAY PRIORITIES\n'+priorities+'\n\nFour-week discovery: Week 1 get comfortable; Week 2 try something new; Week 3 build a little if recovery is good; Week 4 review and keep favorites.\n\nSource: https://vtrackstar.github.io/bfit/guides/50-plus/\n';
}
function updateReview(){
 if(!el('weekReview'))return;
 var w=el('weekReview').value;
 var r=state.reviews[w]||{};
 document.querySelectorAll('#reviewChecks input').forEach(function(e){e.checked=Array.isArray(r.checks)&&r.checks.indexOf(e.value)!==-1;});
 el('confidenceRating').value=validValue(r.rating,['1','2','3','4','5'],'');
 el('reviewStatus').textContent=r.checks||r.sessions?'Previously saved for week '+w+'.':'';
 document.querySelectorAll('#sessionChecks input').forEach(function(e){e.checked=Array.isArray(r.sessions)&&r.sessions.indexOf(e.value)!==-1;});
}
document.querySelectorAll('select').forEach(function(e){
 if(e.id==='preferredCardio')e.addEventListener('change',function(){state.mainCardio=e.value;update();});
 else if(['weekReview','confidenceRating'].indexOf(e.id)===-1)e.addEventListener('change',update);
});
document.querySelectorAll('[data-goal]').forEach(function(x){x.addEventListener('change',function(){
 if(choose('[data-goal]').length>3){x.checked=false;el('goalMessage').textContent='Choose no more than three priorities.';return;}update();
});});
document.querySelectorAll('[data-activity]').forEach(function(x){x.addEventListener('change',function(){
 if(x.checked&&choose('[data-activity]').length>3){x.checked=false;el('activityMessage').textContent='Choose up to three activities.';return;}
 if(x.checked){state.activities=state.activities.filter(function(a){return a!==x.value;});state.activities.push(x.value);if(cardioOptions([x.value]).length)state.mainCardio=x.value;}
 else state.activities=state.activities.filter(function(a){return a!==x.value;});
 if(!state.activities.length){state.activities=['walking'];document.querySelector('[data-activity][value="walking"]').checked=true;}
 update();
});});
if(el('savePlan'))el('savePlan').addEventListener('click',function(){fileDownload('BFit-50plus-week.txt',planText(),'text/plain;charset=utf-8');el('saveStatus').textContent='Your weekly plan was downloaded.';});
if(el('printPlan'))el('printPlan').addEventListener('click',function(){window.print();});
if(el('backup'))el('backup').addEventListener('click',backup);
if(el('restore'))el('restore').addEventListener('change',function(e){
 var file=e.target.files&&e.target.files[0];if(!file)return;
 if(file.size>100000){el('saveStatus').textContent='This file is too large for a guide backup.';return;}
 var reader=new FileReader();
 reader.onload=function(){try{var o=JSON.parse(reader.result);if(!o||o.version!==1||!o.answers||typeof o.answers!=='object')throw Error('Invalid format');state=normalize(o.answers);apply();update();updateReview();el('saveStatus').textContent='Your choices and reviews are restored.';}catch(err){el('saveStatus').textContent='That backup did not work. Try a JSON file downloaded from this guide.';}};
 reader.readAsText(file);e.target.value='';
});
if(el('weekReview'))el('weekReview').addEventListener('change',updateReview);
if(el('saveReview'))el('saveReview').addEventListener('click',function(){
 var w=el('weekReview').value,checks=choose('#reviewChecks input'),rating=el('confidenceRating').value,sessions=choose('#sessionChecks input');
 state.reviews[w]={checks:checks,rating:rating,sessions:sessions};persist();
 el('reviewStatus').textContent='Week '+w+' saved in this browser. Download a backup if you want to transfer it.';
});
if(el('printProgress'))el('printProgress').addEventListener('click',function(){window.print();});
if(el('downloadProgress'))el('downloadProgress').addEventListener('click',function(){
 var lines=['BFit Keep Moving | My four-week activity notes'];
 for(var i=1;i<=4;i++){
   var r=state.reviews[i]||{};
   lines.push('Week '+i+': '+(r.sessions||[]).join(', ')+' | Highlights: '+(r.checks||[]).join(', ')+' | Confidence: '+(r.rating||'not rated'));
 }
 fileDownload('BFit-50plus-progress.txt',lines.join('\n'),'text/plain;charset=utf-8');
});
apply();update();updateReview();
})();

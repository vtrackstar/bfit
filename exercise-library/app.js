
(()=>{'use strict';const data=BFitCatalog.validate(JSON.parse(document.getElementById('catalog').textContent));const cards=document.getElementById('cards');const search=document.getElementById('search');const domain=document.getElementById('domain');const count=document.getElementById('count');const empty=document.getElementById('empty');
function elt(tag,attrs={},txt){const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==='class')n.className=v;else n.setAttribute(k,v)}if(txt!==undefined)n.textContent=txt;return n}
function sec(parent,title,val){if(!val||Array.isArray(val)&&!val.length)return;const d=elt('div',{class:'section'});d.append(elt('strong',{},title),elt('p',{},Array.isArray(val)?val.join(', '):val));parent.append(d)}
function card(e){const a=elt('article',{class:'movement',id:e.id,tabindex:'-1'}),head=elt('div',{class:'row'}),lead=elt('div');lead.append((()=>{const h=elt('h2');h.append(elt('a',{href:'#'+e.id},e.name));return h})());head.append(lead,elt('span',{class:'badge'},e.domain));a.append(head);sec(a,'What it helps with',e.purpose);sec(a,'What you need',e.equipment);sec(a,'How to do it',e.steps);sec(a,'What to look for',e.cues);sec(a,'Make it easier',e.easier);const more=elt('details',{class:'more'});more.append(elt('summary',{},'More options, exercise details and safety'));const inner=elt('div');sec(inner,'Starting level',e.readiness);sec(inner,'Common mistakes',e.mistakes);sec(inner,'Make it harder',e.harder);sec(inner,'How the movement is counted',e.units);sec(inner,'Other names',e.aliases);inner.append(elt('span',{class:'id'},e.id));if(e.demo_url && e.demo_status==='Verified'){const p=elt('p');const link=elt('a',{href:e.demo_url,target:'_blank',rel:'noopener noreferrer'},'View independently checked demonstration');p.append(link);inner.append(p)}sec(a,'Safety',e.safety);more.append(inner);a.append(more);const b=elt('button',{type:'button',class:'copy'},'Copy link to this exercise');b.onclick=()=>{const url=location.href.split('#')[0]+'#'+e.id;if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy link to this exercise',1800)}).catch(()=>{b.textContent=url});else b.textContent=url};a.append(b);return a}
const equipment=document.getElementById('equipment-filter'),area=document.getElementById('area-filter');
const equipmentPatterns={home:/bodyweight|body weight|no equipment|wall|floor|chair|counter|no external|open space|clear space/i,chair:/chair|bench|seat|counter/i,dumbbell:/dumbbell|kettlebell/i,machine:/machine|cable|treadmill|ergometer|elliptical|stationary bike/i,band:/band/i};
const areaPatterns={legs:/leg|hip|thigh|knee|calf|ankle|glute|squat|hamstring|foot/i,upper:/shoulder|chest|arm|elbow|wrist|hand|push.up|press/i,back:/back|row|pull.up|pull.down|shoulder.blade/i,core:/trunk|core|abdomen|abdominal|anti.rotation|anti.extension/i,mobility:/mobility|flexibility|range of motion|joint control/i,cardio:/conditioning|running|walking|endurance|cycling|cardio/i,sport:/jump|sprint|agility|acceleration|deceleration|landing|sport/i};
function matchesEquipment(e,filter){
 if(filter!=='home')return equipmentPatterns[filter].test(e.equipment);
 // A floor or bench mentioned alongside required equipment does not make an exercise equipment-free.
 const required=e.equipment.split(/;\s*optional\b/i)[0];
 if(/dumbbell|kettlebell|barbell|trap bar|plates|machine|cable|band|pull.up bar|roller|rope|medicine ball|landmine|restraint|\banchor\b|two manageable weights|appropriate load/i.test(required))return false;
 if(/see setup instructions|table or towel|bench or stable surface|partner|cones|gates|track|turf|court|outdoor|running route|sprint|run.out|approach lane/i.test(required))return false;
 if(/slider|towel/i.test(required))return false;
 return equipmentPatterns.home.test(required)||/stable chair|nonslip surface|level ground|level stable|stable seat|hands and feet/i.test(required);
}
function searchText(e){return [e.id,e.name,...e.aliases,e.domain,e.family,e.equipment,e.purpose,e.steps,e.cues].join(' ').toLocaleLowerCase()}
function matchesSearch(e,q){if(!q)return true;const synonyms={butt:'glute',buttocks:'glute',stomach:'abdomen',abs:'abdominal',thighs:'thigh',shoulders:'shoulder',weights:'weight',dumbbells:'dumbbell',stretching:'stretch',toes:'toe'};const words=q.split(/\s+/).map(w=>synonyms[w]||w);const text=searchText(e);return words.every(w=>text.includes(w));}
let all=data.entries;function categories(){const selected=domain.value;domain.replaceChildren(elt('option',{value:''},'All categories'));for(const d of [...new Set(all.map(x=>x.domain))].sort())domain.append(elt('option',{value:d},d));domain.value=selected;}categories();
function update(){document.getElementById('total').textContent=all.length+' exercises and movements.';const q=search.value.toLocaleLowerCase().trim();const cat=domain.value;const level=document.getElementById('level').value;const hits=all.filter(e=>(!cat||e.domain===cat)&&(!level||e.readiness.startsWith(level))&&matchesSearch(e,q)&&(!equipment.value||matchesEquipment(e,equipment.value))&&(!area.value||areaPatterns[area.value].test([e.name,e.domain,e.family,e.purpose].join(' '))));cards.replaceChildren(...hits.map(card));count.textContent=hits.length+' of '+all.length+' exercises and movements shown';empty.style.display=hits.length?'none':'block';}
equipment.addEventListener('change',update);area.addEventListener('change',update);search.addEventListener('input',update);domain.addEventListener('change',update);document.getElementById('level').addEventListener('change',update);document.getElementById('reset').addEventListener('click',()=>{search.value='';domain.value='';equipment.value='';area.value='';document.getElementById('level').value='';update();search.focus()});update();function route(){if(location.hash){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const node=document.getElementById(id);if(!node&&/^BFIT-/.test(id)){document.getElementById('feed-status').textContent='This exercise is not in the current list. Return to the library search to find another movement.';}if(node){node.scrollIntoView({block:'start'});node.focus({preventScroll:true})}}
}window.addEventListener('hashchange',()=>{search.value='';domain.value='';equipment.value='';area.value='';document.getElementById('level').value='';update();route()});route();
const status=document.getElementById('feed-status'),retry=document.getElementById('retry');
const cacheKey='bfit-approved-feed-v1.1:'+window.BFIT_FEED_URL;
let current=data,busy=false,source='saved catalog',verifiedAt=null;
function accept(next,label,checked){
 if(Date.parse(next.published_at)<Date.parse(current.published_at))throw Error('Older catalog publication');
 const changed=JSON.stringify(next.entries)!==JSON.stringify(current.entries);
 current=next;source=label;verifiedAt=checked;all=next.entries;
 if(changed){categories();update();route();}
 document.getElementById('total').textContent=all.length+' exercises and movements.';
 document.getElementById('catalog-date').textContent='Catalog published '+new Date(next.published_at).toLocaleString();
}
try{const cached=JSON.parse(localStorage.getItem(cacheKey));if(cached&&cached.checked<=Date.now()&&Date.now()-cached.checked<86400000)accept(BFitCatalog.validate(cached.data),'last checked catalog',cached.checked);}catch{}
async function refresh(){
 if(busy)return;busy=true;retry.disabled=true;
 try{
  if(!window.BFIT_FEED_URL)throw Error('Feed not activated');
  const next=await BFitCatalog.fetchCatalog(window.BFIT_FEED_URL);
  const checked=Date.now();accept(next,'live catalog',checked);
  try{localStorage.setItem(cacheKey,JSON.stringify({checked,data:next}));}catch{}
  status.textContent='Exercise list checked '+new Date(checked).toLocaleTimeString()+'.';
 }catch{
  status.textContent='Live updates are unavailable. Showing the '+source+(verifiedAt?' checked '+new Date(verifiedAt).toLocaleString():' published '+new Date(current.published_at).toLocaleString())+'. Updates may be missing. Try again shortly.';
 }finally{busy=false;retry.disabled=false;}
}
retry.addEventListener('click',refresh);
window.addEventListener('online',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
setInterval(()=>{if(!document.hidden)refresh();},300000);
refresh();})();
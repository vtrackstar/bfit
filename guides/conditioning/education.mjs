// Standalone education: no access to saved plans, timer or localStorage.
const workSeconds=30,reps=4,baseline=90;
export function comparison(rest){
 if(![30,60,90].includes(rest))throw Error("Choose a listed recovery duration");
 const work=workSeconds*reps,recovery=rest*reps,total=work+recovery;
 return {work,recovery,total,density:Math.round(100*work/total)};
}
function minutes(s){const m=s/60;return Number.isInteger(m)?m+" min":Math.floor(m)+" min "+s%60+" sec";}
function track(el,rest){el.replaceChildren();for(let i=0;i<reps;i++){for(const [kind,s] of [["work",workSeconds],["rest",rest]]){const seg=document.createElement("span");seg.className="density-"+kind;seg.style.width=100*s/comparison(baseline).total+"%";el.append(seg);}}}
function render(){const input=document.getElementById("compare-rest");if(!input)return;const r=Number(input.value),v=comparison(r);track(document.getElementById("density-a"),baseline);track(document.getElementById("density-b"),r);document.getElementById("density-result").textContent=minutes(v.work)+" work · "+minutes(v.recovery)+" recovery · "+minutes(v.total)+" main block · "+v.density+"% work time";document.getElementById("density-explanation").textContent=r===baseline?"Both examples have identical planned work and recovery.":"The same work time takes up a larger share of the shorter main block. Shorter recovery may make consistent performance harder to maintain.";}
if(typeof document!=="undefined"){document.getElementById("compare-rest")?.addEventListener("change",render);render();}

// BFit milestone program contract. Enforces requirements from the very first draft.
// Run: node scripts/audit-milestones.mjs
// This checks structure and release evidence. It cannot judge coaching quality, scientific validity,
// exact exercise technique, or how a real beginner uses the product.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ids=['first-push-up','first-pull-up','first-pistol-squat','first-5k'];
const expectedGates=['programming','evidence','exerciseLibrary','loadTotals','progression','editorial','accessibility','deviceAndNavigation','saveAndRestore','beginnerTest','releaseLinks'];
const requiredIntake=['startingAbility','equipment','trainingDays','existingTraining','limitations'];
const requiredOutcomes=['progress','repeat','reduce','pause'];
const allowedStates=['planning','building','review','ready'];
const allowedStatuses=['pending','pass','fail'];

function audit(manifest,id,checkEvidence=true){
  const issues=[];
  const flag=(message)=>issues.push(id+': '+message);
  if(manifest.schemaVersion!==1)flag('unsupported schemaVersion (expected 1)');
  if(manifest.id!==id)flag('manifest id does not match folder');
  if(typeof manifest.title!=='string'||!manifest.title.startsWith('Your First '))flag('missing Your First title');
  if(!['strength-skill','running'].includes(manifest.kind))flag('invalid goal kind');
  if(!allowedStates.includes(manifest.state))flag('state must be planning, building, review, or ready');
  const d=manifest.delivery||{};
  if(d.format!=='interactive-guide'||d.primaryMode!=='adaptive-milestones')flag('must be an adaptive interactive guide');
  if(d.cycleWeeks!==4||d.hardCompletionDeadline!==false)flag('four weeks must be a review cycle, not a success deadline');
  for(const key of ['standaloneWorkoutShortcut','localBrowserSave','jsonExport','jsonImport']){
    if(d[key]!==true)flag('required delivery capability: '+key);
  }
  if(!['proposed-not-final','supported','declined'].includes(d.portableCode))flag('portable-code decision must be recorded');
  for(const field of requiredIntake){
    if(!manifest.requiredIntakeDomains?.includes(field))flag('required intake domain missing: '+field);
  }
  for(const outcome of requiredOutcomes){
    if(!manifest.reviewOutcomes?.includes(outcome))flag('must support post-cycle outcome: '+outcome);
  }
  if(!manifest.programmingPrinciples?.includes('concurrent-skill-and-strength') && manifest.kind==='strength-skill')flag('strength skill and supporting strength must be concurrent');
  if(['first-push-up','first-pull-up'].includes(id)){
    if(!manifest.programmingPrinciples?.includes('negatives-core-progressions'))flag('negative progressions must be core to the strength-skill approach');
    if(!manifest.programmingPrinciples?.includes('band-assistance-optional'))flag('band assistance must remain optional');
  }
  if(id==='first-5k'&&!manifest.programmingPrinciples?.includes('run-walk-when-appropriate'))flag('running must support run-walk entry');
  if(!Array.isArray(manifest.unresolved))flag('unresolved design decisions must be explicitly listed');
  const gates=manifest.qualityGates||{};
  for(const gate of expectedGates){
    const entry=gates[gate];
    if(!entry||!allowedStatuses.includes(entry.status)){flag('missing or invalid quality gate '+gate);continue;}
    if(entry.status==='pass'){
      if(typeof entry.evidence!=='string'||!entry.evidence.trim())flag('passed gate '+gate+' requires evidence path');
      else if(checkEvidence){
        if(!entry.evidence.startsWith('milestones/'+id+'/'))flag('evidence must be within this milestone folder: '+gate);
        else if(!fs.existsSync(entry.evidence))flag('gate evidence file does not exist: '+entry.evidence);
      }
    }
  }
  if(manifest.state==='ready'){
    if(typeof manifest.successfulCompletionCriteria!=='string'||manifest.successfulCompletionCriteria.trim().length<20)flag('ready program needs explicit measurable success criteria');
    if(!fs.existsSync(path.join('milestones',id,'index.html')))flag('ready program is missing interactive index.html');
    if(!fs.existsSync(path.join('milestones',id,'program.json')))flag('ready program is missing reviewable program.json');
    for(const gate of expectedGates)if(gates[gate]?.status!=='pass')flag('ready program has incomplete gate '+gate);
  }
  return issues;
}
let problems=[];
for(const id of ids){
 const file='milestones/'+id+'/manifest.json';
 if(!fs.existsSync(file)){problems.push('Missing planning manifest '+file);continue;}
 let manifest;
 try{manifest=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){problems.push(file+': invalid JSON '+e.message);continue;}
 problems.push(...audit(manifest,id));
 console.log('Milestone '+id+': '+manifest.state+'; '+Object.values(manifest.qualityGates||{}).filter(g=>g.status==='pass').length+'/'+expectedGates.length+' review gates passed');
}
// Self-test that a future premature launch cannot satisfy the validator by accident.
const example=JSON.parse(fs.readFileSync('milestones/first-push-up/manifest.json','utf8'));
const attempt={...example,state:'ready',successfulCompletionCriteria:null};
assert.ok(audit(attempt,'first-push-up',false).some(x=>x.includes('incomplete gate')),'ready-state guard missing');
assert.ok(audit({...example,delivery:{...example.delivery,hardCompletionDeadline:true}},'first-push-up',false).some(x=>x.includes('success deadline')),'four-week cycle guard missing');
assert.ok(audit({...example,programmingPrinciples:[]},'first-push-up',false).some(x=>x.includes('negative progressions')),'negatives guard missing');
if(problems.length){
 for(const p of problems)console.error('FAIL '+p);
 process.exitCode=1;
}else{
 console.log('PASS: four milestone manifests have day-one intake, progression, storage, and review contracts.');
 console.log('NOTE: Draft contracts are not approved programs. Release requires real workouts, evidence, browser tests, and a beginner review.');
}

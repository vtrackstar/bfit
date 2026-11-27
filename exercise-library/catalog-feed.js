(function(root){
'use strict';
const fields='id name aliases domain family equipment readiness purpose steps cues mistakes easier harder units safety last_reviewed'.split(' ');
function validate(data){
 if(!data||data.schema_version!=='1.1'||!Array.isArray(data.entries)||data.entries.length>5000||!Number.isFinite(Date.parse(data.published_at)))throw Error('Unsupported catalog');
 const ids=new Set();
 const entries=data.entries.map(e=>{
  if(!e||!/^(BFIT-\d{5,})$/.test(e.id)||ids.has(e.id))throw Error('Invalid or duplicate ID');
  ids.add(e.id);const clean={};
  for(const k of fields){
   if(k==='aliases'){if(!Array.isArray(e[k])||e[k].some(v=>typeof v!=='string'||v.length>2000))throw Error('Invalid aliases');clean[k]=e[k].slice();}
   else {if(typeof e[k]!=='string'||e[k].length>20000)throw Error('Invalid field');clean[k]=e[k];}
  }
  for(const k of ['name','domain','readiness','steps'])if(!clean[k].trim())throw Error('Missing required field');
  return clean;
 });return {schema_version:'1.1',published_at:data.published_at,entries};
}
function csvRows(text){
 if(typeof text!=='string'||text.length>5000000)throw Error('Invalid feed size');
 const rows=[];let row=[],value='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){value+='"';i++;}else if(c==='"')quoted=false;else value+=c;}
  else if(c==='"'){if(value)throw Error('Malformed CSV');quoted=true;}
  else if(c===','){row.push(value);value='';}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(value);rows.push(row);row=[];value='';}
  else value+=c;
 }
 if(quoted)throw Error('Truncated CSV');if(value||row.length){row.push(value);rows.push(row);}return rows;
}
function parse(text){
 const rows=csvRows(text),header=['schema_version','published_at',...fields];
 if(JSON.stringify(rows.shift())!==JSON.stringify(header))throw Error('Unexpected feed columns');
 const populated=rows.filter(r=>r.some(Boolean));if(!populated.length)throw Error('Missing publication metadata');
 const version=populated[0][0],published=populated[0][1],entries=[];
 for(const row of populated){if(row.length!==header.length||row[0]!==version||row[1]!==published)throw Error('Incomplete publication');
  if(row.slice(2).every(v=>!v))continue;
  const e=Object.fromEntries(fields.map((k,i)=>[k,k==='aliases'?JSON.parse(row[i+2]):row[i+2]]));entries.push(e);
 }return validate({schema_version:version,published_at:published,entries});
}
async function fetchCatalog(url,fetcher=fetch){
 const target=new URL(url);if(target.origin!=='https://docs.google.com'||!/^\/spreadsheets\/d\/[A-Za-z0-9_-]+\/gviz\/tq$/.test(target.pathname))throw Error('Feed not configured');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const response=await fetcher(target.href,{credentials:'omit',cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Feed unavailable');return parse(await response.text());}finally{clearTimeout(timer);}
}
const api={fields,validate,parse,csvRows,fetchCatalog};
if(typeof module!=='undefined')module.exports=api;else root.BFitCatalog=api;
})(typeof window==='undefined'?globalThis:window);
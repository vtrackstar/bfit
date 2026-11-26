import assert from 'node:assert/strict';
import { comparison } from './preview/education.mjs';
for(const [rest,expected] of [[90,{work:120,recovery:360,total:480,density:25}],[60,{work:120,recovery:240,total:360,density:33}],[30,{work:120,recovery:120,total:240,density:50}]]){
 assert.deepEqual(comparison(rest),expected);console.log('PASS '+rest+' second recovery arithmetic');
}
for(const invalid of [0,-1,45,Infinity,NaN,'30'])assert.throws(()=>comparison(invalid));
console.log('PASS reject unsupported educational input');
console.log('4 education checks passed');

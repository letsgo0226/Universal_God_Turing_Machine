#!/usr/bin/env node
'use strict';
// GitHub-only memory archivist: daily GitHub Actions bot comments in public
// issue #1. Never modifies source, experiments or the main branch.
const assert=require('node:assert/strict');
const https=require('node:https');
const fs=require('node:fs');
const path=require('node:path');
const {cycle,verify,write,selfTest:cognitionSelfTest}=require('./seed_cognition.js');
const ROOT=path.resolve(__dirname,'..');
const cfg=JSON.parse(fs.readFileSync(path.join(ROOT,'research/seed/cognitive_config.json'),'utf8'));
const REPO='letsgo0226/Universal_God_Turing_Machine',ISSUE=1;
const MARKER='UGTM_SEED_COGNITIVE_MEMORY_V1';
const BOT='github-actions[bot]';
assert.equal(cfg.repository,REPO);
assert.equal(cfg.ledger_issue_number,ISSUE);
function api(method,endpoint,data=null) {
  assert.ok(/^\/repos\/letsgo0226\/Universal_God_Turing_Machine\/issues\/1(?:\/comments(?:\?page=\d+&per_page=100)?)?$/.test(endpoint),'Disallowed GitHub memory endpoint');
  assert.ok(['GET','POST'].includes(method));
  const token=process.env.GITHUB_TOKEN;
  if(!token)throw new Error('GITHUB_TOKEN required for GitHub issue memory');
  const body=data===null?null:JSON.stringify(data);
  return new Promise((resolve,reject)=>{
    const req=https.request({
      hostname:'api.github.com',port:443,path:endpoint,method,
      headers:{
        'Authorization':'Bearer '+token,
        'Accept':'application/vnd.github+json',
        'X-GitHub-Api-Version':'2022-11-28',
        'User-Agent':'UGTM-AI-Seed-GitHub-Native-Memory',
        ...(body===null?{}:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)})
      },timeout:12000
    },res=>{
      const parts=[];let size=0;
      res.on('data',chunk=>{size+=chunk.length;if(size>1024*1024){req.destroy(new Error('Response too large'));return}parts.push(chunk)});
      res.on('end',()=>{
        const text=Buffer.concat(parts).toString('utf8');
        if(res.statusCode<200||res.statusCode>=300)return reject(new Error('GitHub HTTP '+res.statusCode+': '+text.slice(0,300)));
        try{resolve(JSON.parse(text))}catch(err){reject(err)}
      });
    });
    req.on('error',reject);
    req.on('timeout',()=>req.destroy(new Error('GitHub API timeout')));
    req.end(body||undefined);
  });
}
function readComment(comment) {
  if(!comment||comment.user?.login!==BOT)return null;
  const s=comment.body;
  if(typeof s!=='string'||!s.startsWith(MARKER+'\n'))return null;
  if(s.length>64000)throw new Error('Oversized memory record');
  return verify(JSON.parse(s.slice(MARKER.length+1)));
}
async function latest() {
  const issue=await api('GET','/repos/'+REPO+'/issues/'+ISSUE);
  assert.equal(issue.number,ISSUE);
  assert.equal(issue.state,'open');
  const total=Number(issue.comments)||0;
  const lastPage=Math.max(1,Math.ceil(total/100));
  for(let page=lastPage;page>=Math.max(1,lastPage-9);page--){
    const comments=await api('GET','/repos/'+REPO+'/issues/'+ISSUE+'/comments?page='+page+'&per_page=100');
    assert.ok(Array.isArray(comments));
    for(let j=comments.length-1;j>=0;j--){
      const record=readComment(comments[j]);
      if(record)return record;
    }
  }
  if(total>1000)throw new Error('No trusted memory record found in bounded history scan; manual review required');
  return null;
}
async function run(mode) {
  const previous=await latest();
  if(mode==='--read'){
    const record=previous||cycle();
    write(record);
    console.log('UGTM_GITHUB_MEMORY_SNAPSHOT generation='+record.generation+' source='+(previous?'issue':'local_initial'));
    return;
  }
  if(mode!=='--archive')throw new Error('Expected --read or --archive');
  const now=new Date(),day=now.toISOString().slice(0,10);
  if(previous&&previous.cycle_utc_day===day){
    write(previous);
    console.log('UGTM_GITHUB_MEMORY_ALREADY_ARCHIVED day='+day+' digest='+previous.digest);
    return;
  }
  const record=cycle({clock:now,previous});
  const body=MARKER+'\n'+JSON.stringify(record,null,2);
  assert.ok(body.length<=64000);
  await api('POST','/repos/'+REPO+'/issues/'+ISSUE+'/comments',{body});
  write(record);
  console.log('UGTM_GITHUB_MEMORY_ARCHIVED cycle='+day+' generation='+record.generation+' digest='+record.digest);
}
function selfTest() {
  cognitionSelfTest();
  const a=cycle({clock:new Date('2026-11-05T00:00:00Z'),source:'test'});
  const framed={user:{login:BOT},body:MARKER+'\n'+JSON.stringify(a,null,2)};
  assert.deepEqual(readComment(framed),a);
  assert.equal(readComment({...framed,user:{login:'untrusted-user'}}),null);
  assert.throws(()=>readComment({...framed,body:framed.body.replace('"generation": 1','"generation": 2')}),/digest mismatch/);
  console.log('PASS: GitHub-native memory archive, bot identity and integrity checks');
}
if(require.main===module){
  const action=process.argv[2]||'--self-test';
  if(action==='--self-test')selfTest();
  else run(action).catch(err=>{console.error(err.message);process.exitCode=1});
}
module.exports={readComment,selfTest};

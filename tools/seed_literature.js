#!/usr/bin/env node
'use strict';
// Existing UGTM AI Seed: bounded Crossref metadata discovery.
// No full-text retrieval, arbitrary browsing, inference, self-training,
// independent academic publication or access to private research data.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const https=require('node:https');
const crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const FIELDS=path.join(ROOT,'research/seed/academic_fields.json');
const OUTPUT=path.join(ROOT,'docs/seed/literature.json');
const REPO='letsgo0226/Universal_God_Turing_Machine';
const ISSUE=2;
const MARKER='UGTM_SEED_BIBLIOGRAPHY_V1\n';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const clean=(v,n=220)=>String(v||'').replace(/<[^>]*>/g,'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,n);
const doiRE=/^10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+$/;
const MAX_BYTES=400000;
function monday(date){
  assert.ok(date instanceof Date&&Number.isFinite(date.getTime()));
  const d=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate()));
  d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);
  return d.toISOString().slice(0,10);
}
function selection(date){
  const fields=JSON.parse(fs.readFileSync(FIELDS,'utf8'));
  assert.equal(fields.schema,'ugtm-academic-fields-v1');
  assert.ok(Array.isArray(fields.fields)&&fields.fields.length>=30&&fields.fields.length<=100);
  const weeks=Math.floor((Date.parse(monday(date)+'T00:00:00Z')-Date.parse('2026-01-05T00:00:00Z'))/604800000);
  const start=((weeks*3)%fields.fields.length+fields.fields.length)%fields.fields.length;
  return Array.from({length:3},(_,i)=>{
    const f=fields.fields[(start+i)%fields.fields.length];
    assert.match(f.id,/^[A-Z]{2,6}$/);
    return {field_id:f.id,discipline:clean(f.title,80),
      search_query:clean(f.title+' '+f.research_question,165)};
  });
}
function normalize(entry,field_id){
  if(!entry||typeof entry!=='object')return null;
  const doi=clean(entry.DOI,180);
  const title=clean(Array.isArray(entry.title)?entry.title[0]:'',240);
  if(!doiRE.test(doi)||!title)return null;
  const issued=entry.issued?.['date-parts']?.[0]?.[0];
  const year=Number.isInteger(issued)&&issued>=1450&&issued<=2200?issued:null;
  const authors=(Array.isArray(entry.author)?entry.author:[]).slice(0,3).map(a=>clean([a.given,a.family].filter(Boolean).join(' '),90)).filter(Boolean);
  return {field_id,doi,doi_url:'https://doi.org/'+encodeURI(doi),title,year,authors,
    container_title:clean(Array.isArray(entry['container-title'])?entry['container-title'][0]:'',150)||null,
    publisher:clean(entry.publisher,110)||null,type:clean(entry.type,60)||null,
    status:'candidate_crossref_metadata_only',full_text_read:false,citation_verified:false,
    provenance:'Crossref depositor metadata (not independent work verification)'};
}
function request(host,route,{method='GET',token=null,body=null}={}){
  assert.ok(host==='api.crossref.org'||host==='api.github.com','Unapproved host');
  if(host==='api.crossref.org')assert.ok(method==='GET'&&route.startsWith('/works?')&&route.length<900);
  else assert.ok(/^\/repos\/letsgo0226\/Universal_God_Turing_Machine\/issues\/2(?:\/comments(?:\?page=\d+&per_page=100)?)?$/.test(route),'Unapproved issue endpoint');
  const payload=body?JSON.stringify(body):null;
  return new Promise((resolve,reject)=>{
    const req=https.request({hostname:host,method,path:route,timeout:12000,headers:{
      'User-Agent':'UGTM-AI-Seed/1.0 (https://github.com/letsgo0226/Universal_God_Turing_Machine)',
      'Accept':'application/json',
      ...(token?{'Authorization':'Bearer '+token}:{}),
      ...(payload?{'Content-Type':'application/json','Content-Length':Buffer.byteLength(payload)}:{})
    }},res=>{
      const chunks=[];let bytes=0;
      res.on('data',chunk=>{bytes+=chunk.length;if(bytes>MAX_BYTES){req.destroy(new Error('Response too large'));return}chunks.push(chunk)});
      res.on('end',()=>{
        if(res.statusCode<200||res.statusCode>=300)return reject(new Error(host+' HTTP '+res.statusCode));
        try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch(e){reject(new Error('Invalid JSON from '+host))}
      });
    });
    req.on('error',reject);
    req.on('timeout',()=>req.destroy(new Error('Request timed out')));
    req.end(payload||undefined);
  });
}
function payloadHash(record){const {digest,...rest}=record;return sha(JSON.stringify(rest))}
function validate(record){
  assert.equal(record.schema,'ugtm-ai-seed-literature-v1');
  assert.equal(record.repository,REPO);
  assert.match(record.week_start_utc,/^\d{4}-\d\d-\d\d$/);
  assert.equal(record.metadata_source,'Crossref REST API');
  assert.ok(Array.isArray(record.queries)&&record.queries.length===3);
  assert.ok(Array.isArray(record.items)&&record.items.length<=6);
  assert.ok(record.items.every(x=>doiRE.test(x.doi)&&x.status==='candidate_crossref_metadata_only'&&!x.full_text_read&&!x.citation_verified));
  assert.equal(record.human_review_required,true);
  assert.equal(record.full_text_read,false);
  assert.equal(record.scholarship_verified,false);
  assert.match(record.digest,/^[a-f0-9]{64}$/);
  assert.equal(record.digest,payloadHash(record),'Metadata digest mismatch');
  return record;
}
function makeRecord({date,queries,items,errors,source}){
  const r={schema:'ugtm-ai-seed-literature-v1',repository:REPO,
    week_start_utc:monday(date),created_at_utc:date.toISOString(),
    source_commit:source||process.env.GITHUB_SHA||'local',
    actor:'UGTM AI Seed bibliography submodule',
    metadata_source:'Crossref REST API',
    queries,items,errors,full_text_read:false,scholarship_verified:false,
    human_review_required:true,
    caveat:'DOIs and deposited metadata are candidate references, not proof of relevance, claims, full-text reading, peer review, or citation accuracy.'};
  r.digest=payloadHash(r);
  return validate(r);
}
async function harvest({date=new Date(),fetchMetadata=request,source}={}){
  const fields=selection(date),items=[],queries=[],errors=[],seen=new Set();
  for(const field of fields){
    const p=new URLSearchParams({'query.bibliographic':field.search_query,rows:'2',
      select:'DOI,title,author,issued,container-title,type,publisher'});
    try{
      const response=await fetchMetadata('api.crossref.org','/works?'+p.toString());
      const works=response?.message?.items;
      assert.ok(Array.isArray(works)&&works.length<=2,'Bad Crossref results');
      let count=0;
      for(const w of works){
        const normalized=normalize(w,field.field_id);
        if(normalized&&!seen.has(normalized.doi.toLowerCase())){
          seen.add(normalized.doi.toLowerCase());items.push(normalized);count++;
        }
      }
      queries.push({...field,candidate_count:count,status:'metadata_only'});
    }catch(e){
      errors.push({field_id:field.field_id,reason:clean(e.message,100)});
      queries.push({...field,candidate_count:0,status:'retrieval_failed'});
    }
  }
  if(!items.length)throw new Error('No candidate DOI metadata; refusing to report an empty search as successful');
  return makeRecord({date,queries,items,errors,source});
}
function write(record){
  validate(record);
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  fs.writeFileSync(OUTPUT,JSON.stringify(record,null,2)+'\n');
}
function parseComment(c){
  if(c?.user?.login!=='github-actions[bot]'||typeof c.body!=='string'||!c.body.startsWith(MARKER)||c.body.length>46000)return null;
  return validate(JSON.parse(c.body.slice(MARKER.length)));
}
async function latest(token){
  const base='/repos/'+REPO+'/issues/'+ISSUE;
  const issue=await request('api.github.com',base,{token});
  assert.equal(issue.number,ISSUE);
  assert.equal(issue.state,'open');
  const pages=Math.max(1,Math.ceil((Number(issue.comments)||0)/100));
  for(let page=pages;page>=Math.max(1,pages-5);page--){
    const comments=await request('api.github.com',base+'/comments?page='+page+'&per_page=100',{token});
    assert.ok(Array.isArray(comments));
    for(let i=comments.length-1;i>=0;i--){const r=parseComment(comments[i]);if(r)return r}
  }
  return null;
}
async function execute(mode){
  const token=process.env.GITHUB_TOKEN;
  if(!token)throw new Error('Restricted GITHUB_TOKEN required');
  const prev=await latest(token);
  if(mode==='--read'){
    if(prev){write(prev);console.log('UGTM_SEED_LITERATURE_SNAPSHOT='+prev.week_start_utc+' items='+prev.items.length)}
    else {
      const placeholder={schema:'ugtm-ai-seed-literature-pending-v1',status:'not_yet_archived',
        metadata_source:'Crossref REST API',items:[],full_text_read:false,scholarship_verified:false,human_review_required:true};
      fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
      fs.writeFileSync(OUTPUT,JSON.stringify(placeholder,null,2)+'\n');
      console.log('UGTM_SEED_LITERATURE_PENDING');
    }
    return;
  }
  if(mode!=='--harvest')throw new Error('Unknown mode');
  if(prev?.week_start_utc===monday(new Date())){write(prev);console.log('UGTM_SEED_LITERATURE_ALREADY_ARCHIVED='+prev.week_start_utc);return}
  const record=await harvest();
  const payload=MARKER+JSON.stringify(record,null,2);
  assert.ok(payload.length<46000,'Public metadata archive too large');
  await request('api.github.com','/repos/'+REPO+'/issues/'+ISSUE+'/comments',
    {method:'POST',token,body:{body:payload}});
  write(record);
  console.log('UGTM_SEED_LITERATURE_ARCHIVED='+record.week_start_utc+' items='+record.items.length+' errors='+record.errors.length);
}
async function selfTest(){
  const work={DOI:'10.1234/sample.test',title:['A sample work'],issued:{'date-parts':[[2024]]},
    author:[{given:'Ada',family:'Example'}],'container-title':['Sample journal'],publisher:'Sample Press',type:'journal-article'};
  const date=new Date('2026-11-05T00:00:00Z');
  const fake=async(host,route)=>{assert.equal(host,'api.crossref.org');assert.ok(route.startsWith('/works?'));return {message:{items:[work]}}};
  const a=await harvest({date,fetchMetadata:fake,source:'test'});
  const b=await harvest({date,fetchMetadata:fake,source:'test'});
  assert.deepEqual(a,b);
  assert.equal(a.queries.length,3);
  assert.equal(a.items.length,1); // DOI deduplicated across disciplines
  assert.equal(a.items[0].title,'A sample work');
  assert.ok(!a.full_text_read&&!a.scholarship_verified);
  assert.equal(parseComment({user:{login:'github-actions[bot]'},body:MARKER+JSON.stringify(a)}).digest,a.digest);
  assert.equal(parseComment({user:{login:'visitor'},body:MARKER+JSON.stringify(a)}),null);
  assert.throws(()=>validate({...a,scholarship_verified:true}),/Expected values/);
  assert.throws(()=>validate({...a,items:[{doi:'10.fake',status:'candidate_crossref_metadata_only'}]}));
  console.log('PASS: UGTM seed bounded Crossref candidate extraction, deduplication, DOI checks, review gate, digest, bot-only ledger');
}
if(require.main===module) {
  const mode=process.argv[2]||'--self-test';
  if(mode==='--self-test')selfTest().catch(e=>{console.error(e);process.exitCode=1});
  else execute(mode).catch(e=>{console.error(e.message);process.exitCode=1});
}
module.exports={harvest,validate,normalize,selection,selfTest};

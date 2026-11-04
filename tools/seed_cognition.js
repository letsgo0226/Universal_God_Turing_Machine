#!/usr/bin/env node
'use strict';
// ACE-inspired GitHub-native cognitive memory: Generator, Reflector, Curator.
// Rule-based reproducible research metadata; not the proprietary ACE3 server,
// not an LLM, no continual consciousness, no speculative remote communications.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {buildReport} = require('./ai_seed.js');
const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'research/seed/cognitive_config.json');
const OUTPUT_PATH = path.join(ROOT, 'docs/seed/cognition.json');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const idPattern = /^RQ-[a-f0-9]{12}$/;
const evidencePattern = /^[a-f0-9]{64}$/;

function config() {
  const c = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  assert.equal(c.schema, 'ugtm-seed-github-cognition-config-v1');
  assert.equal(c.repository, 'letsgo0226/Universal_God_Turing_Machine');
  assert.equal(c.ledger_issue_number, 1);
  assert.equal(c.backend, 'github_issue_comments');
  assert.equal(c.max_question_history, 48);
  assert.equal(c.max_observations, 8);
  assert.equal(c.private_data_allowed, false);
  assert.equal(c.automated_source_writes, false);
  assert.equal(c.automatic_new_experiments, false);
  assert.equal(c.manual_review_required, true);
  return c;
}
function canonicalBody(record) {
  const {digest, ...data} = record;
  return JSON.stringify(data);
}
function verify(record) {
  const c = config();
  assert.equal(record.schema, 'ugtm-seed-cognition-v1');
  assert.equal(record.repository, c.repository);
  assert.match(record.cycle_utc_day, /^\d{4}-\d\d-\d\d$/);
  assert.ok(Number.isSafeInteger(record.generation) && record.generation >= 1);
  assert.ok(Array.isArray(record.question_history) && record.question_history.length <= c.max_question_history);
  assert.ok(Array.isArray(record.observations) && record.observations.length <= c.max_observations);
  assert.ok(record.question_history.every(x => idPattern.test(x.id) && Number.isInteger(x.seen_count) && x.seen_count > 0 && x.seen_count <= 100000));
  assert.ok(record.observations.every(x => /^[A-Z][A-Z0-9]{0,4}$/.test(x.project_id) && evidencePattern.test(x.evidence_sha256)));
  assert.ok(record.questions_proposed.every(x => idPattern.test(x.id) && x.status === 'human_review_required'));
  assert.ok(typeof record.previous_digest === 'string' && (record.previous_digest === 'GENESIS' || evidencePattern.test(record.previous_digest)));
  assert.ok(evidencePattern.test(record.digest));
  assert.equal(hash(canonicalBody(record)), record.digest, 'cognitive record digest mismatch');
  assert.equal(record.governance.no_self_modification, true);
  assert.equal(record.governance.journal_submission_authorized, false);
  assert.equal(record.governance.human_review_required, true);
  return record;
}
function cycle({clock=new Date(),source,previous=null}={}) {
  assert.ok(clock instanceof Date && Number.isFinite(clock.valueOf()));
  const settings = config();
  if (previous !== null) verify(previous);
  const report = buildReport({clock,source});
  const day = clock.toISOString().slice(0,10);
  const inputQuestions = report.research_questions.map(q => ({
    id:q.id,originating_project_ids:q.originating_project_ids,
    status:'human_review_required',
    proposed_question:q.question,
    scientific_boundary:q.scientific_boundary
  }));
  assert.ok(inputQuestions.length <= settings.max_published_questions_per_cycle);
  // REFLECTOR: do not inflate finite test success into unknown physical mechanisms.
  const observations = report.projects.slice(0,settings.max_observations).map(p => ({
    project_id:p.id,execution_status:p.status,
    evidence_sha256:hash(JSON.stringify({status:p.status,evidence:p.evidence||null,finding:p.finding||null})),
    evidence_scope:p.status === 'bounded_check_passed' ? 'finite_local_check_only' : 'not_empirically_established'
  }));
  const unsupported = ['Physical quantum entanglement from identical software',
    'No-channel remote receipt of previously unknown bits',
    'Subjective identity or conscious AI welfare established by checkpoints',
    'A correct solution to the general halting problem',
    'Peer-reviewed publication from unreviewed academic protocols'];
  // CURATOR: stable IDs, deduplicated counts and bounded replayable history.
  const past = new Map((previous?.question_history||[]).map(x=>[x.id,{...x}]));
  for(const q of inputQuestions) {
    const existing = past.get(q.id);
    past.set(q.id, existing ? {id:q.id,first_seen_utc_day:existing.first_seen_utc_day,
      last_seen_utc_day:day,seen_count:existing.seen_count+1} :
      {id:q.id,first_seen_utc_day:day,last_seen_utc_day:day,seen_count:1});
  }
  const history=Array.from(past.values()).sort((a,b)=>
    b.last_seen_utc_day.localeCompare(a.last_seen_utc_day)||a.id.localeCompare(b.id)).slice(0,settings.max_question_history);
  const record={
    schema:'ugtm-seed-cognition-v1',repository:settings.repository,
    cycle_utc_day:day,source_commit:report.source_commit,
    generation:previous ? previous.generation+1 : 1,
    previous_digest:previous ? previous.digest : 'GENESIS',
    generator:{type:'offline_deterministic_bounded_questions',model_used:false},
    reflector:{
      projects_checked:report.metrics.bounded_experiments_executed,
      candidate_questions:inputQuestions.length,
      uncertain_claims:unsupported,
      conclusion:'Finite local observations do not justify quantum signaling, sentience, universal proof or publication claims.'
    },
    curator:{
      retained_question_ids:history.length,
      repeated_question_ids:inputQuestions.filter(q=>!!previous?.question_history?.find(x=>x.id===q.id)).length,
      continuity:'Versioned structured metadata only; not perpetual execution or subjective continuity.'
    },
    questions_proposed:inputQuestions,
    observations,question_history:history,
    governance:{
      no_self_modification:true,no_unbounded_replication:true,
      journal_submission_authorized:false,human_review_required:true,
      no_new_experiments_authorized:true,network_authority:'GitHub Issue archival adapter only'
    }
  };
  record.digest=hash(canonicalBody(record));
  return verify(record);
}
function write(record) {
  verify(record);
  fs.mkdirSync(path.dirname(OUTPUT_PATH),{recursive:true});
  fs.writeFileSync(OUTPUT_PATH,JSON.stringify(record,null,2)+'\n','utf8');
  return record;
}
function selfTest() {
  const a=cycle({clock:new Date('2026-11-05T02:00:00Z'),source:'test'});
  const b=cycle({clock:new Date('2026-11-06T02:00:00Z'),source:'test',previous:a});
  assert.equal(a.generation,1);
  assert.equal(b.generation,2);
  assert.equal(b.previous_digest,a.digest);
  assert.equal(b.questions_proposed.length,4);
  assert.ok(b.question_history.length <= 48);
  assert.equal(verify(b),b);
  assert.throws(()=>verify({...b,reflector:{...b.reflector,conclusion:'fabricated result'}}),/digest mismatch/);
  const bad=JSON.parse(JSON.stringify(b));
  bad.question_history.push({id:'injection',seen_count:1});
  assert.throws(()=>verify(bad));
  const other=cycle({clock:new Date('2026-11-06T02:00:00Z'),source:'test',previous:a});
  assert.deepEqual(b,other);
  console.log('PASS: GitHub-native ACE-inspired Generator/Reflector/Curator, replayable memory digest, bounded retention, tamper rejection');
}
if(require.main===module) {
  const args=process.argv.slice(2);
  if(args.includes('--self-test')) selfTest();
  else if(args.includes('--write')) {
    let prev=null;
    const arg=args.indexOf('--previous');
    if(arg!==-1) {
      assert.ok(args[arg+1] && args[arg+1].startsWith('/tmp/'),'previous file must be under /tmp/');
      prev=JSON.parse(fs.readFileSync(args[arg+1],'utf8'));
    }
    const out=write(cycle({previous:prev}));
    console.log('UGTM_COGNITION_REPORT='+path.relative(ROOT,OUTPUT_PATH)+' generation='+out.generation);
  } else throw new Error('Expected --self-test or --write [--previous /tmp/path.json]');
}
module.exports={cycle,verify,write,selfTest};

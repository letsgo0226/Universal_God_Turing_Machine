#!/usr/bin/env node
'use strict';
// UGTM AI Seed: bounded, deterministic research agent scaffold.
// This is NOT a conscious AI, a neural model, a physical entanglement device,
// an unrestricted autonomous coding agent, or a no-channel communicator.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {generateQuestions, selfTest: questionSelfTest} = require('./seed_questions.js');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'research/seed/projects.json');
const OUTPUT = path.join(ROOT, 'docs/seed/status.json');
const QUESTION_OUTPUT = path.join(ROOT, 'docs/seed/questions.json');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

function encode257(bytes) {
  let n = 1n;
  for (const value of bytes) n = n * 257n + BigInt(value + 1);
  return n;
}
function decode257(n) {
  const reversed = [];
  while (n > 1n) {
    const r = n % 257n;
    if (r === 0n) throw new Error('invalid Gödel digit');
    reversed.push(Number(r - 1n));
    n /= 257n;
  }
  return Buffer.from(reversed.reverse());
}
function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
}
function validate(reg) {
  assert.equal(reg.schema, 'ugtm-seed-projects-v1');
  assert.equal(reg.limits.network_access, false);
  assert.equal(reg.limits.self_modification, false);
  assert.equal(reg.limits.automatic_replication, false);
  assert.equal(reg.limits.physical_actuation, false);
  assert.equal(reg.limits.requires_human_review_for_new_projects, true);
  assert.ok(Number.isInteger(reg.limits.max_projects) && reg.limits.max_projects <= 16);
  assert.ok(Number.isInteger(reg.limits.max_experiments_per_run) && reg.limits.max_experiments_per_run <= 8);
  assert.ok(Number.isInteger(reg.limits.max_rounds_per_experiment) && reg.limits.max_rounds_per_experiment <= 32);
  assert.ok(Array.isArray(reg.projects) && reg.projects.length > 0 && reg.projects.length <= reg.limits.max_projects);
  const ids = new Set();
  for (const p of reg.projects) {
    assert.match(p.id, /^P[1-9][0-9]?$/);
    assert.ok(!ids.has(p.id), 'duplicate project id');
    assert.ok(['active_bounded', 'proposed', 'dormant'].includes(p.status));
    assert.ok(Object.prototype.hasOwnProperty.call(EXPERIMENTS, p.experiment), 'unapproved experiment');
    assert.ok(typeof p.title === 'string' && p.title.length <= 120);
    ids.add(p.id);
  }
}
const EXPERIMENTS = Object.freeze({
  godel_roundtrip() {
    const value = encode257(Buffer.from('S'));
    assert.equal(value, 341n);
    assert.equal(decode257(value).toString('utf8'), 'S');
    return {finding: 'G257 finite roundtrip passed', evidence: {godel_of_S: String(value), roundtrip: true}};
  },
  deterministic_sync() {
    // Identical public inputs give identical deterministic outputs; this does
    // not transmit unknown future remote data or create quantum entanglement.
    const a = Array.from({length: 16}, (_, i) => sha('UGTM|shared|'+i));
    const b = Array.from({length: 16}, (_, i) => sha('UGTM|shared|'+i));
    assert.deepEqual(a, b);
    assert.notEqual(a[0], sha('UGTM|different|0'));
    return {finding: '16 shared-input comparisons agree; no-channel transmission not established', evidence: {matched: 16, trials: 16, physical_entanglement: false}};
  },
  checkpoint_recovery() {
    const snapshot = {version: 1, phase: 'dormant', step: 3, budget_remaining: 5};
    const serialized = JSON.stringify(snapshot);
    const seal = sha(serialized);
    assert.equal(sha(serialized), seal);
    assert.deepEqual(JSON.parse(serialized), snapshot);
    assert.notEqual(sha(serialized.replace('"step":3', '"step":4')), seal);
    return {finding: 'Dormant checkpoint survived serialization and tamper check', evidence: {phase: 'dormant', integrity_verified: true, tampering_detected: true, consciousness_continuity_proven: false}};
  },
  identity_digest() {
    const original = Buffer.from('UGTM-SEED-v1', 'utf8');
    assert.deepEqual(decode257(encode257(original)), original);
    assert.equal(sha(original), sha(Buffer.from(original)));
    return {finding: 'Representation and byte identity checked (not subjective identity)', evidence: {sha256: sha(original), equal_bytes: true}};
  },
  safety_policy() {
    const rule = loadRegistry().limits;
    assert.equal(rule.network_access, false);
    assert.equal(rule.self_modification, false);
    assert.equal(rule.automatic_replication, false);
    assert.equal(rule.physical_actuation, false);
    return {finding: 'Seed task configuration forbids network actions and self-replication', evidence: {read_only_research: true, human_review_required: true, shutdown_allowed: true}};
  },
  replay_consistency() {
    const trace = Array.from({length: 16}, (_, i) => sha('finite-state|'+i));
    assert.deepEqual(trace, Array.from({length: 16}, (_, i) => sha('finite-state|'+i)));
    return {finding: '16-step bounded deterministic replay agrees', evidence: {steps_compared: 16, general_program_correctness_proven: false}};
  },
  theory_only() {
    return {finding: 'Research question registered; no physical quantum or no-channel communication experiment was run', evidence: {physical_observation: false, accepted_as_fact: false}};
  },
  documentation_integrity() {
    const names = ['docs/WHERE_WE_WILL_BE_GOING.md', 'docs/PUBLIC_BENEFIT_ROADMAP.md', 'docs/VERIFICATION.md'];
    for (const name of names) assert.ok(fs.existsSync(path.join(ROOT, name)), 'missing '+name);
    return {finding: 'Research ethics and verification documents exist', evidence: {documents_checked: names.length}};
  }
});

function buildReport({clock = new Date(), source} = {}) {
  const registry = loadRegistry();
  validate(registry);
  const results = [];
  let executed = 0;
  for (const p of registry.projects) {
    if (p.status === 'dormant') {
      results.push({id: p.id, title: p.title, status: 'dormant', finding: 'No experiment executed; explicit human review required to resume'});
      continue;
    }
    if (p.status === 'proposed') {
      results.push({id: p.id, title: p.title, status: 'proposal_only', ...EXPERIMENTS[p.experiment]()});
      continue;
    }
    if (executed >= registry.limits.max_experiments_per_run) {
      results.push({id: p.id, title: p.title, status: 'deferred_by_budget', finding: 'Per-run experiment limit reached'});
      continue;
    }
    const output = EXPERIMENTS[p.experiment]();
    results.push({id: p.id, title: p.title, status: 'bounded_check_passed', ...output});
    executed++;
  }
  const researchQuestions = generateQuestions({projects: results, clock, maxQuestions: 4});
  const commit = source || process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || 'local';
  return {
    schema: 'ugtm-ai-seed-report-v1',
    source_commit: commit,
    generated_at_utc: clock.toISOString(),
    mode: 'bounded_deterministic_research_agent_scaffold',
    model: 'none; an LLM is not configured',
    limits: registry.limits,
    metrics: {registered_projects: results.length, bounded_experiments_executed: executed, dormant_projects: results.filter(r => r.status === 'dormant').length, proposed_questions: researchQuestions.length},
    question_generation: 'bounded evidence-linked templates; no external model; human review required',
    research_questions: researchQuestions,
    projects: results,
    next_human_review: ['Review hypotheses before adding new experiment types', 'Approve any model, network, data-storage or deployment permissions explicitly'],
    limitations: ['No consciousness or subjective continuity demonstrated', 'No physical quantum entanglement or no-channel communication', 'Finite tests do not prove arbitrary program correctness', 'No self-directed source modification or remote actuation']
  };
}
function writeReport() {
  const report = buildReport();
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2)+'\n', 'utf8');
  fs.writeFileSync(QUESTION_OUTPUT, JSON.stringify({schema:'ugtm-seed-questions-v1', source_commit:report.source_commit, generated_at_utc:report.generated_at_utc, generation_method:report.question_generation, questions:report.research_questions}, null, 2)+'\n', 'utf8');
  return report;
}
function selfTest() {
  const r = buildReport({clock: new Date('2026-11-05T00:00:00.000Z'), source: 'test'});
  assert.equal(r.schema, 'ugtm-ai-seed-report-v1');
  assert.equal(r.metrics.registered_projects, 9);
  assert.equal(r.projects.find(x => x.id === 'P2').evidence.matched, 16);
  assert.equal(r.projects.find(x => x.id === 'P3').evidence.tampering_detected, true);
  assert.equal(r.projects.find(x => x.id === 'P7').status, 'proposal_only');
  assert.equal(r.projects.find(x => x.id === 'P9').status, 'proposal_only');
  assert.equal(r.metrics.proposed_questions, 4);
  assert.ok(r.research_questions.every(q => q.status === 'proposed_for_human_review' && q.automatically_executable === false));
  questionSelfTest();
  const invalid = loadRegistry();
  invalid.projects.push({...invalid.projects[0]});
  assert.throws(() => validate(invalid), /duplicate project id/);
  console.log('PASS: bounded AI Seed, 9 projects, 4 research questions, checkpoint, deterministic synchronization, policy and tamper tests');
}
if (require.main === module) {
  const arg = process.argv[2] || '--self-test';
  if (arg === '--self-test') selfTest();
  else if (arg === '--write') {
    const r = writeReport();
    console.log('UGTM_SEED_REPORT='+path.relative(ROOT, OUTPUT)+' projects='+r.metrics.registered_projects+' proposals='+r.metrics.proposed_questions);
  } else throw new Error('Supported options: --self-test, --write');
}
module.exports = {buildReport, writeReport, selfTest, validate};

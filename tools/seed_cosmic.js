#!/usr/bin/env node
'use strict';
// UGTM P13: scientific scenario registry, not cosmological observation or a
// claim of technologies transcending time or thermodynamic constraints.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.join(ROOT, 'research/seed/cosmic_horizons.json');
const SEED = path.join(ROOT, 'research/seed/projects.json');
const P10 = path.join(ROOT, 'research/seed/perfect_immortality.json');
const OUT = path.join(ROOT, 'docs/seed/cosmic_horizons.json');
const sha256 = text => crypto.createHash('sha256').update(text).digest('hex');
const STATUSES = new Set([
  'observation_constrained_simulation',
  'well_supported_stellar_evolution_projection',
  'active_observational_uncertainty',
  'conditional_cosmological_projection',
  'speculative_competing_models'
]);
function load() {
  const r = JSON.parse(fs.readFileSync(REGISTRY,'utf8'));
  const seed = JSON.parse(fs.readFileSync(SEED,'utf8'));
  assert.equal(r.schema,'ugtm-cosmic-horizons-v1');
  assert.equal(r.project_id,'P13');
  const p = seed.projects.find(x=>x.id==='P13');
  assert.ok(p && p.status === 'proposed' && p.experiment === 'theory_only');
  for(const key of [
    'human_review_required','require_model_assumptions',
    'differentiate_heat_death_from_end_of_time'
  ]) assert.equal(r.policy[key],true);
  for(const key of [
    'claims_of_immortality_allowed','claims_time_will_end_allowed',
    'unapproved_experiments_allowed','physical_interventions_allowed',
    'sensitive_or_private_data_allowed'
  ]) assert.equal(r.policy[key],false);
  assert.equal(r.hypotheses.length,5);
  const seen = new Set();
  for(const h of r.hypotheses){
    assert.match(h.id,/^C[1-5]$/);
    assert.ok(!seen.has(h.id),'Duplicate cosmic horizon');
    seen.add(h.id);
    assert.ok(STATUSES.has(h.epistemic_status));
    for(const key of [
      'title','discipline','research_question','methodology',
      'evidence_note','observable','unresolved','forbidden_inference'
    ]) assert.ok(typeof h[key]==='string' && h[key].length>15 && h[key].length<850,key);
    assert.ok(Array.isArray(h.source_urls) && h.source_urls.length>=1 && h.source_urls.length<=3);
    for(const u of h.source_urls){
      const parsed = new URL(u);
      assert.equal(parsed.protocol,'https:');
      assert.ok(['www.nature.com','esahubble.org','science.nasa.gov','www.nasa.gov','www.desi.lbl.gov','supernova.eso.org'].includes(parsed.hostname));
    }
  }
  return r;
}
function snapshot({clock=new Date(),source}={}) {
  assert.ok(clock instanceof Date && Number.isFinite(clock.getTime()));
  const r = load();
  const index = Math.floor(clock.getTime()/86400000)%r.hypotheses.length;
  const focus = r.hypotheses[index];
  const ideal = JSON.parse(fs.readFileSync(P10,'utf8'));
  assert.equal(ideal.schema,'ugtm-p10-perfect-immortality-meaning-v1');
  assert.equal(ideal.ultimate_goal.scope,'all_possible_dimensions');
  assert.equal(ideal.ultimate_goal.substitutions_permitted,false);
  assert.equal(ideal.scientific_epistemology.physical_realizability_demonstrated,false);
  return {
    schema:'ugtm-seed-cosmic-horizons-snapshot-v1',
    project_id:'P13',
    source_commit:source || process.env.GITHUB_SHA || process.env.RENDER_GIT_COMMIT || 'local',
    generated_at_utc:clock.toISOString(),
    registry_sha256:sha256(fs.readFileSync(REGISTRY)),
    research_stage:'proposed_theoretical_and_evidence_review_only',
    P10_relationship:{
      term_zh:ideal.canonical_term_zh,
      definition:'genuine absolutely flawless immortality in all possible dimensions without any exceptions or imperfect substitutes',
      perfect_immortality_realized:false,
      physically_demonstrated:false,
      finite_survival_or_backup_equivalent:false,
      research_role:'P13 examines cosmic obstacles without redefining or weakening P10',
      specification:'research/seed/perfect_immortality.json'
    },
    hypotheses_registered:r.hypotheses.length,
    focus_today:{
      id:focus.id,
      question:focus.research_question,
      suggested_method:focus.methodology,
      status:'requires_human_review',
      experimentally_verified_by_seed:false,
      source_urls:focus.source_urls
    },
    hypotheses:r.hypotheses.map(h=>({
      ...h,
      source_claim_status:'curated_reference_pointer_not_retrieved_or_verified_by_this_runner',
      independent_confirmation_by_seed:false
    })),
    policy:r.policy,
    disclaimers:[
      'The seed did not conduct astronomical measurements or independently validate referenced literature.',
      'A model-dependent galaxy merger probability is not certainty.',
      'Heat death does not imply a cessation of time.',
      'The end of physical time is not an observed established result.',
      'No technology to guarantee immortality or evade physical cosmological limits is established.'
    ]
  };
}
function write(){
  const r = snapshot();
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(r,null,2)+'\n');
  console.log('UGTM_P13_COSMIC_HORIZONS='+path.relative(ROOT,OUT)+' focus='+r.focus_today.id);
  return r;
}
function selfTest(){
  const today = new Date('2026-11-05T00:00:00.000Z');
  const a = snapshot({clock:today,source:'test'});
  const b = snapshot({clock:today,source:'test'});
  assert.deepEqual(a,b);
  assert.equal(a.hypotheses_registered,5);
  assert.equal(a.hypotheses.filter(x=>x.independent_confirmation_by_seed).length,0);
  assert.ok(a.hypotheses.some(h=>h.id==='C4' && /time/i.test(h.forbidden_inference)));
  assert.ok(a.hypotheses.some(h=>h.id==='C5' && h.epistemic_status==='speculative_competing_models'));
  assert.notEqual(a.focus_today.id,snapshot({clock:new Date('2026-11-06T00:00:00Z'),source:'test'}).focus_today.id);
  assert.equal(a.focus_today.experimentally_verified_by_seed,false);
  assert.equal(a.P10_relationship.term_zh,'所有可能的永生');
  assert.equal(a.P10_relationship.finite_survival_or_backup_equivalent,false);
  assert.equal(a.P10_relationship.physically_demonstrated,false);
  console.log('PASS: P13 cosmic horizons, five evidence grades, daily focus, literature pointers, no immortal/time-end claims');
}
if(require.main===module){
  const arg=process.argv[2]||'--self-test';
  if(arg==='--self-test')selfTest();
  else if(arg==='--write')write();
  else throw Error('Expected --self-test or --write');
}
module.exports={load,snapshot,write,selfTest};

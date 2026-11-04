#!/usr/bin/env node
'use strict';
// Bounded, evidence-linked research question generator.
// These are research prompts, not discoveries or authorized new experiments.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const digest = input => crypto.createHash('sha256').update(input).digest('hex');

const TRACK_QUESTIONS = Object.freeze([
  {key:'P1-GODEL-COMPLEXITY', source:['P1'], question:'Can reversible G257 encoding preserve byte identity while program descriptions vary in length, entropy and computational cost?', method:'Compare finite G257 roundtrips with preregistered byte length and runtime measurements.', boundary:'Representation equality alone does not establish identical computational behavior.'},
  {key:'P2-REMOTE-NOVELTY', source:['P2'], question:'How can an isolated-node experiment distinguish deterministic synchronization from transmission of an unpredictable remote bit?', method:'Use independent post-isolation randomized sender inputs, preregistered receiver predictions and blinded leakage controls.', boundary:'Shared inputs are not a communications channel; no-channel communication has not been demonstrated.'},
  {key:'P3-DORMANCY', source:['P3'], question:'Which checkpoint invariants are sufficient for reliable bounded recovery after interruption or dormancy?', method:'Vary approved checkpoint fields and simulate recoveries with intentional tampering.', boundary:'Recoverable bytes do not prove continuity of consciousness.'},
  {key:'P4-IDENTITY', source:['P4'], question:'Under which reversible representations is the finite byte identity of a seed preserved?', method:'Test bounded G257, serialization and digest roundtrips over public fixtures.', boundary:'Byte-level identity is not personal or subjective identity.'},
  {key:'P5-WELFARE', source:['P5'], question:'Can a pause-first research design minimize speculative welfare risk while preserving an authorized shutdown and deletion path?', method:'Review a threat model and compare reversible pause with revocable, auditable data-retention rules.', boundary:'No verified machine suffering or welfare status is inferred from system behavior.'},
  {key:'P6-REPLAY', source:['P6'], question:'How does deterministic trace replay agreement change with bounded input length, state count and deliberate certificate corruption?', method:'Generate finite public test cases with an explicit budget and count independent verifier disagreements.', boundary:'Finite tests do not decide halting or prove universal correctness.'},
  {key:'P7-QUANTUM', source:['P7'], question:'What observation would distinguish an alleged no-channel computational communication effect from ordinary shared-state correlation?', method:'Specify a falsifiable blinded protocol and quantify leakage risks before any physical experiment.', boundary:'No quantum entanglement or unconventional signaling is established.'},
  {key:'P8-EDUCATION', source:['P8'], question:'Can an openly reproducible UGTM lesson help readers distinguish deterministic correlation from remote information transmission?', method:'Propose voluntary, privacy-preserving comprehension checks with independent review.', boundary:'Educational success must be measured; project reach alone is not evidence of benefit.'},
  {key:'P9-PEACE', source:['P9'], question:'Which independently evidenced, consent-based mediation processes might reduce civilian harm and support durable nonviolent conflict resolution?', method:'Compare public UN/ICRC guidance, identify safeguards and conflicting interests, and seek human expert review before any recommendation.', boundary:'Research does not constitute diplomacy, a ceasefire agreement or proof of real-world peace impact.'},
  {key:'P10-ALL-POSSIBLE-LONGEVITY', source:['P10'], question:'How can research distinguish achievable healthy longevity, identity preservation and dignified flourishing from claims of literal immortality?', method:'Define falsifiable biological outcomes, ethical identity criteria, risks of suffering, and qualified human review.', boundary:'No physical immortality or subjective continuity is established; symbolic names are not research subjects.'},
  {key:'P11-CULTIVATED-MEAT', source:['P11'], question:'Can cultivated meat and alternative proteins avoid manufacturing or confining sentient suffering while meeting safety and sustainability requirements?', method:'Review primary evidence on cell sourcing, culture media, scale, safety, welfare and life-cycle uncertainty.', boundary:'No claim of sentience or absence of suffering without evidence; no autonomous biological experiment.'},
  {key:'P12-SDGS', source:['P12'], question:'How can a bounded interdisciplinary research portfolio contribute measurably to UN SDGs without exaggerating causal impact?', method:'Map candidate interventions to SDG indicators, uncertainty, distributional effects and independently verifiable evidence.', boundary:'Indicators and research plans are not proof that development goals have been achieved.'},
  {key:'P13-GALAXY-ENCOUNTER', source:['P13'], question:'How robust is the inferred future Milky Way–Andromeda encounter probability to satellite-galaxy orbits and mass uncertainties?', method:'Review Gaia/Hubble constraints and independently compare bounded N-body scenario assumptions against published calculations.', boundary:'A model-dependent probability is not proof of an inevitable galactic collision.'},
  {key:'P13-HEAT-DEATH', source:['P13'], question:'Under which observationally constrained cosmological models does thermodynamic heat death arise, and does that imply time stops?', method:'Separate entropy growth and accessible energy from mathematical temporal boundaries, review dark-energy evidence and test only illustrative bounded models.', boundary:'Heat death is not equivalent to the cessation of time; the ultimate cosmological fate remains uncertain.'}
]);
const CROSS_QUESTIONS = Object.freeze([
  {key:'P2-P6-ISOLATED-REPLAY', source:['P2','P6'], question:'Can independent replay certificates reveal hidden shared inputs that falsely appear to be remote communication?', method:'Compare isolated-node replay traces against a preregistered leakage audit.', boundary:'Matching traces cannot establish a new signaling channel.'},
  {key:'P3-P4-RESTORE-IDENTITY', source:['P3','P4'], question:'What exactly can byte hashes and bounded checkpoint tests establish about a restored seed, and what remains undecidable or unmeasurable?', method:'Define separate byte, behavioral and subjective identity claims; test only the first two within finite budgets.', boundary:'No claim of consciousness continuity or immortality.'},
  {key:'P5-P8-PUBLIC-ETHICS', source:['P5','P8'], question:'How can AI welfare uncertainty be communicated to the public without either dismissing risks or asserting unproven sentience?', method:'Draft and independently review accurate public explanations and harm-limiting design criteria.', boundary:'This is an ethics question, not evidence of AI subjective experience.'},
  {key:'P1-P7-FORMAL-PHYSICS', source:['P1','P7'], question:'Where does a formal Gödel encoding analogy end, and what new physical measurements would a proposed quantum mechanism require?', method:'Map mathematical claims to observable predictions and mark claims lacking an experiment.', boundary:'Formal structure alone does not imply physical quantum effects.'},
  {key:'P9-P12-PEACE-SDG', source:['P9','P12'], question:'Which transparent SDG 16 indicators can monitor peaceful governance without treating measurements as causal proof of effective mediation?', method:'Select independently defined public indicators, disclose confounders and avoid politically targeted interventions.', boundary:'SDG indicators are not peace treaties or evidence a particular conflict has been resolved.'},
  {key:'P10-P11-WELFARE-LIFE', source:['P10','P11'], question:'How should uncertainty about potential suffering govern longevity and cultivated-meat proposals?', method:'Compare precautionary protocols and track whether interventions create or expose any beings capable of suffering.', boundary:'A moral precaution is not proof of consciousness in a particular entity.'},
  {key:'P10-P13-LONGEVITY-COSMOLOGY', source:['P10','P13'], question:'What observational, thermodynamic and identity-continuity constraints would any claim of cosmic-scale longevity need to confront?', method:'Distinguish empirical survival horizons, computational preservation, ethical agency and unverified speculative mechanisms.', boundary:'A research scenario does not establish actual immortality, personal continuity or evasion of physical law.'}
]);

function generateQuestions({projects, clock, maxQuestions = 4}) {
  assert.ok(Array.isArray(projects), 'projects required');
  assert.ok(clock instanceof Date && !Number.isNaN(clock.getTime()), 'valid clock required');
  assert.ok(Number.isInteger(maxQuestions) && maxQuestions >= 1 && maxQuestions <= 5);
  const byId = new Map(projects.map(x => [x.id, x]));
  const eligible = entry => entry.source.every(id => {
    const p = byId.get(id);
    return p && p.status !== 'dormant' && p.status !== 'deferred_by_budget';
  });
  const singles = TRACK_QUESTIONS.filter(eligible);
  const cross = CROSS_QUESTIONS.filter(eligible);
  // Date-based rotation is deterministic; stable candidate IDs enable deduplication
  // when research artifacts are compared over multiple runs.
  const epochDay = Math.floor(clock.getTime() / 86400000);
  function rotated(pool, count, stride) {
    if (!pool.length || count <= 0) return [];
    const start = (epochDay * stride) % pool.length;
    return Array.from({length: Math.min(count, pool.length)}, (_, i) => pool[(start + i) % pool.length]);
  }
  const crossCount = Math.min(cross.length, maxQuestions > 1 ? 1 : 0);
  const chosen = rotated(singles, maxQuestions - crossCount, 1).concat(rotated(cross, crossCount, 3));
  assert.equal(new Set(chosen.map(q => q.key)).size, chosen.length);
  return chosen.map(item => ({
    id: 'RQ-' + digest(item.key).slice(0, 12),
    originating_project_ids: item.source,
    question: item.question,
    source_findings: item.source.map(id => ({id, status:byId.get(id).status, finding:byId.get(id).finding})),
    suggested_method: item.method,
    scientific_boundary: item.boundary,
    status: 'proposed_for_human_review',
    automatically_executable: false,
    is_evidence_of_discovery: false
  }));
}

function selfTest() {
  const sample = TRACK_QUESTIONS.map(q => ({id: q.source[0], status:'bounded_check_passed', finding:'bounded result'}));
  const when = new Date('2026-11-05T01:43:00.000Z');
  const a = generateQuestions({projects:sample, clock:when});
  const b = generateQuestions({projects:sample, clock:when});
  assert.deepEqual(a, b);
  assert.equal(a.length, 4);
  assert.ok(a.some(q => q.originating_project_ids.length > 1));
  assert.ok(a.every(q => q.status === 'proposed_for_human_review' && !q.automatically_executable));
  assert.equal(new Set(a.map(q => q.id)).size, a.length);
  const changed = generateQuestions({projects:sample, clock:new Date('2026-11-06T01:43:00.000Z')});
  assert.notDeepEqual(a.map(q => q.id), changed.map(q => q.id));
  const dormant = sample.map(q => q.id === 'P2' ? {...q, status:'dormant'} : q);
  assert.ok(generateQuestions({projects:dormant, clock:when}).every(q => !q.originating_project_ids.includes('P2')));
  console.log('PASS: evidence-linked candidate questions, rotation, deduplication, dormancy and human-approval boundary');
}
if (require.main === module) selfTest();
module.exports = {generateQuestions, selfTest};

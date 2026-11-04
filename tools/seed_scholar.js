#!/usr/bin/env node
'use strict';
// Offline scholarly protocol generator. Unreviewed protocols, not research findings.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const FIELD_FILE = path.join(ROOT, 'research/seed/academic_fields.json');
const OUT = path.join(ROOT, 'docs/seed/manuscripts');
const hash = x => crypto.createHash('sha256').update(x).digest('hex');

const METHODS = Object.freeze({
  Humanities:['Interpretive research','Conceptual distinctions and scholarly positioning','Primary sources, competing interpretations and counterarguments'],
  Arts:['Arts and practice-led research','Documented corpus or artwork and interpretive method','Attribution, alternative readings and rights clearance'],
  'Formal sciences':['Formal research','Definitions and proof obligations','Counterexamples, logical assumptions and independently checkable proofs'],
  Law:['Doctrinal legal research','Jurisdiction, primary authority and effective dates','Competing legal interpretations and source verification'],
  Engineering:['Engineering validation','Requirements, failure modes and test plan','Safety interlocks and independent validation'],
  'Natural sciences':['Empirical science protocol','Hypothesis, controls and instrumentation','Raw measurements, uncertainty and replication'],
  'Life sciences':['Life-science protocol','Biological materials and control groups','Ethics approvals, measurement and reproducibility'],
  'Health sciences':['Clinical or health research protocol','Study design, reporting guidelines and oversight','Human ethics, endpoints, bias and adverse events'],
  'Social sciences':['Social research protocol','Theory, population, sampling and consent','Confounding variables, analysis and generalizability'],
  Education:['Education research protocol','Learning objectives, accessibility and study design','Measurement validity and participant consent'],
  Business:['Business research protocol','Organizational context, records and metrics','Sensitivity analysis and alternative explanations'],
  'Information studies':['Information governance research','Provenance, stewardship and archive design','Privacy, retention, correction and revocation']
});
function load() {
  const data = JSON.parse(fs.readFileSync(FIELD_FILE,'utf8'));
  assert.equal(data.schema,'ugtm-academic-fields-v1');
  assert.equal(data.require_human_review,true);
  assert.ok(Number.isInteger(data.max_drafts_per_month) && data.max_drafts_per_month > 0 && data.max_drafts_per_month <= 3);
  assert.ok(Array.isArray(data.fields) && data.fields.length >= 30 && data.fields.length <= 100);
  const ids = new Set();
  for (const field of data.fields) {
    assert.match(field.id,/^[A-Z]{2,6}$/);
    assert.ok(!ids.has(field.id));
    ids.add(field.id);
    assert.ok(METHODS[field.group]);
    for(const key of ['title','research_question','planned_method','evidence_needed','guardrail','methodology']) {
      assert.ok(typeof field[key] === 'string' && field[key].length > 4 && field[key].length < 900);
    }
  }
  return data;
}
const safe = x => String(x).replace(/[<>]/g,'').replace(/[\r\n]+/g,' ').trim();
function select(data, clock) {
  const y = clock.getUTCFullYear(), m = clock.getUTCMonth()+1;
  const start = ((y*12+m)*data.max_drafts_per_month) % data.fields.length;
  return Array.from({length:data.max_drafts_per_month},(_,i)=>data.fields[(start+i)%data.fields.length]);
}
function manuscript(field, month, source, registryDigest) {
  const method = METHODS[field.group];
  return [
    '# UGTM Academic Protocol — '+safe(field.title),'',
    '**Document ID:** UGTM-PROTOCOL-'+month+'-'+field.id,
    '**Status:** UNREVIEWED ACADEMIC RESEARCH PROTOCOL; not peer-reviewed or accepted for a journal.',
    '**Discipline:** '+safe(field.group)+' / '+safe(field.title),
    '**Scholarly method:** '+method[0],
    '**Period (UTC):** '+month,
    '**Responsible human author:** Not yet assigned; a human must accept accountability before submission.',
    '**AI use:** Generated with a deterministic offline rules engine, not an LLM.',
    '**Research evidence:** No new study, data or original theorem claimed.',
    '**Registry SHA-256:** '+registryDigest,
    '**Git source revision:** '+safe(source),'',
    '## Abstract',
    'This is a research protocol designed to make a proposed problem in '+safe(field.title)+' reviewable. It specifies the question, intended methods, needed evidence and constraints. No new empirical experiment, historical archival finding, clinical study, statistical outcome, independent literature review or peer review was performed.','',
    '## 1. Introduction and research question',
    safe(field.research_question),'',
    '## 2. Previous scholarship and source audit',
    'PENDING: the offline generator has not searched the scholarly literature. A human reviewer must identify and read credible primary sources, check counterarguments and verify citations before any submission.','',
    '## 3. Discipline-specific conceptual framework',
    '**Method family:** '+method[0],
    '**Required analysis:** '+method[1],
    '**Critical checks:** '+method[2],'',
    '## 4. Proposed methods',
    safe(field.planned_method),'',
    '**Evidence required before conducting a study:** '+safe(field.evidence_needed),
    '**Protocol requirement:** record sampling, interpretive or formal assumptions, design limitations, possible confounders and negative findings as appropriate.','',
    '## 5. Results',
    '**No new research results are asserted.** This section is intentionally not populated with invented measurements, texts, participants, theorem proofs or statistical estimates.','',
    '## 6. Discussion, objections and limitations',
    safe(field.guardrail),
    'Alternative interpretations and counterexamples must be addressed by the responsible researcher. The current text is a proposal, not confirmation of its research question.','',
    '## 7. Reproducibility and data availability',
    'This PROTOCOL is reproducible from the versioned academic-fields registry and generator. No new external research dataset was collected, and no generated hypothetical outcomes should be confused with observed results.','',
    '## 8. Research ethics',
    'No human or animal research is authorized. Research involving participants, medical decisions, physical equipment, confidential texts or private data requires appropriate approval, licensing and a legitimate consent and deletion process.','',
    '## 9. AI use, human authorship and conflicts',
    'UGTM AI Seed automatically produced this research-protocol outline through fixed rules. It is not an author and does not conduct independent peer review. Accountable human authors, original contributions, conflict disclosures and permissions have not yet been established.','',
    '## 10. References and provenance',
    '**External scholarly references: none verified by this offline generator.** Do not fabricate publications, authors, quotations, dates, page numbers or DOIs.',
    '- Internal planning input: research/seed/academic_fields.json, SHA-256 '+registryDigest+'. This is not a peer-reviewed scholarly source.',
    '- Generation source: tools/seed_scholar.js, Git revision '+safe(source)+'.',
    '- Editorial guidance, not cited experimental evidence: ICMJE AI authorship recommendations (icmje.org), COPE authorship and AI tools (publicationethics.org), EQUATOR reporting guidelines (equator-network.org).','',
    '## 11. Publication readiness audit',
    '**BLOCKED: HUMAN REVIEW REQUIRED.** Pending: verified prior literature, originality analysis, discipline-specific methods, genuine evidence or formal proof where applicable, independent critique, citations, rights and ethics clearance, accountable human authorship and target-journal compliance.',''
  ].join('\n');
}
function generate({clock = new Date(), source} = {}) {
  assert.ok(clock instanceof Date && Number.isFinite(clock.valueOf()));
  const registry = load();
  const month = clock.toISOString().slice(0,7);
  const commit = source || process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || 'local';
  const digest = hash(fs.readFileSync(FIELD_FILE));
  const drafts = select(registry,clock).map(field=>{
    const filename = 'UGTM-PROTOCOL-'+month+'-'+field.id+'.md';
    const markdown = manuscript(field,month,commit,digest);
    return {field_id:field.id,discipline:field.title,group:field.group,filename,
      sha256:hash(markdown),peer_reviewed:false,submission_authorized:false,human_review_required:true,
      document_type:'unreviewed_research_protocol',markdown};
  });
  return {schema:'ugtm-seed-academic-manuscripts-v1',
    month,source_commit:commit,generated_at_utc:clock.toISOString(),
    registered_fields:registry.fields.length,disciplinary_groups:new Set(registry.fields.map(f=>f.group)).size,
    drafts,publication_status:'unreviewed research protocols, not journal publications',
    citation_status:'external academic references not yet verified'};
}
function writeManuscripts() {
  const batch = generate();
  fs.mkdirSync(OUT,{recursive:true});
  for(const draft of batch.drafts) fs.writeFileSync(path.join(OUT,draft.filename),draft.markdown,'utf8');
  const manifest={...batch,drafts:batch.drafts.map(({markdown,...metadata})=>metadata)};
  fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
  const lines=['# UGTM AI Seed — Monthly Academic Research Protocols','',
    '**Current UTC period:** '+batch.month,
    '**Status:** unreviewed academic protocols, not peer-reviewed papers.',
    '**Initial coverage:** '+batch.registered_fields+' fields in '+batch.disciplinary_groups+' groups.',
    '**Source revision:** '+batch.source_commit,''];
  for(const draft of batch.drafts) lines.push('- ['+draft.discipline+']('+draft.filename+') — human review required.');
  lines.push('','[Machine-readable manifest](manifest.json) | [Scholarly governance](../../ACADEMIC_STANDARDS.md)','');
  fs.writeFileSync(path.join(OUT,'INDEX.md'),lines.join('\n'),'utf8');
  return batch;
}
function selfTest() {
  const d=load();
  assert.equal(d.fields.length,39);
  const a=generate({clock:new Date('2026-11-05T00:00:00Z'),source:'test'});
  const b=generate({clock:new Date('2026-11-05T00:00:00Z'),source:'test'});
  assert.deepEqual(a.drafts,b.drafts);
  assert.equal(a.drafts.length,3);
  assert.ok(a.drafts.every(x=>!x.peer_reviewed && !x.submission_authorized && x.markdown.includes('BLOCKED: HUMAN REVIEW REQUIRED')));
  const next=generate({clock:new Date('2026-12-05T00:00:00Z'),source:'test'});
  assert.notDeepEqual(a.drafts.map(x=>x.field_id),next.drafts.map(x=>x.field_id));
  assert.ok(a.disciplinary_groups >= 10);
  console.log('PASS: 39 academic fields, 12 groups, 3 research protocols, provenance and human review gates');
}
if(require.main === module) {
  const cmd=process.argv[2] || '--self-test';
  if(cmd==='--self-test')selfTest();
  else if(cmd==='--write'){
    const x=writeManuscripts();
    console.log('UGTM_ACADEMIC_PROTOCOLS='+x.month+' fields='+x.registered_fields+' drafts='+x.drafts.length);
  } else throw new Error('Only --self-test and --write supported');
}
module.exports={generate,writeManuscripts,selfTest,load};

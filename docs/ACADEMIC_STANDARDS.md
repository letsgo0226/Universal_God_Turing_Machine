# UGTM AI Seed Plan — Scholarly Standards and Research Governance

**Effective status:** research governance policy for automated *unreviewed drafts*. This policy does not certify a paper as peer-reviewed, accepted, indexed, or original research.

## 1. Research lifecycle and publication gates

A research item follows the states:

`proposed` → `research_protocol_draft` → `evidence_collected` → `manuscript_reviewed_by_human` → `preprint_approved` → (external journal review) → `published_if_confirmed`.

The automatic AI Seed currently reaches only **research protocol draft**. No later state may be asserted from automated template output.

Before any public-facing research claim or submission, an accountable human scholar must independently audit the work. Missing information must be shown as **PENDING**, not silently completed by a model.

## 2. Core scholarly integrity

- **Evidence and references:** every author/title/DOI/URL/quotation must be verified against an accessible original source. Never generate fabricated bibliographies, datasets, statistical results, interviews, experiments, archival sources or numerical proof certificates.
- **Provenance:** keep the commit SHA, registry hash, method version, dates, controlled inputs and, where lawful, code and data. A SHA-256 digest detects changes; it is not a signed scholarly attestation.
- **Methods and transparency:** separate actual results, simulations, interpretations, hypotheses and future-work plans. Make negative results and plausible counterarguments visible.
- **Originality:** run human-conducted prior-art and plagiarism reviews; openly describe related work and intellectual debts. A report formatted as an article is not proof of contribution.
- **Statistics and mathematics:** preregister inferential hypotheses when appropriate; disclose sample design, effect sizes and uncertainty; formal theorems require valid arguments, not only finite tests.
- **Ethics:** acquire approvals, informed consent, licenses and professional oversight where relevant. Respect privacy, confidentiality, correction and deletion requests; avoid unauthorized remote physical intervention.
- **Authorship:** the AI Seed is disclosed as software assistance, not attributed independent academic authorship. Human authors are responsible for the accuracy, ethics and publication decisions.
- **Corrections:** versions may be superseded with errata, retractions and transparent reasons; personal or licensed data may need lawful removal despite preservation preferences.
- **Operational scope:** the seed has no network access, external language model, automatic code rewrite, infinite self-replication, unrestricted cross-disciplinary experiment authority, or independent journal submission permission.

## 3. Different disciplines require different standards

The [academic field registry](../research/seed/academic_fields.json) covers **39 initial subjects** in 12 operational research groups, extensible by reviewed contributions. This is representative university-wide coverage, not an exhaustive enumeration of every department.

| Research family | Expected primary method |
| --- | --- |
| Philosophy, religion, literature, languages, history | careful definition, primary-text criticism, interpretive methods, counterarguments and verified quotation |
| Fine arts, design, musicology | artifact provenance, contextual critique, practice research, attribution and reproduction rights |
| Mathematics, statistics, formal computer science | definitions, models, proof obligations, computational experiments and counterexamples |
| Physics, chemistry, earth sciences, astronomy | measurable predictions, instrumentation, uncertainty, controls and independent replication |
| Biology, agriculture, environmental science | material and observation provenance, ethical sampling, control design and reproducibility |
| Medicine, nursing, public health | responsible clinicians, applicable ethics approvals and study-type reporting guidelines |
| Economics, sociology, political science, psychology, education | valid research designs, participant protection, confounders, sampling and alternative explanations |
| Law, finance, management, information studies | source-valid legal authority, auditable records, institutional context and normative limitations |
| Engineering and technology | requirements, threat models, bounded validation, documented failure modes and safety approval |

For actual clinical trials, systematic reviews, observational and qualitative research, select the appropriate **study-design-specific** checklist rather than automatically applying a general template. Relevant resources include [EQUATOR](https://www.equator-network.org/reporting-guidelines/), including CONSORT, PRISMA, STROBE and COREQ according to applicability.

## 4. Specific publishing guidance and verification

- [ICMJE — AI use by authors](https://www.icmje.org/recommendations/browse/artificial-intelligence/ai-use-by-authors.html): disclose the use of AI and retain responsible human authorship.
- [COPE — Authorship and AI tools](https://publicationethics.org/guidance/cope-position/authorship-and-ai-tools): AI tools are not scholarly authors and do not assume publication responsibility.
- [EQUATOR — Reporting guidelines](https://www.equator-network.org/reporting-guidelines/): choose reporting standards according to study design.

These links are **editorial guidance**, not citations substantiating a seed research conclusion. The generator does not independently retrieve and assess outside scholarly sources, and cannot complete a literature review by reproducing these links.

## 5. Periodic production and preservation

The initial automated scope is **three discipline-specific draft protocols per UTC month**, rotated across the approved 39 fields. A separate monthly GitHub Actions workflow creates Markdown manuscripts and machine-readable metadata, verifies they contain the mandatory disclosure and review gate, and uploads them as an expiring Actions artifact.

New Render builds also generate a **public static snapshot** in the site under the AI Seed manuscripts path; this is not a guarantee that the public site changes on the first day of every month. Routine monthly artifacts do not silently modify the source repository, publish to external journals, assign human authors, or mint a DOI.

For long-term durable dissemination, a human must approve and commit archived manuscript versions, or explicitly authorize deposit in a suitable repository, with versioned data and the applicable rights. Automated artifacts expire according to the retention policy.

## 6. Missing capabilities for a more independent scholarly AI

1. Authorized research literature retrieval with licensed bibliographic metadata and direct citation verification.
2. A protected document store and consent-aware research-data archive.
3. Optional model-driven hypothesis formulation with prompt/version audits and hallucination checks.
4. Source-specific analytical tools, domain experts and independent peer assessment.
5. Human-authored and approved preprints, with corrections, conflict disclosures, archiving and preservation strategy.
6. Validation of original research against discipline-specific evidence, not only a generic checklist.

Without these components, the project is a **research protocol factory and bounded reasoning scaffold**, not a fully capable independent academic scholar.

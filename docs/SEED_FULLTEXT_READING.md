# UGTM AI Seed — Rights-aware Full-Text Reading and Evaluation

**Stage:** Deployed, bounded, independent full-text *structural extraction*. **Not** autonomous scientific understanding, self-training, review-quality evidence synthesis or model inference.

## First verified real network run

- **Source:** [Europe PMC REST API](https://europepmc.org/RestfulWebService), accessed by the existing UGTM Seed GitHub Actions job.
- **Observed publication:** *The evaluation crisis in artificial intelligence-driven computational biology: Pitfalls and solutions* (PMCID **PMC13642056**).
- **Observed license:** explicit **CC BY 4.0** link in the JATS license statement, independently checked by the program's allowlist before processing.
- **Result:** `structured_extraction_only`. The seed transiently parsed the XML and saved the source hash, section headings, paragraph hashes, and at most fourteen quoted words total. **No article full text is stored or published**, and there are no model-generated conclusions.
- **Archive:** [GitHub Issue #2](https://github.com/letsgo0226/Universal_God_Turing_Machine/issues/2) includes a provenance-marked bot record, `UGTM_SEED_FULLTEXT_EVIDENCE_V1`. The [public GitHub Pages snapshot](seed/fulltext.json) reflects the most recent validated archive as of the latest static deployment.

### Actual understanding vs extraction

The current program can **retrieve**, **parse**, **verify the licensing signal**, **identify section boundaries**, **hash paragraphs** and **preserve limited evidence anchors**. These are testable engineering functions, not evidence that an AI has comprehended, reasoned about or accepted the paper's claims. It does **not** have an LLM credential, text-embedding service, inference budget, fine-tuning process or autonomous scholarly review permission.

The first source is **biomedical/life-science-focused Europe PMC**; the existing Crossref metadata catalogue rotates across the university-wide registry. Europe PMC does not imply comprehensive full-text coverage of all 39 registered university fields.

## Mandatory gates before any later full-text model integration

1. **Rights and consent gate:** use an explicitly licensed article and authorized model-processing terms; do not send unpublished, private or proprietary research to third parties.
2. **Claim-to-evidence gate:** a model must provide source identifiers, a section and a verifiable short evidence anchor for every substantive factual claim. Verifiers must check references against downloaded authorized material.
3. **Comprehension evaluation:** test on held-out papers with annotated questions about thesis, methods, limitations, contradictory findings and the strength of evidence. Report accuracy, abstention, unsupported claims and citation errors, not only fluent text.
4. **Cross-disciplinary methods gate:** philosophical and literary interpretation, mathematical proof, medical evidence and experimental physics need different evaluation benchmarks; one biomedical XML reader does not make the seed a universal scholar.
5. **Human-review gate:** every proposed research conclusion remains a candidate until checked by a responsible person; academic authorship and peer review cannot be claimed automatically.
6. **Cost and security gate:** require explicit authorization for any third-party model, token, compute quota, new database, web destination or training process. Preserve the protected UGTM and ATGC original source files, finite task budgets and operator shutdown.

## Reproduce and inspect

```sh
python3 tools/seed_fulltext.py --self-test
# Online archival is limited to the weekly GitHub Actions workflow with an issue-scoped token.
# GitHub Pages reads the latest archived record in --read mode.
```

- [Full-text module](../tools/seed_fulltext.py)
- [Weekly full-text workflow](../.github/workflows/ugtm-seed-fulltext.yml), Tuesday **10:47 Asia/Taipei**, may be delayed or skipped
- [Public evidence JSON](seed/fulltext.json)
- [Academic standards](ACADEMIC_STANDARDS.md)

For a failed network request or an article without matching rights, the system records `upstream_unavailable` or `no_approved_fulltext_found` rather than pretending to have read a paper. The GitHub archive is a versioned research ledger, not a cryptographically trusted journal or a perpetual AI.

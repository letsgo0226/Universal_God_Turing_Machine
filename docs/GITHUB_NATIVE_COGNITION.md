# UGTM AI Seed — GitHub Native Cognitive System

**Status:** First bounded GitHub-native cognitive-memory implementation, using an **ACE-inspired** Generator → Reflector → Curator pattern. This is **not** the official ACE3 cognitive OS, not the complete Agentic Context Engineering research code, and not a pretrained LLM or self-governing academic researcher.

## Why GitHub only?

GitHub Actions provides periodic finite runs; GitHub Issues provides a durable, public, permission-controlled record of structured memory; GitHub Pages can publish static scholarly snapshots. A permanently running AI, Postgres database, always-online inference server or external memory cloud is **not** required for this prototype.

**Persistent memory:** [UGTM AI Seed public cognitive ledger — Issue #1](https://github.com/letsgo0226/Universal_God_Turing_Machine/issues/1). The GitHub Actions bot writes one JSON memory record per UTC day, subject to availability and permissions. Unlike an Actions artifact, Issue comments have no fixed 30-day expiration, although they can be edited or deleted by authorized actors and are not an independent backup or cryptographic attestation.

**Execution schedule:** [GitHub-native cognition workflow](../.github/workflows/ugtm-seed-cognition.yml), every day **01:53 UTC / 09:53 Asia/Taipei**, plus approved manual runs or changes to its implementation.

## Core roles

1. **Generator:** reads approved, bounded UGTM P1–P8 experiment findings and emits up to four human-review candidate questions with stable IDs; it never executes unreviewed research.
2. **Reflector:** explicitly labels finite local evidence and flags unsupported claims: quantum entanglement from source code, no-channel new-data transmission, continuity of consciousness, halting-problem oracle or peer-reviewed publication without review.
3. **Curator:** deduplicates a bounded history of question IDs (up to 48), tracks repeat appearances and retains eight finite experiment observation digests. Each record links to the previous digest and records the source Git commit.

### Immutable safety boundary and trust model

- Only the approved **GitHub Issue #1** endpoint is used for archival, with the job scoped to `contents: read` and `issues: write`.
- The memory archivist reads only comments by `github-actions[bot]` with a fixed marker and validated JSON schema. Public comments from others are ignored; comment text is never used as executable instructions.
- The memory digest detects accidental tampering of parsed records. It is **not** a digital signature, proof of authorship or proof of scientific truth. If the GitHub Actions bot token or workflow is compromised, the scheme cannot prevent false records.
- One entry per UTC day limits growth. Scheduled jobs may be delayed, skipped or cancelled. A human may stop the workflow, correct, archive or remove the issue under applicable governance.
- **No** model API tokens, raw unpublished papers, medical or personal data, secrets or copyrighted full texts are to be written into this publicly visible ledger.
- **No** automatic self-replication, source rewrites, external hardware operation, new experiment authorization, GitHub PR merge or journal submission.
- The original UGTM and ATGC shell source files are verified against unchanged Git blob hashes in CI.

## How to reproduce

```sh
node tools/seed_cognition.js --self-test
node tools/seed_github_ledger.js --self-test
node tools/seed_cognition.js --write
```

The last command generates a **genesis/local-only** cognitive snapshot at `docs/seed/cognition.json`; it does not submit a persistent GitHub Issue comment. GitHub Actions uses `node tools/seed_github_ledger.js --archive` with a limited workflow token to read the last bot-authored record, continue the bounded history and append one record.

The storage model is reproducible, but it does not establish a continuously operating identity or self-awareness.

## GitHub Pages activation and migration

The repository already contains a workflow that checks whether GitHub Pages is configured. **GitHub Pages is not yet enabled as of the initial GitHub-native cognitive deployment**; the workflow intentionally skips the optional Pages publication when it is disabled.

The repository owner must enable Pages in **Settings → Pages → Build and deployment → Source: GitHub Actions**:
https://github.com/letsgo0226/Universal_God_Turing_Machine/settings/pages

Once enabled, the existing `UGTM Continuous Verification and Optional GitHub Pages` workflow publishes the `docs` site, bounded seed status, monthly academic protocol snapshot and latest validated issue-ledger memory JSON. No external database or server is needed for this **GitHub Pages** path. Publication and availability must be checked in Actions; enabling the setting alone is not proof of a successful deploy.

The original Render service is **left unchanged as a fallback** until GitHub Pages publication has been verified and an intentional migration decision is made. Merely committing to GitHub can still trigger the existing Render auto-deploy setting; it is not disabled by GitHub-native cognition.

## Research integrity

See [UGTM AI Seed](AI_SEED.md) and [Academic Standards](ACADEMIC_STANDARDS.md). The system currently produces rule-based study questions and unreviewed academic protocol outlines, not peer-reviewed scientific papers, original validated discoveries or a general-purpose autonomous scholar. There is no official ACE3 service, language-model inference, new physical mechanism, or persistent conscious agent deployed here.

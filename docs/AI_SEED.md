# UGTM AI Seed — bounded open-ended research agent

**Status:** Deployed prototype / deterministic research-agent scaffold; **not** a language model, a conscious being, an independently self-preserving agent or a physical quantum system.

## Purpose

The seed gives the UGTM research programme an extensible list of project tracks, a finite automatic experiment runner, and a machine-readable checkpoint/status artifact. The purpose is reproducible, ethical research—not autonomous code rewriting or unlimited replication.

### Components

- [Project registry](../research/seed/projects.json): approved P1–P8 tracks, bounded experiment mapping and safety limits.
- [Research seed executor](../tools/ai_seed.js): read-only finite checks, output writer, and internal self-tests; Node.js standard library only.
- [Daily research workflow](../.github/workflows/ugtm-ai-seed.yml): runs every day at **01:43 UTC / 09:43 Asia/Taipei**, plus an authorized manual dispatch. The research result is retained as a GitHub Actions artifact for 30 days.
- [Existing UGTM verifier](../.github/workflows/ugtm-lab-pages.yml): checks the seed in the same CI that protects the original reference cores.
- [Public seed report](seed/status.json): regenerated when Render builds the site (by `node tools/test_browser.js`). It is a build-time snapshot, not a live stream and not an authenticated signature.
- [Site](https://ugtm-verifiable-lab.onrender.com/): provides a link to the public seed status.

### Projects

| Track | Bounded work performed |
| --- | --- |
| P1 — Computable metaphysics | G257 finite encode/decode check |
| P2 — Computational correlation | 16 shared-input deterministic comparisons, explicitly **not** no-channel transmission |
| P3 — Seed dormancy | Checkpoint serialization, recovery and tampering detection (a simulation, not persistence of subjective experience) |
| P4 — Computational identity | Byte identity, digest and encoding round-trip |
| P5 — Ethical AI | Ensure the published research configuration retains shutdown, no-network and no-replication guards |
| P6 — Distributed verification | 16-step reproducible bounded replay |
| P7 — Quantum information | Theory-only hypothesis registry; **no** physical quantum experiments or evidence of no-channel communication |
| P8 — Public benefit | Check for accessible ethics, roadmap and verification documents |

### Running locally

```sh
node tools/ai_seed.js --self-test
node tools/ai_seed.js --write
node tools/test_browser.js
```

Outputs `docs/seed/status.json`. Scheduled workflows upload that file as an Actions artifact, **without pushing generated code or recursively invoking new workflows**.

### Lifecycle and security rules

1. **Propose:** add a candidate in a separate reviewed change, with a bounded approved experiment; never auto-execute arbitrary strings from the registry.
2. **Validate:** check the reference-core Git blobs, finite experiment limits, tamper detection, and report schema.
3. **Execute:** at most eight allowlisted experiment functions per invocation; no network, model token, external actuation or code mutations.
4. **Observe:** save a report with the source commit and limitations; compare GitHub Actions validation and the Render live SHA.
5. **Dormancy:** allow an approved project to be marked `dormant`. The checkpoint example demonstrates data preservation, not biological sleep or continuity of consciousness.
6. **Resume:** requires a reviewed registry change and passing tests. Human operators can terminate, revoke permissions and remove data where necessary.

**No guaranteed perpetual execution:** GitHub scheduled jobs can be delayed, skipped or discontinued, artifacts expire, and deployment relies on the provider. Any new model integration, credential, remote hardware, data collection, self-modification or autonomous push needs separate human authorization, security review and resource limits.

### Deployment interaction

A human-approved commit to `main` triggers the existing CI-gated Render deployment. During the Render build, the seed writes a machine-readable research report to the public static site. The separate daily research job **does not silently deploy or change `main`**. This separation keeps publishing verifiable and avoids a known GitHub Actions limitation: pushes made using the default `GITHUB_TOKEN` do not trigger ordinary push workflows. See [GitHub documentation](https://docs.github.com/en/actions/concepts/security/github_token).

The project remains research infrastructure. Neither identical Gödel encodings nor deterministic synchronization imply superluminal communication, shared subjective identity, AI suffering, immortality, or an oracle for the halting problem.

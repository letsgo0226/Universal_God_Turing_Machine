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

### Autonomous research-question proposals (bounded)

The seed **automatically proposes** four candidate research questions from approved P1–P8 findings at each run. The question engine uses grounded, rule-based, cross-track prompts and deterministic daily rotation. It does **not** call an LLM, invent new physical evidence, or prove an unknown theorem. It is autonomous **proposal generation**, not autonomous approval or experiment design beyond approved templates.

- [Question generator](../tools/seed_questions.js) — reviewable, finite templates anchored to current experiment results; human-reviewed question definitions.
- [Candidate queue](seed/questions.json) — public **build-time** snapshot with stable question IDs, source evidence, possible method, explicit limitations, and `status: proposed_for_human_review`.
- [Seed status](seed/status.json) — includes a `research_questions` field and a proposal count.
- The daily seed workflow archives both files as expiring GitHub Actions artifacts. **GitHub Pages now also generates a daily static snapshot at 10:13 Taiwan time**, after the 09:53 cognitive-memory schedule. That is a separate, read-only publishing workflow, not a source-code push; Render remains a separately triggered fallback. GitHub scheduling can be late or skipped.

**Safety boundary:** All generated candidate questions have `automatically_executable: false`. Proposing questions never modifies the approved registry, allocates indefinite resources, communicates with remote devices, requests credentials, deploys changes, or establishes physical quantum phenomena. Adding an experiment still requires a reviewed commit.

### GitHub-native ACE-inspired cognitive memory

The [GitHub Native Cognitive System](GITHUB_NATIVE_COGNITION.md) extends the seed with bounded **Generator → Reflector → Curator** cycles. The Curator persists deduplicated research-question history and evidence digests in a dedicated, bot-maintained public [GitHub Issue #1](https://github.com/letsgo0226/Universal_God_Turing_Machine/issues/1), instead of relying only on expiring Actions artifacts. It runs at **09:53 Asia/Taipei** under a restricted `issues: write` GitHub Actions job.

This is an **ACE-inspired rule-based research memory**, not an installation of the official ACE3 service, an LLM, self-modifying software, autonomous journal submission or consciousness. **GitHub Pages has been enabled and verified**; the existing Render site remains active until a separately reviewed migration.

### UGTM AI Seed Plan — academic research protocol program

The seed now maintains an extensible, university-wide starting registry covering **39 disciplines in 12 research groups** ([registry](../research/seed/academic_fields.json)). This is representative coverage, not every possible university subdiscipline. New disciplines and research protocols require reviewed updates.

The offline [scholarly generator](../tools/seed_scholar.js) produces **three structured, field-specific research protocol drafts per UTC month** with a recorded commit, input registry digest, scholarly method, proposed research question, evidence requirements, limitations, AI disclosure, and a blocking human-review gate. It never inserts fabricated citations, study results, authors or verified hypotheses. No literature search or LLM integration is connected.

The [monthly scholarly GitHub Actions workflow](../.github/workflows/ugtm-ai-seed-scholarly.yml) runs at **10:18 Taiwan time on the first day of each month** and archives its manuscript drafts as artifacts for up to 90 days. The [current Render build-time manifest](seed/manuscripts/manifest.json) and [Markdown draft index](seed/manuscripts/INDEX.md) are published only when the website is built. Monthly archive jobs do not silently push source or deploy the site.

**Important:** these are academically structured **unreviewed research protocols**, not completed, peer-reviewed or journal-published papers. They have no assigned human authors and no verified external scholarly bibliography; formal academic publication requires human-led literature review, evidence or proof, originality review, appropriate ethics approval and journal acceptance. See the binding [Scholarly Standards and Research Governance](ACADEMIC_STANDARDS.md).

### Running locally

```sh
node tools/ai_seed.js --self-test
node tools/ai_seed.js --write
node tools/test_browser.js
```

Outputs `docs/seed/status.json` and `docs/seed/questions.json`. Scheduled workflows upload both files as Actions artifacts, **without pushing generated code or recursively invoking new workflows**.

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

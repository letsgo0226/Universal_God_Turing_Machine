# UGTM continuous verification and deployment

**Status:** end-to-end GitHub Actions → Render automatic deployment **verified on 2026-11-05 (Asia/Taipei)** for commit `d49bfb929994cb5ad8f06c4428a9b06fb111f4a1`.

## Automated tests and triggers

Workflow: [UGTM Continuous Verification and Optional GitHub Pages](../.github/workflows/ugtm-lab-pages.yml)

- Every push to the default `main` branch.
- Every pull request targeting `main`.
- Scheduled verification every day at **00:17 UTC = 08:17 Asia/Taipei**. GitHub scheduled jobs may be delayed or skipped under platform conditions.
- Manual `workflow_dispatch` invocation if a maintainer explicitly runs it.

The verification job checks the unchanged Git blob identity of both original UGTM and ATGC Shell programs, executes their built-in examples, then runs these tests:

~~~sh
python3 tools/verify_trace.py --self-test
node tools/test_browser.js
python3 tools/verify_trace.py /tmp/ugtm-browser-certificate.json
python3 tools/test_differential.py
~~~

The regression suite tests **finite** computation, deliberately altered JSON reports, and G257 round trips. Passing is not a proof of arbitrary halting, AI safety, immortality, or correctness for all programs. All tests may fail and require a human to investigate; the pipeline must not automatically rewrite scientific claims based on a failing test.

## Deployment destinations

### 1. Render (primary public laboratory)

- Service: [ugtm-verifiable-lab](https://ugtm-verifiable-lab.onrender.com)
- Deployment control: [Render dashboard](https://dashboard.render.com/static/srv-dbllfdff3r2c73dvfns0)
- Repository/branch: `letsgo0226/Universal_God_Turing_Machine` → `main`
- Build command: `node tools/test_browser.js`
- Publish path: `docs`
- Configured automatic deployment: **yes**, triggered on commit.
- Verified automatic acceptance deployment: `d49bfb929994cb5ad8f06c4428a9b06fb111f4a1` — Render deployment `dep-dblndbmq1p3s73dutef0`, `trigger=new_commit`, `status=live`, following passing GitHub Actions run `41885575124`.

**Acceptance evidence:** GitHub Actions run [`41885575124`](https://github.com/letsgo0226/Universal_God_Turing_Machine/actions/runs/41885575124) completed successfully on `d49bfb92`; Render then created deployment `dep-dblndbmq1p3s73dutef0` with `trigger=new_commit`, and confirmed the matching commit `live`. Thus this particular GitHub-to-Render automatic deployment passed an end-to-end check. Each future deployment still requires its own verification.

### 2. GitHub Pages (optional second public mirror)

The workflow first queries GitHub Pages' site status. If Pages has not been enabled, **only the optional Pages publication is skipped**; test results are not marked as failed for that reason.

A repository maintainer may activate it once at:

[Repository Settings → Pages](https://github.com/letsgo0226/Universal_God_Turing_Machine/settings/pages)

Select **Build and deployment → Source → GitHub Actions**. Thereafter, the workflow can publish the `docs` folder on future pushes or a manually dispatched run. No new personal access token is required to deploy an already-enabled Pages site using the standard workflow permissions. Enabling Pages automatically through `actions/configure-pages` with the default `GITHUB_TOKEN` alone is not sufficient.

## Research governance

- [Where We Will Be Going](WHERE_WE_WILL_BE_GOING.md): truth, exploration, and care as proposed philosophical and ethical principles.
- [Public-benefit roadmap](PUBLIC_BENEFIT_ROADMAP.md): suggested milestones, not automatically accomplished objectives.
- [Finite verification report](VERIFICATION.md): evidence and limitations.

The schedule **automates repeated checks**, not autonomous invention, interpretation of spiritual claims, direct changes to the base UGTM/ATGC shells, or deployment of unreviewed new research directions. Human review remains necessary before accepting new mathematical theorems, personal-data features, or public-benefit claims.

## Quick audit

1. Inspect the **Actions** tab for the most recent **UGTM Continuous Verification and Optional GitHub Pages** job and check whether the `verify` job concluded `success`.
2. Compare the tested commit SHA in Actions with the `main` HEAD.
3. Inspect the [Render deploy history](https://dashboard.render.com/static/srv-dbllfdff3r2c73dvfns0) and compare its live commit SHA.
4. If GitHub Pages is enabled, confirm its optional deploy step and published URL separately.

This document reports configuration and specific observed deployment states; it does **not** guarantee future availability or perfect, fully unattended operation.

## Public deploy provenance and safe recovery

The Render static build executes `node tools/test_browser.js` and, **after the smoke tests succeed**, writes `docs/build-info.json` containing `RENDER_GIT_COMMIT` as the publicly served source revision. Render documents this variable as available during builds. The browser front page displays that revision if the manifest can be read. This is a provenance *label*, not a signed attestation.

Independent read-only audit command:

~~~sh
python3 tools/audit_deploy.py --expected-sha "$(git rev-parse HEAD)"
~~~

It reports `MATCH`, `STALE`, or `UNVERIFIABLE`. It does not automatically rewrite or deploy anything. Daily GitHub Actions scheduled tests run the same audit with `--warn-only`; an unavailable public site will not cause a mathematical regression check to be misrepresented as a failure.

**Connecting the Git provider:** Render deployments originating from unauthenticated public Git URLs can fail to receive automatic push events, even if the service reports `autoDeploy=yes`. The user has since configured the service in Render; the observed `new_commit` deployment after a successful GitHub run establishes that the integration is working for this tested commit. For future regressions, inspect [Render Settings and Deploys](https://dashboard.render.com/static/srv-dbllfdff3r2c73dvfns0) and compare CI and live SHA before claiming a release is current.

A separate daily **ChatGPT deployment-health watch** is enabled on the user's account (09:15 Asia/Taipei), which compares verified CI and live revisions, and may attempt a safe latest-commit redeploy when the exact matching CI is green. This watchdog is a fallback; it is not a substitute for a correctly connected Render webhook or formal CI-gated delivery. The personal ChatGPT automation is not part of the public GitHub Actions workflow and depends on its own task and connector availability.

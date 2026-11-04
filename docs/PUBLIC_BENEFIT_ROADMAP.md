# UGTM — Public-Benefit Roadmap
## 從「計算的普遍性」走向「知識與生命的庇護」

**Status:** Proposed implementation roadmap; milestones are *acceptance criteria*, not completed claims.  
**Governing philosophy:** [Where We Will Be Going](WHERE_WE_WILL_BE_GOING.md).

### Milestone A — Truth / 真理可驗證

**Goal:** a stranger can clone the repository, execute the published tests, and distinguish proved claims from limited empirical tests.

Deliverables:
- Keep the original UGTM and ATGC source blobs unchanged unless an explicitly reviewed change is accepted.
- Run `python3 tools/verify_trace.py --self-test`, `node tools/test_browser.js`, and `python3 tools/test_differential.py` from one reproducible CI job.
- For any failed test, report the first divergent program, input, trace position, and reference version.
- Specify a reproducible SHA-256 checksum manifest for test fixtures and results. Do not present an ordinary JSON result as a digital signature.

**Acceptance criteria:** independent clone passes all tests; at least one deliberately modified trace is rejected; CI completion status is publicly visible.

### Milestone B — Stars / 探索可學習

**Goal:** turn finite computation into an understandable teaching experience.

Deliverables:
- A step-by-step single-transition viewer, including program counter, tape head, current byte, input cursor and output bytes.
- Three interactive lessons: Gödel encode/decode; anonymous recursion versus semantic self-reference; bounded execution versus the halting problem.
- User-provided bounded examples with helpful error messages for malformed brackets.
- Bilingual explanations (繁體中文 / English).

**Acceptance criteria:** a novice can reproduce the built-in `S` example and explain why `STEP_LIMIT` is *not* a proof of an infinite loop.

### Milestone C — Shelter / 庇護可實踐

**Goal:** evaluate the actual social benefit without making unverified metaphysical promises.

Deliverables:
- Accessibility checks: mobile layout, keyboard navigation, high-contrast labels and screen-reader text.
- Optional and entirely voluntary feedback about comprehension and usability, with no collection of sensitive personal stories.
- A short risk register: mistaken claims about immortality, false certainty, CPU/memory exhaustion, unsafe source execution and loss of user trust.
- An independent community review of the ethics charter; revisions must be recorded transparently.

**Acceptance criteria:** participants can use the educational examples without creating accounts; any collected feedback is optional and disclosed; a known-limitations document is easy to find.

### Milestone D — Immortality as a question / 永生作為未竟問題

**Goal:** study preserving knowledge and transmitting care without pretending to have solved literal immortality.

Potential research questions:
- Which mathematical properties are invariant under reversible change of representation?
- How can finite executions be verified without trusting a model's narrative of its own correctness?
- Can educational tools measurably improve the ability to recognize unsupported claims?
- What does the right to be forgotten require if a system offers voluntary personal archives?

**Acceptance criteria:** publish a paper or open notebook that separates definitions, hypotheses, counterexamples, reproducible computations and non-computational philosophical claims.

---

## Tracking metrics

| Metric | Definition | Limit |
| --- | --- | --- |
| Verification agreement | matching finite cross-language trace objects / total tested | does not prove general correctness |
| Tamper rejection | altered certificate variants rejected / tested alterations | does not provide cryptographic authenticity |
| Education completion | users who voluntarily finish a lesson / those who began | no inference about spiritual insight |
| Accessibility coverage | interface checks passed / checks defined | no guarantee of universal usability |
| Privacy adherence | disclosed data flows and consent/deletion tests passed | no claim of zero risk |

Do **not** treat GitHub stars, page visits, program complexity, output entropy, or the system's name as evidence that the machine gives life, consciousness, moral superiority, or knowledge beyond computability.

## First public milestone to prioritize

Make the verifier, the interactive viewer and the limitations explanation independently reviewable. Celebrate a successful skeptical reproduction, not a grand title.

See [verification results](verification-results.json), [detailed methods](VERIFICATION.md) and the [live lab](https://ugtm-verifiable-lab.onrender.com/).

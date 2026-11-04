# UGTM: reproducible bounded-computation verification report

**Report date:** 2026-11-05 (Asia/Taipei)  
**Scope:** engineering validation of the UGTM/Schumann Machine public lab; **not** a proof of universal correctness, safety, or non-computable capabilities.

## Unchanged original cores

| Core file | Git blob SHA-1 | Role |
| --- | --- | --- |
| `Universal_God_Turing_Machine.sh` | `23c7bdcc123bcdec8c7ee21f8e4cb07881ccf34d` | Python Z-combinator Brainfuck-8 demonstration, two built-in sample programs |
| `lfp_atgc_tm_2kb.sh` | `70b8423d3b5f254ce3011336b868edc20674b8bd` | Finite G257/empirical Shannon-entropy candidate selector |

The browser and replay verifier are **separate implementations of the documented Brainfuck-8 instruction behavior**. Running the browser interpreter is **not** executing the original Python Z-combinator interpreter. Retaining blob IDs permits checking that those original source files were not overwritten.

## Reproduction commands

From the GitHub repository root, with Python 3 and Node.js installed:

~~~sh
sh Universal_God_Turing_Machine.sh
sh lfp_atgc_tm_2kb.sh
python3 tools/verify_trace.py --self-test
node tools/test_browser.js
python3 tools/verify_trace.py /tmp/ugtm-browser-certificate.json
python3 tools/test_differential.py
~~~

The existing GitHub Pages workflow invokes these tests before attempting deployment. GitHub Actions and Render deployments must be independently checked; a successful local run is not itself a completed cloud build.

## Deterministic local test results

Command: `python3 tools/test_differential.py`

| Measurement | Observed |
| --- | ---: |
| Cross-language Python/JavaScript test cases | 120 / 120 matched |
| Cases ending within the selected bound | 38 |
| Cases reaching the finite step bound | 82 |
| Deliberately modified certificates rejected by the Python verifier | 960 / 960 |
| G257 encode/decode comparison cases | 40 / 40 |
| Random-number generator seed | 20261105 |

These numbers were measured in the local working environment running the matching reference semantics. They are a **finite deterministic regression result** and do not imply all possible programs have been tested. Read [verification-results.json](verification-results.json) for machine-readable values. CI may provide a separate result when executed.

### Cases represented

The test covers examples with input/output; output bytes `00`, `53` and `ff`; 8-bit wraparound; a two-sided tape including negative head positions; nested loops; a non-terminating example within a step bound; no-instruction ASCII comments; empty program; empty input; and deterministically generated programs using 15 instruction fragments. The Python and JavaScript programs produce entire trace objects, which are compared field by field. Bracket matching and execution resources are bounded.

The 960 negative tests change **one of eight certificate properties per original case**: schema, model label, referenced core blob, status, step count, output, first trace cell (or inserts a trace entry if empty), or an unexpected top-level field.

### Claims established only for these executions

1. The Python verifier and browser JavaScript transition replay agreed on all 120 tested finite traces.
2. The tested altered records failed replay verification.
3. The tested G257 byte sequences produced matching integer encodings and decoded to their original bytes.
4. A reported `HALTED` means the program counter reached the end **within the bound**. `STEP_LIMIT` means the bound was reached, and **does not prove divergence**.

### Claims **not** established

- That the original Z-combinator core runs arbitrary untrusted Brainfuck programs safely or indefinitely on finite hardware.
- General correctness of either implementation, security against malicious input, or completeness of tests.
- A proof of Kleene's second recursion theorem, a universal halting oracle, or any hypercomputational capability.
- That a matching replay certificate is cryptographically signed or tamper-proof: a party can recompute and replace an entire valid certificate.
- A measurement of public adoption, educational benefit, or reductions in real-world suffering.

## Model assumptions and limitations

Program text is ASCII (maximum 4000 chars); Brainfuck cells are unsigned bytes modulo 256; sparse tape coordinates can be negative; missing cells read as zero; exhausted input writes zero; all eight standard operations are supported. Step limit: 1 through 10,000; byte input limit: 4096. Matching brackets are required, including for unreachable code. Non-instruction ASCII characters are treated as no-ops, but still consume a recorded step.

The `[` and `]` jump replays the original UGTM approach: jumping to the matching bracket, which is visited on the next iteration, rather than skipping directly past it. The test verifies equivalence of the two **implementations** at the tested finite steps, not semantic identity with every possible Brainfuck variant.

The SHA-1 string in the certificate is a source **reference identifier**, not a signature. Certification depends on trusting the verifier, local execution environment and supplied program/input; separate integrity and supply-chain measures would be necessary for adversarial deployments.

## Suggested next independent review

A third party should clone the repository, confirm the source blobs, reproduce the JSON report, manually inspect a small recorded transition trace, and add a new adversarial test that was not designed by the project authors. Only thereafter should the scope of the tool be widened.

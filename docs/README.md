# UGTM Verifiable Computation Lab

This public experiment is an **additive deployment layer**, not a replacement for the existing Universal God Turing Machine (UGTM) cores.

| Component | Purpose |
| --- | --- |
| Universal_God_Turing_Machine.sh | Original Z-combinator / Brainfuck-8 demonstration. Git blob: 23c7bdcc123bcdec8c7ee21f8e4cb07881ccf34d. |
| lfp_atgc_tm_2kb.sh | Original finite G257 / empirical Shannon entropy selector. Git blob: 70b8423d3b5f254ce3011336b868edc20674b8bd. |
| docs/index.html | Mobile-friendly browser lab: bounded Brainfuck interpreter, replayable trace JSON, G257 encoding and finite selector. |
| tools/verify_trace.py | Independent Python reconstruction and checking of all bounded state transitions in trace certificates. |
| .github/workflows/ugtm-lab-pages.yml | CI checks and GitHub Pages publication. |

## Run and verify

From the repository root:

~~~sh
sh Universal_God_Turing_Machine.sh
sh lfp_atgc_tm_2kb.sh
python3 tools/verify_trace.py --self-test
python3 tools/verify_trace.py ugtm-trace.json
~~~

The final command checks a certificate downloaded from the browser interface. The verified statement is narrowly defined: **under the reference implementation's state-transition semantics, this finite trace is consistent with replay**. HALTED means the program counter reached the end during the bound; STEP_LIMIT means execution has not been shown to halt within the bound, **not** that it runs forever.

The idealized Brainfuck-8 model is Turing complete; the concrete Python and browser executables have finite time and memory. G257 encode/decode identity does not prove a Kleene semantic fixed point, and a JSON certificate is not digitally signed.

## Deployment

The GitHub Actions workflow tests the unchanged original core blob hashes, executes each original program's built-in sample, and runs positive/negative trace verification tests before building the Pages artifact.

If the deployment job fails because Pages has not been enabled: open **Settings → Pages → Build and deployment → Source → GitHub Actions** and rerun the workflow. The expected URL after a successful Pages deployment is under the repository's GitHub Pages site; do not treat the URL as live until the workflow succeeds.

This prototype does not claim a halting oracle, a general proof of Kleene's recursion theorem, a purely functional lambda-calculus interpreter, or a novel universality theorem.

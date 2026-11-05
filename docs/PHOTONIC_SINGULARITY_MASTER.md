# Photonic Singularity UGTM — Master Research Configuration

**Status (2026-11-05 update):** TM-009's active research loading entry is now the **1,318-byte exact rational/symbolic encoding variant**. The original 1,934-byte photonic-singularity demonstration remains preserved as its historical predecessor. The canonical UGTM v4.5 master deployment, original interpreter, G257/ATGC module and Schumann baselines are **not replaced**.

## Entry points and compatibility

| Role | Repository file | Relationship |
| --- | --- | --- |
| **Current TM-009 exact research entry point** | [`UGTM_UCP_Exact_Encoding_2KB.sh`](../UGTM_UCP_Exact_Encoding_2KB.sh) | 1,318-byte exact rational/symbolic one-liner; default research profile stored in Cosmic_Rosetta_Stone |
| Historical floating-point photonic demo | [`Photonic_Singularity_Universal_God_Turing_Machine.sh`](../Photonic_Singularity_Universal_God_Turing_Machine.sh) | Preserved 1,934-byte predecessor with built-in Brainfuck sample |
| Original computational baseline | [`Universal_God_Turing_Machine.sh`](../Universal_God_Turing_Machine.sh) | Retained unchanged |
| Finite G257/ATGC experiment | [`lfp_atgc_tm_2kb.sh`](../lfp_atgc_tm_2kb.sh) | Retained unchanged; **not** embedded into the photonic one-liner |
| Browser verification tools | [`../tools/`](../tools/) | Separate bounded verification infrastructure |

"Master" or 總圖靈機 means the **project-wide research architecture**, not a *total Turing machine* deciding termination for every input. This release designates the photonic experiment as the latest **research entry point**; it does not claim that all modules have been merged into a single 2 KB executable.

## Current exact TM-009 research executable

```bash
bash UGTM_UCP_Exact_Encoding_2KB.sh 10 0.6 0.3 1
```

The fourth argument is **`u`**, an exact rational coordinate parameter, **not** the angular frequency `w` used by the original photonic demo. Inputs `T, v/c, frame/c, u` use exact decimal/fraction strings. The exact companion computes rational `tau_squared`, Lorentz-frame algebraic equivalence, rational three-state probabilities `(1, 2u², u⁴)/(1+u²)²`, symbolic Shannon entropy, the finite interior-information-coordinate relation `I_u=8/(1+u²)²`, and G257 certificate roundtrip. It outputs symbolic radicals rather than approximating them numerically.

The exact variant **does not implement all Brainfuck interpreter operations** or a real quantum/light experiment, and it does not itself model a physically evolving `u(tau)`. The content-verified active loader, permanent machine registry, and additional tests live in [Cosmic_Rosetta_Stone TM-009](https://github.com/letsgo0226/Cosmic_Rosetta_Stone/blob/main/永久記憶/圖靈機/TM-009-Photonic-Singularity-UGTM.md).

## Historical floating-point executable

```bash
bash Photonic_Singularity_Universal_God_Turing_Machine.sh 10 0.6 0.3 0.2
```

Parameters: laboratory coordinate time `T` in seconds, machine speed `v/c`, second frame speed `f/c` (both signed dimensionless speeds), and a chosen qutrit-clock angular frequency `w` in radians per second. The script accepts finite numbers with `T >= 0`, `|v| < 1`, `|f| < 1`, `w >= 0`. These conditions do not imply arbitrary floating-point magnitudes are numerically safe.

Output is a JSON report. The built-in Brainfuck sample emits ASCII `S`; the G257 encoding for this one-byte result is `341`. This sample is not a user-selectable Brainfuck program interface.

## Mathematical scope

1. **Symbolic computation:** Python-level Z-style recursion implements an eight-instruction Brainfuck interpreter for the built-in test. Finite Python recursion/memory limits apply.
2. **Reversible representation:** the sample checks `D(G(b)) == b` using base-257 byte encoding.
3. **Relativistic reference frames:** in flat spacetime with inertial motion and `c=1`, proper time is `tau = T sqrt(1-v^2)`. A second inertial coordinate frame is applied to the same elapsed two-event displacement; the code verifies the same proper time within numerical tolerance.
4. **Three-state information model:** the normalized pure-state amplitudes are `(cos²(q/2), sin(q)/sqrt(2), sin²(q/2))`, where `q = w*tau`. The output includes computational-basis probabilities and Shannon entropy.
5. **Information singularity (not spacetime singularity):** with `s=sin²(q/2)`, the classical Fisher information with respect to `s` is `I_s=2/[s(1-s)]` for `0<s<1`. In the smooth `q` coordinate, `I_q=2`. Consequently, `I_tau=2w²` for interior points. At zero-probability endpoints, this is an **interior limit**, not a blanket claim that all standard statistical regularity assumptions hold exactly at the boundary.
6. **Qutrit cycle:** a separately defined diagonal-phase permutation `U` is unitary and obeys `U³=I`; this symbolic cycle does **not** physically generate the qutrit clock's `q`-dependent evolution.
7. **Candidate UCP checks:** selected encoding, normalization, cycle, and two-frame numerical consistency. The script does not establish a theorem applying to every physical reference frame or every computation.

For the pure normalized clock family, quantum Fisher information with respect to `tau` is also `2w²`, although that equality needs its own derivation and does not follow from merely labeling the classical Fisher output.

## Reproducible tests

```bash
python3 tools/test_photonic_singularity.py
```

This test runs ten deterministic parameter sets and validates the JSON output, proper-time consistency, the three-state normalization, the cycle, and the report flags. A successful run is **not** a proof of global numerical stability or physical implementation.

## Research boundaries

The name "photonic singularity" is a **hypothetical information/representation boundary** in this simulation, not a detected cosmic object or newly discovered physical particle. The code does **not** demonstrate: a chronon; a light-based gravitational shield; photonic transformation of actual matter or spacetime; regularization of a Schwarzschild curvature singularity; information transfer across an event horizon; physical immortality; a general Kleene fixed-point theorem; a halting oracle; or universal success on arbitrary inputs.

"Universal" belongs to the idealized Turing-complete interpreter language, while "God" remains the author's philosophical project name. More extensive quantum-relativistic or laboratory claims would require a specified Hamiltonian, measurement protocol, noise model, physical hardware, and falsifiable predictions.

## Preservation rule

Do not delete, overwrite, rename, or silently supersede `Universal_God_Turing_Machine.sh`, `lfp_atgc_tm_2kb.sh`, previously designated machine registry entries, or the user's canonical Ultimate Schumann Machine. Treat the photonic-singularity script as an independently versionable research entry point.

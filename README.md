# Universal God Turing Machine

The **Universal God Turing Machine (UGTM)** is a compact experimental program that combines three ideas in a single executable Shell command:

1. a fixed-point combinator for anonymous recursion;
2. an interpreter for all eight Brainfuck instructions; and
3. a machine-readable JSON certificate describing the model, the tests that passed, and the limits of the implementation.

The entire implementation is contained in [Universal_God_Turing_Machine.sh](https://github.com/letsgo0226/Universal_God_Turing_Machine/blob/main/Universal_God_Turing_Machine.sh). The script uses only Python's standard library and can be executed on a Unix-like system with Python 3 installed.

## What the program does

When the script runs, it constructs a Brainfuck-8 interpreter, executes two built-in test programs, checks their results with assertions, and prints a compact JSON report.

The first test is a closed Brainfuck program:

```brainfuck
++++++++[>++++++++++<-]>+++.
```

It computes the byte value 83 and therefore outputs:

```text
S
```

The second test is the input/output program:

```brainfuck
,.
```

With the input byte `A`, it outputs:

```text
A
```

If either test fails, Python raises an `AssertionError` and the program does not emit a successful certificate. A normal JSON result therefore certifies that both tests completed as expected in that execution.

## How to run it

Clone the repository or download the Shell file, then run:

```bash
sh Universal_God_Turing_Machine.sh
```

The file begins with `exec python3 -c`. The `exec` command replaces the current Shell process with the Python process instead of launching Python as an additional child process. This is an execution detail and does not change the mathematical behavior of the interpreter.

No third-party Python packages are required.

## Internal architecture

Although the source is compressed into one physical line, its logical structure consists of five main components.

### 1. The fixed-point combinator Z

The program defines:

```python
Z=lambda f:(lambda x:f(lambda *a:x(x)(*a)))(lambda x:f(lambda *a:x(x)(*a)))
```

Python evaluates function arguments eagerly, so the ordinary untyped lambda-calculus Y combinator cannot be used directly without diverging. This Z-style combinator delays the recursive self-application inside an additional lambda. It makes anonymous recursion possible in Python and supplies the fixed-point core used by the interpreter.

Informally, the intended fixed-point relationship is:

\[
Z(F)=F(Z(F)).
\]

In this program, `Z` does not prove Kleene's Second Recursion Theorem. It constructs a practical recursive function at the Python level.

### 2. The Brainfuck transition function B

`B` is a higher-order function that receives its recursive continuation `f` and returns a function over the complete interpreter state:

```text
(c, p, t, h, j, o, i, k)
```

The state components are:

| Symbol | Meaning |
| --- | --- |
| `c` | Brainfuck source code |
| `p` | current program position |
| `t` | sparse tape, represented by a Python dictionary |
| `h` | tape-head position |
| `j` | bracket jump table |
| `o` | accumulated output bytes |
| `i` | input bytes |
| `k` | current input position |

Each call processes one Brainfuck instruction and passes the resulting state to the next recursive call. Execution stops when `p` reaches the end of the source code, at which point the accumulated output `o` is returned.

### 3. The recursive interpreter U

The interpreter is obtained by applying the fixed-point combinator to the transition function:

```python
U=Z(B)
```

`B` describes one transition while `Z(B)` supplies the recursive continuation required to execute an arbitrary sequence of transitions.

### 4. The bracket-indexing function J

Brainfuck loops require matching `[` and `]`. The function `J` scans the source code, uses a stack to match bracket pairs, and builds a dictionary mapping each bracket position to its partner.

For a matched pair at positions `a` and `b`, the jump table contains both mappings:

```text
a → b
b → a
```

The built-in closed-program test additionally checks that the number of jump-table entries is twice the number of opening brackets. An unmatched closing bracket causes stack removal to fail immediately. This is a compact validation strategy for the included program, rather than a full diagnostic parser with descriptive syntax errors.

### 5. Test programs and JSON certificate

The variables `C` and `E` contain the closed-output and input/output test programs. After both assertions pass, the script prints a JSON object recording:

- the system and machine names;
- the complete supported instruction set;
- the fixed-point mechanism;
- the observed test outputs;
- the idealized machine model;
- important mathematical and implementation limits; and
- the explicit prohibition on live trading.

## Brainfuck-8 instruction semantics

The interpreter supports all eight conventional Brainfuck instructions:

| Instruction | Implemented behavior |
| --- | --- |
| `+` | Increment the current cell modulo 256 |
| `-` | Decrement the current cell modulo 256 |
| `>` | Move the tape head one position to the right |
| `<` | Move the tape head one position to the left |
| `.` | Append the current cell value to the byte output |
| `,` | Read one input byte into the current cell |
| `[` | If the current cell is zero, jump to the matching `]` |
| `]` | If the current cell is nonzero, jump to the matching `[` |

Cells default to zero and wrap modulo 256. If the input is exhausted, `,` writes zero. The tape is represented as a sparse dictionary indexed by signed integers, so the head can move in either direction.

Tape updates use dictionary unpacking:

```python
{**t, h: new_value}
```

This creates a new dictionary for cell-changing instructions instead of modifying the previous tape dictionary in place. However, the program as a whole is not purely functional: the bracket-table constructor uses Python list and dictionary mutation, and the implementation relies on Python strings, integers, dictionaries, bytes, arithmetic, and conditionals.

## In what sense is it universal?

UGTM specifies an idealized **Brainfuck-8 model with an unbounded two-way sparse tape and unbounded execution resources**. Under that model, the interpreter implements the complete operational instruction set. Its universality is inherited from the Turing completeness of the specified Brainfuck model.

This claim must be interpreted at the model level. The actual executable runs inside CPython and is limited by:

- Python's recursion limit;
- available memory;
- available processor time;
- operating-system limits; and
- the finite hardware on which it runs.

Consequently, the script is an executable prototype of a universal computational model. It is not a physical machine with literally infinite storage or time, and it cannot make every possible computation terminate.

## Meaning of the name

“Universal” refers to the ability of the idealized interpreter model to express computations in a Turing-complete language.

“God” is a philosophical project name for the program's combination of self-reference, fixed-point construction, machine universality, and explicit self-description. It does not mean that the implementation is omniscient, infallible, supernatural, or capable of deciding every mathematical question.

“Turing Machine” identifies the program's place within computability theory. The implementation is a Brainfuck interpreter hosted by Python rather than a literal hardware realization of Turing's original tape-machine notation.

## What the program does not prove

The JSON report deliberately records several negative claims:

```json
{
  "pure_lambda_calculus": false,
  "general_kleene_theorem_proved": false,
  "church_turing_isomorphism_proved": false
}
```

These fields are essential to an accurate interpretation.

The program does **not**:

- constitute a formal proof of Kleene's Second Recursion Theorem;
- prove an isomorphism between lambda calculus and Turing machines;
- run entirely within pure lambda calculus;
- decide the halting problem;
- overcome Gödel's incompleteness theorems;
- compute non-computable functions;
- prove that every program terminates; or
- establish machine consciousness or metaphysical omniscience.

The Z combinator provides anonymous recursion, while the Brainfuck interpreter provides a concrete universal computation layer in the stated ideal model. Those are meaningful computational properties, but they should not be confused with stronger results in mathematical logic.

## Safety and scope

The program:

- reads no files;
- opens no network connections;
- invokes no external services;
- performs no financial transactions;
- uses no credentials;
- modifies no repository or system configuration; and
- prints only its JSON report.

The field `"live_trading": false` makes the project's no-live-trading policy explicit. This interpreter is intended for research, education, reproducible experiments, and philosophical exploration.

As with any source code, users should inspect it before execution and run it in an environment appropriate for experimental programs. A modified Brainfuck program may run indefinitely or consume resources, which is an expected consequence of working with a Turing-complete model.

## Summary

The Universal God Turing Machine is a compact, executable demonstration of how a fixed-point combinator can supply anonymous recursion to a complete Brainfuck-8 interpreter. Its built-in tests verify closed computation, byte input and output, loop matching, and the declared instruction set. Its JSON certificate also states the boundaries of the result: universality belongs to the idealized machine model, while the concrete Python process remains finite and does not prove the stronger theorems sometimes associated with self-reference and computability.

## Verifiable Computation Lab (experimental)

UGTM is the **umbrella architecture** for the [browser-based verification lab](docs/index.html) and the [G257/ATGC finite selector](lfp_atgc_tm_2kb.sh). This integration keeps both original executable cores unchanged.

The lab provides bounded Brainfuck-8 replay, JSON traces, a [standalone Python verifier](tools/verify_trace.py), and [browser smoke tests](tools/test_browser.js). Run `python3 tools/verify_trace.py --self-test` to inspect the replay verifier's positive and tamper-rejection tests.

[Deployment workflow](.github/workflows/ugtm-lab-pages.yml) · [Lab documentation](docs/README.md). GitHub Pages hosting requires the workflow to complete successfully; a repository file alone does not mean the site is published.

A trace reaching its execution limit does **not** solve the halting problem, and reversible G257 encoding does not prove a general semantic fixed point.

#!/usr/bin/env python3
"""UGTM transition-trace verifier. Verifies bounded traces, not arbitrary halting."""
import argparse
import json
import sys
from pathlib import Path

SCHEMA = "ugtm-trace-v1"
CORE_BLOB = "23c7bdcc123bcdec8c7ee21f8e4cb07881ccf34d"
MAX_STEPS = 10000
MAX_PROGRAM = 4000
MAX_INPUT = 4096


def bracket_table(code):
    stack, jumps = [], {}
    for pc, char in enumerate(code):
        if char == "[":
            stack.append(pc)
        elif char == "]":
            if not stack:
                raise ValueError("unmatched ]")
            start = stack.pop()
            jumps[start] = pc
            jumps[pc] = start
    if stack:
        raise ValueError("unmatched [")
    return jumps


def execute(code, data=b"", max_steps=3000):
    if not isinstance(code, str) or len(code) > MAX_PROGRAM or any(ord(c) > 127 for c in code):
        raise ValueError("program must be ASCII and <= 4000 chars")
    if not isinstance(data, bytes) or len(data) > MAX_INPUT:
        raise ValueError("input too long")
    if type(max_steps) is not int or not 1 <= max_steps <= MAX_STEPS:
        raise ValueError("max_steps out of range")
    jumps = bracket_table(code)
    tape, pc, head, cursor = {}, 0, 0, 0
    output, trace = bytearray(), []
    for _ in range(max_steps):
        if pc >= len(code):
            break
        cell, op = tape.get(head, 0), code[pc]
        trace.append([pc, head, cell, op])
        if op == "+":
            tape[head] = (cell + 1) % 256
        elif op == "-":
            tape[head] = (cell - 1) % 256
        elif op == ">":
            head += 1
        elif op == "<":
            head -= 1
        elif op == ".":
            output.append(cell)
        elif op == ",":
            tape[head] = data[cursor] if cursor < len(data) else 0
            if cursor < len(data):
                cursor += 1
        if op == "[" and cell == 0 or op == "]" and cell != 0:
            pc = jumps[pc]  # Match the actual UGTM jump: revisit the other bracket.
        else:
            pc += 1
    return {
        "schema": SCHEMA,
        "model": "UGTM Brainfuck-8 bounded transition replay",
        "reference_core_blob": CORE_BLOB,
        "program": code,
        "input_hex": data.hex(),
        "max_steps": max_steps,
        "status": "HALTED" if pc >= len(code) else "STEP_LIMIT",
        "steps": len(trace),
        "output_hex": output.hex(),
        "trace": trace,
    }


def verify(doc):
    if not isinstance(doc, dict):
        raise ValueError("certificate must be an object")
    if doc.get("schema") != SCHEMA or doc.get("reference_core_blob") != CORE_BLOB:
        raise ValueError("unsupported schema or UGTM reference")
    try:
        input_hex = doc["input_hex"]
        if not isinstance(input_hex, str) or len(input_hex) > 2 * MAX_INPUT:
            raise ValueError("bad input")
        data = bytes.fromhex(input_hex)
        if data.hex() != input_hex:
            raise ValueError("input_hex must be canonical lowercase hex")
        expected = execute(doc["program"], data, doc["max_steps"])
    except (KeyError, TypeError) as e:
        raise ValueError("invalid certificate fields") from e
    if doc != expected:
        raise ValueError("trace or certificate differs from independent replay")
    return expected


def self_test():
    tests = [
        ("++++++++[>++++++++++<-]>+++.", b"", b"S"),
        (",.", b"A", b"A"),
        ("[+].", b"", b"\x00"),
        ("<+.", b"", b"\x01"),
        ("+[]", b"", b""),
    ]
    for code, data, out in tests:
        doc = execute(code, data, 3000)
        verify(doc)
        assert bytes.fromhex(doc["output_hex"]) == out
        if code == "+[]":
            assert doc["status"] == "STEP_LIMIT"
        else:
            assert doc["status"] == "HALTED"
        altered = json.loads(json.dumps(doc))
        if altered["trace"]:
            altered["trace"][0][2] = 77
        else:
            altered["output_hex"] = "ff"
        try:
            verify(altered)
            raise AssertionError("tampered trace accepted")
        except ValueError:
            pass
    print("PASS: 5 valid traces, 5 tampered traces rejected; step-limit != non-halting proof")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("certificate", nargs="?", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if args.certificate is None:
        parser.error("provide a JSON certificate or --self-test")
    try:
        doc = json.loads(args.certificate.read_text(encoding="utf-8"))
        result = verify(doc)
    except (ValueError, OSError, json.JSONDecodeError) as e:
        print("INVALID:", e, file=sys.stderr)
        sys.exit(1)
    print(f"VERIFIED: {result['status']} / {result['steps']} steps / {result['output_hex']}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Deterministic cross-language bounded replay tests for the UGTM lab."""
import copy
import json
import random
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from verify_trace import execute, verify  # noqa: E402

SEED = 20261105
CASES = 120
PAYLOADS = 40


def samples():
    fixed = [
        ('', b'', 1),
        ('+', b'', 1),
        ('-.', b'', 30),
        ('+[-].', b'', 80),
        ('++++++++[>++++++++++<-]>+++.', b'', 500),
        (',.', b'A', 20),
        (',.,.', bytes([0, 255]), 20),
        (',.,.,.', b'\x00', 20),
        ('<+>+.<.', b'', 20),
        ('[+].', b'', 20),
        ('+[->+<]>.', b'', 60),
        ('++[>++[>+<-]<-]>>.', b'', 200),
        ('+[]', b'', 51),
        ('++>+++<--.', b'', 70),
        ('comment+!?[>-<-].', b'', 60),
        ('--[+].', b'', 300),
    ]
    rng = random.Random(SEED)
    atoms = ('+', '-', '>', '<', '.', ',', '[+]', '[-]', '[->+<]', '[>+<-]', '+[]', '[]', 'X', ' ', '\n')
    while len(fixed) < CASES:
        code = ''.join(rng.choice(atoms) for _ in range(rng.randint(1, 24)))
        data = bytes(rng.getrandbits(8) for _ in range(rng.randrange(5)))
        bound = rng.choice((1, 2, 3, 8, 16, 37, 80, 130, 250))
        fixed.append((code, data, bound))
    return fixed


def g257(data):
    n = 1
    for v in data:
        n = n * 257 + v + 1
    return n


def modified(certificates):
    for c in certificates:
        bad = []
        for field, value in (
            ('schema', 'invalid-schema'),
            ('model', 'changed-model'),
            ('reference_core_blob', '0' * 40),
            ('status', 'STEP_LIMIT' if c['status'] == 'HALTED' else 'HALTED'),
            ('steps', c['steps'] + 1),
            ('output_hex', 'ff' if c['output_hex'] != 'ff' else '00'),
        ):
            x = copy.deepcopy(c)
            x[field] = value
            bad.append(x)
        x = copy.deepcopy(c)
        if x['trace']:
            x['trace'][0][2] = (x['trace'][0][2] + 1) % 256
        else:
            x['trace'] = [[0, 0, 0, '+']]
        bad.append(x)
        x = copy.deepcopy(c)
        x['unexpected'] = True
        bad.append(x)
        for altered in bad:
            try:
                verify(altered)
            except ValueError:
                yield True
            else:
                yield False


def main():
    tests = samples()
    payloads = [b'', b'S', b'\x00', b'\xff', b'\x00\xff', '舒曼機'.encode(), b'COSMIC_LOVE']
    rng = random.Random(SEED ^ 0x7A73)
    while len(payloads) < PAYLOADS:
        payloads.append(bytes(rng.getrandbits(8) for _ in range(rng.randrange(17))))
    request = {
        'cases': [{'program': c, 'input': list(data), 'max_steps': steps} for c, data, steps in tests],
        'payloads': [data.hex() for data in payloads],
    }
    run = subprocess.run(
        ['node', 'tools/replay_bridge.js'], input=json.dumps(request), text=True,
        cwd=ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45,
    )
    received = json.loads(run.stdout)
    assert len(received['cases']) == CASES
    halted = limited = 0
    for (code, data, bound), js in zip(tests, received['cases']):
        py = execute(code, data, bound)
        assert js == py, f'Cross-language mismatch at {code!r}, data={data.hex()}, bound={bound}'
        assert verify(js) == py
        halted += py['status'] == 'HALTED'
        limited += py['status'] == 'STEP_LIMIT'
    rejected = list(modified(received['cases']))
    assert len(rejected) == CASES * 8 and all(rejected), 'Tamper detection failure'
    for data, js in zip(payloads, received['payloads']):
        assert js == {'godel': str(g257(data)), 'hex': data.hex()}
    report = {
        'suite': 'UGTM cross-language deterministic regression',
        'seed': SEED,
        'cases': CASES,
        'halted_within_bound': halted,
        'step_limit_reached': limited,
        'tampered_certificates_rejected': len(rejected),
        'g257_roundtrips': PAYLOADS,
        'result': 'PASS',
        'scope': 'finite replay equivalence; no general termination or security proof',
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()

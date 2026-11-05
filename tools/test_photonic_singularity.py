#!/usr/bin/env python3
"""Ten deterministic smoke tests for the 2 KB photonic singularity research entry point."""
import json
import math
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "Photonic_Singularity_Universal_God_Turing_Machine.sh"
CASES = [
    (),
    ("10", ".6", ".3", ".2"),
    ("0", "0", "0", "0"),
    ("3", "0", ".3", ".4"),
    ("1", ".9", "-.7", "1"),
    ("10", "-.6", ".3", ".2"),
    ("10", ".99", "-.99", ".2"),
    ("5", ".2", "-.8", "1.1"),
    ("3", ".2", "0", "0"),
    ("100", ".1", "-.2", ".3"),
]

def check(args):
    completed = subprocess.run(
        ["bash", str(SCRIPT), *args],
        check=True, capture_output=True, text=True, timeout=15
    )
    result = json.loads(completed.stdout)
    assert result["bf"] == "S"
    assert result["godel"] == "341"
    assert result["U3"] is True
    assert result["checks"] == [True, True, True]
    assert result["chronon_proven"] is False
    assert result["barrier_proven"] is False
    assert math.isclose(sum(result["P"]), 1.0, abs_tol=4e-9)
    assert math.isclose(result["proper_s"], result["boost_proper_s"], abs_tol=2e-8)
    assert math.isclose(result["QFI_tau"], result["F_tau_interior_limit"], abs_tol=1e-12)
    return result

if __name__ == "__main__":
    for number, case in enumerate(CASES, 1):
        result = check(case)
        print(f"PASS {number:02d}: tau={result['proper_s']} s; H={result['H_bits']} bits")
    print(f"ALL {len(CASES)} PHOTONIC SINGULARITY TESTS PASSED")

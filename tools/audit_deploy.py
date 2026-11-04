#!/usr/bin/env python3
"""Compare the published Render build-info.json with a specific Git commit.

This verifies the provenance label served by a public static URL.
It is *not* a cryptographic attestation of the server's underlying contents.
"""
import argparse
import json
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PUBLIC_MANIFEST = "https://ugtm-verifiable-lab.onrender.com/build-info.json"
COMMIT_PATTERN = re.compile(r"^[0-9a-f]{40}$")


def audit(expected, url=PUBLIC_MANIFEST, timeout=15):
    if not COMMIT_PATTERN.fullmatch(expected):
        raise ValueError("expected SHA must contain 40 lowercase hexadecimal characters")
    try:
        req = Request(url, headers={"User-Agent": "UGTM-Public-Deployment-Audit/1"})
        with urlopen(req, timeout=timeout) as response:
            if response.status != 200:
                raise RuntimeError(f"unexpected HTTP {response.status}")
            content = response.read(8193)
            if len(content) > 8192:
                raise RuntimeError("public build manifest unexpectedly large")
            doc = json.loads(content)
    except (HTTPError, URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        return {"result": "UNVERIFIABLE", "reason": str(exc), "expected_commit": expected, "manifest_url": url}
    actual = doc.get("source_commit_sha") if isinstance(doc, dict) else None
    if not isinstance(doc, dict) or doc.get("schema") != "ugtm-site-build-v1" or not isinstance(actual, str) or not COMMIT_PATTERN.fullmatch(actual):
        return {"result": "UNVERIFIABLE", "reason": "missing or invalid Render build provenance fields", "expected_commit": expected, "manifest_url": url}
    return {
        "result": "MATCH" if actual == expected else "STALE",
        "expected_commit": expected,
        "published_commit": actual,
        "manifest_url": url,
        "note": "This compares publicly served build labels; not an integrity proof.",
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--expected-sha", required=True)
    p.add_argument("--url", default=PUBLIC_MANIFEST)
    p.add_argument("--warn-only", action="store_true", help="report a mismatch but exit 0; useful for optional scheduled audits")
    args = p.parse_args()
    try:
        result = audit(args.expected_sha, args.url)
    except ValueError as exc:
        p.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if result["result"] != "MATCH":
        print("WARNING: Public website version not confirmed to match main.", file=sys.stderr)
        if not args.warn_only:
            sys.exit(2)


if __name__ == "__main__":
    main()

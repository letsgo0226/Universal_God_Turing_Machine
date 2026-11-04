#!/usr/bin/env python3
"""UGTM AI Seed: bounded, rights-aware open-access full-text inspection.

Search and transiently inspect Europe PMC JATS XML with explicit CC BY/CC0
licensing. Archive only traceable structural evidence and tiny snippets in
existing GitHub bibliography Issue #2. Not full-text AI comprehension.
"""
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs/seed/fulltext.json"
REPO = "letsgo0226/Universal_God_Turing_Machine"
MARKER = "UGTM_SEED_FULLTEXT_EVIDENCE_V1\n"
EUROPE_HOST = "www.ebi.ac.uk"
GITHUB_HOST = "api.github.com"
BASE = "/europepmc/webservices/rest/"
ISSUE_BASE = f"/repos/{REPO}/issues/2"
MAX_RESPONSE = 1_500_000
TOPICS = (
    "reproducibility",
    "research ethics",
    "open science",
    "computational biology",
)
LICENSES = {
    "/licenses/by/4.0/": "CC BY 4.0",
    "/licenses/by/3.0/": "CC BY 3.0",
    "/publicdomain/zero/1.0/": "CC0 1.0",
}


def sha(value):
    return hashlib.sha256(value).hexdigest()


def clean(value, limit=180):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]*>", "", str(value or ""))).strip()[:limit]


def week_start(moment):
    return (moment.date() - dt.timedelta(days=moment.weekday())).isoformat()


def allowed_request(url, method):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.username or parsed.password or parsed.port:
        raise ValueError("Only HTTPS with no userinfo or port is permitted")
    if parsed.hostname == EUROPE_HOST and method == "GET":
        if parsed.path == BASE + "search":
            args = urllib.parse.parse_qs(parsed.query, strict_parsing=True)
            if set(args) != {"query", "format", "pageSize", "resultType"}:
                raise ValueError("Unapproved Europe PMC search parameters")
            if args["format"] != ["json"] or args["pageSize"] != ["5"] or args["resultType"] != ["lite"]:
                raise ValueError("Unapproved Europe PMC search budget")
            return
        if re.fullmatch(r"/europepmc/webservices/rest/PMC\d{3,12}/fullTextXML", parsed.path) and not parsed.query:
            return
    if parsed.hostname == GITHUB_HOST:
        if parsed.path == ISSUE_BASE and method == "GET" and not parsed.query:
            return
        if parsed.path == ISSUE_BASE + "/comments" and method in {"GET", "POST"}:
            if method == "POST" and not parsed.query:
                return
            if method == "GET" and re.fullmatch(r"page=\d+&per_page=100", parsed.query):
                return
    raise ValueError("URL/HTTP method is outside the narrow allowlist")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Redirects are disabled")


def fetch(url, method="GET", token=None, payload=None):
    allowed_request(url, method)
    headers = {
        "User-Agent": "UGTM-AI-Seed/1.0 (https://github.com/letsgo0226/Universal_God_Turing_Machine)",
        "Accept": "application/json, application/xml",
    }
    if token:
        headers["Authorization"] = "Bearer " + token
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None else None
    if body is not None:
        headers["Content-Type"] = "application/json"
        if len(body) > 36_000:
            raise ValueError("Outgoing payload too large")
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    with opener.open(req, timeout=12) as resp:
        raw = resp.read(MAX_RESPONSE + 1)
        if len(raw) > MAX_RESPONSE:
            raise ValueError("Input exceeds approved byte budget")
        return raw


def json_fetch(url, method="GET", token=None, payload=None):
    return json.loads(fetch(url, method=method, token=token, payload=payload))


def license_name(article):
    accepted = None
    for license_node in article.findall(".//{*}permissions/{*}license") + article.findall(".//permissions/license"):
        # JATS may be namespaced or unnamespaced.
        href = next((v for k, v in license_node.attrib.items() if k.endswith("}href") or k == "href"), None)
        if not href:
            continue
        parsed = urllib.parse.urlsplit(href.strip())
        if parsed.scheme not in ("https", "http") or parsed.hostname != "creativecommons.org":
            continue
        name = LICENSES.get(parsed.path.rstrip("/") + "/")
        if name:
            accepted = (name, "https://creativecommons.org" + parsed.path.rstrip("/") + "/")
            break
    return accepted


def node_text(node):
    if node is None:
        return ""
    return clean("".join(node.itertext()), 2000)


def inspect_article(xml_bytes, pmcid, search_metadata):
    if len(xml_bytes) > MAX_RESPONSE:
        raise ValueError("XML too large")
    upper = xml_bytes[:5000].upper()
    if b"<!DOCTYPE" in upper or b"<!ENTITY" in upper or b"<![CDATA[" in upper:
        raise ValueError("Reject XML declarations with external/internal entities or opaque CDATA")
    root = ET.fromstring(xml_bytes)
    if root.tag.split("}")[-1] != "article":
        raise ValueError("Expected JATS article")
    names = [node_text(n) for n in root.findall(".//{*}article-id") if n.attrib.get("pub-id-type") in ("pmc", "pmcid")]
    if names:
        if all(("PMC" + n.lstrip("PMC")) != pmcid for n in names):
            raise ValueError("The JATS PMCID does not match the requested publication")
    rights = license_name(root)
    if not rights:
        raise PermissionError("Article has no permitted explicit CC BY/CC0 license URL")
    body = root.find("./{*}body")
    if body is None:
        raise ValueError("No article body in XML")
    sections = []
    for section in body.findall(".//{*}sec")[:30]:
        title = node_text(section.find("./{*}title"))
        if title:
            sections.append(title[:110])
    paragraphs = []
    for node in body.findall(".//{*}p")[:100]:
        s = node_text(node)
        if len(s) >= 60:
            paragraphs.append(s)
    if not paragraphs:
        raise ValueError("No eligible textual paragraph evidence")
    # At most 14 quoted whitespace-delimited words, total, from this article.
    anchors = []
    for i, para in enumerate(paragraphs[:2]):
        anchors.append({
            "paragraph_index_1based": i + 1,
            "paragraph_sha256": sha(para.encode("utf-8")),
            "short_verbatim_anchor": " ".join(para.split()[:7]),
        })
    article_title = node_text(root.find(".//{*}article-title"))
    doi = next((node_text(n) for n in root.findall(".//{*}article-id") if n.attrib.get("pub-id-type") == "doi"), "")
    return {
        "pmcid": pmcid,
        "doi": clean(doi or search_metadata.get("doi"), 170) or None,
        "title": article_title[:220] or clean(search_metadata.get("title"), 220),
        "fulltext_source": "Europe PMC Open Access REST JATS XML",
        "fulltext_api_url": f"https://{EUROPE_HOST}{BASE}{pmcid}/fullTextXML",
        "license": rights[0],
        "license_url": rights[1],
        "source_xml_sha256": sha(xml_bytes),
        "structure": {
            "section_headings": sections[:10],
            "parsed_section_count_upper_bound": len(sections),
            "parsed_paragraph_count_upper_bound": len(paragraphs),
        },
        "evidence_anchors": anchors,
        "fulltext_fetched_and_parsed": True,
        "independent_claim_verification": False,
        "semantic_comprehension_performed": False,
        "human_review_required": True,
        "no_republication_of_article_body": True,
    }


def record_digest(record):
    return sha(json.dumps({k: v for k, v in record.items() if k != "digest"},
                          ensure_ascii=False, separators=(",", ":")).encode("utf-8"))


def check(record):
    assert record["schema"] == "ugtm-seed-fulltext-reading-v1"
    assert record["repository"] == REPO
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", record["week_start_utc"])
    assert record["status"] in ("structured_extraction_only", "no_approved_fulltext_found")
    assert record["fulltext_semantic_understanding"] is False
    assert record["human_review_required"] is True
    assert len(record["articles"]) <= 1
    assert len(record["search_candidates"]) <= 5
    for a in record["articles"]:
        assert a["license"] in LICENSES.values()
        assert a["fulltext_fetched_and_parsed"] and not a["semantic_comprehension_performed"]
        assert len(a["evidence_anchors"]) <= 2
        assert sum(len(x["short_verbatim_anchor"].split()) for x in a["evidence_anchors"]) <= 14
    assert record["digest"] == record_digest(record)
    return record


def create_record(moment, topic, candidates, articles, problems, source="local"):
    obj = {
        "schema": "ugtm-seed-fulltext-reading-v1",
        "repository": REPO,
        "week_start_utc": week_start(moment),
        "generated_at_utc": moment.isoformat().replace("+00:00", "Z"),
        "source_commit": source,
        "status": "structured_extraction_only" if articles else "no_approved_fulltext_found",
        "scope": "Europe PMC eligible open-access subset; initially biomedical/life-science literature, not all 39 university fields",
        "search_topic": topic,
        "search_candidates": candidates[:5],
        "articles": articles[:1],
        "problems": problems[:4],
        "fulltext_semantic_understanding": False,
        "model_inference_used": False,
        "model_training_performed": False,
        "human_review_required": True,
        "rights_policy": "Fetch JATS via official Europe PMC API; parse only explicit CC BY 3.0/4.0 or CC0 1.0; do not archive full article text",
        "note": "Structural/textual evidence anchors are not a literature review, citation verification or evidence that the seed understood a paper.",
    }
    obj["digest"] = record_digest(obj)
    return check(obj)


def harvest(moment=None, transport=fetch):
    moment = moment or dt.datetime.now(dt.timezone.utc)
    weeks = int((moment.date() - dt.date(2026, 1, 5)).days // 7)
    topic = TOPICS[weeks % len(TOPICS)]
    query = "OPEN_ACCESS:Y AND IN_EPMC:Y AND " + topic.replace(" ", " AND ")
    qs = urllib.parse.urlencode({"query": query, "format": "json", "pageSize": "5", "resultType": "lite"})
    search_url = f"https://{EUROPE_HOST}{BASE}search?{qs}"
    search_data = json.loads(transport(search_url))
    works = search_data.get("resultList", {}).get("result", [])
    if not isinstance(works, list) or len(works) > 5:
        raise ValueError("Unexpected Europe PMC search response")
    candidates, articles, problems = [], [], []
    attempts = 0
    for work in works:
        pmcid = str(work.get("pmcid") or "")
        if not re.fullmatch(r"PMC\d{3,12}", pmcid):
            continue
        if str(work.get("isOpenAccess", "")).upper() != "Y" or str(work.get("inEPMC", "")).upper() != "Y":
            continue
        candidates.append(pmcid)
        if attempts >= 3 or articles:
            continue
        attempts += 1
        try:
            url = f"https://{EUROPE_HOST}{BASE}{pmcid}/fullTextXML"
            article = inspect_article(transport(url), pmcid, work)
            articles.append(article)
        except (ValueError, ET.ParseError, PermissionError, urllib.error.HTTPError) as exc:
            problems.append({"pmcid": pmcid, "reason": clean(str(exc), 90)})
    return create_record(moment, topic, candidates, articles, problems,
                         source=os.getenv("GITHUB_SHA", "local"))


def write(record):
    check(record)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def from_comment(comment):
    if not isinstance(comment, dict) or comment.get("user", {}).get("login") != "github-actions[bot]":
        return None
    body = comment.get("body")
    if not isinstance(body, str) or not body.startswith(MARKER) or len(body) > 32_000:
        return None
    return check(json.loads(body[len(MARKER):]))


def github_url(suffix=""):
    return f"https://{GITHUB_HOST}{ISSUE_BASE}{suffix}"


def latest(token):
    issue = json_fetch(github_url(), token=token)
    if issue.get("number") != 2 or issue.get("state") != "open":
        raise ValueError("Unexpected ledger issue state")
    total = min(int(issue.get("comments", 0)), 500)
    last_page = max(1, (total + 99) // 100)
    for page in range(last_page, max(0, last_page - 5), -1):
        comments = json_fetch(github_url(f"/comments?page={page}&per_page=100"), token=token)
        if not isinstance(comments, list):
            raise ValueError("Invalid comments array")
        for comment in reversed(comments):
            record = from_comment(comment)
            if record:
                return record
    return None


def run(mode):
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        raise ValueError("GITHUB_TOKEN is required only for Issue #2 archival/read")
    previous = latest(token)
    if mode == "--read":
        if previous:
            write(previous)
            print("UGTM_FULLTEXT_READ_SNAPSHOT=" + previous["week_start_utc"])
        else:
            OUTPUT.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT.write_text(json.dumps({
                "schema": "ugtm-seed-fulltext-pending-v1",
                "status": "not_yet_archived",
                "articles": [],
                "fulltext_semantic_understanding": False,
                "human_review_required": True,
            }, indent=2) + "\n")
            print("UGTM_FULLTEXT_NOT_YET_ARCHIVED")
        return
    if mode != "--harvest":
        raise ValueError("Supported modes: --read, --harvest, --self-test")
    now = dt.datetime.now(dt.timezone.utc)
    if previous and previous["week_start_utc"] == week_start(now):
        write(previous)
        print("UGTM_FULLTEXT_ALREADY_ARCHIVED=" + previous["week_start_utc"])
        return
    report = harvest(now)
    body = MARKER + json.dumps(report, indent=2, ensure_ascii=False)
    if len(body.encode("utf-8")) > 32_000:
        raise ValueError("Full-text evidence metadata too large")
    json_fetch(github_url("/comments"), method="POST", token=token, payload={"body": body})
    write(report)
    print("UGTM_FULLTEXT_ARCHIVED=" + report["status"] + " articles=" + str(len(report["articles"])))


def self_test():
    pmcid = "PMC1234567"
    sample = b'''<article xmlns:xlink="http://www.w3.org/1999/xlink"><front>
    <article-meta><article-id pub-id-type="pmc">1234567</article-id>
    <article-id pub-id-type="doi">10.1000/example</article-id>
    <title-group><article-title>Test research transparency</article-title></title-group>
    <permissions><license xlink:href="https://creativecommons.org/licenses/by/4.0/">
      <license-p>Creative Commons Attribution.</license-p></license></permissions></article-meta></front>
    <body><sec><title>Methods</title><p>We defined a bounded reproducibility protocol with independent
    checks for provenance across many separate systems and documented each input
    throughout the evaluation.</p></sec>
    <sec><title>Results</title><p>We report illustrative values from an explicitly fictional
    fixture designed to test extraction and not to establish any real scientific claim
    or empirical finding.</p></sec></body></article>'''
    data = inspect_article(sample, pmcid, {"title": "Fallback title"})
    assert data["license"] == "CC BY 4.0"
    assert data["fulltext_fetched_and_parsed"] and not data["semantic_comprehension_performed"]
    assert len(data["evidence_anchors"]) == 2
    assert "Methods" in data["structure"]["section_headings"]
    assert sum(len(x["short_verbatim_anchor"].split()) for x in data["evidence_anchors"]) <= 14
    assert raises(lambda: inspect_article(sample.replace(b"/by/4.0/", b"/by-nc-nd/4.0/"), pmcid, {}))
    assert raises(lambda: inspect_article(sample.replace(b"1234567", b"9999999"), pmcid, {}))
    assert raises(lambda: allowed_request("https://example.com/steal", "GET"))
    assert raises(lambda: allowed_request("http://www.ebi.ac.uk/europepmc/webservices/rest/search", "GET"))
    assert raises(lambda: allowed_request(github_url("/comments"), "DELETE"))
    assert raises(lambda: inspect_article(sample.replace(b"<article ", b'<!DOCTYPE article><article '), pmcid, {}))
    moment = dt.datetime(2026, 11, 5, tzinfo=dt.timezone.utc)
    fixture = {"resultList": {"result": [
        {"pmcid": pmcid, "isOpenAccess": "Y", "inEPMC": "Y", "title": "Test research transparency"}
    ]}}
    def mocked(url):
        allowed_request(url, "GET")
        if "/search?" in url:
            return json.dumps(fixture).encode()
        return sample
    original = os.environ.get("GITHUB_SHA")
    os.environ["GITHUB_SHA"] = "test"
    try:
        report = harvest(moment, transport=mocked)
        assert report == harvest(moment, transport=mocked)
        assert len(report["articles"]) == 1
        assert report["status"] == "structured_extraction_only"
        assert check(report) == report
        assert from_comment({"user": {"login": "github-actions[bot]"},
                             "body": MARKER + json.dumps(report)}) == report
        assert from_comment({"user": {"login": "visitor"},
                             "body": MARKER + json.dumps(report)}) is None
        tampered = {**report, "status": "no_approved_fulltext_found"}
        assert raises(lambda: check(tampered))
    finally:
        if original is None:
            del os.environ["GITHUB_SHA"]
        else:
            os.environ["GITHUB_SHA"] = original
    print("PASS: licensed full-text fixture, structure, citations, digest, restricted URLs, no unauthorized copying")


def raises(fn):
    try:
        fn()
    except (AssertionError, ValueError, PermissionError, ET.ParseError):
        return True
    return False


if __name__ == "__main__":
    try:
        if sys.argv[1:] == ["--self-test"]:
            self_test()
        elif len(sys.argv) == 2:
            run(sys.argv[1])
        else:
            raise ValueError("Usage: seed_fulltext.py --self-test|--harvest|--read")
    except Exception as exc:
        print("UGTM_FULLTEXT_ERROR: " + clean(str(exc), 160), file=sys.stderr)
        sys.exit(1)

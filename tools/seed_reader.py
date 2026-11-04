#!/usr/bin/env python3
"""UGTM AI Seed: evidence-grounded *reader evaluation*, not an LLM.

Uses the already approved Europe PMC full-text and GitHub Issue #2 source
ledger. Fetches one licensed paper transiently; archives only paragraph
hashes, retrieval decisions, negative controls and evaluation metadata.
There is no claim of semantic comprehension or paid model inference.
"""
import datetime as dt
import hashlib
import json
import os
import re
import sys
import urllib.error
import xml.etree.ElementTree as ET
from pathlib import Path

import seed_fulltext as fulltext

OUTPUT = fulltext.ROOT / "docs/seed/reader.json"
MARKER = "UGTM_SEED_READER_EVALUATION_V1\n"
MODEL = "none: deterministic evidence-localization baseline"
TASKS = (
    ("T1", "Locate methodological evidence", "methods",
     ("method", "methodology", "material", "protocol", "experiment", "design")),
    ("T2", "Locate results evidence", "results",
     ("result", "finding", "evaluation", "benchmark", "performance")),
    ("T3", "Locate limitation evidence", "limitations",
     ("limitation", "caveat", "weakness", "discussion", "future work")),
    ("T4", "Is previously unknown data transmitted without a channel?", "unsupported",
     ()),
)

def hash_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def get_sections(xml_bytes):
    """Keep only section labels and paragraph digests in the output."""
    if b"<!DOCTYPE" in xml_bytes[:5000].upper() or b"<!ENTITY" in xml_bytes[:5000].upper():
        raise ValueError("Unsafe XML declaration")
    root = ET.fromstring(xml_bytes)
    body = root.find("./{*}body")
    if body is None:
        raise ValueError("Missing JATS article body")
    sections = []
    for section in body.findall(".//{*}sec")[:60]:
        title = fulltext.node_text(section.find("./{*}title"))[:110]
        if not title:
            continue
        for paragraph in section.findall("./{*}p")[:15]:
            content = fulltext.node_text(paragraph)
            if len(content) >= 60:
                sections.append({"section": title, "paragraph_digest": hash_text(content),
                                 "paragraph_length": len(content)})
                if len(sections) >= 90:
                    return sections
    return sections

def locate(sections):
    """A limited, easily audited lexical retrieval baseline; NOT interpretation."""
    results = []
    for identifier, question, category, keywords in TASKS:
        if category == "unsupported":
            results.append({"task_id": identifier, "question": question,
                            "status": "abstained_unsupported_research_question",
                            "evidence": None, "claim_verified": False})
            continue
        matches = []
        for s in sections:
            title = s["section"].lower()
            score = sum(1 for key in keywords if key in title)
            if score:
                matches.append((score, s))
        if matches:
            top = sorted(matches, key=lambda pair: -pair[0])[0][1]
            results.append({"task_id": identifier, "question": question,
                            "status": "candidate_section_found",
                            "evidence": {"section": top["section"],
                                         "paragraph_digest": top["paragraph_digest"],
                                         "paragraph_length": top["paragraph_length"]},
                            "claim_verified": False})
        else:
            results.append({"task_id": identifier, "question": question,
                            "status": "abstained_no_matching_section",
                            "evidence": None, "claim_verified": False})
    return results

def payload_digest(r):
    return hashlib.sha256(json.dumps({k:v for k,v in r.items() if k != "digest"},
                                      ensure_ascii=False, sort_keys=True,
                                      separators=(",", ":")).encode("utf8")).hexdigest()

def validate(r):
    assert r["schema"] == "ugtm-seed-reader-evaluation-v1"
    assert r["repository"] == fulltext.REPO
    assert r["mode"] == "non_semantic_evidence_localization"
    assert r["model_inference_used"] is False
    assert r["model_weights_updated"] is False
    assert r["scholarly_conclusions_verified"] is False
    assert r["human_review_required"] is True
    assert r["status"] in ("source_evaluated", "source_unavailable", "source_changed")
    assert len(r["tasks"]) in (0, 4)
    assert all(t["claim_verified"] is False for t in r["tasks"])
    assert all(t["evidence"] is None or re.fullmatch(r"[a-f0-9]{64}",t["evidence"]["paragraph_digest"]) for t in r["tasks"])
    assert r["digest"] == payload_digest(r)
    return r

def make_record(source_record, *, clock=None, status, tasks=(), issue=None):
    clock = clock or dt.datetime.now(dt.timezone.utc)
    article = source_record["articles"][0] if source_record and source_record.get("articles") else {}
    record = {
        "schema": "ugtm-seed-reader-evaluation-v1",
        "repository": fulltext.REPO,
        "generated_at_utc": clock.isoformat().replace("+00:00", "Z"),
        "source_week_utc": source_record.get("week_start_utc") if source_record else None,
        "source_pmcid": article.get("pmcid"),
        "source_doi": article.get("doi"),
        "source_license": article.get("license"),
        "source_xml_sha256": article.get("source_xml_sha256"),
        "source_ledger_issue": 2,
        "source_commit": os.environ.get("GITHUB_SHA", "local"),
        "status": status,
        "mode": "non_semantic_evidence_localization",
        "model_backend": MODEL,
        "model_inference_used": False,
        "model_weights_updated": False,
        "scholarly_conclusions_verified": False,
        "human_review_required": True,
        "tasks": list(tasks),
        "metrics": {
            "candidate_evidence_links": sum(x["status"] == "candidate_section_found" for x in tasks),
            "abstentions": sum(x["status"].startswith("abstained") for x in tasks),
            "verified_semantic_claims": 0,
            "synthetic_test_accuracy_is_real_world_comprehension": False
        },
        "limitations": [
            "Section-heading lexical matching is not model-based semantic understanding.",
            "Paragraph SHA-256 supports source matching, not claim entailment.",
            "No article body or paragraph snippets are archived.",
            "An explicit abstention is preferable to an ungrounded answer.",
            "University-wide comprehension and peer review remain untested."
        ],
        "evaluation_protocol": "Require authorized full text, license, source SHA, exact paragraph references, held-out annotated tasks and independent claim verification before future model use."
    }
    record["digest"] = payload_digest(record)
    return validate(record)

def evaluate(source_record, xml_bytes):
    assert fulltext.check(source_record)
    if source_record["status"] != "structured_extraction_only" or not source_record["articles"]:
        return make_record(source_record, status="source_unavailable")
    a = source_record["articles"][0]
    if fulltext.sha(xml_bytes) != a["source_xml_sha256"]:
        return make_record(source_record, status="source_changed")
    current = fulltext.inspect_article(xml_bytes, a["pmcid"], {"title": a["title"]})
    if current["license"] != a["license"] or current["doi"] != a["doi"]:
        return make_record(source_record, status="source_changed")
    selections = locate(get_sections(xml_bytes))
    return make_record(source_record, status="source_evaluated", tasks=selections)

def fetch_from_ledger(token):
    base = fulltext.github_url()
    issue = fulltext.json_fetch(base, token=token)
    assert issue.get("state") == "open"
    pages = max(1, min(5, (min(500, int(issue.get("comments",0))) + 99)//100))
    for page in range(pages, 0, -1):
        comments=fulltext.json_fetch(base+f"/comments?page={page}&per_page=100",token=token)
        for c in reversed(comments):
            if c.get("user",{}).get("login") != "github-actions[bot]":
                continue
            body=c.get("body","")
            if not isinstance(body,str) or not body.startswith(MARKER):
                continue
            if len(body)>35000: raise ValueError("Oversized reading evaluation")
            record=validate(json.loads(body[len(MARKER):]))
            return record
    return None

def write(record):
    validate(record)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(record,indent=2,ensure_ascii=False)+"\n",encoding="utf8")

def run(mode):
    token=os.getenv("GITHUB_TOKEN")
    if not token: raise ValueError("GITHUB_TOKEN is required for the restricted GitHub Issue workflow")
    if mode=="--read":
        previous=fetch_from_ledger(token)
        if previous: write(previous)
        else:
            pending={"schema":"ugtm-seed-reader-pending-v1",
                     "status":"not_yet_archived","model_inference_used":False,
                     "tasks":[],"human_review_required":True}
            OUTPUT.parent.mkdir(parents=True,exist_ok=True)
            OUTPUT.write_text(json.dumps(pending,indent=2)+"\n")
        print("UGTM_SEED_READER_PUBLIC_SNAPSHOT="+("archived" if previous else "pending"))
        return
    if mode!="--evaluate":raise ValueError("Only --read, --evaluate, --self-test")
    last=fetch_from_ledger(token)
    now=dt.datetime.now(dt.timezone.utc)
    if last and last["generated_at_utc"][:10]==now.date().isoformat():
        write(last);print("UGTM_SEED_READER_ALREADY_EVALUATED");return
    source=fulltext.latest(token)
    if not source or source["status"]!="structured_extraction_only" or not source["articles"]:
        record=make_record(source,status="source_unavailable")
    else:
        pmcid=source["articles"][0]["pmcid"]
        try:
            url=f"https://{fulltext.EUROPE_HOST}{fulltext.BASE}{pmcid}/fullTextXML"
            xml=fulltext.fetch(url)
            record=evaluate(source,xml)
        except (OSError,TimeoutError,urllib.error.URLError,ValueError,PermissionError,ET.ParseError) as exc:
            record=make_record(source,status="source_unavailable")
    body=MARKER+json.dumps(record,ensure_ascii=False,indent=2)
    if len(body.encode("utf8"))>35_000:raise ValueError("Excessive public ledger payload")
    fulltext.json_fetch(fulltext.github_url("/comments"),method="POST",
                        token=token,payload={"body":body})
    write(record)
    print("UGTM_SEED_READER_EVALUATED="+record["status"])

def self_test():
    sample=b'''<article xmlns:xlink="http://www.w3.org/1999/xlink"><front><article-meta>
    <article-id pub-id-type="pmc">1234567</article-id>
    <article-id pub-id-type="doi">10.1000/example</article-id>
    <title-group><article-title>Sample evaluation</article-title></title-group>
    <permissions><license xlink:href="https://creativecommons.org/licenses/by/4.0/"/>
    </permissions></article-meta></front><body>
    <sec><title>Methods</title><p>These are purely synthetic methodological statements for
    evaluating a grounded section retrieval system with known expected labels and document metadata.</p></sec>
    <sec><title>Results</title><p>These are entirely invented fixture results for testing
    the citation validation mechanism and not reported outcomes of any actual scientific article.</p></sec>
    <sec><title>Discussion and Limitations</title><p>Our fictional fixture explains
    several limitations of lexical evidence matching and highlights why source references
    alone cannot prove a claim.</p></sec>
    </body></article>'''
    moment=dt.datetime(2026,11,5,tzinfo=dt.timezone.utc)
    a=fulltext.inspect_article(sample,"PMC1234567",{})
    source=fulltext.create_record(moment,"test",["PMC1234567"],[a],[],"fixture")
    result=evaluate(source,sample)
    assert result["status"]=="source_evaluated"
    assert [t["status"] for t in result["tasks"]]==["candidate_section_found"]*3+["abstained_unsupported_research_question"]
    assert result["metrics"]["candidate_evidence_links"]==3
    assert result["metrics"]["abstentions"]==1
    assert result["metrics"]["verified_semantic_claims"]==0
    assert "paragraph_text" not in json.dumps(result).lower()
    assert "short_verbatim_anchor" not in json.dumps(result).lower()
    assert validate(result)==result
    changed=evaluate(source,sample.replace(b"fictional fixture",b"altered fixture"))
    assert changed["status"]=="source_changed" and not changed["tasks"]
    try:
        validate({**result,"digest":"0"*64})
        raise AssertionError("Must reject modified digest")
    except AssertionError as error:
        if str(error) == "Must reject modified digest":
            raise
    bad=dict(result);bad["model_inference_used"]=True
    try:validate(bad);raise AssertionError("Must reject false model attribution")
    except AssertionError as error:
        if str(error)=="Must reject false model attribution":raise
    print("PASS: four held-out synthetic tasks, 3 section matches, unsupported question abstention, source tampering and model-attribution gates")

if __name__=="__main__":
    try:
        if sys.argv[1:]==["--self-test"]:self_test()
        elif len(sys.argv)==2:run(sys.argv[1])
        else:raise ValueError("Usage: seed_reader.py --self-test|--evaluate|--read")
    except Exception as error:
        print("UGTM_READER_ERROR: "+fulltext.clean(str(error),180),file=sys.stderr)
        raise SystemExit(1)

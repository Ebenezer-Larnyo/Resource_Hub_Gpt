#!/usr/bin/env python3
"""Check approved URLs and write metadata-only candidates to a review queue."""
from __future__ import annotations
import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "crawler" / "sources.json"
QUEUE = ROOT / "crawler" / "review_queue.json"
USER_AGENT = "ASDResourceHubLinkChecker/1.0 (+human-reviewed resource monitoring)"
ALLOWED_SCHEMES = {"http", "https"}

def valid_url(value: str) -> bool:
    try:
        parsed = urlparse(value)
        return parsed.scheme in ALLOWED_SCHEMES and bool(parsed.hostname) and not parsed.username and not parsed.password
    except (TypeError, ValueError):
        return False

def check_url(url: str, timeout: int = 12) -> dict:
    if not valid_url(url):
        return {"url": url, "http_status": None, "check_status": "invalid_url", "title": None}
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
    status, final_url, content_type, body = None, url, "", b""
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            status = response.status
            final_url = response.geturl()
            content_type = response.headers.get("Content-Type", "")
            if "text/html" in content_type.lower():
                body = response.read(512_000)
    except urllib.error.HTTPError as exc:
        status = exc.code
        final_url = exc.geturl()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"url": url, "http_status": None, "check_status": "network_error", "error_type": type(exc).__name__, "title": None}
    title = None
    if body:
        match = re.search(rb"<title[^>]*>(.*?)</title\s*>", body, re.I | re.S)
        if match:
            title = re.sub(r"\s+", " ", match.group(1).decode("utf-8", "replace")).strip()[:250]
    return {"url": url, "final_url": final_url, "http_status": status,
            "content_type": content_type[:120], "title": title,
            "check_status": "reachable" if status is not None and 200 <= status < 400 else "needs_attention"}

def main() -> int:
    config = json.loads(SOURCES.read_text(encoding="utf-8"))
    existing = json.loads(QUEUE.read_text(encoding="utf-8")) if QUEUE.exists() else {"schema_version": 1, "items": []}
    by_url = {item.get("url"): item for item in existing.get("items", [])}
    checked_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    for source in config.get("sources", []):
        url = source.get("url", "")
        if not valid_url(url):
            print(f"Skipping invalid URL: {url!r}")
            continue
        result = check_url(url)
        time.sleep(1.0)
        prior = by_url.get(url, {})
        # This is a monitoring record only; it is never promoted to published resources.
        item = {**prior, **source, **result, "checked_at": checked_at,
                "status": "pending_review", "human_review_required": True}
        by_url[url] = item
        print(f"{result['check_status']}: {url}")
    output = {"schema_version": 1, "updated_at": checked_at,
              "notice": "Pending review only. No crawler result is automatically published.",
              "items": list(by_url.values())}
    QUEUE.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

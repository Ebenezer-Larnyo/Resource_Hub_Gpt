import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "crawler"))
import crawler

class ResourceDataTests(unittest.TestCase):
    def test_resources_have_required_fields_and_safe_urls(self):
        data = json.loads((ROOT / "data" / "resources.json").read_text(encoding="utf-8"))
        self.assertTrue(data["resources"])
        seen = set()
        for item in data["resources"]:
            for field in ("id", "title", "category", "description", "url", "source_name", "last_checked", "status"):
                self.assertTrue(item.get(field), f"Missing {field} in {item}")
            self.assertTrue(crawler.valid_url(item["url"]))
            self.assertNotIn(item["id"], seen)
            seen.add(item["id"])

    def test_invalid_schemes_and_credentials_rejected(self):
        for value in ("javascript:alert(1)", "file:///etc/passwd", "https://user:pass@example.org", "not a URL", ""):
            self.assertFalse(crawler.valid_url(value), value)

    def test_http_and_https_accepted(self):
        self.assertTrue(crawler.valid_url("https://example.org/path"))
        self.assertTrue(crawler.valid_url("http://example.org"))

    def test_review_queue_is_not_published_by_default(self):
        data = json.loads((ROOT / "crawler" / "review_queue.json").read_text(encoding="utf-8"))
        self.assertEqual(data["items"], [])

if __name__ == "__main__":
    unittest.main()

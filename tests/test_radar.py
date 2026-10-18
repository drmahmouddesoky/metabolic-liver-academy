"""Checks for the Publication Radar parser (no internet needed).
Run: python3 tests/test_radar.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "scripts"))
import radar_fetch as R  # noqa: E402

with open(os.path.join(HERE, "radar_sample.xml"), "rb") as f:
    items = R.parse_xml(f.read())

a, b = items
assert a["p"] == "11111111"
assert a["t"] == "Semaglutide for MASH with fibrosis: a randomized trial", a["t"]
assert a["j"] == "J Hepatol"
assert a["a"] == "Hassan MA et al."
assert a["k"] == "rct"
assert a["d"] == "2026-10-02"
assert a["doi"] == "10.1000/test.1"
assert a["c"] == ["Saudi Arabia", "Egypt"], a["c"]
assert a.get("m") == 1
assert "masld" in a["g"] and "drugs" in a["g"] and "fibrosis" in a["g"]

assert b["k"] == "meta"
assert b["j"] == "Hepatology"
assert b["a"] == "Woman A"
assert b["c"] == ["USA"], b["c"]          # "Women's" must not match "Oman"
assert "m" not in b
assert "fibrosis" in b["g"] and "doi" not in b

print("Radar parser: all checks passed")

# The small "recent" file keeps only recent papers but the full tab totals
from datetime import datetime, timezone  # noqa: E402
payload = {"updated": "2026-10-17T07:00Z", "items": [
    {"p": "1", "d": "2026-10-10", "w": 1}, {"p": "2", "d": "2026-08-01", "w": 1, "m": 1}, {"p": "3", "d": "2026-09-20", "m": 1}]}
small = R.recent_payload(payload, datetime(2026, 10, 17, tzinfo=timezone.utc))
assert [x["p"] for x in small["items"]] == ["1", "3"], small["items"]
assert small["counts"] == {"global": 2, "mena": 2}, small["counts"]
assert len(payload["items"]) == 3   # the full list is not changed
print("Radar recent file: all checks passed")

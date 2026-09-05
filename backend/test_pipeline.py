import requests

BASE = "http://localhost:8000/api/v1"

# Ingest sample telemetry for all 6 trucks
samples = [
    {"tid": "TRK-101", "temp": 4.4, "humidity": 55.0, "tamper": False},
    {"tid": "TRK-102", "temp": 3.7, "humidity": 47.0, "tamper": False},
    {"tid": "TRK-103", "temp": 9.6, "humidity": 68.0, "tamper": True},
    {"tid": "TRK-104", "temp": 6.1, "humidity": 57.0, "tamper": False},
    {"tid": "TRK-105", "temp": -19.5, "humidity": 37.0, "tamper": False},
    {"tid": "TRK-106", "temp": 5.0, "humidity": 51.0, "tamper": False},
]

print("[TEST] Ingesting telemetry for 6 trucks...")
for p in samples:
    res = requests.post(f"{BASE}/telemetry/ingest", json=p, timeout=3)
    print(f"  {p['tid']}: {res.status_code} {res.json().get('status')}")

# Fetch fleet overview
fleet = requests.get(f"{BASE}/fleet", timeout=3).json()
print(f"\n--- Fleet Overview ({len(fleet)} Trucks) ---")
for t in fleet:
    print(f"  {t['id']} | {t['driver']:12} | {t['health']:8} | temp={t['temp']:+5.1f}C | limits={t['tempMin']}..{t['tempMax']}C | door={t['door']:6} | risk={t['risk']:2d}")

# Check telemetry history timestamps for TRK-101 (should be %H:%M:%S)
hist = requests.get(f"{BASE}/fleet/TRK-101/telemetry?limit=5", timeout=3).json()
print("\n--- TRK-101 Latest Telemetry Points ---")
for pt in hist.get("history", [])[-5:]:
    print(f"  time={pt['time']} | temp={pt['temp']}C | humidity={pt['humidity']}% | risk={pt['risk']}")

assert len(fleet) == 6, f"Expected 6 trucks, got {len(fleet)}"
print("\n[TEST] All pipeline assertions passed successfully!")

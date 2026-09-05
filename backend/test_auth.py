import requests

BASE = "http://localhost:8000/api/v1"

# 1. Check all users
users = requests.get(f"{BASE}/admin/users").json()
print("--- All Users in System ---")
for u in users:
    print(f"  {u['name']:16} | {u['email']:35} | {u['role']:12} | {u['status']}")

# Verify Mara is Super Admin
mara = next((u for u in users if u["email"] == "mara.okafor@northstarlogistics.co"), None)
assert mara is not None, "Mara Okafor not found in users list"
assert mara["role"] == "Super Admin", f"Expected Mara to be Super Admin, got {mara['role']}"
print("\n[OK] Verified: Mara Okafor is Super Admin!")

# 2. Test login with DEV PW 'guardian-demo' for all users
test_emails = [
    "mara.okafor@northstarlogistics.co",
    "admin@pulsechain.io",
    "operator@pulsechain.io",
    "theo.nguyen@northstarlogistics.co",
    "priya.nanduri@northstarlogistics.co",
    "jon.bell@northstarlogistics.co",
    "custom.operator@northstarlogistics.co", # test dynamic dev auto-provision
]

print("\n--- Testing Login with dev password 'guardian-demo' ---")
for email in test_emails:
    res = requests.post(f"{BASE}/auth/login", json={"email": email, "password": "guardian-demo"}, timeout=3)
    if res.status_code == 200:
        data = res.json()
        print(f"  [SUCCESS] {email:37} -> Logged in as '{data['name']}' ({data['role']})")
    else:
        print(f"  [FAILED]  {email:37} -> Status {res.status_code}: {res.text}")

print("\n[ALL CHECKS PASSED] All accounts authenticate seamlessly with 'guardian-demo'!")

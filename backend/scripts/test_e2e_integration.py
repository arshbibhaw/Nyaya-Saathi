import requests
import json
import time
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = f"test_{int(time.time())}@example.com"
PASSWORD = "password"

print(f"1. Registering new user {EMAIL}...")
res = requests.post(f"{BASE_URL}/auth/register", json={
    "email": EMAIL,
    "username": f"user_{int(time.time())}",
    "password": PASSWORD,
    "full_name": "Test User"
})
assert res.status_code == 201, f"Registration failed: {res.text}"
data = res.json()
token = data["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("   ✅ Registered and got token")

print("\n2. Creating a new legal case (Defective laptop)...")
res = requests.post(f"{BASE_URL}/cases/", json={
    "initial_issue": "I bought a defective laptop from an online seller for 80,000 rupees and they refuse to refund me."
}, headers=headers)
assert res.status_code in (200, 201), f"Case creation failed ({res.status_code}): {res.text}"
case = res.json()
case_id = case["id"]
print(f"   ✅ Case created. ID: {case_id}")
print(f"      Domain: {case['domain']}")
print(f"      Issue: {case['issue']}")

print("\n3. Sending a chat message to the AI...")
res = requests.post(
    f"{BASE_URL}/cases/{case_id}/chat",
    json={"message": "What sections of the law protect me here?"},
    headers=headers,
    stream=True
)
assert res.status_code == 200, f"Chat failed: {res.text}"

print("   ✅ Chat response streaming started. Output:")
print("   --------------------------------------------------")
for line in res.iter_lines():
    if line:
        line_str = line.decode('utf-8')
        if line_str.startswith("data: "):
            try:
                data = json.loads(line_str[6:])
                if data["type"] == "chunk":
                    print(data["text"], end="", flush=True)
                elif data["type"] == "sources":
                    print("\n\n   [SOURCES CITED]:")
                    for s in data["sources"]:
                        print(f"    - {s.get('title', 'Unknown')}")
            except Exception as e:
                pass
print("\n   --------------------------------------------------")
print("\n✅ E2E Integration test passed!")

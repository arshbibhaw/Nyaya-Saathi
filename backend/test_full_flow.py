import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("=== Testing Nyaya Saathi Dynamic Flow ===")
    
    # 1. Health check & Auth
    try:
        req = urllib.request.Request(f"http://127.0.0.1:8000/health")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print("1. Health check passed:", data)
    except Exception as e:
        print("Health check error:", e)
        return False

    # Get Token
    auth_token = None
    try:
        reg_payload = {"email": "tester@nyayasaathi.in", "password": "password123", "full_name": "Test Citizen"}
        req = urllib.request.Request(
            f"{BASE_URL}/auth/register",
            data=json.dumps(reg_payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(req)
    except Exception:
        pass

    login_payload = {"email": "tester@nyayasaathi.in", "password": "password123"}
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=json.dumps(login_payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        auth_token = json.loads(resp.read().decode('utf-8'))["access_token"]

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {auth_token}"}
    print(f"   Authenticated with JWT: {auth_token[:20]}...")

    # 2. Create Tenancy Case
    case1_payload = {
        "initial_issue": "Landlord in Pune not returning my security deposit of Rs 45,000 after 1 month notice. Vacation date was 1st August.",
        "location": "Maharashtra"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/cases/",
        data=json.dumps(case1_payload).encode('utf-8'),
        headers=headers
    )
    try:
        with urllib.request.urlopen(req) as resp:
            case1 = json.loads(resp.read().decode('utf-8'))
            print(f"2. Tenancy Case Created: ID={case1['id']}, Domain='{case1['domain']}', Title='{case1['title']}'")
            assert "Tenant" in case1['domain'] or "Property" in case1['domain'], "Expected Tenancy domain"
    except urllib.error.HTTPError as err:
        error_body = err.read().decode('utf-8')
        print(f"ERROR on case create [{err.code}]: {error_body}", flush=True)
        sys.exit(1)

    # 3. Fetch Action Plan for Tenancy Case
    req = urllib.request.Request(f"{BASE_URL}/cases/{case1['id']}/plan", headers=headers)
    with urllib.request.urlopen(req) as resp:
        plan1 = json.loads(resp.read().decode('utf-8'))
        print(f"3. Action Plan Loaded: {len(plan1['steps'])} steps")
        for s in plan1['steps']:
            print(f"   Step {s['step']}: {s['title']} -> {s['description'][:60]}...")

    # 4. Chat with AI Navigator for Tenancy Case
    chat_payload = {
        "message": "Can the landlord deduct painting charges from my 45000 deposit without showing receipts?"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/cases/{case1['id']}/chat",
        data=json.dumps(chat_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        chat_resp = json.loads(resp.read().decode('utf-8'))
        print(f"4. AI Navigator Response:\n   {chat_resp['response'][:250]}...\n")
        assert "Model Tenancy Act" in chat_resp['response'] or "Transfer of Property" in chat_resp['response'] or "notice" in chat_resp['response'].lower()

    # 5. Create Consumer Case (different case)
    case2_payload = {
        "initial_issue": "Purchased a laptop for Rs 65,000 from online seller. Screen is malfunctioning and seller refusing return/refund.",
        "location": "Karnataka"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/cases/",
        data=json.dumps(case2_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(req) as resp:
        case2 = json.loads(resp.read().decode('utf-8'))
        print(f"5. Consumer Case Created: ID={case2['id']}, Domain='{case2['domain']}', Title='{case2['title']}'")
        assert "Consumer" in case2['domain'], "Expected Consumer Protection domain"
        assert case2['id'] != case1['id'], "Cases must have unique IDs"

    # 6. List all cases
    req = urllib.request.Request(f"{BASE_URL}/cases/", headers=headers)
    with urllib.request.urlopen(req) as resp:
        all_cases = json.loads(resp.read().decode('utf-8'))
        print(f"6. Total Active Cases for User: {len(all_cases)}")
        for c in all_cases[:3]:
            print(f"   - [{c['id'][:8]}] {c['domain']}: {c['description'][:50]}...")

    print("\n=== ALL DYNAMIC TESTS PASSED SUCCESSFULLY! ===")
    return True

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

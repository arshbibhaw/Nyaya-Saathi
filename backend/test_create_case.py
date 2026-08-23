import requests

def test_flow():
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Login to get token (auto-registers if not exists)
    print("Logging in...")
    login_res = requests.post(f"{base_url}/auth/login", json={"email": "test2@test.com", "password": "test"})
    # I removed auto-register! Let's register first.
    print("Registering...")
    reg_res = requests.post(f"{base_url}/auth/register", json={"email": "test2@test.com", "password": "test", "full_name": "Test User"})
    if reg_res.status_code == 409:
        print("Already registered, logging in...")
        login_res = requests.post(f"{base_url}/auth/login", json={"email": "test2@test.com", "password": "test"})
        token = login_res.json()["access_token"]
    else:
        token = reg_res.json()["access_token"]
        
    print(f"Got token: {token[:20]}...")
    
    # 2. Create case
    print("Creating case...")
    headers = {"Authorization": f"Bearer {token}"}
    case_res = requests.post(f"{base_url}/cases/", json={"initial_issue": "fuck you bhai"}, headers=headers)
    print(f"Case status: {case_res.status_code}")
    if case_res.status_code != 201:
        print(case_res.text)

if __name__ == "__main__":
    test_flow()

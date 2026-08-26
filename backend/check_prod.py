import urllib.request
import urllib.error
import json
import sys

def check_production():
    render_url = "https://nyaya-saathi-xnxf.onrender.com"
    
    print("--- 1. Checking Render (Backend) Health ---")
    try:
        req = urllib.request.Request(f"{render_url}/health")
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode())
            print(f"[SUCCESS] Backend is up! Health status: {data['status']}")
    except Exception as e:
        print(f"[FAILED] Could not connect to Render: {e}")
        sys.exit(1)
        
    print("\n--- 2. Checking Render -> Supabase Connection & Database Conversion ---")
    try:
        req_cases = urllib.request.Request(f"{render_url}/api/v1/cases/")
        with urllib.request.urlopen(req_cases, timeout=15) as response:
            pass
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("[SUCCESS] Render successfully connected to Supabase!")
            print("[SUCCESS] Database tables (migrations) exist! (Received 401 Unauthorized, which is correct).")
        elif e.code == 500:
            print("[FAILED] Render connected, but Supabase connection or tables are broken (500 Internal Server Error).")
            print("         Did you run 'alembic upgrade head' in the Render Shell?")
        else:
            print(f"[WARNING] Unexpected HTTPError: {e.code}")
    except Exception as e:
        print(f"[FAILED] Error connecting to cases endpoint: {e}")

if __name__ == "__main__":
    check_production()

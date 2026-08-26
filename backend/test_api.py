from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "test6@example.com", "password": "pass", "full_name": "Test"},
    )
    print(response.status_code, response.text)

if __name__ == "__main__":
    test_register()

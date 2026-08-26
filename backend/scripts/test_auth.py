from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

response = client.post(
    "/api/v1/auth/register",
    json={"email": "test1234@example.com", "password": "password", "full_name": "Test User"}
)

print("STATUS CODE:", response.status_code)
print("RESPONSE:", response.text)

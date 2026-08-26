import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "caseuser@example.com", "password": "pwd"}
    )
    res = client.post("/api/v1/auth/login", json={"email": "caseuser@example.com", "password": "pwd"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_case(client: TestClient, auth_headers: dict):
    response = client.post(
        "/api/v1/cases",
        headers=auth_headers,
        json={"initial_issue": "I bought a defective product."}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["issue"] == "Defective Product"
    assert "id" in data
    assert data["status"] == "new"

def test_list_cases(client: TestClient, auth_headers: dict):
    # Create two cases
    client.post("/api/v1/cases", headers=auth_headers, json={"initial_issue": "Case 1"})
    client.post("/api/v1/cases", headers=auth_headers, json={"initial_issue": "Case 2"})
    
    response = client.get("/api/v1/cases", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert "id" in data[0]

def test_get_case(client: TestClient, auth_headers: dict):
    create_res = client.post("/api/v1/cases", headers=auth_headers, json={"initial_issue": "Get me"})
    case_id = create_res.json()["id"]
    
    response = client.get(f"/api/v1/cases/{case_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == case_id

def test_case_chat(client: TestClient, auth_headers: dict):
    create_res = client.post("/api/v1/cases", headers=auth_headers, json={"initial_issue": "Chat case"})
    case_id = create_res.json()["id"]
    
    response = client.post(
        f"/api/v1/cases/{case_id}/chat",
        headers=auth_headers,
        json={"message": "What should I do next?"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "sources" in data

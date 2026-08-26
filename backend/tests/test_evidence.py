import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={"email": "evuser@example.com", "password": "pwd"}
    )
    res = client.post("/api/v1/auth/login", json={"email": "evuser@example.com", "password": "pwd"})
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def test_case_id(client: TestClient, auth_headers: dict):
    res = client.post("/api/v1/cases", headers=auth_headers, json={"initial_issue": "Ev Case"})
    return res.json()["id"]

def test_upload_evidence(client: TestClient, auth_headers: dict, test_case_id: str, tmp_path):
    # Create a dummy text file
    file_path = tmp_path / "test_evidence.pdf"
    file_path.write_text("This is test evidence text.")
    
    with open(file_path, "rb") as f:
        response = client.post(
            f"/api/v1/cases/{test_case_id}/evidence",
            headers=auth_headers,
            files={"file": ("test_evidence.pdf", f, "application/pdf")}
        )
        
    assert response.status_code == 201
    data = response.json()
    assert data["file_name"] == "test_evidence.pdf"
    assert data["mime_type"] == "application/pdf"
    assert "extracted_text" in data
    assert "extracted_entities" in data

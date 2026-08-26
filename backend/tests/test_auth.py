import pytest
from fastapi.testclient import TestClient

def test_register_user(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    assert "id" in data["user"]
    assert "hashed_password" not in data["user"]

def test_register_existing_user(client: TestClient):
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    # Register again
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Email already registered"

def test_login(client: TestClient):
    # Register
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_password(client: TestClient):
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "strongpassword123"
        }
    )
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

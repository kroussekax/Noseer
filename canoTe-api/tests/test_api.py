import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

def test_auth_and_notebook_hierarchy():
    uid = uuid.uuid4().hex[:8]
    email_a = f"user_a_{uid}@test.com"
    pwd = "password123"
    res = client.post("/api/auth/register", json={"email": email_a, "password": pwd})
    assert res.status_code in (200, 201)
    cookies_a = res.cookies

    # Me check
    res = client.get("/api/auth/me", cookies=cookies_a)
    assert res.status_code == 200
    user_a_data = res.json()
    assert user_a_data["email"] == email_a

    # Create Notebook
    res = client.post("/api/notebooks", json={"name": "Quantum Optics", "description": "Lab notes"}, cookies=cookies_a)
    assert res.status_code == 201
    nb = res.json()
    nb_id = nb["id"]
    assert nb["name"] == "Quantum Optics"

    # List Notebooks
    res = client.get("/api/notebooks", cookies=cookies_a)
    assert res.status_code == 200
    assert any(n["id"] == nb_id for n in res.json())

    # Create Chapter
    res = client.post(f"/api/notebooks/{nb_id}/chapters", json={"name": "Chapter 1: Lasers"}, cookies=cookies_a)
    assert res.status_code == 201
    ch = res.json()
    ch_id = ch["id"]
    assert ch["name"] == "Chapter 1: Lasers"

    # Create Page
    res = client.post(f"/api/chapters/{ch_id}/pages", json={"title": "Page 1: Alignment", "content": "Initial calibration"}, cookies=cookies_a)
    assert res.status_code == 201
    pg = res.json()
    pg_id = pg["id"]
    assert pg["title"] == "Page 1: Alignment"

    # Update Page (Autosave test)
    res = client.patch(f"/api/pages/{pg_id}", json={"content": "Updated laser calibration data"}, cookies=cookies_a)
    assert res.status_code == 200
    assert res.json()["content"] == "Updated laser calibration data"

    # User B isolation test
    email_b = f"user_b_{uid}@test.com"
    res_b = client.post("/api/auth/register", json={"email": email_b, "password": pwd})
    cookies_b = res_b.cookies

    # User B should NOT be able to access User A's notebook
    res_forbidden = client.get(f"/api/notebooks/{nb_id}", cookies=cookies_b)
    assert res_forbidden.status_code == 403

    # User B should NOT see User A's notebook in their list
    res_list_b = client.get("/api/notebooks", cookies=cookies_b)
    assert res_list_b.status_code == 200
    assert not any(n["id"] == nb_id for n in res_list_b.json())

    # User A deletes notebook
    res_del = client.delete(f"/api/notebooks/{nb_id}", cookies=cookies_a)
    assert res_del.status_code == 204

    # Now it should be gone
    res_get_gone = client.get(f"/api/notebooks/{nb_id}", cookies=cookies_a)
    assert res_get_gone.status_code == 404

def test_uploads():
    uid = uuid.uuid4().hex[:8]
    email = f"uploader_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    # Create dummy PNG file (starts with PNG magic \x89PNG\r\n\x1a\n)
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"

    files = {"file": ("test.png", png_bytes, "image/png")}
    res_up = client.post("/api/uploads", files=files, cookies=cookies)
    assert res_up.status_code == 201
    up_data = res_up.json()
    assert "id" in up_data
    assert "url" in up_data
    upload_id = up_data["id"]

    # List user uploads
    res_list = client.get("/api/uploads", cookies=cookies)
    assert res_list.status_code == 200
    assert any(u["id"] == upload_id for u in res_list.json())

    # Delete upload
    res_del = client.delete(f"/api/uploads/{upload_id}", cookies=cookies)
    assert res_del.status_code == 204

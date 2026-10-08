"""
Tests for AI endpoints.
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_analyze_requires_auth():
    """Unauthenticated users cannot call POST /api/ai/analyze."""
    res = client.post("/api/ai/analyze", files={"file": ("test.jpg", b"\xff\xd8\xff" + b"\x00" * 100, "image/jpeg")})
    assert res.status_code == 401


def test_confirm_requires_auth():
    """Unauthenticated users cannot call POST /api/ai/confirm."""
    res = client.post("/api/ai/confirm", json={
        "upload_id": str(uuid.uuid4()),
        "title": "Test",
        "content": "Test content",
    })
    assert res.status_code == 401


def test_analyze_rejects_non_image():
    """Reject non-image file types."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_test_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    res = client.post("/api/ai/analyze", files={"file": ("test.txt", b"hello world", "text/plain")}, cookies=cookies)
    assert res.status_code == 415


def test_analyze_rejects_oversized():
    """Reject files over 10 MB."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_test_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    # Create a fake 11 MB "image"
    big_data = b"\xff\xd8\xff" + b"\x00" * (11 * 1024 * 1024)
    res = client.post("/api/ai/analyze", files={"file": ("big.jpg", big_data, "image/jpeg")}, cookies=cookies)
    assert res.status_code == 413


def test_analyze_rejects_too_small():
    """Reject files too small to be valid images."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_test_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    res = client.post("/api/ai/analyze", files={"file": ("tiny.jpg", b"\xff\xd8", "image/jpeg")}, cookies=cookies)
    assert res.status_code == 400


def test_confirm_requires_upload():
    """Confirm fails with non-existent upload_id."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_test_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    res = client.post("/api/ai/confirm", json={
        "upload_id": str(uuid.uuid4()),
        "title": "Test",
        "content": "Test content",
    }, cookies=cookies)
    assert res.status_code == 404


def test_confirm_ownership_enforced():
    """User cannot confirm with another user's upload."""
    # Create user A
    uid = uuid.uuid4().hex[:8]
    email_a = f"ai_owner_{uid}@test.com"
    res_a = client.post("/api/auth/register", json={"email": email_a, "password": "password123"})
    cookies_a = res_a.cookies

    # Create user B
    email_b = f"ai_other_{uid}@test.com"
    res_b = client.post("/api/auth/register", json={"email": email_b, "password": "password123"})
    cookies_b = res_b.cookies

    # User A creates a notebook
    res = client.post("/api/notebooks", json={"name": "Test NB"}, cookies=cookies_a)
    nb_id = res.json()["id"]

    # User A creates a chapter
    res = client.post(f"/api/notebooks/{nb_id}/chapters", json={"name": "Test CH"}, cookies=cookies_a)
    ch_id = res.json()["id"]

    # User A uploads an image
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    res = client.post("/api/uploads", files={"file": ("test.png", png_bytes, "image/png")}, cookies=cookies_a)
    upload_id = res.json()["id"]

    # User B tries to confirm with User A's upload
    res = client.post("/api/ai/confirm", json={
        "upload_id": upload_id,
        "notebook_id": nb_id,
        "chapter_id": ch_id,
        "title": "Hacked",
        "content": "Hacked content",
    }, cookies=cookies_b)
    assert res.status_code == 403


def test_confirm_creates_page():
    """After confirmation, page is created and persists."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_confirm_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    # Create notebook
    res = client.post("/api/notebooks", json={"name": "Physics"}, cookies=cookies)
    nb_id = res.json()["id"]

    # Create chapter
    res = client.post(f"/api/notebooks/{nb_id}/chapters", json={"name": "Kinematics"}, cookies=cookies)
    ch_id = res.json()["id"]

    # Upload image
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    res = client.post("/api/uploads", files={"file": ("test.png", png_bytes, "image/png")}, cookies=cookies)
    upload_id = res.json()["id"]

    # Confirm
    res = client.post("/api/ai/confirm", json={
        "upload_id": upload_id,
        "notebook_id": nb_id,
        "chapter_id": ch_id,
        "title": "Uniform Motion",
        "content": "Velocity is defined as...",
    }, cookies=cookies)
    assert res.status_code == 200
    page = res.json()
    assert page["title"] == "Uniform Motion"
    assert page["chapter_id"] == ch_id

    # Verify page persists
    res = client.get(f"/api/chapters/{ch_id}/pages", cookies=cookies)
    assert res.status_code == 200
    pages = res.json()
    assert any(p["id"] == page["id"] for p in pages)


def test_confirm_creates_notebook_and_chapter():
    """Confirm can create notebook and chapter if requested."""
    uid = uuid.uuid4().hex[:8]
    email = f"ai_create_{uid}@test.com"
    res = client.post("/api/auth/register", json={"email": email, "password": "password123"})
    cookies = res.cookies

    # Upload image
    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    res = client.post("/api/uploads", files={"file": ("test.png", png_bytes, "image/png")}, cookies=cookies)
    upload_id = res.json()["id"]

    # Confirm with create flags
    res = client.post("/api/ai/confirm", json={
        "upload_id": upload_id,
        "create_notebook": True,
        "notebook_name": "Biology",
        "create_chapter": True,
        "chapter_name": "Cell Structure",
        "title": "Mitochondria",
        "content": "The powerhouse of the cell",
    }, cookies=cookies)
    assert res.status_code == 200
    page = res.json()

    # Verify notebook was created
    res = client.get("/api/notebooks", cookies=cookies)
    notebooks = res.json()
    assert any(nb["name"] == "Biology" for nb in notebooks)

    # Verify chapter was created
    nb_id = next(nb["id"] for nb in notebooks if nb["name"] == "Biology")
    res = client.get(f"/api/notebooks/{nb_id}/chapters", cookies=cookies)
    chapters = res.json()
    assert any(ch["name"] == "Cell Structure" for ch in chapters)

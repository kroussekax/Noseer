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


# --- OpenRouter service tests (mocked HTTP, no real API calls) ---


def test_openrouter_requires_api_key(monkeypatch):
    """OpenRouterService refuses to start without OPENROUTER_API_KEY."""
    from app.config import settings
    from app.services.openrouter import OpenRouterService

    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "")
    with pytest.raises(RuntimeError):
        OpenRouterService()


def test_openrouter_request_construction(monkeypatch):
    """The service sends the configured model + base64 image to OpenRouter and parses the reply."""
    import asyncio
    import json as _json
    from app.config import settings
    from app.services.openrouter import OpenRouterService

    captured = {}

    class FakeResponse:
        status_code = 200

        def json(self):
            return {
                "choices": [
                    {
                        "message": {
                            "content": _json.dumps(
                                {
                                    "title": "Grocery Receipt",
                                    "suggested_notebook": "Finance",
                                    "suggested_notebook_exists": False,
                                    "suggested_chapter": "Groceries",
                                    "suggested_chapter_exists": False,
                                    "extracted_text": "Coffee 25000\nCake 30000",
                                    "visual_elements": [],
                                    "confidence": 0.8,
                                }
                            )
                        }
                    }
                ]
            }

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, json=None, headers=None):
            captured["url"] = url
            captured["json"] = json
            captured["headers"] = headers
            return FakeResponse()

    monkeypatch.setattr("app.services.openrouter.httpx.AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "test-key-not-real")

    svc = OpenRouterService()
    result = asyncio.run(
        svc.analyze_note(
            image_bytes=b"\xff\xd8\xff\xe0" + b"\x00" * 64,
            mime_type="image/jpeg",
            notebook_names=["Finance"],
        )
    )

    assert captured["url"] == "https://openrouter.ai/api/v1/chat/completions"
    assert captured["json"]["model"] == settings.AI_MODEL
    assert captured["headers"]["Authorization"] == "Bearer test-key-not-real"
    content = captured["json"]["messages"][0]["content"]
    image_part = next(p for p in content if p["type"] == "image_url")
    assert image_part["image_url"]["url"].startswith("data:image/jpeg;base64,")
    assert result["title"] == "Grocery Receipt"


def test_openrouter_rate_limit_maps_to_429(monkeypatch):
    """Persistent 429s from OpenRouter surface as HTTP 429 with a safe message."""
    import asyncio
    from app.config import settings
    from app.services import openrouter as openrouter_module
    from app.services.ai import AIServiceError
    from app.services.openrouter import OpenRouterService

    class Fake429Response:
        status_code = 429
        text = "rate limited"

        def json(self):
            return {}

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, json=None, headers=None):
            return Fake429Response()

    async def fake_sleep(seconds):
        pass

    monkeypatch.setattr("app.services.openrouter.httpx.AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(openrouter_module.asyncio, "sleep", fake_sleep)
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "test-key-not-real")

    svc = OpenRouterService()
    with pytest.raises(AIServiceError) as exc:
        asyncio.run(
            svc.analyze_note(b"\xff\xd8\xff" + b"\x00" * 32, "image/jpeg", [])
        )
    assert exc.value.status_code == 429
    assert "test-key" not in str(exc.value)


def test_openrouter_malformed_json_maps_to_error(monkeypatch):
    """Non-JSON model output raises AIServiceError instead of crashing."""
    import asyncio
    from app.config import settings
    from app.services.ai import AIServiceError
    from app.services.openrouter import OpenRouterService

    class FakeResponse:
        status_code = 200

        def json(self):
            return {"choices": [{"message": {"content": "sorry, I cannot do that"}}]}

    class FakeAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, url, json=None, headers=None):
            return FakeResponse()

    monkeypatch.setattr("app.services.openrouter.httpx.AsyncClient", FakeAsyncClient)
    monkeypatch.setattr(settings, "OPENROUTER_API_KEY", "test-key-not-real")

    svc = OpenRouterService()
    with pytest.raises(AIServiceError):
        asyncio.run(
            svc.analyze_note(b"\xff\xd8\xff" + b"\x00" * 32, "image/jpeg", [])
        )


# --- Full pipeline tests (image -> mocked VLM -> validation -> DB) ---


def _valid_vlm_result():
    return {
        "title": "Newton's Laws",
        "suggested_notebook": "Physics",
        "suggested_notebook_exists": False,
        "suggested_chapter": "Mechanics",
        "suggested_chapter_exists": False,
        "extracted_text": "Newton's First Law: an object remains at rest unless acted upon.\nF = ma",
        "visual_elements": [
            {"type": "equation", "description": "F = ma", "bounding_box": None}
        ],
        "confidence": 0.92,
    }


def test_analyze_with_mocked_vlm_full_pipeline():
    """image -> mocked VLM -> Pydantic validation -> confirm -> Notebook/Chapter/Page persisted."""
    from app.routers import ai as ai_router
    from app.services.ai import AIService

    class StubAI(AIService):
        async def analyze_note(self, image_bytes, mime_type, notebook_names, chapter_names=None):
            return _valid_vlm_result()

    app.dependency_overrides[ai_router.get_ai_service] = lambda: StubAI()
    try:
        uid = uuid.uuid4().hex[:8]
        res = client.post(
            "/api/auth/register",
            json={"email": f"ai_pipe_{uid}@test.com", "password": "password123"},
        )
        cookies = res.cookies

        # 1. Analyze a "photo" (fake PNG bytes pass the image validation)
        png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        res = client.post(
            "/api/ai/analyze",
            files={"file": ("note.png", png_bytes, "image/png")},
            cookies=cookies,
        )
        assert res.status_code == 200
        body = res.json()
        upload_id = body["upload_id"]
        analysis = body["analysis"]
        assert analysis["title"] == "Newton's Laws"
        assert analysis["suggested_notebook"] == "Physics"
        assert analysis["suggested_chapter"] == "Mechanics"
        assert analysis["confidence"] == 0.92

        # 2. Confirm: creates notebook + chapter + page from the AI suggestion
        res = client.post(
            "/api/ai/confirm",
            json={
                "upload_id": upload_id,
                "create_notebook": True,
                "notebook_name": analysis["suggested_notebook"],
                "create_chapter": True,
                "chapter_name": analysis["suggested_chapter"],
                "title": analysis["title"],
                "content": analysis["extracted_text"],
            },
            cookies=cookies,
        )
        assert res.status_code == 200
        page = res.json()
        assert page["title"] == "Newton's Laws"

        # 3. Page persists through the normal chapter -> pages endpoint
        res = client.get(f"/api/chapters/{page['chapter_id']}/pages", cookies=cookies)
        assert res.status_code == 200
        assert any(p["id"] == page["id"] for p in res.json())
    finally:
        app.dependency_overrides.pop(ai_router.get_ai_service, None)


def test_analyze_vlm_invalid_schema_fails_without_page():
    """If VLM output fails Pydantic validation, the request fails and nothing is persisted."""
    from app.routers import ai as ai_router
    from app.services.ai import AIService

    class BadStubAI(AIService):
        async def analyze_note(self, image_bytes, mime_type, notebook_names, chapter_names=None):
            # Missing required fields, wrong types
            return {"title": "Broken", "confidence": "not-a-number"}

    app.dependency_overrides[ai_router.get_ai_service] = lambda: BadStubAI()
    try:
        uid = uuid.uuid4().hex[:8]
        res = client.post(
            "/api/auth/register",
            json={"email": f"ai_bad_{uid}@test.com", "password": "password123"},
        )
        cookies = res.cookies

        png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        res = client.post(
            "/api/ai/analyze",
            files={"file": ("note.png", png_bytes, "image/png")},
            cookies=cookies,
        )
        assert res.status_code == 502

        # No notebooks/pages were created for this user
        res = client.get("/api/notebooks", cookies=cookies)
        assert res.status_code == 200
        assert res.json() == []
    finally:
        app.dependency_overrides.pop(ai_router.get_ai_service, None)


def test_analyze_without_api_key_returns_503():
    """With no OPENROUTER_API_KEY configured, analyze returns 503 (not a crash)."""
    uid = uuid.uuid4().hex[:8]
    res = client.post(
        "/api/auth/register",
        json={"email": f"ai_nokey_{uid}@test.com", "password": "password123"},
    )
    cookies = res.cookies

    png_bytes = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    res = client.post(
        "/api/ai/analyze",
        files={"file": ("note.png", png_bytes, "image/png")},
        cookies=cookies,
    )
    # 503 when unconfigured; 200 if a real key happens to be present in the environment
    assert res.status_code in (503, 200)

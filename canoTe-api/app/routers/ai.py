"""
AI endpoints: analyze image and confirm result.
"""
import json
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import User, Notebook, Chapter, Page, Upload
from ..schemas import AIAnalysis, AIAnalyzeResponse, AIConfirmRequest, PageOut
from ..storage import save_upload, delete_upload
from ..services.ai import AIService, AIServiceError
from ..services.openrouter import OpenRouterService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai"])


def get_ai_service() -> AIService | None:
    """Return AI service if configured, None otherwise."""
    try:
        return OpenRouterService()
    except RuntimeError:
        return None


@router.post("/ai/analyze", response_model=AIAnalyzeResponse)
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    ai_service: AIService | None = Depends(get_ai_service),
):
    """Upload and analyze a note image. Does NOT create any database records."""

    # Validate file first
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(415, "Unsupported file type. Only images are allowed.")

    # Read and validate size
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(413, "File too large (max 10 MB)")
    if len(data) < 12:
        raise HTTPException(400, "File too small to be a valid image")

    # Check if AI service is configured
    if ai_service is None:
        raise HTTPException(503, "AI service is not configured. Set OPENROUTER_API_KEY.")

    # Store original image
    from fastapi.datastructures import UploadFile as FastAPIUploadFile

    # Create a new UploadFile from bytes for storage
    import io

    stored_file = FastAPIUploadFile(
        filename=file.filename or "upload.jpg",
        file=io.BytesIO(data),
    )
    saved = await save_upload(stored_file, str(user.id))

    # Create Upload record (no page_id yet)
    upload = Upload(
        user_id=user.id,
        page_id=None,
        storage_key=saved["storage_key"],
        mime_type=saved["mime_type"],
        file_size=saved["file_size"],
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    # Get user's notebooks
    notebooks = db.query(Notebook).filter(Notebook.user_id == user.id).all()
    notebook_names = [nb.name for nb in notebooks]

    # Get chapters for notebooks (for context)
    chapter_names = []
    if notebooks:
        chapters = (
            db.query(Chapter)
            .filter(Chapter.notebook_id.in_([nb.id for nb in notebooks]))
            .all()
        )
        chapter_names = [ch.name for ch in chapters]

    # Call AI service
    try:
        result = await ai_service.analyze_note(
            image_bytes=data,
            mime_type=saved["mime_type"],
            notebook_names=notebook_names,
            chapter_names=chapter_names if chapter_names else None,
        )
    except AIServiceError as e:
        logger.error(f"AI analysis failed: {e}")
        # Clean up the upload record on failure
        delete_upload(upload.storage_key)
        db.delete(upload)
        db.commit()
        raise HTTPException(e.status_code, str(e)) from e
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        # Clean up the upload record on failure
        delete_upload(upload.storage_key)
        db.delete(upload)
        db.commit()
        raise HTTPException(502, "AI analysis failed. Please try again.") from e

    # Validate with Pydantic
    try:
        analysis = AIAnalysis(**result)
    except Exception as e:
        logger.error(f"Invalid AI response schema: {e}")
        delete_upload(upload.storage_key)
        db.delete(upload)
        db.commit()
        raise HTTPException(502, "Invalid response from AI service") from e

    return AIAnalyzeResponse(
        upload_id=upload.id,
        analysis=analysis,
    )


@router.post("/ai/confirm", response_model=PageOut)
async def confirm_analysis(
    body: AIConfirmRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Confirm AI analysis and create the actual page.
    Creates notebook/chapter if requested, then creates the page and associates the upload.
    """

    # Verify upload belongs to user
    upload = db.get(Upload, body.upload_id)
    if not upload:
        raise HTTPException(404, "Upload not found")
    if upload.user_id != user.id:
        raise HTTPException(403, "Access denied")

    notebook_id = body.notebook_id
    chapter_id = body.chapter_id

    # Create notebook if requested
    if body.create_notebook:
        if not body.notebook_name:
            raise HTTPException(400, "notebook_name required when creating notebook")
        nb = Notebook(user_id=user.id, name=body.notebook_name.strip())
        db.add(nb)
        db.commit()
        db.refresh(nb)
        notebook_id = nb.id
    elif notebook_id:
        # Verify notebook ownership
        nb = db.get(Notebook, notebook_id)
        if not nb:
            raise HTTPException(404, "Notebook not found")
        if nb.user_id != user.id:
            raise HTTPException(403, "Access denied")

    # Create chapter if requested
    if body.create_chapter:
        if not body.chapter_name:
            raise HTTPException(400, "chapter_name required when creating chapter")
        if not notebook_id:
            raise HTTPException(400, "notebook_id required when creating chapter")
        ch = Chapter(
            notebook_id=notebook_id,
            name=body.chapter_name.strip(),
            position=0,
        )
        db.add(ch)
        db.commit()
        db.refresh(ch)
        chapter_id = ch.id
    elif chapter_id:
        # Verify chapter ownership
        ch = db.get(Chapter, chapter_id)
        if not ch:
            raise HTTPException(404, "Chapter not found")
        nb = db.get(Notebook, ch.notebook_id)
        if not nb or nb.user_id != user.id:
            raise HTTPException(403, "Access denied")

    if not chapter_id:
        raise HTTPException(400, "chapter_id or create_chapter required")

    # Create page
    pg = Page(
        chapter_id=chapter_id,
        title=body.title,
        content=body.content,
        position=0,
    )
    db.add(pg)

    # Associate upload with page
    upload.page_id = pg.id

    db.commit()
    db.refresh(pg)
    return pg

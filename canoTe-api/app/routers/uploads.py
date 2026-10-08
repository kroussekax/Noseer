"""
Upload endpoints.
POST  /pages/{page_id}/uploads   – upload an image file attached to a page
GET   /pages/{page_id}/uploads   – list uploads for a page
GET   /uploads                   – list all uploads for current user (gallery)
POST  /uploads                   – upload directly (camera / standalone)
DELETE /uploads/{upload_id}      – delete an upload
"""
from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..deps import get_current_user
from ..models import User, Notebook, Chapter, Page, Upload
from ..schemas import UploadOut
from ..storage import save_upload, delete_upload, upload_url

router = APIRouter(tags=["uploads"])


def _owned_page(page_id: UUID, user: User, db: Session) -> Page:
    pg = db.get(Page, page_id)
    if pg is None:
        raise HTTPException(404, "Page not found")
    ch = db.get(Chapter, pg.chapter_id)
    nb = db.get(Notebook, ch.notebook_id)
    if nb is None or nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return pg


def _upload_out(u: Upload) -> UploadOut:
    return UploadOut(
        id=u.id, page_id=u.page_id,
        storage_key=u.storage_key, mime_type=u.mime_type,
        file_size=u.file_size, url=upload_url(u.storage_key),
        created_at=u.created_at,
    )


@router.get("/uploads", response_model=List[UploadOut])
def list_user_uploads(db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    """List all uploads owned by the user (Gallery)."""
    uploads = db.query(Upload).filter(Upload.user_id == user.id)\
                .order_by(Upload.created_at.desc()).all()
    return [_upload_out(u) for u in uploads]


@router.post("/uploads", response_model=UploadOut, status_code=201)
async def create_direct_upload(file: UploadFile = File(...),
                               page_id: Optional[UUID] = Form(None),
                               db: Session = Depends(get_db),
                               user: User = Depends(get_current_user)):
    """Upload directly (from camera or gallery upload), optionally attaching to page."""
    if page_id:
        _owned_page(page_id, user, db)

    saved = await save_upload(file, str(user.id))

    upload = Upload(
        user_id=user.id,
        page_id=page_id,
        storage_key=saved["storage_key"],
        mime_type=saved["mime_type"],
        file_size=saved["file_size"],
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return _upload_out(upload)


@router.get("/pages/{page_id}/uploads", response_model=List[UploadOut])
def list_page_uploads(page_id: UUID, db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    _owned_page(page_id, user, db)
    uploads = db.query(Upload).filter(Upload.page_id == page_id)\
                .order_by(Upload.created_at).all()
    return [_upload_out(u) for u in uploads]


@router.post("/pages/{page_id}/uploads", response_model=UploadOut, status_code=201)
async def create_page_upload(page_id: UUID, file: UploadFile = File(...),
                             db: Session = Depends(get_db),
                             user: User = Depends(get_current_user)):
    _owned_page(page_id, user, db)

    saved = await save_upload(file, str(user.id))

    upload = Upload(
        user_id=user.id,
        page_id=page_id,
        storage_key=saved["storage_key"],
        mime_type=saved["mime_type"],
        file_size=saved["file_size"],
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    return _upload_out(upload)


@router.delete("/uploads/{upload_id}", status_code=204)
def remove_upload(upload_id: UUID, db: Session = Depends(get_db),
                  user: User = Depends(get_current_user)):
    u = db.get(Upload, upload_id)
    if u is None:
        raise HTTPException(404, "Upload not found")
    if u.user_id != user.id:
        raise HTTPException(403, "Access denied")

    delete_upload(u.storage_key)
    db.delete(u)
    db.commit()
    return None

"""
Chapter CRUD endpoints.
Nested under notebooks; ownership enforced by walking up the hierarchy.
"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..deps import get_current_user
from ..models import User, Notebook, Chapter, Page
from ..schemas import ChapterCreate, ChapterUpdate, ChapterOut

router = APIRouter(tags=["chapters"])


def _owned_chapter(chapter_id: UUID, user: User, db: Session) -> Chapter:
    ch = db.get(Chapter, chapter_id)
    if ch is None:
        raise HTTPException(404, "Chapter not found")
    nb = db.get(Notebook, ch.notebook_id)
    if nb is None or nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return ch


def _owned_notebook(notebook_id: UUID, user: User, db: Session) -> Notebook:
    nb = db.get(Notebook, notebook_id)
    if nb is None:
        raise HTTPException(404, "Notebook not found")
    if nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return nb


def _chapter_out(ch: Chapter, db: Session) -> ChapterOut:
    count = db.query(func.count(Page.id)).filter(Page.chapter_id == ch.id).scalar()
    return ChapterOut(
        id=ch.id, notebook_id=ch.notebook_id,
        name=ch.name, position=ch.position,
        page_count=count or 0,
        created_at=ch.created_at, updated_at=ch.updated_at,
    )


# --- nested under /notebooks/{notebook_id}/chapters ---

@router.get("/notebooks/{notebook_id}/chapters", response_model=List[ChapterOut])
def list_chapters(notebook_id: UUID, db: Session = Depends(get_db),
                  user: User = Depends(get_current_user)):
    _owned_notebook(notebook_id, user, db)
    chs = db.query(Chapter).filter(Chapter.notebook_id == notebook_id)\
            .order_by(Chapter.position).all()
    return [_chapter_out(ch, db) for ch in chs]


@router.post("/notebooks/{notebook_id}/chapters", response_model=ChapterOut, status_code=201)
def create_chapter(notebook_id: UUID, body: ChapterCreate,
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_notebook(notebook_id, user, db)
    # auto-position at end
    max_pos = db.query(func.max(Chapter.position))\
                .filter(Chapter.notebook_id == notebook_id).scalar() or -1
    ch = Chapter(notebook_id=notebook_id, name=body.name.strip(),
                 position=max_pos + 1)
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return _chapter_out(ch, db)


# --- flat /chapters/{id} ---

@router.get("/chapters/{chapter_id}", response_model=ChapterOut)
def get_chapter(chapter_id: UUID, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    return _chapter_out(_owned_chapter(chapter_id, user, db), db)


@router.patch("/chapters/{chapter_id}", response_model=ChapterOut)
def update_chapter(chapter_id: UUID, body: ChapterUpdate,
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ch = _owned_chapter(chapter_id, user, db)
    if body.name is not None:
        ch.name = body.name.strip()
    if body.position is not None:
        ch.position = body.position
    db.commit()
    db.refresh(ch)
    return _chapter_out(ch, db)


@router.delete("/chapters/{chapter_id}", status_code=204)
def delete_chapter(chapter_id: UUID, db: Session = Depends(get_db),
                   user: User = Depends(get_current_user)):
    ch = _owned_chapter(chapter_id, user, db)
    db.delete(ch)
    db.commit()
    return None

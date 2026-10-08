"""
Page CRUD endpoints.
Nested under chapters; ownership enforced by walking up the hierarchy.
"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..deps import get_current_user
from ..models import User, Notebook, Chapter, Page
from ..schemas import PageCreate, PageUpdate, PageOut

router = APIRouter(tags=["pages"])


def _owned_chapter(chapter_id: UUID, user: User, db: Session) -> Chapter:
    ch = db.get(Chapter, chapter_id)
    if ch is None:
        raise HTTPException(404, "Chapter not found")
    nb = db.get(Notebook, ch.notebook_id)
    if nb is None or nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return ch


def _owned_page(page_id: UUID, user: User, db: Session) -> Page:
    pg = db.get(Page, page_id)
    if pg is None:
        raise HTTPException(404, "Page not found")
    ch = db.get(Chapter, pg.chapter_id)
    nb = db.get(Notebook, ch.notebook_id)
    if nb is None or nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return pg


# --- nested under /chapters/{chapter_id}/pages ---

@router.get("/chapters/{chapter_id}/pages", response_model=List[PageOut])
def list_pages(chapter_id: UUID, db: Session = Depends(get_db),
               user: User = Depends(get_current_user)):
    _owned_chapter(chapter_id, user, db)
    return db.query(Page).filter(Page.chapter_id == chapter_id)\
             .order_by(Page.position).all()


@router.post("/chapters/{chapter_id}/pages", response_model=PageOut, status_code=201)
def create_page(chapter_id: UUID, body: PageCreate,
                db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _owned_chapter(chapter_id, user, db)
    max_pos = db.query(func.max(Page.position))\
                .filter(Page.chapter_id == chapter_id).scalar() or -1
    pg = Page(chapter_id=chapter_id, title=body.title,
              content=body.content, position=max_pos + 1)
    db.add(pg)
    db.commit()
    db.refresh(pg)
    return pg


# --- flat /pages/{id} ---

@router.get("/pages/{page_id}", response_model=PageOut)
def get_page(page_id: UUID, db: Session = Depends(get_db),
             user: User = Depends(get_current_user)):
    return _owned_page(page_id, user, db)


@router.patch("/pages/{page_id}", response_model=PageOut)
def update_page(page_id: UUID, body: PageUpdate,
                db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    pg = _owned_page(page_id, user, db)
    if body.title is not None:
        pg.title = body.title
    if body.content is not None:
        pg.content = body.content
    if body.position is not None:
        pg.position = body.position
    db.commit()
    db.refresh(pg)
    return pg


@router.delete("/pages/{page_id}", status_code=204)
def delete_page(page_id: UUID, db: Session = Depends(get_db),
                user: User = Depends(get_current_user)):
    pg = _owned_page(page_id, user, db)
    db.delete(pg)
    db.commit()
    return None

"""
Notebook CRUD endpoints.
All operations are scoped to the authenticated user.
"""
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..deps import get_current_user
from ..models import User, Notebook, Chapter
from ..schemas import NotebookCreate, NotebookUpdate, NotebookOut

router = APIRouter(prefix="/notebooks", tags=["notebooks"])


def _owned_notebook(notebook_id: UUID, user: User, db: Session) -> Notebook:
    nb = db.get(Notebook, notebook_id)
    if nb is None:
        raise HTTPException(404, "Notebook not found")
    if nb.user_id != user.id:
        raise HTTPException(403, "Access denied")
    return nb


def _notebook_out(nb: Notebook, db: Session) -> NotebookOut:
    count = db.query(func.count(Chapter.id)).filter(Chapter.notebook_id == nb.id).scalar()
    return NotebookOut(
        id=nb.id, name=nb.name, description=nb.description or "",
        chapter_count=count or 0,
        created_at=nb.created_at, updated_at=nb.updated_at,
    )


@router.get("", response_model=List[NotebookOut])
def list_notebooks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    nbs = db.query(Notebook).filter(Notebook.user_id == user.id)\
            .order_by(Notebook.created_at.desc()).all()
    return [_notebook_out(nb, db) for nb in nbs]


@router.post("", response_model=NotebookOut, status_code=201)
def create_notebook(body: NotebookCreate, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    nb = Notebook(user_id=user.id, name=body.name.strip(), description=body.description)
    db.add(nb)
    db.commit()
    db.refresh(nb)
    return _notebook_out(nb, db)


@router.get("/{notebook_id}", response_model=NotebookOut)
def get_notebook(notebook_id: UUID, db: Session = Depends(get_db),
                 user: User = Depends(get_current_user)):
    return _notebook_out(_owned_notebook(notebook_id, user, db), db)


@router.patch("/{notebook_id}", response_model=NotebookOut)
def update_notebook(notebook_id: UUID, body: NotebookUpdate,
                    db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    nb = _owned_notebook(notebook_id, user, db)
    if body.name is not None:
        nb.name = body.name.strip()
    if body.description is not None:
        nb.description = body.description
    db.commit()
    db.refresh(nb)
    return _notebook_out(nb, db)


@router.delete("/{notebook_id}", status_code=204)
def delete_notebook(notebook_id: UUID, db: Session = Depends(get_db),
                    user: User = Depends(get_current_user)):
    nb = _owned_notebook(notebook_id, user, db)
    db.delete(nb)
    db.commit()
    return None

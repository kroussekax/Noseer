"""
Pydantic request/response schemas.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserOut(BaseModel):
    id: UUID
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Notebooks
# ---------------------------------------------------------------------------

class NotebookCreate(BaseModel):
    name: str
    description: str = ""

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class NotebookUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class NotebookOut(BaseModel):
    id: UUID
    name: str
    description: str
    chapter_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Chapters
# ---------------------------------------------------------------------------

class ChapterCreate(BaseModel):
    name: str
    position: int = 0

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class ChapterUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None


class ChapterOut(BaseModel):
    id: UUID
    notebook_id: UUID
    name: str
    position: int
    page_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Pages
# ---------------------------------------------------------------------------

class PageCreate(BaseModel):
    title: str = "Untitled"
    content: str = ""
    position: int = 0


class PageUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    position: Optional[int] = None


class PageOut(BaseModel):
    id: UUID
    chapter_id: UUID
    title: str
    content: str
    position: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Uploads
# ---------------------------------------------------------------------------

class UploadOut(BaseModel):
    id: UUID
    page_id: Optional[UUID]
    storage_key: str
    mime_type: str
    file_size: int
    url: str   # computed field, not in DB
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# AI Analysis
# ---------------------------------------------------------------------------

class VisualElement(BaseModel):
    type: str
    description: str
    bounding_box: dict | None = None


class AIAnalysis(BaseModel):
    title: str
    suggested_notebook: str
    suggested_notebook_exists: bool
    suggested_chapter: str | None = None
    suggested_chapter_exists: bool | None = None
    extracted_text: str
    visual_elements: list[VisualElement] = []
    confidence: float


class AIAnalyzeResponse(BaseModel):
    upload_id: UUID
    analysis: AIAnalysis


class AIConfirmRequest(BaseModel):
    upload_id: UUID
    notebook_id: UUID | None = None
    chapter_id: UUID | None = None
    create_notebook: bool = False
    create_chapter: bool = False
    notebook_name: str | None = None
    chapter_name: str | None = None
    title: str
    content: str

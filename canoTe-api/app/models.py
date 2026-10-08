"""
SQLAlchemy ORM models.
Hierarchy: User → Notebook → Chapter → Page → Upload
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Boolean,
    DateTime, ForeignKey, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base


def now_utc():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String(320), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())

    notebooks = relationship("Notebook", back_populates="user", cascade="all, delete-orphan")
    uploads   = relationship("Upload",   back_populates="user", cascade="all, delete-orphan")


class Notebook(Base):
    __tablename__ = "notebooks"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(255), nullable=False)
    description = Column(Text, default="")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    user     = relationship("User",    back_populates="notebooks")
    chapters = relationship("Chapter", back_populates="notebook",
                            cascade="all, delete-orphan",
                            order_by="Chapter.position")


class Chapter(Base):
    __tablename__ = "chapters"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    notebook_id = Column(UUID(as_uuid=True), ForeignKey("notebooks.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String(255), nullable=False)
    position    = Column(Integer, nullable=False, default=0)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now())

    notebook = relationship("Notebook", back_populates="chapters")
    pages    = relationship("Page", back_populates="chapter",
                            cascade="all, delete-orphan",
                            order_by="Page.position")


class Page(Base):
    __tablename__ = "pages"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    title      = Column(String(500), nullable=False, default="Untitled")
    content    = Column(Text, default="")
    position   = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    chapter = relationship("Chapter", back_populates="pages")
    uploads = relationship("Upload",  back_populates="page", cascade="all, delete-orphan")


class Upload(Base):
    __tablename__ = "uploads"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    page_id     = Column(UUID(as_uuid=True), ForeignKey("pages.id", ondelete="SET NULL"), nullable=True)
    storage_key = Column(String(512), nullable=False)   # relative path under UPLOAD_DIR
    mime_type   = Column(String(64),  nullable=False)
    file_size   = Column(Integer,     nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="uploads")
    page = relationship("Page", back_populates="uploads")

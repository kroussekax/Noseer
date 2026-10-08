"""initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-09-29

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id",            postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email",         sa.String(320), nullable=False),
        sa.Column("password_hash", sa.String(),    nullable=False),
        sa.Column("created_at",    sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "notebooks",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name",        sa.String(255), nullable=False),
        sa.Column("description", sa.Text(),      nullable=True, default=""),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",  sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_notebooks_user_id", "notebooks", ["user_id"])

    op.create_table(
        "chapters",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("notebook_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("notebooks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name",        sa.String(255), nullable=False),
        sa.Column("position",    sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at",  sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_chapters_notebook_id", "chapters", ["notebook_id"])

    op.create_table(
        "pages",
        sa.Column("id",         postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("chapter_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title",      sa.String(500), nullable=False, server_default="Untitled"),
        sa.Column("content",    sa.Text(),      nullable=True,  default=""),
        sa.Column("position",   sa.Integer(),   nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_pages_chapter_id", "pages", ["chapter_id"])

    op.create_table(
        "uploads",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("users.id",  ondelete="CASCADE"), nullable=False),
        sa.Column("page_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("pages.id",  ondelete="SET NULL"), nullable=True),
        sa.Column("storage_key", sa.String(512), nullable=False),
        sa.Column("mime_type",   sa.String(64),  nullable=False),
        sa.Column("file_size",   sa.Integer(),   nullable=False),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_uploads_user_id", "uploads", ["user_id"])
    op.create_index("ix_uploads_page_id", "uploads", ["page_id"])


def downgrade() -> None:
    op.drop_table("uploads")
    op.drop_table("pages")
    op.drop_table("chapters")
    op.drop_table("notebooks")
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")

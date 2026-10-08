"""
File storage module.
Saves validated uploads to local disk under UPLOAD_DIR.
UUID-based filenames prevent path traversal and collisions.
"""
import uuid
import struct
from pathlib import Path
from fastapi import UploadFile, HTTPException
from .config import settings

# Magic-byte signatures for allowed image types
_MAGIC: dict[bytes, tuple[str, str]] = {
    b"\xff\xd8\xff":          ("image/jpeg", ".jpg"),
    b"\x89PNG\r\n\x1a\n":    ("image/png",  ".png"),
    b"RIFF":                  ("image/webp", ".webp"),  # checked further below
}

_WEBP_MARKER = b"WEBP"  # bytes 8-12 of a WEBP file


def _detect_mime(header: bytes) -> tuple[str, str] | None:
    """
    Return (mime_type, extension) by inspecting file magic bytes.
    Returns None if the file is not an allowed image type.
    """
    for magic, info in _MAGIC.items():
        if header[:len(magic)] == magic:
            if magic == b"RIFF":
                # Confirm it's actually WEBP not another RIFF variant
                if header[8:12] != _WEBP_MARKER:
                    return None
            return info
    return None


async def save_upload(file: UploadFile, user_id: str) -> dict:
    """
    Validate and save an uploaded file.
    Returns dict with storage_key, mime_type, file_size.
    Raises HTTPException on invalid/oversized file.
    """
    # Read entire file into memory (size-limited)
    data = await file.read(settings.MAX_UPLOAD_BYTES + 1)
    if len(data) > settings.MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB)")
    if len(data) < 12:
        raise HTTPException(status_code=400, detail="File too small to be a valid image")

    # Validate by magic bytes — ignore browser-supplied Content-Type
    detected = _detect_mime(data)
    if detected is None:
        raise HTTPException(status_code=415, detail="Unsupported file type. Only JPEG, PNG, and WebP are allowed.")

    mime_type, ext = detected

    # Build path: UPLOAD_DIR / user_id / <uuid>.<ext>
    user_dir = settings.UPLOAD_DIR / str(user_id)
    user_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4()}{ext}"
    dest = user_dir / filename
    dest.write_bytes(data)

    # storage_key is a relative path from UPLOAD_DIR root
    storage_key = f"{user_id}/{filename}"

    return {
        "storage_key": storage_key,
        "mime_type":   mime_type,
        "file_size":   len(data),
    }


def delete_upload(storage_key: str) -> None:
    """Delete a file from disk. Silently ignores missing files."""
    try:
        (settings.UPLOAD_DIR / storage_key).unlink(missing_ok=True)
    except Exception:
        pass


def upload_url(storage_key: str) -> str:
    """Return the public URL path for an upload."""
    return f"/uploads/{storage_key}"

"""
FastAPI dependencies.
- get_db: yields a DB session
- get_current_user: resolves authenticated user from session cookie
"""
from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from itsdangerous import BadSignature, SignatureExpired
from .database import get_db
from .auth import decode_session_token, SESSION_COOKIE
from .models import User


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        user_id = decode_session_token(token)
    except SignatureExpired:
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    except BadSignature:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user

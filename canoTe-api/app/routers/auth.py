"""
Auth endpoints: register, login, logout, me.
"""
from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..database import get_db
from ..models import User
from ..schemas import AuthRequest, UserOut
from ..auth import (
    hash_password, verify_password,
    create_session_token, SESSION_COOKIE, SESSION_MAX_AGE
)
from ..deps import get_current_user
from ..config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_session_cookie(response: Response, user_id: str) -> None:
    token = create_session_token(str(user_id))
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax",
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=201)
def register(body: AuthRequest, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with that email already exists")

    _set_session_cookie(response, user.id)
    return user


@router.post("/login", response_model=UserOut)
def login(body: AuthRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    _set_session_cookie(response, user.id)
    return user


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(SESSION_COOKIE, path="/", samesite="lax")
    return None


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

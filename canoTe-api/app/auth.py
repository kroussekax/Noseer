"""
Authentication helpers.
- Direct bcrypt password hashing
- Signed session token via itsdangerous (stored in HTTP-only cookie)
"""
import bcrypt
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from .config import settings

_serializer = URLSafeTimedSerializer(settings.SECRET_KEY, salt="session")

SESSION_COOKIE  = "session"
SESSION_MAX_AGE = 30 * 24 * 60 * 60   # 30 days in seconds


def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


def create_session_token(user_id: str) -> str:
    """Return a signed, time-stamped token encoding the user_id."""
    return _serializer.dumps(str(user_id))


def decode_session_token(token: str) -> str:
    """
    Return user_id string from token.
    Raises itsdangerous.BadSignature / SignatureExpired on failure.
    """
    return _serializer.loads(token, max_age=SESSION_MAX_AGE)

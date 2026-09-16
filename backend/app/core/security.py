import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)

oauth2_scheme_optional = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False,
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
REFRESH_TOKEN_EXPIRE_DAYS = settings.REFRESH_TOKEN_EXPIRE_DAYS


def hash_token_string(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_refresh_token(user_id: int, db: Session) -> str:
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token_string(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    db_token = RefreshToken(
        token_hash=token_hash,
        user_id=user_id,
        expires_at=expires_at,
        revoked=False,
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)

    return raw_token


def rotate_refresh_token(raw_token: str, db: Session) -> Tuple[str, User]:
    token_hash = hash_token_string(raw_token)
    db_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Theft Detection: If token is already revoked, revoke all tokens for this user!
    if db_token.revoked:
        db.query(RefreshToken).filter(
            RefreshToken.user_id == db_token.user_id
        ).update({"revoked": True})
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compromised refresh token detected. All sessions revoked.",
        )

    now = datetime.now(timezone.utc)
    if db_token.expires_at < now:
        db_token.revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired refresh token",
        )

    # Mark existing token as revoked
    db_token.revoked = True

    # Generate new token
    new_raw_token = secrets.token_urlsafe(32)
    new_token_hash = hash_token_string(new_raw_token)
    db_token.replaced_by = new_token_hash

    new_expires_at = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    new_db_token = RefreshToken(
        token_hash=new_token_hash,
        user_id=db_token.user_id,
        expires_at=new_expires_at,
        revoked=False,
    )
    db.add(new_db_token)
    db.commit()

    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return new_raw_token, user


def revoke_refresh_token(raw_token: str, db: Session) -> bool:
    token_hash = hash_token_string(raw_token)
    db_token = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash)
        .first()
    )
    if db_token and not db_token.revoked:
        db_token.revoked = True
        db.commit()
        return True
    return False



def hash_password(password: str) -> str:
    # bcrypt limit is 72 bytes
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict) -> str:

    payload = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({"exp": expire})

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return payload

    except JWTError:

        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    username = payload.get("sub")

    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not token:
        return None

    payload = decode_token(token)
    if payload is None:
        return None

    username = payload.get("sub")
    if not username:
        return None

    return (
        db.query(User)
        .filter(User.username == username)
        .first()
    )
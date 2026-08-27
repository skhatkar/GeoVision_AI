from sqlalchemy.orm import Session

from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate

from app.core.security import (
    hash_password,
    verify_password,
)


def create_user(
    db: Session,
    user: UserCreate,
) -> User:
    """
    Create a new user after validating
    username and email uniqueness.
    """

    existing_username = (
        db.query(User)
        .filter(User.username == user.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists.",
        )

    existing_email = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists.",
        )

    db_user = User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        password_hash=hash_password(user.password),
        role_id=user.role_id,
        department_id=user.department_id,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def authenticate(
    db: Session,
    username: str,
    password: str,
):
    """
    Authenticate user credentials by username or email.
    """

    user = (
        db.query(User)
        .filter((User.username == username) | (User.email == username))
        .first()
    )

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash,
    ):
        return None

    return user
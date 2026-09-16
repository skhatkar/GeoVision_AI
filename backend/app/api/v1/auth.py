from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, RefreshTokenRequest
from app.services.auth_service import create_user, authenticate
from app.core.security import (
    create_access_token,
    create_refresh_token,
    rotate_refresh_token,
    revoke_refresh_token,
    get_current_user,
)
from app.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# -----------------------------
# Register
# -----------------------------
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return create_user(db, user)


# -----------------------------
# Login (Swagger OAuth2 Compatible)
# -----------------------------
@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(
        {
            "sub": user.username,
            "id": user.id,
        }
    )
    refresh_token = create_refresh_token(user.id, db)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
    }


# -----------------------------
# Refresh Token Flow
# -----------------------------
@router.post(
    "/refresh",
    response_model=Token,
)
def refresh_token(
    body: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    new_refresh_token, user = rotate_refresh_token(body.refresh_token, db)
    new_access_token = create_access_token(
        {
            "sub": user.username,
            "id": user.id,
        }
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token,
    }


# -----------------------------
# Logout
# -----------------------------
@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
)
def logout(
    body: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    revoke_refresh_token(body.refresh_token, db)
    return {"message": "Successfully logged out"}


# -----------------------------
# Current User
# -----------------------------
@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
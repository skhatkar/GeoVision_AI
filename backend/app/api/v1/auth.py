from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, RefreshTokenRequest
from app.services.auth_service import create_user, authenticate
from app.services.audit_service import log_action
from app.common.request_utils import get_client_ip
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
    request: Request,
    db: Session = Depends(get_db),
):
    new_user = create_user(db, user)
    ip_address = get_client_ip(request)
    log_action(
        db,
        action="USER_REGISTER",
        user_id=new_user.id,
        description=f"User registered with username: {new_user.username}",
        entity_type="user",
        entity_id=new_user.id,
        ip_address=ip_address,
    )
    return new_user


# -----------------------------
# Login (Swagger OAuth2 Compatible)
# -----------------------------
@router.post(
    "/login",
    response_model=Token,
)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    ip_address = get_client_ip(request)
    user = authenticate(
        db,
        form_data.username,
        form_data.password,
    )

    if not user:
        log_action(
            db,
            action="USER_LOGIN_FAILED",
            description=f"Failed login attempt for username: {form_data.username}",
            entity_type="auth",
            ip_address=ip_address,
        )
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

    log_action(
        db,
        action="USER_LOGIN",
        user_id=user.id,
        description=f"User logged in successfully: {user.username}",
        entity_type="user",
        entity_id=user.id,
        ip_address=ip_address,
    )

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
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = get_client_ip(request)
    new_refresh_token, user = rotate_refresh_token(body.refresh_token, db)
    new_access_token = create_access_token(
        {
            "sub": user.username,
            "id": user.id,
        }
    )

    log_action(
        db,
        action="TOKEN_REFRESH",
        user_id=user.id,
        description=f"Token rotated for user: {user.username}",
        entity_type="user",
        entity_id=user.id,
        ip_address=ip_address,
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
    request: Request,
    db: Session = Depends(get_db),
):
    ip_address = get_client_ip(request)
    revoke_refresh_token(body.refresh_token, db)
    log_action(
        db,
        action="USER_LOGOUT",
        description="User logged out and session revoked",
        entity_type="auth",
        ip_address=ip_address,
    )
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
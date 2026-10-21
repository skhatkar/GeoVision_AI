from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ==========================================
    # Application
    # ==========================================
    APP_NAME: str = "GeoVision AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug_mode(cls, value: object) -> object:
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod"}:
                return False
            if normalized in {"development", "dev", "debug"}:
                return True
        return value

    API_PREFIX: str = "/api/v1"

    # ==========================================
    # Database
    # ==========================================
    DATABASE_URL: str = (
        "postgresql://skhatkar:skhatkar@localhost:5432/Geovision"
    )

    # ==========================================
    # JWT Authentication
    # ==========================================
    SECRET_KEY: str = (
        "change-this-to-a-very-long-random-secret-key"
    )

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RATE_LIMIT_PER_MINUTE: int = 300

    # ==========================================
    # File Upload
    # ==========================================
    UPLOAD_FOLDER: str = "uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

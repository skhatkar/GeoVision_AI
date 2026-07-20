from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ==========================================
    # Application
    # ==========================================
    APP_NAME: str = "GeoVision AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

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

    # ==========================================
    # File Upload
    # ==========================================
    UPLOAD_FOLDER: str = "uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
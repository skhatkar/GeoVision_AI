from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "GeoVision AI"
    APP_VERSION: str = "1.0.0"

    API_PREFIX: str = "/api/v1"

    DEBUG: bool = True

    DATABASE_URL: str = (
        "postgresql://skhatkar:skhatkar@localhost:5432/Geovision"
    )

    class Config:
        env_file = ".env"


settings = Settings()

SECRET_KEY = "change-this-to-a-long-random-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
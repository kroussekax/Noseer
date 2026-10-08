"""
Application configuration — reads from environment variables.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql://tactile:tactile@localhost/tactile"
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    SECURE_COOKIES: bool = False
    UPLOAD_DIR: Path = Path("./uploads")
    MAX_UPLOAD_BYTES: int = 10 * 1024 * 1024  # 10 MB
    OPENROUTER_API_KEY: str = ""
    AI_MODEL: str = "qwen/qwen3.8-27b:free"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()

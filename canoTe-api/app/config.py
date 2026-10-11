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
    AI_MODEL: str = "google/gemma-4-26b-a4b-it:free"
    # Every free vision model on OpenRouter (verified against the live catalog),
    # tried in order when the primary fails (rate limit, 5xx, bad output).
    # Each is a separate capacity pool.
    AI_FALLBACK_MODELS: str = (
        "google/gemma-4-31b-it:free,"
        "thinkingmachines/inkling:free,"
        "thinkingmachines/inkling-small:free,"
        "dots-studio/dots-3-note-preview:free,"
        "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
    )

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()

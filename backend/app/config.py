"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """App settings loaded from .env file or environment."""

class Settings(BaseSettings):
    """App settings loaded from .env file or environment."""

    supabase_url: str = "https://owrqljgboratvcmuzpkx.supabase.co"
    supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cnFsamdib3JhdHZjbXV6cGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjMwNTYsImV4cCI6MjEwMTQ5OTA1Nn0.GgVitgmpcehOnsBzjfWe8lrI4J3bMamhBTO2-LAW1mQ"
    supabase_jwt_secret: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    frontend_url: str = "http://localhost:5500"
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cache and return settings singleton."""
    return Settings()

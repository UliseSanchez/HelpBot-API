from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY")
    database_url: str = os.getenv("DATABASE_URL")
    model_name: str = os.getenv("MODEL_NAME")

settings = Settings()
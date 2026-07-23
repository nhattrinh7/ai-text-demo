import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MCP_API_KEY = os.getenv("MCP_API_KEY")
    RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://my-rag:8000/query")


settings = Settings()

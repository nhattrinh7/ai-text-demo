from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env vào os.environ ĐẦU TIÊN — để các thư viện bên thứ 3 (OpenAI SDK, v.v.)
# có thể đọc trực tiếp từ os.environ thay vì từ pydantic Settings.
load_dotenv()


class Settings(BaseSettings):
    """Cấu hình tập trung được nạp từ biến môi trường."""

    # OpenAI
    openai_api_key: str

    # Nhúng (Embedding)
    embedding_model: str = "text-embedding-3-large"

    # LLM
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.0

    # Bộ truy xuất (Retriever)
    retriever_k: int = 5

    # Paths
    vectorstore_path: str = "./vectorstore"
    papers_path: str = "./data/papers"

    # SemanticChunker
    breakpoint_threshold: float = 0.85

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()  # type: ignore

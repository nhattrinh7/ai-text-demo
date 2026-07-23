"""
Script index tài liệu (chạy offline).

Đọc các file PDF từ thư mục papers, cắt đoạn theo ngữ nghĩa (semantic chunking),
tạo vector nhúng (embeddings) và lưu FAISS vectorstore vào ổ đĩa.

Cách dùng:
    cd my-rag
    uv run python -m scripts.index_documents
"""

import sys
from pathlib import Path

# File này nằm trong thư mục con scripts/, nhưng nó lại cần lấy code từ thư mục app/
# nếu import thẳng sẽ lỗi ModuleNotFoundError
# Đoạn code dưới lùi 2 cấp (.parent.parent) để ra thư mục gốc my-rag
# rồi nhét đường dẫn thư mục gốc vào sys.path
# Đảm bảo thư mục gốc nằm trong sys.path để có thể import package `app`.
_project_root = str(Path(__file__).resolve().parent.parent)
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

from app.config import settings
from app.services.rag import RAGService


def main() -> None:
    print("=== Đang bắt đầu index tài liệu ===")
    print(f"Đường dẫn thư mục papers : {settings.papers_path}")
    print(f"Đường dẫn lưu vectorstore: {settings.vectorstore_path}")

    service = RAGService(settings)
    service.build_from_documents()

    print("=== Hoàn tất index ===")


if __name__ == "__main__":
    main()

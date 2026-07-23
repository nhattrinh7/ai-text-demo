import os
import pytest
from fastapi.testclient import TestClient

from app.main import app

@pytest.mark.skipif(
    not os.path.exists("vectorstore/index.faiss"), 
    reason="FAISS index not found (likely running in CI)"
)

def test_query_endpoint_success():
    # Sử dụng 'with' block để TestClient tự động kích hoạt sự kiện lifespan
    # Từ đó tự động load FAISS index và sẵn sàng RAG service
    with TestClient(app) as client:
        # Bắn request trực tiếp vào API thật (sẽ tốn token LLM)
        response = client.post("/query", json={"question": "CDC là gì?"})
        
        # Verify response
        assert response.status_code == 200
        data = response.json()
        print("\n\n=== RESULT FROM MY-RAG ===")
        print(data["answer"])
        print("==========================\n")
        assert "answer" in data
        assert len(data["answer"]) > 0


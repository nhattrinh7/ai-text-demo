import requests
from app.config import settings


def ask_rag_service(query: str) -> str:
    """
    Gọi API RAG để lấy câu trả lời.
    """
    try:
        response = requests.post(settings.RAG_SERVICE_URL, json={"question": query})
        response.raise_for_status()
        data = response.json()
        return data.get("answer", "No answer received.")
    except Exception as e:
        return f"Error communicating with RAG Service: {str(e)}"

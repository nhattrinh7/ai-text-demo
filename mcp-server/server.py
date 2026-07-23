import os
import requests
import uvicorn
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP
from middleware import APIKeyMiddleware

load_dotenv()

# Khởi tạo MCP Server
mcp = FastMCP("RAG_MCP_Server", host="0.0.0.0", port=3001)

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "http://my-rag:8000/query")

@mcp.tool()
def ask_knowledge_base(query: str) -> str:
    """
    Tìm kiếm câu trả lời từ kho tài liệu RAG bằng cách truyền câu hỏi vào.
    
    Args:
        query (str): Câu hỏi của người dùng.
    """
    try:
        # Gửi request sang RAG Service (my-rag project)
        response = requests.post(RAG_SERVICE_URL, json={"question": query})
        response.raise_for_status()
        data = response.json()
        return data.get("answer", "No answer received.")
    except Exception as e:
        return f"Error communicating with RAG Service: {str(e)}"

if __name__ == "__main__":
    app = mcp.streamable_http_app()
    app.add_middleware(APIKeyMiddleware)
    uvicorn.run(app, host="0.0.0.0", port=3001)

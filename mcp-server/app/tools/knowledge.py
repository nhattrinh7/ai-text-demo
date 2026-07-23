from mcp.server.fastmcp import FastMCP
from app.services.rag import ask_rag_service


def register_tools(mcp: FastMCP):
    @mcp.tool()
    def ask_knowledge_base(query: str) -> str:
        """
        Tìm kiếm câu trả lời từ kho tài liệu RAG bằng cách truyền câu hỏi vào.
        Args:
            query (str): Câu hỏi của người dùng.
        """
        return ask_rag_service(query)

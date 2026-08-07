from mcp.server.fastmcp import FastMCP
from app.services.rag import ask_rag_service


def register_tools(mcp: FastMCP):
    @mcp.tool()
    def ask_knowledge_base(query: str, instruction: str = "") -> str:
        """
        Tìm kiếm câu trả lời từ kho tài liệu RAG.
        Args:
            query (str): Câu hỏi thực tế của người dùng.
            instruction (str): Chỉ thị tùy chỉnh (tự động sinh ra bởi Agent)
                để hướng dẫn hệ thống tìm kiếm ưu tiên loại tài liệu nào.
                Ví dụ: "Chỉ ưu tiên báo cáo quý 3", "Tập trung vào tài liệu tiếng Việt".
                Nếu không có yêu cầu đặc biệt, hãy để trống.
        """
        return ask_rag_service(query, instruction)

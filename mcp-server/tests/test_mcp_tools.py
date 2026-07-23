from unittest.mock import MagicMock
from mcp.server.fastmcp import FastMCP

from app.tools.knowledge import register_tools

def test_register_tools_and_execution():
    mock_mcp = MagicMock(spec=FastMCP)
    
    # Tạo một decorator (hàm bọc) giả mạo chỉ trả về hàm gốc
    # để chúng ta có thể lôi hàm đó ra test trực tiếp
    registered_functions = {}
    def mock_tool():
        def decorator(func):
            registered_functions[func.__name__] = func
            return func
        return decorator
        
    mock_mcp.tool = mock_tool
    
    # Tiến hành đăng ký tool
    register_tools(mock_mcp)
    
    # Xác nhận tool đã bị "bẫy" vào lồng registered_functions
    assert "ask_knowledge_base" in registered_functions
    
    # Kiểm tra thực thi tool bằng cách gọi hàm trực tiếp.
    # Lệnh này sẽ gửi HTTP request THẬT tới http://localhost:8000/query
    tool_func = registered_functions["ask_knowledge_base"]
    
    result = tool_func("CDC là gì?")
    
    print("\n\n=== RESULT FROM MCP-SERVER ===")
    print(result)
    print("==============================\n")
    
    # Kiểm tra result có phải string không
    assert isinstance(result, str)
    # Kiểm tra result có độ dài > 0 không
    assert len(result) > 0

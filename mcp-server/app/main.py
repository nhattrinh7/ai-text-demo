import uvicorn
from mcp.server.fastmcp import FastMCP
from app.middleware.auth import APIKeyMiddleware
from app.tools.knowledge import register_tools

# Khởi tạo MCP Server
mcp = FastMCP("RAG_MCP_Server", host="0.0.0.0", port=3001)

# Đăng ký các tool
register_tools(mcp)

if __name__ == "__main__":
    app = mcp.streamable_http_app()
    app.add_middleware(APIKeyMiddleware)
    uvicorn.run(app, host="0.0.0.0", port=3001)

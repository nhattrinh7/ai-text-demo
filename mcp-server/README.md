# MCP Server

Dịch vụ này đóng vai trò là một Model Context Protocol (MCP) server. Nó cung cấp các công cụ (tools) cho AI Agent để Agent có thể giao tiếp một cách an toàn với các dịch vụ nội bộ (ví dụ như Knowledge Base).

## 🚀 Cài đặt & Chạy

### 1. Cài đặt Python và uv
Đảm bảo bạn đã cài đặt Python (>= 3.10) và công cụ `uv`.

### 2. Cài đặt dependencies
```bash
uv sync
```

### 3. Cấu hình biến môi trường
Mở hoặc tạo file `.env` và thiết lập:

**Các biến quan trọng:**
- `RAG_SERVICE_URL`: URL của dịch vụ RAG (mặc định `http://127.0.0.1:8000/query`).
- `MCP_API_KEY`: Chuỗi bí mật (Secret) để AI Agent xác thực khi kết nối với server này.

### 4. Khởi động dịch vụ
```bash
uv run python -m app.main
```
Server sẽ lắng nghe các kết nối theo chuẩn giao tiếp MCP SSE (Server-Sent Events) tại `http://localhost:3001/sse`.

## 🛠 Tools được cung cấp

Server này hiện tại đăng ký công cụ (tool) `ask_knowledge_base`:
- **Chức năng:** Gọi tiếp sang dịch vụ `my-rag` để tìm kiếm thông tin.
- **Bảo mật:** Yêu cầu header `Authorization: Bearer <MCP_API_KEY>` từ Client (Agent) mỗi khi kết nối.

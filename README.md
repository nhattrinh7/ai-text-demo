# AI Text Demo Monorepo

Dự án này là một hệ thống AI Agent đa dịch vụ (multi-service), bao gồm 3 thành phần chính hoạt động kết hợp với nhau.

## 🏗 Kiến trúc & Luồng hoạt động

Hệ thống được chia làm 3 services chính:

1. **`vercel-eve` (Next.js AI Agent):** 
   - Giao diện người dùng và não bộ trung tâm của hệ thống.
   - Quản lý các phiên trò chuyện, công cụ (tools) và đưa ra quyết định gọi các dịch vụ bên ngoài dựa trên ngữ cảnh người dùng.

2. **`mcp-server` (FastMCP Server):**
   - Đóng vai trò là cầu nối (middleware/bridge) sử dụng giao thức Model Context Protocol (MCP).
   - Đóng gói (expose) API từ `my-rag` thành các công cụ (tools) tiêu chuẩn để AI Agent (`vercel-eve`) có thể gọi được một cách an toàn.

3. **`my-rag` (FastAPI RAG Service):**
   - Đảm nhiệm việc truy xuất dữ liệu từ cơ sở tri thức cục bộ.
   - Nhận câu hỏi, tìm kiếm thông tin liên quan trong Vector Database và trả về kết quả qua API `/query`.

**Luồng dữ liệu (Data Workflow):**
Người dùng gửi câu hỏi -> `vercel-eve` phân tích và nhận định cần tìm tài liệu -> Agent gọi tool thông qua `mcp-server` -> `mcp-server` chuyển tiếp yêu cầu (HTTP POST) tới `my-rag` (endpoint `/query`) -> `my-rag` truy vấn VectorDB và trả kết quả về -> `mcp-server` format lại kết quả trả về cho `vercel-eve` -> AI tổng hợp câu trả lời cuối cùng và hiển thị cho người dùng.

## 🚀 Hướng dẫn chạy dự án

### Yêu cầu hệ thống
- **Node.js** (khuyên dùng >= 18)
- **Python** (>= 3.10)
- **uv** (Trình quản lý package Python siêu tốc)

### Khởi động đồng loạt (Local Development)
Vui lòng tham khảo file `README.md` bên trong từng thư mục để biết chi tiết cách thiết lập file `.env` trước khi chạy.

Bạn cần mở 3 terminal riêng biệt để khởi động toàn bộ hệ thống:

**Terminal 1: Chạy Backend RAG (`my-rag`)**
```bash
cd my-rag
# Sẽ chạy trên http://localhost:8000
uv run python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2: Chạy MCP Server (`mcp-server`)**
```bash
cd mcp-server
# Sẽ kết nối với localhost:8000 và expose tools qua MCP
uv run python -m app.main
```

**Terminal 3: Chạy Agent Giao Diện (`vercel-eve`)**
```bash
cd vercel-eve
npm install
npm run dev
# Giao diện chính sẽ chạy trên http://localhost:3000
```

Sau khi cả 3 service đã báo chạy thành công, truy cập `http://localhost:3000` trên trình duyệt để tương tác với Agent.

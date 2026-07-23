# Vercel Eve (AI Agent UI)

Đây là giao diện người dùng chính (Frontend) và bộ não (Agent) của toàn bộ hệ thống. Dự án được xây dựng bằng **Next.js** và tích hợp AI Agent Framework. Vercel Eve có nhiệm vụ giao tiếp với người dùng qua giao diện Web và Telegram, quản lý xác thực người dùng, và đưa ra quyết định gọi các dịch vụ bên ngoài (thông qua `mcp-server`) dựa trên ngữ cảnh câu hỏi.

## 🚀 Cài đặt & Chạy

### 1. Yêu cầu hệ thống
- **Node.js** (Khuyên dùng >= 18)
- **npm** (Hoặc yarn/pnpm)

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc của `vercel-eve` (nếu chưa có) và điền các biến cấu hình cần thiết:

**Các nhóm biến quan trọng:**
- **AI & MCP:**
  - `OPENAI_API_KEY`: Khóa API của OpenAI (Bắt buộc để Agent suy luận).
  - `MCP_SERVER_URL`: Địa chỉ của MCP Server (Thường là `http://127.0.0.1:3001/mcp`).
  - `MCP_API_KEY`: Mã bí mật để Agent xác thực với MCP Server (Phải khớp với cấu hình bên `mcp-server`).
- **Database & Auth:**
  - `DATABASE_URL`: Chuỗi kết nối tới cơ sở dữ liệu PostgreSQL (ví dụ NeonDB) dùng cho Prisma.
  - `AUTH_SECRET`: Khóa bí mật dùng cho phiên đăng nhập an toàn.
  - `RESEND_API_KEY`: Khóa API của dịch vụ Resend dùng để gửi email mã xác thực OTP.
- **Telegram (Tùy chọn nếu dùng bot):**
  - `TELEGRAM_BOT_TOKEN`: Token của Telegram Bot lấy từ BotFather.
  - `TELEGRAM_WEBHOOK_SECRET_TOKEN`: Mã bí mật bảo vệ Webhook giao tiếp với Telegram.

### 4. Đồng bộ Cơ sở dữ liệu (Prisma)
Đảm bảo bạn đã đồng bộ hóa schema với database trước khi chạy (chỉ cần chạy lần đầu hoặc khi có thay đổi DB):
```bash
npx prisma generate
npx prisma db push
```

### 5. Khởi động dịch vụ
```bash
npm run dev
```

Giao diện web sẽ khởi chạy tại `http://localhost:3000`. Bạn có thể mở trình duyệt, đăng ký tài khoản (xác thực qua Email OTP) và bắt đầu trò chuyện với Agent.

## 🛠 Cấu trúc thư mục chính
- `/app`: Chứa các route và UI components của Next.js (Đăng nhập, Đăng ký, Xác thực, Chat UI).
- `/agent`: Mã nguồn định nghĩa logic của AI Agent, thiết lập hệ thống hướng dẫn (instructions), kết nối kênh (Telegram, Web) và khai báo các công cụ (Tools).
- `/prisma`: Nơi chứa file `schema.prisma` định nghĩa cơ sở dữ liệu người dùng.

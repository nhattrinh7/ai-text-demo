# My RAG Service

Dịch vụ này cung cấp một API RESTful để truy xuất thông tin từ Cơ sở tri thức (Knowledge Base) thông qua phương pháp Retrieval-Augmented Generation (RAG).

## 🚀 Cài đặt & Chạy

### 1. Cài đặt Python và uv
Đảm bảo bạn đã cài đặt Python (>= 3.10) và công cụ quản lý package `uv`.

### 2. Cài đặt dependencies
```bash
uv sync
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:
```bash
cp .env.example .env
```

**Các biến quan trọng:**
- `OPENAI_API_KEY`: Bắt buộc. Khóa API OpenAI của bạn.
- `VECTORSTORE_PATH`: Đường dẫn tới thư mục lưu trữ Vector Database (mặc định `./vectorstore`).

### 4. Khởi động dịch vụ
```bash
uv run python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API sẽ chạy tại `http://localhost:8000`. Bạn có thể xem tài liệu API (Swagger UI) tại `http://localhost:8000/docs`.

## 📡 Endpoints

### `POST /query`
Truy vấn cơ sở tri thức bằng một câu hỏi.

**Request:**
```json
{
  "question": "Nội dung câu hỏi của bạn"
}
```

**Response:**
```json
{
  "answer": "Câu trả lời được tổng hợp từ AI..."
}
```

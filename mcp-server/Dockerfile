FROM python:3.13-slim

WORKDIR /app

# Cài đặt uv
RUN pip install uv

# Copy file cấu hình uv
COPY pyproject.toml uv.lock ./

# Cài đặt thư viện
RUN uv sync --frozen --no-cache

# Copy mã nguồn
COPY . .

# Mở cổng 3001
EXPOSE 3001

# Chạy server
CMD ["uv", "run", "python", "server.py"]

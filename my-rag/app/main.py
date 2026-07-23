from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import settings
from app.exceptions import (
    ServiceNotReadyError,
    global_exception_handler,
    service_not_ready_handler,
)
from app.routes import query as query_route
from app.services.rag import RAGService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Quản lý vòng đời ứng dụng: load vectorstore khi bật, dọn dẹp khi tắt."""
    rag = RAGService(settings)
    rag.load_existing()

    # Tiêm (inject) RAG service đã sẵn sàng vào module route
    query_route.rag_service = rag

    yield  # Ứng dụng đang chạy

    # Tắt ứng dụng
    query_route.rag_service = None


app = FastAPI(
    title="API Dịch vụ RAG",
    description="API cơ sở tri thức RAG chuẩn production.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- Xử lý ngoại lệ (ẩn lỗi nội bộ) ---
app.add_exception_handler(ServiceNotReadyError, service_not_ready_handler)  # type: ignore
app.add_exception_handler(Exception, global_exception_handler)

# --- Khai báo Routes ---
app.include_router(query_route.router)

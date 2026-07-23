import logging

from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

# Dưới đây định nghĩa các lỗi Custom


# Lỗi gốc
class RAGServiceError(Exception):
    """Lỗi cơ bản từ dịch vụ RAG — KHÔNG để lộ chi tiết cho client."""

    pass


class ServiceNotReadyError(RAGServiceError):
    """Báo lỗi khi dịch vụ RAG chưa khởi tạo xong."""

    pass


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Xử lý mọi ngoại lệ không mong muốn (catch-all).

    - Trả về thông báo chung chung cho client (không lộ chi tiết bên trong).
    """
    logger.exception("Lỗi không mong muốn trên %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Lỗi máy chủ nội bộ. Vui lòng thử lại sau."},
    )


async def service_not_ready_handler(
    request: Request, exc: ServiceNotReadyError
) -> JSONResponse:
    """Trả về mã lỗi 503 (Service Unavailable) khi index RAG chưa tải xong."""
    logger.warning("Dịch vụ chưa sẵn sàng: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "Dịch vụ đang khởi động. Vui lòng thử lại trong giây lát."},
    )

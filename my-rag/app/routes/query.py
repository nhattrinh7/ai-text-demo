from fastapi import APIRouter

from app.schemas.query import ErrorResponse, QueryRequest, QueryResponse
from app.services.rag import RAGService
from app.exceptions import ServiceNotReadyError

router = APIRouter()

# Ban đầu cứ đặt là None vì việc nạp các file pdf và khởi tạo VectorDB sẽ
# tốn chút thời gian. Nếu khởi tạo ngay ở đây thì ứng dụng sẽ treo do phải chờ
# => làm thế này để rag_service
# Sẽ được khởi tạo bởi app.main trong quá trình lifespan startup.
rag_service: RAGService | None = None


@router.post(
    "/query",
    response_model=QueryResponse,
    # khai báo này ko ảnh hưởng logic, chỉ để sinh SwaggerUI, báo rằng
    # nếu lỗi 500 hoặc 503 thì trả về JSON theo cấu trúc của ErrorResponse
    responses={
        500: {"model": ErrorResponse, "description": "Lỗi máy chủ nội bộ"},
        503: {"model": ErrorResponse, "description": "Dịch vụ chưa sẵn sàng"},
    },
)
async def query(request: QueryRequest):
    """Truy vấn cơ sở tri thức RAG bằng một câu hỏi."""
    if rag_service is None:
        raise ServiceNotReadyError("RAG service is not initialized")
    answer = rag_service.query(request.question, instruction=request.instruction)
    return QueryResponse(answer=answer)

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Mô hình dữ liệu đầu vào cho endpoint /query."""

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Câu hỏi gửi tới cơ sở tri thức RAG.",
    )
    instruction: str | None = Field(
        default=None,
        max_length=1000,
        description="Chỉ thị (instruction) cho bộ Reranker để điều hướng kết quả tìm kiếm.",
    )


class QueryResponse(BaseModel):
    """Mô hình phản hồi thành công từ endpoint /query."""

    answer: str


class ErrorResponse(BaseModel):
    """Mô hình phản hồi lỗi chung cho client."""

    detail: str

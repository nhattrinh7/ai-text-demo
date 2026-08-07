from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_voyageai import VoyageAIRerank
from pydantic import SecretStr

from app.config import Settings
from app.exceptions import ServiceNotReadyError

_SYSTEM_TEMPLATE = (
    "You are a strict, citation-focused assistant for a private knowledge base.\n"
    "RULES:\n"
    "1) Use ONLY the provided context to answer.\n"
    "2) If the answer is not clearly contained in the context, say: "
    '"I don\'t know based on the provided documents."\n'
    "3) Do NOT use outside knowledge, guessing, or web information.\n"
    "4) Always cite sources as (source:page) using the metadata.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)


def _format_docs(docs) -> str:
    """Định dạng tài liệu kèm metadata nguồn cho LLM prompt."""
    return "\n\n".join(
        f"[nguồn: {doc.metadata.get('source', 'unknown')}, "
        f"trang: {doc.metadata.get('page', '?')}]\n{doc.page_content}"
        for doc in docs
    )


class RAGService:
    """
    Đóng gói toàn bộ luồng RAG: embeddings, vectorstore, retriever, và chuỗi LLM.

    Hai chế độ hoạt động:
    - load_existing(): Tải vectorstore đã lưu từ ổ đĩa (chạy production).
    - build_from_documents(): Đọc PDF, cắt đoạn, nhúng, lưu lại, rồi tạo chuỗi
      (dùng cho script index offline).
    """

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._embeddings = OpenAIEmbeddings(model=settings.embedding_model)
        self._vectorstore = None
        self._llm = None
        self._prompt = None
        self._reranker = VoyageAIRerank(
            model="rerank-2.5-lite",
            voyage_api_key=SecretStr(settings.voyage_api_key),
            top_k=settings.retriever_k,
        )

    # Initialization
    def load_existing(self) -> None:
        """Tải FAISS vectorstore đã lưu từ ổ đĩa."""
        vectorstore = FAISS.load_local(
            self._settings.vectorstore_path,
            self._embeddings,
            allow_dangerous_deserialization=True,
        )
        self._setup_components(vectorstore)

    def build_from_documents(self) -> None:
        """
        Toàn bộ luồng index: đọc PDF → semantic chunk → nhúng (embed) → lưu (persist).

        Việc này tốn kém (gọi API + tính toán) và chỉ nên chạy qua
        CLI ``scripts/index_documents.py``, KHÔNG chạy mỗi khi khởi động app.
        """
        # 1. Đọc PDFs
        loader = PyPDFDirectoryLoader(
            path=self._settings.papers_path,
            glob="**/*.pdf",
        )
        docs = loader.load()

        if not docs:
            raise RuntimeError(
                f"Không tìm thấy tài liệu PDF nào trong {self._settings.papers_path}"
            )

        # 2. Cắt đoạn theo ngữ nghĩa (Semantic chunking)
        text_splitter = SemanticChunker(
            embeddings=OpenAIEmbeddings(),
            breakpoint_threshold_amount=self._settings.breakpoint_threshold,
        )
        splits = text_splitter.split_documents(docs)

        # 3. Nhúng & tạo vectorstore
        vectorstore = FAISS.from_documents(
            documents=splits,
            embedding=self._embeddings,
            distance_strategy=DistanceStrategy.COSINE,
        )

        # 4. Lưu ra đĩa
        vectorstore.save_local(self._settings.vectorstore_path)

        # 5. Khởi tạo các thành phần để dịch vụ sẵn sàng dùng ngay
        self._setup_components(vectorstore)

    # Query
    def query(self, question: str, instruction: str | None = None) -> str:
        """Đưa câu hỏi qua luồng RAG nâng cao (Advanced RAG) và trả về câu trả lời."""
        if self._vectorstore is None or self._llm is None or self._prompt is None:
            raise ServiceNotReadyError("Dịch vụ RAG chưa được khởi tạo.")
            
        # 1. Tìm kiếm thô (lấy nhiều hơn mức bình thường để Reranker có đủ dữ liệu lọc)
        # Sử dụng base retriever của FAISS
        raw_docs = self._vectorstore.similarity_search(
            question, k=self._settings.retriever_fetch_k
        )
        
        # 2. Tạo câu hỏi tăng cường (nếu có chỉ thị)
        if instruction and instruction.strip():
            augmented_query = f"{instruction.strip()}\nQuery: {question}"
        else:
            augmented_query = question
            
        # 3. Lọc tinh bằng Voyage AI Reranker
        # Nén/lọc 20 tài liệu xuống còn top_k (ví dụ: 5)
        reranked_docs = self._reranker.compress_documents(
            documents=raw_docs, 
            query=augmented_query
        )
        
        # 4. Định dạng tài liệu và gọi LLM
        context_str = _format_docs(reranked_docs)
        prompt_val = self._prompt.invoke({"context": context_str, "question": question})
        
        # 5. Lấy kết quả text (tương tự StrOutputParser)
        response = self._llm.invoke(prompt_val)
        # response.content có type `str | list[...]`; ở đây luôn là str
        # vì chúng ta không dùng tool calling hay structured output.
        return str(response.content)

    # Internal
    def _setup_components(self, vectorstore: FAISS) -> None:
        """Lưu trữ các thành phần cần thiết cho luồng truy vấn."""
        self._vectorstore = vectorstore
        self._prompt = ChatPromptTemplate.from_template(_SYSTEM_TEMPLATE)
        self._llm = ChatOpenAI(
            model=self._settings.llm_model,
            temperature=self._settings.llm_temperature,
        )


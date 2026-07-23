from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

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
        self._rag_chain = None
        self._embeddings = OpenAIEmbeddings(model=settings.embedding_model)


    # Initialization
    def load_existing(self) -> None:
        """Tải FAISS vectorstore đã lưu từ ổ đĩa."""
        vectorstore = FAISS.load_local(
            self._settings.vectorstore_path,
            self._embeddings,
            allow_dangerous_deserialization=True,
        )
        self._build_chain(vectorstore)

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

        # 5. Khởi tạo chuỗi để dịch vụ sẵn sàng dùng ngay
        self._build_chain(vectorstore)


    # Query
    def query(self, question: str) -> str:
        """Đưa câu hỏi qua chuỗi RAG và trả về chuỗi câu trả lời."""
        if self._rag_chain is None:
            raise ServiceNotReadyError("Dịch vụ RAG chưa được khởi tạo.")
        return self._rag_chain.invoke(question)


    # Internal
    def _build_chain(self, vectorstore: FAISS) -> None:
        """Kết nối bộ truy xuất (retriever) → prompt → LLM → output parser."""
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": self._settings.retriever_k},
        )

        prompt = ChatPromptTemplate.from_template(_SYSTEM_TEMPLATE)

        llm = ChatOpenAI(
            model=self._settings.llm_model,
            temperature=self._settings.llm_temperature,
        )

        self._rag_chain = (
            {"context": retriever | _format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

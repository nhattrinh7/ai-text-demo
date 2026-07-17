from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.document_loaders import DirectoryLoader, UnstructuredFileLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_experimental.text_splitter import SemanticChunker
from dotenv import load_dotenv

load_dotenv()

# loader = PyPDFDirectoryLoader(
#     path='./papers',
#     glob='**/*.pdf',
# )

loader = DirectoryLoader(
    path="./papers",
    glob="**/*.pdf",
    loader_cls=UnstructuredFileLoader,
    show_progress=True,
    use_multithreading=True,
)

docs = loader.load()
print(f'Loaded {len(docs)} pages from papers/')

MARKDOWN_SEPARATORS = [
    "\n#{1,6} ",
    "```\n",
    "\n\\*\\*.*\\*\\*\n",
    "\n---+\n",
    "\n___+\n",
    "\n\n",
    "\n",
    " ",
    "",
]

# text_splitter = RecursiveCharacterTextSplitter(
#     chunk_size=1200, # chia thành mỗi chunk ko quá 1200 kí tự (k phải từ hay token đâu)
#     chunk_overlap=200, # overlap 200 kí tự (đoạn chồng lấn giữa 2 chunk liên tiếp nhau, xử lí trg hợp ý nào đó quan trọng nhưng nửa đầu ở chunk này, nửa cuối ở chunk kia)
#     add_start_index=True, # lưu lại vị trí bắt đầu của mỗi chunk trong tài liệu gốc
#     strip_whitespace=True, # loại bỏ khoảng trắng thừa ở đầu và cuối mỗi chunk
#     separators=MARKDOWN_SEPARATORS # giúp splitter biết có thể dùng những kí tự nào để phân đoạn
# )
text_splitter = SemanticChunker(
    embeddings=OpenAIEmbeddings(),
    breakpoint_threshold_amount=0.85
)

# BẮT ĐẦU CHUNKING
# Tạo biến lưu trữ kết quả
splits = text_splitter.split_documents(docs)

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
)

# Thực hiện embedding và lưu vào vectorstore
vectorstore = FAISS.from_documents(
    documents=splits, # dữ liệu đầu vào để embedding
    embedding=embeddings, # model để thực hiện embedding
    distance_strategy=DistanceStrategy.COSINE # so sánh sự tương đồng của vector dùng để search với các vector trong store bằng Cosine Similarity
)

# retriever nhận vào câu hỏi của người dùng rồi tìm các vector tài liệu liên quan trong vectorstore
# sau đó tổng hợp câu hỏi và vector tài liệu liên quan vào LLM để tạo câu trả lời
retriever = vectorstore.as_retriever(
    search_type='similarity', # lấy top-k kết quả tương đồng nhất
    search_kwargs={
        'k': 5, # số lượng vector tối đa được trả về từ vectorstore
    }
)

template = (
    "You are a strict, citation-focused assistant for a private knowledge base.\n"
    "RULES:\n"
    "1) Use ONLY the provided context to answer.\n"
    "2) If the answer is not clearly contained in the context, say: "
    "\"I don't know based on the provided documents.\"\n"
    "3) Do NOT use outside knowledge, guessing, or web information.\n"
    "4) Allways cite sources as (source:page) using the metadata.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

prompt = ChatPromptTemplate.from_template(template)

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.0, # tùy chỉnh mức độ ngẫu nhiên trong câu trl, tem càng cao thì trl càng sáng tạo
)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def query_knowledge_base(question: str) -> str:
    """Queries the RAG system with the given question and returns the answer."""
    return rag_chain.invoke(question)
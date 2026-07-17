from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-large",
)

vector = embeddings.embed_query("Xin chào")
print(vector)
print(len(vector))
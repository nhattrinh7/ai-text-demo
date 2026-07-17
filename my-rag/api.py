from fastapi import FastAPI
from pydantic import BaseModel
from main import query_knowledge_base

app = FastAPI(title="RAG Service API")

class QueryRequest(BaseModel):
    question: str

@app.post("/query")
def query(request: QueryRequest):
    try:
        answer = query_knowledge_base(request.question)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

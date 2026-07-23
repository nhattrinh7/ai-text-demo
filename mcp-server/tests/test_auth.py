from starlette.applications import Starlette
from starlette.routing import Route
from starlette.responses import JSONResponse
from starlette.testclient import TestClient
from app.middleware.auth import APIKeyMiddleware
from app.config import settings

async def mock_endpoint(request):
    return JSONResponse({"message": "Success"})

# Tạo một ứng dụng Starlette giả để test middleware
app = Starlette(routes=[
    Route("/test", mock_endpoint)
])
app.add_middleware(APIKeyMiddleware)

client = TestClient(app)

def test_auth_missing_header():
    """Test trường hợp request không có header Authorization"""
    response = client.get("/test")
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}

def test_auth_invalid_header():
    """Test trường hợp request có header Authorization nhưng token sai"""
    response = client.get("/test", headers={"Authorization": "Bearer invalid_token_123"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized"}

def test_auth_valid_header():
    """Test trường hợp request có header Authorization chứa token hợp lệ"""
    valid_key = settings.MCP_API_KEY
    if not valid_key:
        valid_key = "mock_test_key"
        settings.MCP_API_KEY = valid_key
        
    response = client.get("/test", headers={"Authorization": f"Bearer {valid_key}"})
    assert response.status_code == 200
    assert response.json() == {"message": "Success"}

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import settings


class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        api_key = settings.MCP_API_KEY

        auth_header = request.headers.get("Authorization")
        if not auth_header or auth_header != f"Bearer {api_key}":
            return JSONResponse({"detail": "Unauthorized"}, status_code=401)

        return await call_next(request)

import time
from collections import defaultdict
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.common.request_utils import get_client_ip


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = None, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests or settings.RATE_LIMIT_PER_MINUTE
        self.window_seconds = window_seconds
        self.request_history = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Exclude docs and health check endpoints
        path = request.url.path
        if path.startswith("/docs") or path.startswith("/openapi.json") or path == "/health":
            return await call_next(request)

        client_ip = get_client_ip(request)
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old timestamps
        timestamps = [ts for ts in self.request_history[client_ip] if ts > window_start]
        self.request_history[client_ip] = timestamps

        if len(timestamps) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Rate limit exceeded. Too many requests, please try again later."
                },
                headers={"Retry-After": str(self.window_seconds)}
            )

        self.request_history[client_ip].append(now)
        return await call_next(request)

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from backend.utils.logging import logger
import traceback

class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    """
    Catches all unhandled exceptions, logs them with full traceback, and returns a JSON payload.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Capture error signature and backtrace
            err_msg = str(e)
            trace = traceback.format_exc()
            logger.error(f"Global exception caught on {request.method} {request.url.path}: {err_msg}\n{trace}")
            
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error occurred.",
                    "error_message": err_msg,
                    "path": request.url.path
                }
            )

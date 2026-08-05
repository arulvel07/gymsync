"""JWT authentication dependency for FastAPI routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import get_settings
from app.database import get_supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate the Supabase JWT and return the user payload.

    Returns a dict with at minimum: {"sub": "<user-uuid>", "email": "..."}
    """
    settings = get_settings()
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user ID",
        )

    return {"id": user_id, "email": payload.get("email", "")}


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """Ensure the authenticated user has the 'admin' role."""
    db = get_supabase()
    result = (
        db.table("profiles")
        .select("role")
        .eq("id", user["id"])
        .single()
        .execute()
    )
    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    user["role"] = "admin"
    return user

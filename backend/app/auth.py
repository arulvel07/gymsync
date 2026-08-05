"""JWT authentication dependency for FastAPI routes."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate the Supabase JWT by querying Supabase Auth API directly.

    Returns a dict with at minimum: {"id": "<user-uuid>", "email": "..."}
    """
    token = credentials.credentials
    db = get_supabase()

    try:
        res = db.auth.get_user(token)
        if not res or not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return {"id": res.user.id, "email": res.user.email or ""}
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


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

import secrets
import io
import base64
import urllib.parse
from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime, timedelta, timezone
from app.auth import require_admin
from app.database import get_supabase
from app.models import UpdateConfigRequest, SessionResponse, QRTokenResponse

try:
    import qrcode
    from qrcode.image.svg import SvgImage
    HAS_QRCODE_LIB = True
except ImportError:
    HAS_QRCODE_LIB = False

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Global in-memory fallback cache
_CURRENT_QR_TOKEN: dict | None = None


def generate_python_qr_image(text: str) -> str:
    """Generate high-res SVG QR code image directly in Python."""
    if HAS_QRCODE_LIB:
        try:
            factory = SvgImage
            img = qrcode.make(text, image_factory=factory)
            stream = io.BytesIO()
            img.save(stream)
            svg_bytes = stream.getvalue()
            encoded = base64.b64encode(svg_bytes).decode('utf-8')
            return f"data:image/svg+xml;base64,{encoded}"
        except Exception as e:
            print(f"Python qrcode render note: {e}")

    return f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data={urllib.parse.quote(text)}"


def get_or_create_qr_token(force_new: bool = False) -> dict:
    """Get active 7-minute QR token from Supabase or generate a new token."""
    global _CURRENT_QR_TOKEN
    now = datetime.now(timezone.utc)
    db = get_supabase()

    # 1. Try querying latest token from Supabase qr_tokens table
    if not force_new:
        try:
            res = db.table("qr_tokens").select("*").order("created_at", desc=True).limit(1).execute()
            if res.data:
                latest = res.data[0]
                expires = datetime.fromisoformat(latest["expires_at"].replace("Z", "+00:00"))
                remaining = int((expires - now).total_seconds())

                if remaining > 10:
                    scan_url = f"http://localhost:5500/check-in.html?token={latest['token']}"
                    qr_img = generate_python_qr_image(scan_url)

                    token_info = {
                        "token": latest["token"],
                        "created_at": latest["created_at"],
                        "expires_at": latest["expires_at"],
                        "valid_seconds": remaining,
                        "qr_image": qr_img,
                    }
                    _CURRENT_QR_TOKEN = token_info
                    return token_info
        except Exception as e:
            print(f"Supabase qr_tokens select note: {e}")

    # Fallback to in-memory check if table not created yet
    if not force_new and _CURRENT_QR_TOKEN:
        try:
            expires = datetime.fromisoformat(_CURRENT_QR_TOKEN["expires_at"].replace("Z", "+00:00"))
            remaining = int((expires - now).total_seconds())
            if remaining > 10:
                _CURRENT_QR_TOKEN["valid_seconds"] = remaining
                return _CURRENT_QR_TOKEN
        except Exception:
            pass

    # Generate new secure 12-char hex token
    token = secrets.token_hex(6)
    created_at = now.isoformat()
    expires_at = (now + timedelta(minutes=7)).isoformat()
    scan_url = f"http://localhost:5500/check-in.html?token={token}"
    qr_img = generate_python_qr_image(scan_url)

    token_data = {
        "token": token,
        "created_at": created_at,
        "expires_at": expires_at,
        "valid_seconds": 420,
        "qr_image": qr_img,
    }

    _CURRENT_QR_TOKEN = token_data

    # Save/Update single token row in Supabase table
    try:
        db.table("qr_tokens").upsert({
            "id": "00000000-0000-0000-0000-000000000001",
            "token": token,
            "created_at": created_at,
            "expires_at": expires_at,
        }).execute()
    except Exception as e:
        print(f"Supabase qr_tokens upsert note: {e}")

    return token_data


@router.get("/qr-token", response_model=QRTokenResponse)
async def get_admin_qr_token(_admin: dict = Depends(require_admin)):
    """Get active dynamic 7-minute QR check-in token (Admin only)."""
    return get_or_create_qr_token(force_new=False)


@router.post("/qr-token/rotate", response_model=QRTokenResponse)
async def rotate_admin_qr_token(_admin: dict = Depends(require_admin)):
    """Rotate and generate a new QR token immediately (Admin only)."""
    return get_or_create_qr_token(force_new=True)


@router.get("/users")
async def get_all_users(
    _admin: dict = Depends(require_admin),
    search: str = Query(default="", description="Search by name or roll number"),
):
    """Get all registered users (admin only)."""
    db = get_supabase()
    query = db.table("profiles").select("*").order("created_at", desc=True)

    if search:
        query = query.or_(
            f"full_name.ilike.%{search}%,roll_number.ilike.%{search}%"
        )

    result = query.execute()
    return result.data or []


@router.get("/all-sessions")
async def get_all_sessions(
    _admin: dict = Depends(require_admin),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    date_from: str = Query(default="", description="Start date YYYY-MM-DD"),
    date_to: str = Query(default="", description="End date YYYY-MM-DD"),
    search: str = Query(default="", description="Search by name or roll number"),
):
    """Get all gym sessions with filtering (admin only)."""
    db = get_supabase()

    query = (
        db.table("gym_sessions")
        .select("*, profiles(full_name, roll_number)")
        .order("check_in", desc=True)
        .range(offset, offset + limit - 1)
    )

    if date_from:
        query = query.gte("check_in", f"{date_from}T00:00:00Z")
    if date_to:
        query = query.lte("check_in", f"{date_to}T23:59:59Z")

    result = query.execute()

    sessions = []
    for s in (result.data or []):
        profile = s.get("profiles") or {}
        # Filter by search if provided
        if search:
            name = (profile.get("full_name") or "").lower()
            roll = (profile.get("roll_number") or "").lower()
            if search.lower() not in name and search.lower() not in roll:
                continue

        sessions.append({
            "id": s["id"],
            "user_id": s["user_id"],
            "check_in": s["check_in"],
            "check_out": s.get("check_out"),
            "workout_type": s["workout_type"],
            "duration_minutes": s.get("duration_minutes"),
            "full_name": profile.get("full_name", "—"),
            "roll_number": profile.get("roll_number", "—"),
        })

    return sessions


@router.get("/config")
async def get_config(_admin: dict = Depends(require_admin)):
    """Get current gym configuration (admin only)."""
    db = get_supabase()
    result = db.table("gym_config").select("*").eq("id", 1).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Config not found")
    return result.data


@router.put("/config")
async def update_config(
    body: UpdateConfigRequest,
    _admin: dict = Depends(require_admin),
):
    """Update gym configuration (admin only)."""
    db = get_supabase()
    updates = {}
    if body.max_capacity is not None:
        if body.max_capacity < 1:
            raise HTTPException(400, "Capacity must be at least 1")
        updates["max_capacity"] = body.max_capacity
    if body.open_time is not None:
        updates["open_time"] = body.open_time
    if body.close_time is not None:
        updates["close_time"] = body.close_time
    if body.is_open is not None:
        updates["is_open"] = body.is_open

    if not updates:
        raise HTTPException(400, "No updates provided")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = db.table("gym_config").update(updates).eq("id", 1).execute()
    return result.data[0] if result.data else updates


@router.get("/reports/monthly")
async def get_monthly_report(
    _admin: dict = Depends(require_admin),
    year: int = Query(default=0),
    month: int = Query(default=0),
):
    """Get a monthly attendance report (admin only)."""
    db = get_supabase()
    now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    if year == 0:
        year = now.year
    if month == 0:
        month = now.month

    start = datetime(year, month, 1, tzinfo=timezone.utc) - timedelta(hours=5, minutes=30)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc) - timedelta(hours=5, minutes=30)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc) - timedelta(hours=5, minutes=30)

    result = (
        db.table("gym_sessions")
        .select("check_in, duration_minutes, workout_type, user_id")
        .gte("check_in", start.isoformat())
        .lt("check_in", end.isoformat())
        .execute()
    )

    sessions = result.data or []
    total_visits = len(sessions)
    unique_users = len(set(s["user_id"] for s in sessions))
    durations = [s["duration_minutes"] for s in sessions if s.get("duration_minutes")]
    avg_duration = round(sum(durations) / len(durations), 1) if durations else 0

    # Daily breakdown
    daily: dict[str, int] = {}
    for s in sessions:
        dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
        ist = dt + timedelta(hours=5, minutes=30)
        day_str = ist.strftime("%Y-%m-%d")
        daily[day_str] = daily.get(day_str, 0) + 1

    # Workout breakdown
    workouts: dict[str, int] = {}
    for s in sessions:
        wt = s["workout_type"]
        workouts[wt] = workouts.get(wt, 0) + 1

    return {
        "year": year,
        "month": month,
        "total_visits": total_visits,
        "unique_users": unique_users,
        "avg_duration_minutes": avg_duration,
        "daily_breakdown": [
            {"date": k, "count": v}
            for k, v in sorted(daily.items())
        ],
        "workout_breakdown": [
            {"workout_type": k, "count": v}
            for k, v in sorted(workouts.items(), key=lambda x: -x[1])
        ],
    }

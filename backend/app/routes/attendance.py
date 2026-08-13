"""Attendance routes: check-in, check-out, occupancy, session history."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, timezone
from app.auth import get_current_user
from app.database import get_supabase
from app.models import (
    CheckInRequest,
    CheckOutRequest,
    SessionResponse,
    OccupancyResponse,
)

from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api", tags=["attendance"])

VALID_WORKOUT_TYPES = [
    "Push", "Pull", "Legs", "Upper Body",
    "Lower Body", "Cardio", "Full Body", "Core",
]


# Max session duration before auto-checkout (set to 120 minutes / 2 hours)
MAX_SESSION_MINUTES = 120


def auto_checkout_expired_sessions(db):
    """Automatically check out sessions that exceed the max session duration."""
    try:
        now_utc = datetime.now(timezone.utc)
        active = db.table("gym_sessions").select("*").is_("check_out", "null").execute()
        if active.data:
            for s in active.data:
                check_in_dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
                elapsed_minutes = int((now_utc - check_in_dt).total_seconds() / 60)
                if elapsed_minutes >= MAX_SESSION_MINUTES:
                    checkout_dt = check_in_dt + timedelta(minutes=MAX_SESSION_MINUTES)
                    db.table("gym_sessions").update({
                        "check_out": checkout_dt.isoformat(),
                        "duration_minutes": MAX_SESSION_MINUTES,
                    }).eq("id", s["id"]).execute()
                    print(f"Auto checked out session {s['id']} after reaching max limit ({MAX_SESSION_MINUTES} min).")
    except Exception as e:
        print(f"Auto checkout expired sessions note: {e}")


def auto_checkout_all_active_sessions(db):
    """Automatically check out all active gym sessions when gym is closed."""
    try:
        now_iso = datetime.now(timezone.utc).isoformat()
        active = db.table("gym_sessions").select("*").is_("check_out", "null").execute()
        if active.data:
            for s in active.data:
                check_in_dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
                dur = max(1, int((datetime.now(timezone.utc) - check_in_dt).total_seconds() / 60))
                db.table("gym_sessions").update({
                    "check_out": now_iso,
                    "duration_minutes": dur,
                }).eq("id", s["id"]).execute()
            print(f"Auto checked out {len(active.data)} active sessions at closing time.")
    except Exception as e:
        print(f"Auto checkout error note: {e}")


def check_facility_open_status(db) -> tuple[bool, str]:
    """Check if gym is open based on manual toggle AND operational hours (IST)."""
    now_utc = datetime.now(timezone.utc)
    ist_time = now_utc + timedelta(hours=5, minutes=30)
    current_time_str = ist_time.strftime("%H:%M")

    try:
        res = db.table("gym_config").select("*").eq("id", 1).single().execute()
        if not res.data:
            return True, "Open"

        cfg = res.data
        is_open_toggle = cfg.get("is_open", True)
        open_time = cfg.get("open_time", "05:00")
        close_time = cfg.get("close_time", "09:00")
        open_time_2 = cfg.get("open_time_2", "17:00")
        close_time_2 = cfg.get("close_time_2", "22:00")

        # Strip seconds if database returns HH:MM:SS format
        if open_time and len(open_time) > 5: open_time = open_time[:5]
        if close_time and len(close_time) > 5: close_time = close_time[:5]
        if open_time_2 and len(open_time_2) > 5: open_time_2 = open_time_2[:5]
        if close_time_2 and len(close_time_2) > 5: close_time_2 = close_time_2[:5]

        # 1. Manual toggle is OFF
        if not is_open_toggle:
            auto_checkout_all_active_sessions(db)
            return False, "Gym is currently closed by administration."

        # 2. Operational hours comparison in IST (Shift 1)
        if open_time <= close_time:
            within_shift_1 = (open_time <= current_time_str <= close_time)
        else:
            within_shift_1 = (current_time_str >= open_time or current_time_str <= close_time)

        # 3. Operational hours comparison in IST (Shift 2)
        if open_time_2 <= close_time_2:
            within_shift_2 = (open_time_2 <= current_time_str <= close_time_2)
        else:
            within_shift_2 = (current_time_str >= open_time_2 or current_time_str <= close_time_2)

        within_hours = within_shift_1 or within_shift_2

        if not within_hours:
            auto_checkout_all_active_sessions(db)
            return False, f"Gym is currently closed. Operating hours: {open_time}-{close_time} and {open_time_2}-{close_time_2}."

        return True, "Open"
    except Exception as e:
        print(f"Facility open status check note: {e}")
        return True, "Open"


@router.get("/occupancy", response_model=OccupancyResponse)
async def get_occupancy():
    """Get current gym occupancy — PUBLIC endpoint (no auth required)."""
    db = get_supabase()

    auto_checkout_expired_sessions(db)
    is_open, _ = check_facility_open_status(db)

    # Current active sessions
    active = (
        db.table("gym_sessions")
        .select("workout_type")
        .is_("check_out", "null")
        .execute()
    )
    current_count = len(active.data) if active.data else 0

    # Workout distribution
    distribution: dict[str, int] = {}
    if active.data:
        for session in active.data:
            wt = session["workout_type"]
            distribution[wt] = distribution.get(wt, 0) + 1

    workout_dist = [
        {"workout_type": k, "count": v}
        for k, v in sorted(distribution.items(), key=lambda x: -x[1])
    ]

    # Gym config
    config = db.table("gym_config").select("*").eq("id", 1).single().execute()
    max_cap = config.data["max_capacity"] if config.data else 50

    percentage = round((current_count / max_cap) * 100, 1) if max_cap > 0 else 0

    return OccupancyResponse(
        current_count=current_count,
        max_capacity=max_cap,
        percentage=percentage,
        is_open=is_open,
        workout_distribution=workout_dist,
    )


def ensure_user_profile(db, user: dict):
    """Ensure user exists in public.profiles table to prevent foreign key errors."""
    try:
        existing = db.table("profiles").select("id").eq("id", user["id"]).execute()
        if not existing.data:
            email = user.get("email", "")
            roll = email.split("@")[0].upper() if "@" in email else "STUDENT"
            db.table("profiles").insert({
                "id": user["id"],
                "full_name": roll,
                "roll_number": roll,
                "role": "student"
            }).execute()
    except Exception as e:
        print(f"Error ensuring profile: {e}")


def validate_qr_token_helper(token: str) -> dict:
    """Validate token strictly against the single LATEST token in Supabase qr_tokens table."""
    now = datetime.now(timezone.utc)

    # 1. Query the SINGLE LATEST active token from Supabase
    try:
        db = get_supabase()
        res = db.table("qr_tokens").select("*").order("created_at", desc=True).limit(1).execute()
        if res.data:
            latest_record = res.data[0]
            latest_token = latest_record["token"]

            # Strict check: scanned token MUST match the current latest active token!
            if token != latest_token:
                return {
                    "valid": False,
                    "token": token,
                    "remaining_seconds": 0,
                    "message": "❌ Stale QR Code. A new QR code has been generated on the entrance screen.",
                }

            # As long as it is the latest active token in database, allow check-in!
            expires = datetime.fromisoformat(latest_record["expires_at"].replace("Z", "+00:00"))
            remaining = int((expires - now).total_seconds())

            return {
                "valid": True,
                "token": token,
                "remaining_seconds": max(remaining, 60),
                "message": "Valid entrance QR code token",
            }
    except Exception as e:
        print(f"Supabase qr_tokens validation note: {e}")

    # 2. Check in-memory active token fallback
    from app.routes.admin import _CURRENT_QR_TOKEN
    if _CURRENT_QR_TOKEN:
        active_token = _CURRENT_QR_TOKEN.get("token")
        if token == active_token:
            return {
                "valid": True,
                "token": token,
                "remaining_seconds": 300,
                "message": "Valid entrance QR code token",
            }

    return {
        "valid": False,
        "token": token,
        "remaining_seconds": 0,
        "message": "❌ Invalid QR Code.",
    }


@router.get("/qr-tokens/validate")
async def validate_qr_token(token: str = Query(...)):
    """Validate dynamic entrance QR token (Public endpoint)."""
    return validate_qr_token_helper(token)


@router.post("/check-in", response_model=SessionResponse)
async def check_in(
    body: CheckInRequest,
    user: dict = Depends(get_current_user),
):
    """Check into the gym with a workout type (optionally validating QR token)."""
    db = get_supabase()
    if not body.workout_type or not body.workout_type.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workout type cannot be empty",
        )

    # Check if gym facility is currently open
    try:
        cfg_res = db.table("gym_config").select("is_open").eq("id", 1).single().execute()
        if cfg_res.data and not cfg_res.data.get("is_open", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="⛔ Gym is currently closed by administration. Check-in suspended.",
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Check gym_config is_open note: {e}")

    # Validate QR token if provided
    if body.qr_token:
        val = validate_qr_token_helper(body.qr_token)
        if not val["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=val["message"],
            )

    try:
        # Check for existing active session
        existing = (
            db.table("gym_sessions")
            .select("id")
            .eq("user_id", user["id"])
            .is_("check_out", "null")
            .execute()
        )
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have an active gym session. Check out first.",
            )

        # Check gym capacity
        active_count = (
            db.table("gym_sessions")
            .select("id", count="exact")
            .is_("check_out", "null")
            .execute()
        )
        config = db.table("gym_config").select("*").eq("id", 1).single().execute()
        max_cap = config.data["max_capacity"] if config.data else 50
        is_open = config.data["is_open"] if config.data else True

        if not is_open:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The gym is currently closed.",
            )

        if active_count.count and active_count.count >= max_cap:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The gym is at full capacity. Please try again later.",
            )

        # Create session
        result = (
            db.table("gym_sessions")
            .insert({
                "user_id": user["id"],
                "workout_type": body.workout_type,
                "check_in": datetime.now(timezone.utc).isoformat(),
            })
            .execute()
        )

        session = result.data[0]
        return SessionResponse(
            id=session["id"],
            user_id=session["user_id"],
            check_in=session["check_in"],
            check_out=session.get("check_out"),
            workout_type=session["workout_type"],
            duration_minutes=session.get("duration_minutes"),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Check-in error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-in failed: {str(e)}"
        )


@router.post("/check-out", response_model=SessionResponse)
async def check_out(user: dict = Depends(get_current_user)):
    """Check out of the gym (auto-finds active session)."""
    db = get_supabase()
    ensure_user_profile(db, user)

    try:
        # Find active session
        active = (
            db.table("gym_sessions")
            .select("*")
            .eq("user_id", user["id"])
            .is_("check_out", "null")
            .order("check_in", desc=True)
            .limit(1)
            .execute()
        )

        if not active.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active gym session found.",
            )

        session = active.data[0]
        now = datetime.now(timezone.utc)
        check_in_time = datetime.fromisoformat(session["check_in"].replace("Z", "+00:00"))
        duration = int((now - check_in_time).total_seconds() / 60)

        # Update session
        result = (
            db.table("gym_sessions")
            .update({
                "check_out": now.isoformat(),
                "duration_minutes": duration,
            })
            .eq("id", session["id"])
            .execute()
        )

        updated = result.data[0]
        return SessionResponse(
            id=updated["id"],
            user_id=updated["user_id"],
            check_in=updated["check_in"],
            check_out=updated["check_out"],
            workout_type=updated["workout_type"],
            duration_minutes=updated["duration_minutes"],
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Check-out error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-out failed: {str(e)}"
        )


@router.get("/active-session")
async def get_active_session(user: dict = Depends(get_current_user)):
    """Check if user has an active gym session."""
    db = get_supabase()
    auto_checkout_expired_sessions(db)
    ensure_user_profile(db, user)
    try:
        active = (
            db.table("gym_sessions")
            .select("*")
            .eq("user_id", user["id"])
            .is_("check_out", "null")
            .limit(1)
            .execute()
        )
        if active.data:
            s = active.data[0]
            return {
                "active": True,
                "session": SessionResponse(
                    id=s["id"],
                    user_id=s["user_id"],
                    check_in=s["check_in"],
                    check_out=s.get("check_out"),
                    workout_type=s["workout_type"],
                    duration_minutes=s.get("duration_minutes"),
                ),
            }
    except Exception as e:
        print(f"Active session error: {e}")
    return {"active": False, "session": None}


@router.get("/my-sessions", response_model=list[SessionResponse])
async def get_my_sessions(
    user: dict = Depends(get_current_user),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Get the authenticated user's session history."""
    db = get_supabase()
    ensure_user_profile(db, user)
    try:
        result = (
            db.table("gym_sessions")
            .select("*")
            .eq("user_id", user["id"])
            .order("check_in", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return [
            SessionResponse(
                id=s["id"],
                user_id=s["user_id"],
                check_in=s["check_in"],
                check_out=s.get("check_out"),
                workout_type=s["workout_type"],
                duration_minutes=s.get("duration_minutes"),
            )
            for s in (result.data or [])
        ]
    except Exception as e:
        print(f"My sessions error: {e}")
        return []


@router.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    db = get_supabase()
    ensure_user_profile(db, user)
    try:
        result = (
            db.table("profiles")
            .select("*")
            .eq("id", user["id"])
            .execute()
        )
        if result.data:
            return result.data[0]
    except Exception as e:
        print(f"Profile error: {e}")
    
    email = user.get("email", "")
    roll = email.split("@")[0].upper() if "@" in email else "STUDENT"
    return {"id": user["id"], "full_name": roll, "roll_number": roll, "role": "student"}

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

router = APIRouter(prefix="/api", tags=["attendance"])

VALID_WORKOUT_TYPES = [
    "Push", "Pull", "Legs", "Upper Body",
    "Lower Body", "Cardio", "Full Body", "Core",
]


@router.get("/occupancy", response_model=OccupancyResponse)
async def get_occupancy():
    """Get current gym occupancy — PUBLIC endpoint (no auth required)."""
    db = get_supabase()

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
    is_open = config.data["is_open"] if config.data else True

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


@router.post("/check-in", response_model=SessionResponse)
async def check_in(
    body: CheckInRequest,
    user: dict = Depends(get_current_user),
):
    """Check into the gym with a workout type."""
    db = get_supabase()
    ensure_user_profile(db, user)

    if body.workout_type not in VALID_WORKOUT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid workout type. Must be one of: {VALID_WORKOUT_TYPES}",
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

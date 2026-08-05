"""Analytics routes: peak hours, daily stats, workout distribution, averages."""

from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta, timezone
from app.auth import get_current_user
from app.database import get_supabase

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/peak-hours")
async def get_peak_hours(
    days: int = Query(default=30, le=90),
    _user: dict = Depends(get_current_user),
):
    """Get average visitors per hour over the last N days."""
    db = get_supabase()
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    result = (
        db.table("gym_sessions")
        .select("check_in")
        .gte("check_in", start_date)
        .execute()
    )

    # Aggregate by hour
    hourly: dict[int, int] = {h: 0 for h in range(24)}
    for s in (result.data or []):
        dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
        # Convert to IST (UTC+5:30) for local relevance
        ist = dt + timedelta(hours=5, minutes=30)
        hourly[ist.hour] = hourly.get(ist.hour, 0) + 1

    return [
        {"hour": h, "avg_visitors": round(count / max(days, 1), 1)}
        for h, count in sorted(hourly.items())
    ]


@router.get("/daily-stats")
async def get_daily_stats(
    days: int = Query(default=30, le=90),
    _user: dict = Depends(get_current_user),
):
    """Get daily visitor counts for the last N days."""
    db = get_supabase()
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    result = (
        db.table("gym_sessions")
        .select("check_in")
        .gte("check_in", start_date)
        .execute()
    )

    daily: dict[str, int] = {}
    for s in (result.data or []):
        dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
        ist = dt + timedelta(hours=5, minutes=30)
        day_str = ist.strftime("%Y-%m-%d")
        daily[day_str] = daily.get(day_str, 0) + 1

    # Fill missing days with 0
    today = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    all_days = []
    for i in range(days):
        d = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        all_days.append({"date": d, "count": daily.get(d, 0)})

    return list(reversed(all_days))


@router.get("/workout-distribution")
async def get_workout_distribution(
    days: int = Query(default=30, le=90),
    _user: dict = Depends(get_current_user),
):
    """Get workout type distribution over the last N days."""
    db = get_supabase()
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    result = (
        db.table("gym_sessions")
        .select("workout_type")
        .gte("check_in", start_date)
        .execute()
    )

    dist: dict[str, int] = {}
    for s in (result.data or []):
        wt = s["workout_type"]
        dist[wt] = dist.get(wt, 0) + 1

    total = sum(dist.values()) or 1
    return [
        {
            "workout_type": k,
            "count": v,
            "percentage": round((v / total) * 100, 1),
        }
        for k, v in sorted(dist.items(), key=lambda x: -x[1])
    ]


@router.get("/summary")
async def get_analytics_summary(
    _user: dict = Depends(get_current_user),
):
    """Get a summary of key analytics metrics."""
    db = get_supabase()
    now = datetime.now(timezone.utc)
    ist_now = now + timedelta(hours=5, minutes=30)
    today_start = ist_now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=5, minutes=30)
    week_start = today_start - timedelta(days=ist_now.weekday())
    month_start = ist_now.replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(hours=5, minutes=30)

    # Today's visits
    today_result = (
        db.table("gym_sessions")
        .select("id", count="exact")
        .gte("check_in", today_start.isoformat())
        .execute()
    )
    # Unique users today
    today_users = (
        db.table("gym_sessions")
        .select("user_id")
        .gte("check_in", today_start.isoformat())
        .execute()
    )
    unique_today = len(set(s["user_id"] for s in (today_users.data or [])))

    # Week visits
    week_result = (
        db.table("gym_sessions")
        .select("id", count="exact")
        .gte("check_in", week_start.isoformat())
        .execute()
    )

    # Month visits
    month_result = (
        db.table("gym_sessions")
        .select("id", count="exact")
        .gte("check_in", month_start.isoformat())
        .execute()
    )

    # Average duration (last 30 days)
    duration_result = (
        db.table("gym_sessions")
        .select("duration_minutes")
        .not_.is_("duration_minutes", "null")
        .gte("check_in", (now - timedelta(days=30)).isoformat())
        .execute()
    )
    durations = [s["duration_minutes"] for s in (duration_result.data or []) if s["duration_minutes"]]
    avg_dur = round(sum(durations) / len(durations), 1) if durations else 0

    # Peak hour (last 30 days)
    peak_data = (
        db.table("gym_sessions")
        .select("check_in")
        .gte("check_in", (now - timedelta(days=30)).isoformat())
        .execute()
    )
    hourly: dict[int, int] = {}
    for s in (peak_data.data or []):
        dt = datetime.fromisoformat(s["check_in"].replace("Z", "+00:00"))
        ist = dt + timedelta(hours=5, minutes=30)
        hourly[ist.hour] = hourly.get(ist.hour, 0) + 1
    peak_hour = max(hourly, key=hourly.get) if hourly else 18

    return {
        "total_visits_today": today_result.count or 0,
        "total_visits_week": week_result.count or 0,
        "total_visits_month": month_result.count or 0,
        "avg_duration_minutes": avg_dur,
        "peak_hour": peak_hour,
        "unique_users_today": unique_today,
    }

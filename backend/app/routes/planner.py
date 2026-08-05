"""Workout planner routes: pre-planning, weekly templates, crowd forecasting."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime, date, timedelta, timezone
from app.auth import get_current_user
from app.database import get_supabase
from app.routes.attendance import ensure_user_profile
from app.models import (
    SavePlanRequest,
    SaveTemplateRequest,
    PlanResponse,
    TemplateResponse,
    CrowdForecastResponse,
)

router = APIRouter(prefix="/api/planner", tags=["planner"])


@router.get("/my-schedule")
async def get_my_schedule(user: dict = Depends(get_current_user)):
    """Fetch student's pre-planned workouts & weekly template for upcoming 7 days."""
    db = get_supabase()
    ensure_user_profile(db, user)

    today = date.today()
    next_week = today + timedelta(days=7)

    # 1. Specific date plans
    plans_res = (
        db.table("workout_plans")
        .select("*")
        .eq("user_id", user["id"])
        .gte("planned_date", today.isoformat())
        .lte("planned_date", next_week.isoformat())
        .execute()
    )

    # 2. Weekly recurring templates
    templates_res = (
        db.table("workout_templates")
        .select("*")
        .eq("user_id", user["id"])
        .execute()
    )

    return {
        "plans": plans_res.data or [],
        "templates": templates_res.data or [],
    }


@router.post("/plan", response_model=PlanResponse)
async def save_plan(
    body: SavePlanRequest,
    user: dict = Depends(get_current_user),
):
    """Create or update a workout plan for a specific date."""
    db = get_supabase()
    ensure_user_profile(db, user)

    if not body.workout_type.strip():
        raise HTTPException(status_code=400, detail="Workout type cannot be empty")

    res = (
        db.table("workout_plans")
        .upsert(
            {
                "user_id": user["id"],
                "planned_date": body.planned_date,
                "planned_time_slot": body.planned_time_slot,
                "workout_type": body.workout_type.strip(),
                "notes": body.notes,
            },
            on_conflict="user_id,planned_date",
        )
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to save plan")

    p = res.data[0]
    return PlanResponse(
        id=str(p["id"]),
        user_id=str(p["user_id"]),
        planned_date=str(p["planned_date"]),
        planned_time_slot=int(p["planned_time_slot"]),
        workout_type=str(p["workout_type"]),
        notes=p.get("notes"),
    )


@router.delete("/plan/{planned_date}")
async def delete_plan(
    planned_date: str,
    user: dict = Depends(get_current_user),
):
    """Delete a plan for a specific date."""
    db = get_supabase()
    ensure_user_profile(db, user)

    db.table("workout_plans").delete().eq("user_id", user["id"]).eq("planned_date", planned_date).execute()
    return {"message": "Plan deleted"}


@router.post("/template", response_model=TemplateResponse)
async def save_template(
    body: SaveTemplateRequest,
    user: dict = Depends(get_current_user),
):
    """Create or update a recurring weekly workout template."""
    db = get_supabase()
    ensure_user_profile(db, user)

    if not (0 <= body.day_of_week <= 6):
        raise HTTPException(status_code=400, detail="day_of_week must be 0-6")

    res = (
        db.table("workout_templates")
        .upsert(
            {
                "user_id": user["id"],
                "day_of_week": body.day_of_week,
                "planned_time_slot": body.planned_time_slot,
                "workout_type": body.workout_type.strip(),
            },
            on_conflict="user_id,day_of_week",
        )
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to save template")

    t = res.data[0]
    return TemplateResponse(
        id=str(t["id"]),
        user_id=str(t["user_id"]),
        day_of_week=int(t["day_of_week"]),
        planned_time_slot=int(t["planned_time_slot"]),
        workout_type=str(t["workout_type"]),
    )


@router.delete("/template/{day_of_week}")
async def delete_template(
    day_of_week: int,
    user: dict = Depends(get_current_user),
):
    """Delete a recurring template for a day of week."""
    db = get_supabase()
    ensure_user_profile(db, user)

    db.table("workout_templates").delete().eq("user_id", user["id"]).eq("day_of_week", day_of_week).execute()
    return {"message": "Template deleted"}


@router.get("/crowd-forecast", response_model=CrowdForecastResponse)
async def get_crowd_forecast(
    target_date: str = Query(default=None),
    hour: int = Query(default=17, ge=0, le=23),
):
    """Calculate predicted crowd and workout breakdown for a target date & hour."""
    db = get_supabase()

    if not target_date:
        target_date = date.today().isoformat()

    try:
        dt = date.fromisoformat(target_date)
    except ValueError:
        dt = date.today()
        target_date = dt.isoformat()

    day_of_week = (dt.weekday() + 1) % 7  # Python weekday: Mon=0 -> Sun=6; convert to Sun=0 ... Sat=6

    # 1. Fetch specific date plans
    plans_res = (
        db.table("workout_plans")
        .select("user_id, workout_type, planned_time_slot")
        .eq("planned_date", target_date)
        .eq("planned_time_slot", hour)
        .execute()
    )
    date_plans = plans_res.data or []

    # 2. Fetch recurring templates for this day of week
    templates_res = (
        db.table("workout_templates")
        .select("user_id, workout_type, planned_time_slot")
        .eq("day_of_week", day_of_week)
        .eq("planned_time_slot", hour)
        .execute()
    )
    recurring_templates = templates_res.data or []

    # Combine planned students (date plans override templates for same user)
    planned_map = {}
    for t in recurring_templates:
        planned_map[t["user_id"]] = t["workout_type"]
    for p in date_plans:
        planned_map[p["user_id"]] = p["workout_type"]

    planned_students_count = len(planned_map)

    # Calculate workout breakdown
    dist = {}
    for wt in planned_map.values():
        dist[wt] = dist.get(wt, 0) + 1
    workout_breakdown = [{"workout_type": k, "count": v} for k, v in sorted(dist.items(), key=lambda x: -x[1])]

    # 3. Fetch 30-day historical avg for that hour
    hist_avg = 0.0
    try:
        rpc_res = db.rpc("get_hourly_distribution").execute()
        if rpc_res.data:
            for row in rpc_res.data:
                if row.get("hour") == hour:
                    hist_avg = float(row.get("avg_visitors", 0.0))
                    break
    except Exception:
        pass

    # 4. Final predicted crowd count
    predicted_count = max(planned_students_count, round(hist_avg))

    # Gym config
    max_cap = 50
    try:
        cfg = db.table("gym_config").select("max_capacity").eq("id", 1).single().execute()
        if cfg.data:
            max_cap = cfg.data.get("max_capacity", 50)
    except Exception:
        pass

    predicted_percentage = round((predicted_count / max_cap) * 100, 1) if max_cap > 0 else 0.0

    return CrowdForecastResponse(
        target_date=target_date,
        hour=hour,
        predicted_count=predicted_count,
        max_capacity=max_cap,
        predicted_percentage=predicted_percentage,
        planned_students_count=planned_students_count,
        historical_avg_visitors=hist_avg,
        workout_breakdown=workout_breakdown,
    )

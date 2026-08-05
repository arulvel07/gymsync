"""Pydantic models for request/response validation."""

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Requests ──────────────────────────────────────────────

class CheckInRequest(BaseModel):
    workout_type: str


class CheckOutRequest(BaseModel):
    session_id: str


class UpdateConfigRequest(BaseModel):
    max_capacity: Optional[int] = None
    open_time: Optional[str] = None   # "HH:MM"
    close_time: Optional[str] = None  # "HH:MM"
    is_open: Optional[bool] = None


class SavePlanRequest(BaseModel):
    planned_date: str  # "YYYY-MM-DD"
    planned_time_slot: int = 17
    workout_type: str
    notes: Optional[str] = None


class SaveTemplateRequest(BaseModel):
    day_of_week: int  # 0-6
    planned_time_slot: int = 17
    workout_type: str


class PlanResponse(BaseModel):
    id: str
    user_id: str
    planned_date: str
    planned_time_slot: int
    workout_type: str
    notes: Optional[str] = None


class TemplateResponse(BaseModel):
    id: str
    user_id: str
    day_of_week: int
    planned_time_slot: int
    workout_type: str


class CrowdForecastResponse(BaseModel):
    target_date: str
    hour: int
    predicted_count: int
    max_capacity: int
    predicted_percentage: float
    planned_students_count: int
    historical_avg_visitors: float
    workout_breakdown: list[dict]


# ── Responses ─────────────────────────────────────────────

class SessionResponse(BaseModel):
    id: str
    user_id: str
    check_in: str
    check_out: Optional[str] = None
    workout_type: str
    duration_minutes: Optional[int] = None
    full_name: Optional[str] = None
    roll_number: Optional[str] = None


class OccupancyResponse(BaseModel):
    current_count: int
    max_capacity: int
    percentage: float
    is_open: bool
    workout_distribution: list[dict]


class WorkoutDistItem(BaseModel):
    workout_type: str
    count: int


class HourlyDistItem(BaseModel):
    hour: int
    avg_visitors: float


class DailyStatItem(BaseModel):
    date: str
    count: int


class AnalyticsSummary(BaseModel):
    total_visits_today: int
    total_visits_week: int
    total_visits_month: int
    avg_duration_minutes: float
    peak_hour: int
    unique_users_today: int


class ConfigResponse(BaseModel):
    max_capacity: int
    open_time: str
    close_time: str
    is_open: bool

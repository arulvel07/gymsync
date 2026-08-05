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

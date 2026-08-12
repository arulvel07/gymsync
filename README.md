# GymSync - Smart Campus Gym Management System

A full-stack web app for IIITDM Kancheepuram that handles real-time gym occupancy tracking, QR-based digital attendance, workout analytics, crowd forecasting, automated operating hours, anti-screenshot QR protection, and an admin control panel.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Authentication Flow](#authentication-flow)
- [Security](#security)
- [Automation](#automation)
- [Contributing](#contributing)

---

## Overview

GymSync replaces manual attendance registers with a fully digital, real-time system for managing a campus gym.

**Problem:**
- Students can't check if the gym is full before going there
- No attendance data, usage analytics, or capacity enforcement for admins
- No historical data to find peak hours or plan improvements
- Paper registers are easy to fake

**What GymSync does:**
- Public landing page showing live occupancy (no login needed)
- Student dashboard with QR-based check-in, session history, analytics, workout planning, and crowd forecasting
- Admin panel with rotating QR entrance display, user management, session logs, gym config, and reports
- Automated operating hours, idle session timeouts, and anti-screenshot QR protection

---

## Features

### Public (No Login)
| Feature | Description |
|---------|-------------|
| Live Occupancy Ring | Animated SVG ring showing current headcount vs max capacity |
| Gym Status | Real-time open/closed badge based on hours and admin toggle |
| Workout Split | Bar chart of what workouts active users are doing |
| Auto-Refresh | Occupancy data refreshes every 30 seconds |

### Student Dashboard
| Feature | Description |
|---------|-------------|
| QR Check-In | Scan the entrance QR code with your phone camera to check in |
| Manual OTP Fallback | Type the 12-char token from the entrance screen if camera doesn't work |
| Check-Out | End your session, duration is calculated automatically |
| 2-Hour Auto-Checkout | Sessions over 2 hours get closed automatically (frontend + backend) |
| Gym Closed Detection | Shows why the gym is closed (admin toggle or outside hours) |
| Duplicate Prevention | Can't check in twice, must check out first |
| Capacity Enforcement | Blocked if gym is full |
| Attendance Logs | Table of past sessions with date, times, workout, and duration |
| Peak Hours Heatmap | Visual heatmap of avg visitors per hour (last 30 days) |
| Workout Planner | Plan workouts for specific dates with type and time slot |
| Weekly Templates | Recurring schedules like "Push on Monday at 5 PM" |
| Crowd Forecast | Predict how busy the gym will be on a future date/hour |

### Admin Panel
| Feature | Description |
|---------|-------------|
| Entrance QR Display | Auto-rotating QR code for the gym entrance screen |
| Manual QR Rotation | Button to instantly invalidate old screenshots and generate a fresh code |
| Screenshot Protection | Every new QR voids all previous ones, only the latest code works |
| Facility Lock | QR generation stops when gym is closed |
| User Management | View all users, search by name or roll number |
| Session Logs | Browse all gym sessions with date filters and search |
| Gym Config | Set max capacity, open/close times, toggle open/closed |
| Monthly Reports | Total visits, unique users, avg duration, daily and workout breakdowns |
| CSV Export | Export attendance data for offline analysis |

---

## Automation

### Operating Hours Enforcement
The gym opens and closes automatically based on `gym_config` times (e.g. 06:00-22:00 IST), regardless of whether the admin is logged in:

| When | What happens |
|------|-------------|
| Before open time | Gym closed. Check-in blocked. QR suspended. |
| After close time | Gym auto-closes. All active sessions force-checked-out. QR suspended. |
| During hours + admin toggles OFF | Gym closes. Shows "closed by administration" message. |
| During hours + admin toggles ON | Normal operation. |

### 2-Hour Idle Timeout
If a student forgets to check out:
- Frontend timer detects when elapsed time hits 120 min and auto-checks out with a toast notification
- Backend scans all active sessions on every `/api/occupancy` call and closes any over 120 min

### Single-Click Google Login
- When OAuth completes, `index.html` and `login.html` both have `onAuthStateChange` listeners
- The moment Supabase finishes parsing the token, the user gets redirected to dashboard instantly
- No need to click login twice

### Anti-Screenshot QR System
- Backend only looks at the single latest row in `qr_tokens` table
- Scanned token must exactly match the latest one
- Every QR rotation makes all older screenshots useless
- If the admin screen goes offline, the last token stays valid so students aren't locked out

---

## Tech Stack

| Layer | Tech | What it does |
|-------|------|-------------|
| Frontend | HTML, CSS, JS (vanilla) | Landing, login, dashboard, admin pages |
| Styling | Tailwind CSS v4 (CDN) + custom CSS | Dark theme, glassmorphism, animations |
| Backend | Python 3.11 + FastAPI | REST API |
| Database | Supabase (PostgreSQL) | Data, RLS, Auth |
| Auth | Supabase Google OAuth | Login via `@iiitdm.ac.in` email |
| QR | QRCode.js + Html5-QRCode | Admin generates QR, students scan with camera |
| Validation | Pydantic v2 | Request/response models |
| Backend Hosting | Render | Docker deployment |
| Frontend Hosting | Vercel | Static site |

---

## Architecture

```
                        BROWSER
    ┌──────────┐  ┌────────────┐  ┌─────────────┐
    │ Landing  │  │ Dashboard  │  │ Admin Panel  │
    │ (public) │  │ (student)  │  │ (admin)      │
    └────┬─────┘  └──────┬─────┘  └──────┬───────┘
         │          QR Scanner       QR Display
         │          (camera)        (entrance)
         └───────────┬───────────────────┘
                     │
              FastAPI Backend (Render)
         ┌───────────┼───────────────┐
         │  Routes: attendance,      │
         │  analytics, admin,        │
         │  planner                  │
         │                           │
         │  Auto-checkout engine     │
         │  QR token validator       │
         │  Facility status checker  │
         │                           │
         │  JWT auth middleware      │
         └───────────┬───────────────┘
                     │
              Supabase (Cloud)
         ┌───────────┼───────────────┐
         │  Auth (Google OAuth)      │
         │  PostgreSQL database      │
         │  Row Level Security       │
         │                           │
         │  Tables: profiles,        │
         │  gym_sessions, gym_config,│
         │  qr_tokens, workout_plans,│
         │  workout_templates        │
         └───────────────────────────┘
```

### How data flows

1. **Public occupancy**: Landing page calls `GET /api/occupancy` (no auth), which auto-checkouts expired sessions, then returns count
2. **QR check-in**: Admin screen shows QR -> student scans -> `POST /api/check-in` with JWT + token -> validates against latest `qr_tokens` row -> creates session
3. **Auto-checkout at close**: Any API call checks facility status -> if outside hours -> force-closes all active sessions
4. **Crowd forecast**: `GET /api/planner/crowd-forecast?date=...&hour=...` combines planned workouts + historical data -> returns predicted count

---

## Project Structure

```
campus-gym/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point, CORS, routers
│   │   ├── config.py                 # Env vars config
│   │   ├── database.py               # Supabase client
│   │   ├── auth.py                   # JWT auth (get_current_user, require_admin)
│   │   ├── models.py                 # Pydantic models
│   │   └── routes/
│   │       ├── attendance.py         # Check-in/out, occupancy, QR validation, auto-checkout
│   │       ├── analytics.py          # Peak hours, daily stats, workout distribution
│   │       ├── admin.py              # Users, sessions, config, reports, QR tokens
│   │       └── planner.py            # Workout plans, templates, crowd forecast
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/
│   ├── index.html                    # Landing page + OAuth auto-redirect
│   ├── login.html                    # Google OAuth login
│   ├── dashboard.html                # Student dashboard
│   ├── admin.html                    # Admin panel
│   ├── css/styles.css                # Dark theme, glassmorphism
│   ├── js/
│   │   ├── supabase-config.js        # Supabase client init
│   │   ├── auth.js                   # OAuth, onAuthStateChange listener
│   │   ├── utils.js                  # API helpers, parseUTC, formatters
│   │   ├── dashboard.js              # QR scanner, check-in/out, timer, planner
│   │   └── admin.js                  # QR generation, config, users, reports
│   └── vercel.json
│
├── supabase/schema.sql               # Full DB schema
├── vercel.json                       # Root Vercel config
├── .gitignore
└── README.md
```

---

## Database Schema

Full schema is in [`supabase/schema.sql`](supabase/schema.sql).

### profiles
User data, auto-created on signup via DB trigger.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK to auth.users) | Supabase Auth user ID |
| full_name | TEXT | Extracted from email prefix (e.g. CS24I1027) |
| roll_number | TEXT (unique) | Same as full_name |
| role | TEXT | 'student' or 'admin' |
| created_at | TIMESTAMPTZ | When created |

### gym_sessions
One row per gym visit.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Session ID |
| user_id | UUID (FK to profiles) | Who checked in |
| check_in | TIMESTAMPTZ | Check-in time |
| check_out | TIMESTAMPTZ (nullable) | Check-out time (NULL = active) |
| workout_type | TEXT | Push, Pull, Legs, etc. or custom |
| duration_minutes | INT (nullable) | Calculated on check-out |

### gym_config
Single row (id=1) for gym settings.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| max_capacity | INT | 50 | Max concurrent users |
| open_time | TIME | 06:00 | Opening time (IST) |
| close_time | TIME | 22:00 | Closing time (IST) |
| is_open | BOOLEAN | true | Manual toggle |

### qr_tokens
Current entrance QR token. Only the latest row matters.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Fixed UUID for upsert |
| token | TEXT | 12-char hex token (e.g. 8f92a7c1e43b) |
| created_at | TIMESTAMPTZ | When generated |
| expires_at | TIMESTAMPTZ | Expiry (7 min from creation) |

### workout_plans
Pre-planned workouts for specific dates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Plan ID |
| user_id | UUID | Student |
| planned_date | DATE | Target date |
| planned_time_slot | INT | Hour (0-23), default 17 |
| workout_type | TEXT | What workout |
| notes | TEXT (nullable) | Optional notes |

### workout_templates
Recurring weekly schedules.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Template ID |
| user_id | UUID | Student |
| day_of_week | INT | 1 (Mon) to 7 (Sun) |
| planned_time_slot | INT | Hour (0-23) |
| workout_type | TEXT | What workout |

### DB Functions

| Function | What it does |
|----------|-------------|
| get_current_occupancy() | Count of active sessions (check_out IS NULL) |
| get_workout_distribution() | Breakdown of active workout types |
| get_hourly_distribution() | Avg visitors per hour over a date range |
| handle_new_user() | Trigger that creates a profiles row on signup |
| is_admin() | Checks if current user has admin role |

### Row Level Security
All tables have RLS. Backend uses `service_role` key (bypasses RLS), but policies exist as a safety net for direct Supabase client queries.

---

## API Reference

Backend runs on FastAPI. Auto-docs at `/docs` (Swagger) and `/redoc`.

Base URL: `https://gym-qxdu.onrender.com`

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | None | Health check |
| GET | `/health` | None | Detailed health + DB check |

### Attendance

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/occupancy` | None | Current count, capacity, status, workout dist. Also triggers auto-checkout. |
| POST | `/api/check-in` | JWT | Check in with workout type + QR token |
| POST | `/api/check-out` | JWT | Check out of active session |
| GET | `/api/active-session` | JWT | Is user currently checked in? |
| GET | `/api/my-sessions` | JWT | Session history (`?limit=20&offset=0`) |
| GET | `/api/profile` | JWT | User profile |
| GET | `/api/qr-tokens/validate` | None | Validate a QR token (`?token=...`) |

**POST /api/check-in body:**
```json
{
  "workout_type": "Push",
  "qr_token": "8f92a7c1e43b"
}
```

Default types: Push, Pull, Legs, Upper Body, Lower Body, Cardio, Full Body, Core. Custom types accepted too.

Errors: 409 (already checked in), 403 (gym closed/full), 400 (bad QR token)

### Analytics

All need JWT.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/peak-hours` | Avg visitors per hour (`?days=30`) |
| GET | `/api/analytics/daily-stats` | Daily counts (`?days=30`) |
| GET | `/api/analytics/workout-distribution` | Workout percentages (`?days=30`) |
| GET | `/api/analytics/summary` | Today/week/month visits, avg duration, peak hour |

### Planner

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/planner/my-schedule` | JWT | Plans + templates for next 7 days |
| POST | `/api/planner/plan` | JWT | Create/update a plan |
| DELETE | `/api/planner/plan/{date}` | JWT | Delete a plan |
| POST | `/api/planner/template` | JWT | Create/update a weekly template |
| DELETE | `/api/planner/template/{day}` | JWT | Delete a template |
| GET | `/api/planner/crowd-forecast` | None | Predict crowd (`?target_date=...&hour=17`) |

### Admin

All need admin JWT.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users (`?search=CS22B`) |
| GET | `/api/admin/all-sessions` | All sessions with filters |
| GET | `/api/admin/config` | Get gym config |
| PUT | `/api/admin/config` | Update config (all fields optional) |
| GET | `/api/admin/reports/monthly` | Monthly report (`?year=2026&month=8`) |

---

## Getting Started

### Prerequisites
- Python 3.11+
- Supabase account (free tier works)
- Git

### 1. Supabase Setup

1. Create a project on [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Google OAuth under Authentication > Providers
   - Need Google Cloud OAuth Client ID + Secret
   - Add your frontend URL as authorized redirect URI
4. Grab your keys from Settings > API:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service_role, keep secret)
   - `SUPABASE_ANON_KEY` (safe for frontend)
   - `SUPABASE_JWT_SECRET`

If `qr_tokens` table isn't in your schema yet:
```sql
CREATE TABLE IF NOT EXISTS public.qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON public.qr_tokens
    FOR ALL USING (auth.role() = 'authenticated');
```

To make someone admin:
```sql
UPDATE public.profiles SET role = 'admin' WHERE roll_number = 'CS24I1027';
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET, FRONTEND_URL
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API at `http://localhost:8000`, docs at `http://localhost:8000/docs`

### 3. Frontend Setup

No build step needed, it's plain HTML/CSS/JS.

1. Edit `frontend/js/supabase-config.js` with your Supabase URL, anon key, and backend URL
2. Serve the frontend folder:
```bash
cd frontend
python -m http.server 5500
# or use VS Code Live Server
# or: npx serve . -l 5500
```
3. Open `http://localhost:5500`

---

## Deployment

### Backend (Render)

1. Push to GitHub
2. Render > New > Web Service > connect repo
3. Root directory: `backend`
4. It'll use the Dockerfile
5. Set env vars: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`, `PORT=10000`

### Frontend (Vercel)

1. Vercel > New Project > import repo
2. `vercel.json` at root sets output to `frontend/`
3. Security headers auto-applied
4. No build needed, static site

---

## Environment Variables

### Backend (.env)

| Variable | Required | What |
|----------|----------|------|
| SUPABASE_URL | Yes | Project URL |
| SUPABASE_KEY | Yes | service_role key (backend only!) |
| SUPABASE_JWT_SECRET | Yes | JWT secret |
| FRONTEND_URL | No | CORS origin (default: http://localhost:5500) |
| PORT | No | Server port (default: 8000) |

### Frontend (supabase-config.js)

| Variable | What |
|----------|------|
| SUPABASE_URL | Same project URL |
| SUPABASE_ANON_KEY | Anon key (safe to expose) |
| API_BASE_URL | Backend URL |

> Never put the service_role key in frontend code. It bypasses all RLS.

---

## Authentication Flow

```
User clicks "Login"
    -> Supabase redirects to Google OAuth
    -> Restricted to @iiitdm.ac.in via hd parameter
    -> User picks their Google account
    -> Google sends auth code back
    -> Supabase exchanges it for tokens (PKCE)
    -> Creates/updates user in auth.users
    -> DB trigger creates profiles row
       (full_name = email prefix, role = student)
    -> onAuthStateChange listener catches SIGNED_IN
    -> Instant redirect to dashboard (single click)
    -> All API calls use: Authorization: Bearer <token>
    -> Backend validates via supabase.auth.get_user()
```

---

## Security

| What | How |
|------|-----|
| QR screenshot prevention | Only latest qr_tokens row is valid, rotation kills old codes |
| Email restriction | Google OAuth hd param limits to @iiitdm.ac.in |
| JWT validation | Every request validated via Supabase auth.get_user() |
| Admin enforcement | require_admin() checks profiles.role |
| RLS | All tables have Row Level Security enabled |
| CORS | Backend only accepts requests from configured frontend URL |
| Security headers | Vercel adds X-Content-Type-Options, X-Frame-Options, Referrer-Policy |
| Key isolation | service_role key only in backend .env, never in frontend |

---

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/something`
3. Commit: `git commit -m 'add something'`
4. Push: `git push origin feature/something`
5. Open a PR

**Backend**: Python, type hints, docstrings, PEP 8.
**Frontend**: Vanilla JS, semantic HTML, CSS custom properties.

---

Built for IIITDM Kancheepuram | [Live Demo](https://gym-eta-pink-49.vercel.app) | [API Docs](https://gym-qxdu.onrender.com/docs)

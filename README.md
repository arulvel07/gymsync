# 🏋️ GymSync — Smart Campus Gym Management System

> A full-stack web application for **IIITDM Kancheepuram** that provides real-time gym occupancy tracking, **QR-based digital check-in/check-out**, workout analytics, crowd forecasting, **automated operating hours enforcement**, **anti-screenshot QR exploit prevention**, and an admin command center.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Supabase Setup](#1-supabase-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Deployment](#-deployment)
  - [Backend on Render](#backend-on-render)
  - [Frontend on Vercel](#frontend-on-vercel)
- [Environment Variables](#-environment-variables)
- [Authentication Flow](#-authentication-flow)
- [Security Features](#-security-features)
- [Automation & Smart Features](#-automation--smart-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**GymSync** solves the problem of managing a campus gym where there's no digital system to track who is currently using the facility, how crowded it is, or what workout zones are in demand. It replaces manual attendance registers with a fully digital, real-time system that benefits both **students** and **campus administration**.

### The Problem

- Students have no way to know if the gym is full before walking there.
- Admins have no attendance data, usage analytics, or capacity enforcement.
- There's no historical data to identify peak hours or plan facility improvements.
- Manual attendance registers are easily faked — anyone can write any name.

### The Solution

GymSync provides:
- A **public landing page** showing live occupancy (no login needed).
- A **student dashboard** for QR-based digital check-in/check-out, session history, analytics, workout planning, and crowd forecasting.
- An **admin command center** with a real-time rotating QR entrance display, user management, session logs, gym configuration (capacity, open/close hours), and monthly reports.
- **Fully automated** operating hours enforcement, idle session timeouts, and anti-screenshot QR exploit prevention.

---

## ✨ Features

### 🔓 Public (No Login Required)
| Feature | Description |
|---------|-------------|
| **Live Occupancy Ring** | Animated SVG ring showing current headcount vs. max capacity |
| **Gym Open/Closed Status** | Real-time open/closed badge based on operating hours and admin toggle |
| **Workout Focus Split** | Bar chart showing what workouts active users are doing (e.g., Push, Pull, Legs) |
| **Auto-Refresh** | Occupancy data refreshes every 30 seconds |

### 🎓 Student Dashboard (Authenticated)
| Feature | Description |
|---------|-------------|
| **QR-Based Check-In** | Scan the entrance QR code using your phone camera to check in with a selected workout type |
| **Manual OTP Fallback** | Alternatively type the 12-character OTP token displayed on the entrance screen |
| **Auto Check-Out** | Check out from your active session; duration is automatically calculated |
| **2-Hour Idle Auto-Checkout** | Sessions exceeding 2 hours are automatically checked out (both frontend timer + backend enforcement) |
| **Gym Closed Detection** | Check-in button shows a toast alert explaining why the gym is closed (admin toggle OR outside operating hours) |
| **Duplicate Prevention** | Cannot check in twice — must check out of active session first |
| **Capacity Enforcement** | Check-in is blocked if the gym is at full capacity |
| **Personal Attendance Logs** | Paginated table of your past gym sessions with date, check-in/out times, workout focus, and duration |
| **Peak Hours Heatmap** | Visual heatmap showing average visitors per hour over the last 30 days |
| **Workout Planner** | Pre-plan workouts for specific dates with workout type and time slot |
| **Weekly Templates** | Set recurring weekly workout schedules (e.g., "Push on Monday at 5 PM") |
| **Crowd Forecast** | Predict gym crowd for a future date/hour based on planned workouts + historical data |
| **Profile** | View your roll number, name, and role |

### 🔐 Admin Command Center (Admin Role Only)
| Feature | Description |
|---------|-------------|
| **Real-Time Entrance QR Display** | Auto-rotating QR code displayed on the gym entrance screen for students to scan |
| **Instant QR Rotation** | Manual "Rotate QR" button to immediately invalidate old screenshots and generate a fresh code |
| **QR Screenshot Exploit Prevention** | Every new QR generation instantly voids ALL previous QR screenshots — only the latest code works |
| **Facility Closed Lock** | QR generation is automatically suspended when the gym is closed (admin toggle or outside hours) |
| **User Management** | View all registered users, search by name or roll number |
| **All Sessions** | Browse every gym session with date filters and search |
| **Gym Configuration** | Set max capacity, open/close times, toggle gym open/closed |
| **Monthly Reports** | Generate reports with total visits, unique users, avg duration, daily & workout breakdowns |
| **CSV Export** | Export attendance data to CSV for offline analysis |

---

## 🤖 Automation & Smart Features

### ⏰ Operating Hours Enforcement
The gym automatically opens and closes based on the configured operating hours in `gym_config` (e.g., `06:00` - `22:00` IST). This works **irrespective** of whether the admin is logged in or not:

| Scenario | Behavior |
|----------|----------|
| **Before `open_time`** | Gym is closed. Check-in blocked. QR generation suspended. |
| **After `close_time`** | Gym auto-closes. All active sessions are force-checked-out. QR suspended. |
| **During hours + Admin toggles OFF** | Gym closes. Toast shows: "Gym is currently closed by administration." |
| **During hours + Admin toggles ON** | Normal operation. QR codes rotate. Check-ins allowed. |

### ⏱ 2-Hour Idle Session Auto-Checkout
Students who forget to check out are automatically checked out after **2 hours** (120 minutes):

- **Frontend**: The session timer in `dashboard.js` detects when `elapsedMinutes >= 120` and triggers `handleCheckOut()` automatically with a toast notification.
- **Backend**: The `/api/occupancy` endpoint calls `auto_checkout_expired_sessions()` on every request, scanning all active sessions and closing any that exceed 120 minutes.

### 📱 Single-Click Google OAuth Login
When a student clicks "Login" and completes Google OAuth:
1. Google redirects back to the app with token hash parameters.
2. `index.html` has an `onAuthStateChange` listener that **instantly detects** the new session.
3. The student is redirected to `dashboard.html` on the **very first click** — no double-click required.
4. `auth.js` on `login.html` also has its own `onAuthStateChange` listener as a safety net.

### 🔒 Anti-Screenshot QR Exploit Prevention
The QR token validation system is designed to prevent students from screenshotting the entrance QR and sharing it:

1. **Single Active Token**: The backend queries only the **single latest row** from `qr_tokens` (`ORDER BY created_at DESC LIMIT 1`).
2. **Strict Match**: The scanned token must **exactly match** the latest active token. Any older screenshot is instantly invalid.
3. **Instant Invalidation**: Every time the admin rotates the QR (manually or auto-rotation), all previous QR codes become useless.
4. **Token Persistence**: If the admin screen goes offline, the last generated token stays valid in Supabase so students aren't locked out.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------| 
| **Frontend** | HTML, CSS, JavaScript (Vanilla) | UI pages — landing, login, dashboard, admin |
| **CSS Framework** | Tailwind CSS v4 (CDN) + Custom CSS | Styling, glassmorphism cards, animations |
| **Backend** | Python 3.11 + FastAPI | REST API server |
| **Database** | Supabase (PostgreSQL) | Data storage, Row Level Security, Auth |
| **Authentication** | Supabase Auth (OAuth — Google) | Login via institutional email (`@iiitdm.ac.in`) |
| **QR Generation** | QRCode.js (Admin) + Html5-QRCode (Student Scanner) | Entrance display QR + Phone camera scanner |
| **Validation** | Pydantic v2 + pydantic-settings | Request/response validation, env config |
| **HTTP Client** | httpx | Async HTTP for inter-service calls |
| **Backend Hosting** | Render (Free tier) | Docker-based Python deployment |
| **Frontend Hosting** | Vercel | Static site hosting with security headers |
| **Containerization** | Docker | Backend container for Render deployment |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USERS (Browser)                       │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Landing  │  │  Dashboard   │  │  Admin Command    │  │
│  │ (Public) │  │  (Student)   │  │  Center (Admin)   │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                   │              │
│       │          ┌─────┴──────┐            │              │
│       │          │ QR Scanner │            │              │
│       │          │ (Camera)   │     ┌──────┴──────┐      │
│       │          └────────────┘     │ QR Display  │      │
│       │                             │ (Entrance)  │      │
│       │                             └─────────────┘      │
└───────┼───────────────┼───────────────────┼──────────────┘
        │               │                   │
        ▼               ▼                   ▼
┌──────────────────────────────────────────────────────────┐
│              FastAPI Backend (Render)                     │
│                                                          │
│  ┌─────────────┐ ┌────────────┐ ┌──────────┐ ┌────────┐ │
│  │ Attendance  │ │ Analytics  │ │  Admin   │ │Planner │ │
│  │   Router    │ │   Router   │ │  Router  │ │ Router │ │
│  └──────┬──────┘ └─────┬──────┘ └────┬─────┘ └───┬────┘ │
│         │              │             │            │      │
│  ┌──────┴──────────────┴─────────────┴────────────┴──┐   │
│  │  Auto-Checkout Engine (Expired + Closing Time)    │   │
│  │  QR Token Validator (Anti-Screenshot Strict)      │   │
│  │  Facility Status Checker (IST Operating Hours)    │   │
│  └───────────────────┬───────────────────────────────┘   │
│                      │                                   │
│  ┌───────────────────┴───────────────────────────────┐   │
│  │        Auth Middleware (JWT Validation)            │   │
│  │     get_current_user() / require_admin()          │   │
│  └──────────────────────┬────────────────────────────┘   │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│                Supabase (Cloud)                          │
│                                                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Auth   │  │  PostgreSQL  │  │  Row Level        │   │
│  │ (Google  │  │  Database    │  │  Security (RLS)   │   │
│  │  OAuth)  │  │              │  │                   │   │
│  └──────────┘  └──────────────┘  └───────────────────┘   │
│                                                          │
│  Tables: profiles, gym_sessions, gym_config,             │
│          workout_plans, workout_templates, qr_tokens     │
└──────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Public Occupancy**: Landing page → `GET /api/occupancy` (no auth) → auto-checkout expired sessions → Supabase query → response
2. **QR Check-In**: Admin entrance display generates QR → Student scans with phone camera → `POST /api/check-in` (JWT + QR token) → validates against latest `qr_tokens` row → inserts session → response
3. **Auto-Checkout at Close**: Any API call triggers `check_facility_open_status()` → if outside hours → `auto_checkout_all_active_sessions()` → force-closes all active sessions
4. **Admin Config**: Admin panel → `PUT /api/admin/config` (admin JWT required) → updates `gym_config` → response
5. **Crowd Forecast**: Dashboard → `GET /api/planner/crowd-forecast?date=...&hour=...` → combines planned workouts + historical data → predicted count

---

## 📁 Project Structure

```
campus-gym/
│
├── backend/                          # FastAPI Python backend
│   ├── app/
│   │   ├── __init__.py               # Package init
│   │   ├── main.py                   # FastAPI app entry point, CORS, router registration
│   │   ├── config.py                 # Pydantic settings (env vars: SUPABASE_URL, etc.)
│   │   ├── database.py               # Supabase client singleton
│   │   ├── auth.py                   # JWT auth dependencies (get_current_user, require_admin)
│   │   ├── models.py                 # Pydantic request/response models
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── attendance.py         # Check-in, check-out, occupancy, QR validation, auto-checkout
│   │       ├── analytics.py          # Peak hours, daily stats, workout distribution, summary
│   │       ├── admin.py              # User management, all sessions, config, monthly reports, QR tokens
│   │       └── planner.py            # Workout plans, weekly templates, crowd forecasting
│   │
│   ├── .env.example                  # Template for environment variables
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Docker image for Render deployment
│   └── render.yaml                   # Render deployment configuration
│
├── frontend/                         # Static HTML/CSS/JS frontend
│   ├── index.html                    # Public landing page with live occupancy + OAuth auto-redirect
│   ├── login.html                    # Login page (Supabase Google OAuth)
│   ├── dashboard.html                # Student dashboard (QR check-in, analytics, planner)
│   ├── admin.html                    # Admin command center (QR display, config, reports)
│   ├── css/
│   │   └── styles.css                # Custom CSS (dark theme, glassmorphism, animations)
│   ├── js/
│   │   ├── supabase-config.js        # Supabase client init + OAuth state listener
│   │   ├── auth.js                   # Login/logout, Google OAuth, onAuthStateChange listener
│   │   ├── utils.js                  # Shared utilities (API calls, parseUTC, formatters, colors)
│   │   ├── dashboard.js              # Dashboard logic (QR scanner, check-in/out, timer, planner)
│   │   └── admin.js                  # Admin logic (QR generation, users, sessions, config, reports)
│   └── vercel.json                   # Vercel routing configuration
│
├── supabase/
│   └── schema.sql                    # Complete database schema (tables, RLS, functions, triggers)
│
├── vercel.json                       # Root Vercel config (outputs frontend/, security headers)
├── .gitignore                        # Ignored files (venv, .env, __pycache__, IDE files)
└── README.md                         # This file
```

---

## 🗄 Database Schema

The database is hosted on **Supabase** (managed PostgreSQL). The full schema is in [`supabase/schema.sql`](supabase/schema.sql).

### Tables

#### `profiles`
Extends Supabase `auth.users` with gym-specific fields. Auto-populated on user signup via a database trigger.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` (PK, FK → `auth.users`) | User's unique ID from Supabase Auth |
| `full_name` | `TEXT` | Student's name (auto-extracted from email prefix, e.g., `CS24I1027`) |
| `roll_number` | `TEXT` (UNIQUE) | Roll number extracted from email |
| `role` | `TEXT` | `'student'` or `'admin'` |
| `created_at` | `TIMESTAMPTZ` | Account creation timestamp |

#### `gym_sessions`
Tracks every gym visit — one row per check-in.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` (PK) | Auto-generated session ID |
| `user_id` | `UUID` (FK → `profiles`) | Who checked in |
| `check_in` | `TIMESTAMPTZ` | When the student checked in |
| `check_out` | `TIMESTAMPTZ` (nullable) | When they checked out (`NULL` = currently active) |
| `workout_type` | `TEXT` | e.g., Push, Pull, Legs, Cardio, Full Body, Core, or custom |
| `duration_minutes` | `INT` (nullable) | Auto-calculated on check-out |
| `created_at` | `TIMESTAMPTZ` | Row creation timestamp |

#### `gym_config`
Singleton table (only 1 row, `id = 1`) for admin-configurable settings.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `max_capacity` | `INT` | `50` | Maximum concurrent users allowed |
| `open_time` | `TIME` | `06:00` | Daily opening time (IST) |
| `close_time` | `TIME` | `22:00` | Daily closing time (IST) |
| `is_open` | `BOOLEAN` | `true` | Manual open/close toggle |

#### `qr_tokens`
Stores the current active QR entrance token. Only the **latest row** is ever valid.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` (PK) | Fixed UUID for upsert (`00000000-0000-0000-0000-000000000001`) |
| `token` | `TEXT` | 12-character hex token (e.g., `8f92a7c1e43b`) |
| `created_at` | `TIMESTAMPTZ` | When this token was generated |
| `expires_at` | `TIMESTAMPTZ` | When this token expires (7 minutes from creation) |

#### `workout_plans`
Pre-planned workouts for specific dates (one plan per user per date).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` (PK) | Plan ID |
| `user_id` | `UUID` (FK → `profiles`) | Student |
| `planned_date` | `DATE` | Which date this workout is for |
| `planned_time_slot` | `INT` | Hour of day (0–23), default `17` |
| `workout_type` | `TEXT` | Planned workout type |
| `notes` | `TEXT` (nullable) | Optional notes |

#### `workout_templates`
Recurring weekly templates (one template per user per day-of-week).

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` (PK) | Template ID |
| `user_id` | `UUID` (FK → `profiles`) | Student |
| `day_of_week` | `INT` | 1 (Monday) through 7 (Sunday) |
| `planned_time_slot` | `INT` | Hour of day (0–23), default `17` |
| `workout_type` | `TEXT` | Planned workout type |

### Database Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `get_current_occupancy()` | `INT` | Count of sessions where `check_out IS NULL` |
| `get_workout_distribution()` | `TABLE(workout_type, count)` | Active workout type breakdown |
| `get_hourly_distribution(start_date, end_date)` | `TABLE(hour, avg_visitors)` | Average visitors per hour over a date range |
| `handle_new_user()` | `TRIGGER` | Auto-creates a `profiles` row when a new user signs up |
| `is_admin()` | `BOOLEAN` | Checks if the current auth user has `role = 'admin'` |

### Row Level Security (RLS)

All tables have RLS enabled. Since the backend uses the **`service_role` key** (which bypasses RLS), the policies are permissive. The RLS policies exist as a safety net for any direct client-side Supabase queries:

- `profiles` — Read/insert/update allowed for all authenticated users
- `gym_sessions` — Read/insert/update allowed for all authenticated users
- `gym_config` — Read allowed for everyone; update allowed for admins
- `qr_tokens` — Full CRUD allowed for admins; read allowed for authenticated users
- `workout_plans` & `workout_templates` — Full CRUD allowed for all authenticated users

---

## 📡 API Reference

The backend runs on **FastAPI** with auto-generated docs at `/docs` (Swagger) and `/redoc`.

Base URL: `https://gym-qxdu.onrender.com`

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | None | Basic health check (`{"status": "healthy"}`) |
| `GET` | `/health` | None | Detailed health check with database connectivity |

### Attendance (`/api`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/occupancy` | **None** (Public) | Current headcount, capacity, open/closed, workout distribution. Also triggers auto-checkout for expired sessions. |
| `POST` | `/api/check-in` | Bearer JWT | Check into the gym with a workout type + QR token. Validates token against latest `qr_tokens` row. |
| `POST` | `/api/check-out` | Bearer JWT | Check out of active session (auto-finds it) |
| `GET` | `/api/active-session` | Bearer JWT | Check if the user has an active session |
| `GET` | `/api/my-sessions` | Bearer JWT | Paginated session history (`?limit=20&offset=0`) |
| `GET` | `/api/profile` | Bearer JWT | Get user's profile (name, roll number, role) |
| `GET` | `/api/qr-tokens/validate` | **None** (Public) | Validate a QR token (`?token=8f92a7c1e43b`) |

#### `POST /api/check-in` — Request Body
```json
{
  "workout_type": "Push",
  "qr_token": "8f92a7c1e43b"
}
```
Valid default workout types: `Push`, `Pull`, `Legs`, `Upper Body`, `Lower Body`, `Cardio`, `Full Body`, `Core`
Custom workout types are also accepted (entered via "Others" option).

#### Error Cases
- `409 Conflict` — Already have an active session
- `403 Forbidden` — Gym is closed or at full capacity
- `400 Bad Request` — Invalid or stale QR token

### Analytics (`/api/analytics`)

All analytics endpoints require a Bearer JWT.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/analytics/peak-hours` | Bearer JWT | Avg visitors per hour (`?days=30`) |
| `GET` | `/api/analytics/daily-stats` | Bearer JWT | Daily visitor counts (`?days=30`) |
| `GET` | `/api/analytics/workout-distribution` | Bearer JWT | Workout type percentages (`?days=30`) |
| `GET` | `/api/analytics/summary` | Bearer JWT | Key metrics: today/week/month visits, avg duration, peak hour |

### Planner (`/api/planner`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/planner/my-schedule` | Bearer JWT | User's plans + templates for the next 7 days |
| `POST` | `/api/planner/plan` | Bearer JWT | Create/update a workout plan for a specific date |
| `DELETE` | `/api/planner/plan/{date}` | Bearer JWT | Delete a plan for a date |
| `POST` | `/api/planner/template` | Bearer JWT | Create/update a weekly recurring template |
| `DELETE` | `/api/planner/template/{day}` | Bearer JWT | Delete a recurring template |
| `GET` | `/api/planner/crowd-forecast` | **None** (Public) | Predict crowd for a date/hour (`?target_date=2026-08-06&hour=17`) |

#### `POST /api/planner/plan` — Request Body
```json
{
  "planned_date": "2026-08-10",
  "planned_time_slot": 17,
  "workout_type": "Legs",
  "notes": "Don't skip leg day!"
}
```

#### `GET /api/planner/crowd-forecast` — Response
```json
{
  "target_date": "2026-08-10",
  "hour": 17,
  "predicted_count": 12,
  "max_capacity": 50,
  "predicted_percentage": 24.0,
  "planned_students_count": 8,
  "historical_avg_visitors": 10.5,
  "workout_breakdown": [
    { "workout_type": "Push", "count": 4 },
    { "workout_type": "Legs", "count": 3 }
  ]
}
```

### Admin (`/api/admin`)

All admin endpoints require a Bearer JWT from a user with `role = 'admin'` in the `profiles` table.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/users` | Admin JWT | List all users (`?search=CS22B`) |
| `GET` | `/api/admin/all-sessions` | Admin JWT | All sessions with filters (`?limit=50&offset=0&date_from=2026-08-01&date_to=2026-08-31&search=John`) |
| `GET` | `/api/admin/config` | Admin JWT | Get gym configuration |
| `PUT` | `/api/admin/config` | Admin JWT | Update gym settings |
| `GET` | `/api/admin/reports/monthly` | Admin JWT | Monthly report (`?year=2026&month=8`) |

#### `PUT /api/admin/config` — Request Body
```json
{
  "max_capacity": 60,
  "open_time": "06:00",
  "close_time": "22:00",
  "is_open": true
}
```
All fields are optional — only provided fields are updated.

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** — [Download](https://www.python.org/downloads/)
- **Node.js** (optional, only if you want to use a local dev server for the frontend)
- **A Supabase account** — [Sign up free](https://supabase.com)
- **Git** — [Download](https://git-scm.com)

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** → **New Query**.
3. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. Go to **Authentication** → **Providers** → enable **Google** OAuth.
   - You'll need a Google Cloud OAuth Client ID and Secret.
   - Set the redirect URL to your Supabase project's callback URL (shown in the Supabase dashboard).
   - **Important**: In the Google Cloud Console, add your frontend URL (e.g., `https://gym-eta-pink-49.vercel.app`) as an authorized redirect URI.
5. Collect your credentials from **Settings** → **API**:
   - `SUPABASE_URL` — Project URL
   - `SUPABASE_KEY` — `service_role` key (for the backend — **keep this secret!**)
   - `SUPABASE_ANON_KEY` — `anon` key (for the frontend — safe to expose)
   - `SUPABASE_JWT_SECRET` — JWT Secret

#### Creating the `qr_tokens` Table

If not already in your schema, run this in the Supabase SQL Editor:

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

#### Making a User an Admin

To promote a student to admin, run this in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE roll_number = 'CS24I1027';  -- Replace with the actual roll number
```

### 2. Backend Setup

```bash
# Clone the repository
git clone https://github.com/arulvel07/gymsync.git
cd gymsync/backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file from the template
cp .env.example .env
# Edit .env and fill in your Supabase credentials:
#   SUPABASE_URL=https://your-project-id.supabase.co
#   SUPABASE_KEY=your-service-role-key
#   SUPABASE_JWT_SECRET=your-jwt-secret
#   FRONTEND_URL=http://localhost:5500

# Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive Swagger documentation.

### 3. Frontend Setup

The frontend is **plain HTML/CSS/JS** — no build step required.

1. Open [`frontend/js/supabase-config.js`](frontend/js/supabase-config.js) and update:
   - `SUPABASE_URL` — Your Supabase project URL
   - `SUPABASE_ANON_KEY` — Your Supabase anon key
   - `API_BASE_URL` — Your backend URL (e.g., `http://localhost:8000` for local dev)

2. Serve the `frontend/` directory with any static file server:

   ```bash
   # Option 1: Python's built-in server
   cd frontend
   python -m http.server 5500

   # Option 2: VS Code Live Server extension
   # Right-click index.html → "Open with Live Server"

   # Option 3: Node.js serve
   npx serve frontend -l 5500
   ```

3. Open `http://localhost:5500` in your browser.

---

## ☁️ Deployment

### Backend on Render

The backend is configured for **Render** deployment via [`backend/render.yaml`](backend/render.yaml) and [`backend/Dockerfile`](backend/Dockerfile).

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Set the **Root Directory** to `backend`.
5. Render will auto-detect the `Dockerfile`.
6. Add environment variables in the Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service_role key)
   - `SUPABASE_JWT_SECRET`
   - `FRONTEND_URL` (your Vercel frontend URL)
   - `PORT` = `10000`

### Frontend on Vercel

The frontend is configured via [`vercel.json`](vercel.json) at the project root.

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. The root `vercel.json` sets `outputDirectory` to `frontend` — Vercel will serve that folder.
3. Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) are automatically applied.
4. No build step is needed — it's a static site.

---

## 🔑 Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL (e.g., `https://xyz.supabase.co`) |
| `SUPABASE_KEY` | ✅ | Supabase **service_role** key (bypasses RLS, backend only) |
| `SUPABASE_JWT_SECRET` | ✅ | JWT secret for token validation |
| `FRONTEND_URL` | ❌ | Frontend origin for CORS (default: `http://localhost:5500`) |
| `HOST` | ❌ | Server host (default: `0.0.0.0`) |
| `PORT` | ❌ | Server port (default: `8000`) |

### Frontend (`supabase-config.js`)

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Same Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase **anon** key (safe to expose, limited by RLS) |
| `API_BASE_URL` | Backend API URL (e.g., `https://gym-qxdu.onrender.com`) |

> ⚠️ **Never** expose the `service_role` key in the frontend. It bypasses all Row Level Security.

---

## 🔐 Authentication Flow

GymSync uses **Supabase Auth with Google OAuth** (PKCE flow):

```
User clicks "Login"
        │
        ▼
Supabase redirects to Google OAuth consent screen
  (restricted to @iiitdm.ac.in via hd parameter)
        │
        ▼
User selects their institutional Google account
        │
        ▼
Google redirects back to the app with auth code
        │
        ▼
Supabase exchanges the code for tokens (PKCE)
        │
        ▼
Supabase creates/updates the user in auth.users
        │
        ▼
Database trigger (handle_new_user) auto-creates a profiles row
  ├── full_name = uppercase email prefix (e.g., CS24I1027)
  ├── roll_number = same as full_name
  └── role = 'student' (default)
        │
        ▼
onAuthStateChange listener on index.html/login.html
  detects SIGNED_IN event instantly
        │
        ▼
Immediate redirect to dashboard.html (single click!)
        │
        ▼
All authenticated API calls include:
  Authorization: Bearer <access_token>
        │
        ▼
Backend validates the JWT by calling supabase.auth.get_user(token)
  ├── Returns user ID and email
  └── For admin routes: checks profiles.role = 'admin'
```

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| **QR Screenshot Prevention** | Only the single latest `qr_tokens` row is valid. Every rotation invalidates all older codes. |
| **Institutional Email Lock** | Google OAuth `hd` parameter restricts login to `@iiitdm.ac.in` accounts only |
| **JWT Token Validation** | Backend validates every request's `Authorization: Bearer` header via Supabase `auth.get_user()` |
| **Admin Role Enforcement** | Admin endpoints use `require_admin()` dependency that checks `profiles.role = 'admin'` |
| **Row Level Security** | All Supabase tables have RLS enabled as a defense-in-depth layer |
| **CORS Protection** | Backend only accepts requests from the configured `FRONTEND_URL` origin |
| **Security Headers** | Vercel config applies `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy` headers |
| **Service Role Key Isolation** | The `service_role` key is only used server-side (backend `.env`), never exposed in frontend code |

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request.

### Code Style

- **Backend**: Python with type hints, docstrings on all functions, PEP 8 formatting.
- **Frontend**: Vanilla JS (no frameworks), semantic HTML, CSS custom properties for theming.

---

## 📄 License

This project was built for **Campus Sync Hackathon** as a campus facility management solution.

---

<div align="center">

**Built with ❤️ for IIITDM Kancheepuram**

[Live Demo](https://gym-eta-pink-49.vercel.app) · [API Docs](https://gym-qxdu.onrender.com/docs) · [Report Bug](https://github.com/arulvel07/gymsync/issues)

</div>

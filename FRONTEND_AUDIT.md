# GymSync Frontend Audit

## 1. Current Architecture

The current GymSync frontend is a static Multi-Page Application (MPA) built with vanilla HTML5, Vanilla JavaScript (ES6+), custom CSS (`frontend/css/styles.css`), Tailwind CSS v4 loaded via browser CDN (`@tailwindcss/browser@4`), Supabase JS SDK v2, Chart.js v4 (via CDN), QRCode.js (via CDN), and Html5-QRCode (via CDN).

### Key Architectural Characteristics

1. **No Build Step / No Transpiler**:
   * HTML files reference `.js` and `.css` files directly using script tags with version query strings (e.g., `styles.css?v=1.0.7`, `dashboard.js?v=2.0.0`).
   * JavaScript is non-modular vanilla JS (no ES module `import`/`export`). Global variables (`window.SUPABASE_CLIENT`, `window.API_BASE_URL`, `window.handleLogout`, `window.parseUTC`) are placed on the `window` object to share state across script tags.

2. **Client-Side Authentication & Session Management**:
   * Supabase Auth handles Google OAuth single sign-on restricted to `@iiitdm.ac.in` domain emails via PKCE flow.
   * `frontend/js/supabase-config.js` sets up a global Promise (`window.SUPABASE_AUTH_READY`) to handle async OAuth token resolution.
   * Supabase JWT access tokens are retrieved from `supabase.auth.getSession()` and attached as `Authorization: Bearer <token>` HTTP headers on every REST request to the FastAPI backend.

3. **Backend Integration**:
   * All dynamic business logic, session tracking, capacity enforcement, operating hours validation, analytics calculations, and QR code verification run through a FastAPI backend deployed at `https://gym-qxdu.onrender.com`.
   * Public telemetry (e.g. occupancy headcount, facility status, active workout distribution) is fetched via unauthenticated endpoints (`GET /api/occupancy`, `GET /api/planner/crowd-forecast`, `GET /api/qr-tokens/validate`).

4. **Direct DOM Manipulation & Imperative Rendering**:
   * DOM elements are populated using imperative `document.getElementById()`, `innerHTML` template strings, and direct inline style mutations (e.g. `element.style.display = 'block'`).
   * Tab switches and state transitions toggle `display: none` / `display: block` on container `<div>` elements within single HTML files (e.g., `dashboard.html` tabs, `admin.html` sections).

---

## 2. Repository Structure

```text
gymsync/
├── backend/                             # Python 3.11 + FastAPI Backend API
│   ├── app/
│   │   ├── main.py                      # FastAPI entry point, CORS config, router inclusion
│   │   ├── config.py                    # Environment variable configuration (Pydantic BaseSettings)
│   │   ├── database.py                  # Supabase client initializer (service_role key)
│   │   ├── auth.py                      # JWT verification middleware & require_admin dependency
│   │   ├── models.py                    # Pydantic v2 request/response schemas
│   │   └── routes/                      # API Endpoint Controllers
│   │       ├── attendance.py            # /api/occupancy, check-in, check-out, active-session, my-sessions, profile
│   │       ├── analytics.py             # /api/analytics/peak-hours, daily-stats, workout-distribution, summary
│   │       ├── admin.py                 # /api/admin/users, all-sessions, config, reports/monthly, qr-token
│   │       └── planner.py               # /api/planner/my-schedule, plan, template, crowd-forecast
│   ├── Dockerfile                       # Container deployment definition for Render
│   ├── render.yaml                      # Render hosting configuration
│   └── requirements.txt                 # FastAPI, Supabase, Pydantic, uvicorn dependencies
│
├── frontend/                            # Client-side Static Application
│   ├── index.html                       # Public Landing Page (Live occupancy ring & workout telemetry)
│   ├── login.html                       # Single Sign-On Page (Google OAuth button)
│   ├── dashboard.html                   # Student Dashboard (Check-in, active session, planner, history)
│   ├── check-in.html                    # Dynamic Entrance QR Scan / Mobile Check-in target screen
│   ├── admin.html                       # Admin Command Center (5 single-page modules)
│   ├── css/
│   │   └── styles.css                   # Master CSS (Design tokens, glass cards, buttons, tables, media queries)
│   ├── js/
│   │   ├── supabase-config.js           # Supabase client init, API_BASE_URL, SUPABASE_AUTH_READY promise
│   │   ├── auth.js                      # OAuth login handler, auto-redirect logic, logout helper
│   │   ├── utils.js                     # apiRequest(), publicApiRequest(), formatters, toasts, skeletons, auth guards
│   │   ├── dashboard.js                 # Student occupancy timer, camera QR scanner, workout planner, crowd forecast
│   │   ├── admin.js                     # Admin telemetry, Chart.js graphs, QR generation, config forms, CSV export
│   │   └── check-in.js                  # QR token validation, workout focus picker, check-in confirmation
│   └── vercel.json                      # Frontend Vercel routing headers & security rules
│
├── supabase/
│   └── schema.sql                       # PostgreSQL schema (profiles, gym_sessions, gym_config, qr_tokens, workout_plans, workout_templates, triggers, RLS)
│
├── GymSync_Frontend_Anti_AI_Redesign_Plan.md # Master Redesign Master Plan
├── README.md                            # Comprehensive system documentation
└── vercel.json                          # Root Vercel configuration
```

### Component & Utility File Inventory

| Category | File Path | Function / Responsibility |
| -------- | --------- | ------------------------- |
| **HTML Pages** | [index.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/index.html) | Public landing page displaying live gym occupancy ring & workout focus split |
| | [login.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/login.html) | Institute Single Sign-On (@iiitdm.ac.in restriction notice & Google login button) |
| | [dashboard.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/dashboard.html) | Student workspace (Occupancy gauge, check-in pills, active timer, planner tabs, history) |
| | [check-in.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/check-in.html) | Entrance QR check-in landing page for students scanning the entrance screen QR |
| | [admin.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html) | Admin Command Center (Overview, Attendance, Analytics, Facility Config, Dynamic QR) |
| **Styles** | [styles.css](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css) | Single stylesheet with dark theme variables, glass cards, buttons, responsive media queries |
| **JavaScript** | [supabase-config.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/supabase-config.js) | Supabase client setup, API URL, early auth listener & promise wrapper |
| | [auth.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/auth.js) | Google OAuth redirect trigger, auth change handlers, logout logic |
| | [utils.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/utils.js) | Shared REST wrappers (`apiRequest`, `publicApiRequest`), date parsing, toasts, auth guards |
| | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js) | Student dashboard state management, 2-hr timer, camera scanner, planner & forecast logic |
| | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js) | Admin module switcher, KPI fetcher, Chart.js renders, config updates, QR 7-min generator |
| | [check-in.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/check-in.js) | Token validation handler, workout selection, and check-in confirmation |

---

## 3. Page Inventory

| Page Name | File/Component Location | Purpose | Target User Type | Main API Dependencies |
| --------- | ----------------------- | ------- | ---------------- | --------------------- |
| **Landing Page** | [index.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/index.html) | Public overview of gym availability, live capacity ring, and active workout split. Automatically redirects logged-in users to `dashboard.html`. | Public / Guest / Student | `GET /api/occupancy` |
| **Login Page** | [login.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/login.html) | Authentication screen triggering Supabase Google OAuth (`@iiitdm.ac.in`). Redirects authenticated users to `dashboard.html` or `check-in.html?token=...`. | All Unauthenticated Users | `Supabase OAuth` -> `GET /api/profile` |
| **Student Dashboard** | [dashboard.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/dashboard.html) | Primary student dashboard. Contains live occupancy gauge, workout check-in panel, active session timer, live workout breakdown, 30-day peak hour heatmap, smart planner/crowd forecast, and personal attendance history. | Student (`role: 'student'`) | `GET /api/profile`<br>`GET /api/occupancy`<br>`GET /api/active-session`<br>`POST /api/check-in`<br>`POST /api/check-out`<br>`GET /api/my-sessions`<br>`GET /api/analytics/peak-hours`<br>`GET /api/planner/my-schedule`<br>`POST /api/planner/plan`<br>`DELETE /api/planner/plan/{date}`<br>`POST /api/planner/template`<br>`DELETE /api/planner/template/{day}`<br>`GET /api/planner/crowd-forecast` |
| **QR Scan / Check-In Target** | [check-in.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/check-in.html) | Destination page when a student scans the dynamic entrance QR code with their mobile phone. Validates token freshness, prompts for workout type, and completes check-in. | Student (`role: 'student'`) | `GET /api/qr-tokens/validate`<br>`GET /api/active-session`<br>`POST /api/check-in` |
| **Admin Command Center** | [admin.html#overview](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html#overview) | Section 1 of Admin panel. Displays live facility headcount, capacity progress bar, quick action links, 6 executive KPI cards, and recent session activity table. | Admin (`role: 'admin'`) | `GET /api/profile`<br>`GET /api/occupancy`<br>`GET /api/analytics/summary`<br>`GET /api/admin/all-sessions` |
| **Attendance & Audit Logs** | [admin.html#attendance](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html#attendance) | Section 2 of Admin panel. Searchable and date-filterable register of all gym check-ins and check-outs across students. | Admin (`role: 'admin'`) | `GET /api/admin/all-sessions`<br>`GET /api/admin/all-sessions?search=...&date_from=...&date_to=...` |
| **Analytics & Trends** | [admin.html#analytics](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html#analytics) | Section 3 of Admin panel. Chart.js visualizations for 30-day daily visitor trends, hourly peak traffic averages, and workout focus distribution doughnut chart. | Admin (`role: 'admin'`) | `GET /api/analytics/daily-stats`<br>`GET /api/analytics/peak-hours`<br>`GET /api/analytics/workout-distribution` |
| **Facility Configuration** | [admin.html#settings](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html#settings) | Section 4 of Admin panel. Controls max rated capacity, shift 1 hours (morning), shift 2 hours (evening), and manual gym operational status toggle. | Admin (`role: 'admin'`) | `GET /api/admin/config`<br>`PUT /api/admin/config` |
| **Dynamic Entrance QR Display** | [admin.html#qr-code](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/admin.html#qr-code) | Section 5 of Admin panel. Kiosk screen displayed on gym tablet/monitor. Auto-rotates 12-char OTP & QR code every 7 minutes, with countdown timer and manual rotation button. | Admin (`role: 'admin'`) / Entrance Kiosk | `GET /api/admin/qr-token`<br>`POST /api/admin/qr-token/rotate`<br>`Direct Supabase DB sync` |
| **User Management** | Embedded in Admin API | Functionality provided via `GET /api/admin/users`. Listed on backend, exposed in search filter on attendance logs. | Admin (`role: 'admin'`) | `GET /api/admin/users` |
| **Reports & CSV Export** | Client-side function in [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L457) | Client-side export generator converts fetched session JSON to downloadable CSV files (`gym-attendance-YYYY-MM-DD.csv`). Backend also provides monthly aggregated report endpoint. | Admin (`role: 'admin'`) | `GET /api/admin/all-sessions?limit=200`<br>`GET /api/admin/reports/monthly` |

---

## 4. API Dependency Map

### Complete Endpoint Specification

```text
GymSync API Hierarchy
├── Health & Telemetry (Public)
│   ├── GET /                            (Health status)
│   ├── GET /health                      (Detailed health & DB status)
│   ├── GET /api/occupancy               (Live headcount, capacity, status, workout distribution)
│   └── GET /api/qr-tokens/validate     (Validate entrance QR token)
│
├── Student Attendance (JWT Required)
│   ├── GET /api/profile                 (Student/Admin profile & role lookup)
│   ├── GET /api/active-session          (Check if user is currently checked in)
│   ├── POST /api/check-in               (Check in with workout_type + optional qr_token)
│   ├── POST /api/check-out              (End active session and record duration)
│   └── GET /api/my-sessions             (Fetch student's personal session history)
│
├── Analytics (JWT Required)
│   ├── GET /api/analytics/summary       (Today/week/month visits, avg duration, peak hour)
│   ├── GET /api/analytics/peak-hours    (Hourly average traffic density)
│   ├── GET /api/analytics/daily-stats   (30-day daily visitor counts)
│   └── GET /api/analytics/workout-distribution (30-day workout type breakdown)
│
├── Workout Planner & Forecasting
│   ├── GET /api/planner/my-schedule     (JWT: Fetch date plans & weekly templates)
│   ├── POST /api/planner/plan           (JWT: Create/update date-specific workout plan)
│   ├── DELETE /api/planner/plan/{date}  (JWT: Delete date plan)
│   ├── POST /api/planner/template       (JWT: Create/update recurring weekly template)
│   ├── DELETE /api/planner/template/{day} (JWT: Delete weekly template)
│   └── GET /api/planner/crowd-forecast  (Public: Predict headcount & workout breakdown)
│
└── Admin Command Center (Admin JWT Required)
    ├── GET /api/admin/users             (List/search registered users)
    ├── GET /api/admin/all-sessions      (Browse/filter all attendance logs)
    ├── GET /api/admin/config            (Get gym operating config & shift times)
    ├── PUT /api/admin/config            (Update capacity, shifts, operational toggle)
    ├── GET /api/admin/reports/monthly   (Get monthly aggregated metrics & breakdowns)
    ├── GET /api/admin/qr-token          (Get current 7-minute entrance QR token)
    └── POST /api/admin/qr-token/rotate  (Force generate & rotate entrance QR token)
```

### Detailed Endpoint Map

| Endpoint | Method | Auth | Query / Request Body | Response Payload | Usage Site in Frontend | Refresh Interval |
| -------- | ------ | ---- | -------------------- | ---------------- | ---------------------- | ---------------- |
| `GET /api/occupancy` | `GET` | None | None | `{ current_count, max_capacity, percentage, is_open, workout_distribution: [{workout_type, count}] }` | [index.html](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/index.html#L199)<br>[dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L94)<br>[admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L135) | Landing: 30s<br>Student: 30s<br>Admin: 60s |
| `GET /api/qr-tokens/validate` | `GET` | None | `?token=...` | `{ valid: boolean, token: string, remaining_seconds: number, message: string }` | [check-in.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/check-in.js#L29) | On QR link scan / page load |
| `GET /api/profile` | `GET` | JWT | None | `{ id: UUID, full_name: string, roll_number: string, role: 'student' \| 'admin' }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L51)<br>[admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L30)<br>[utils.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/utils.js#L309) | On page load / auth guard |
| `GET /api/active-session` | `GET` | JWT | None | `{ active: boolean, session: { id, user_id, check_in, check_out, workout_type, duration_minutes } \| null }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L185)<br>[check-in.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/check-in.js#L59) | Page load & timer init |
| `POST /api/check-in` | `POST` | JWT | `{ workout_type: string, qr_token?: string }` | `SessionResponse` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L409)<br>[check-in.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/check-in.js#L139) | On user check-in action |
| `POST /api/check-out` | `POST` | JWT | None | `SessionResponse` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L466) | On user check-out or 2-hr timeout |
| `GET /api/my-sessions` | `GET` | JWT | `?limit=10&offset=0` | `SessionResponse[]` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L493) | Page load & post check-out |
| `GET /api/analytics/peak-hours` | `GET` | JWT | `?days=30` | `[{ hour: number, avg_visitors: number }]` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L523)<br>[admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L290) | Page load |
| `GET /api/analytics/daily-stats` | `GET` | JWT | `?days=30` | `[{ date: 'YYYY-MM-DD', count: number }]` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L253) | Page load |
| `GET /api/analytics/workout-distribution` | `GET` | JWT | `?days=30` | `[{ workout_type: string, count: number, percentage: number }]` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L327) | Page load |
| `GET /api/analytics/summary` | `GET` | JWT | None | `{ total_visits_today, total_visits_week, total_visits_month, avg_duration_minutes, peak_hour, unique_users_today }` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L121) | Page load & 60s interval |
| `GET /api/planner/my-schedule` | `GET` | JWT | None | `{ plans: [...], templates: [...] }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L647) | Page load & post plan/template edit |
| `POST /api/planner/plan` | `POST` | JWT | `{ planned_date, planned_time_slot, workout_type, notes? }` | `PlanResponse` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L687) | Form submit |
| `DELETE /api/planner/plan/{date}` | `DELETE` | JWT | None | `{ message: "Plan deleted" }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L706) | Click delete plan |
| `POST /api/planner/template` | `POST` | JWT | `{ day_of_week, planned_time_slot, workout_type }` | `TemplateResponse` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L770) | Click save day / save all |
| `DELETE /api/planner/template/{day}` | `DELETE` | JWT | None | `{ message: "Template deleted" }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#762) | Save empty template day |
| `GET /api/planner/crowd-forecast` | `GET` | None | `?target_date=YYYY-MM-DD&hour=17` | `{ target_date, hour, predicted_count, max_capacity, predicted_percentage, planned_students_count, historical_avg_visitors, workout_breakdown }` | [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L815) | Date/time picker change |
| `GET /api/admin/all-sessions` | `GET` | Admin | `?limit=50&offset=0&search=...&date_from=...&date_to=...` | `[{ id, user_id, check_in, check_out, workout_type, duration_minutes, full_name, roll_number }]` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L199) | Page load, search, date filter |
| `GET /api/admin/users` | `GET` | Admin | `?search=...` | `[{ id, full_name, roll_number, role, created_at }]` | Admin API | On demand |
| `GET /api/admin/config` | `GET` | Admin | None | `{ id, max_capacity, open_time, close_time, open_time_2, close_time_2, is_open }` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L412) | Config tab load |
| `PUT /api/admin/config` | `PUT` | Admin | `{ max_capacity?, open_time?, close_time?, open_time_2?, close_time_2?, is_open? }` | `GymConfig` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L439) | Save config submit |
| `GET /api/admin/reports/monthly` | `GET` | Admin | `?year=2026&month=8` | `{ year, month, total_visits, unique_users, avg_duration_minutes, daily_breakdown, workout_breakdown }` | Admin API | On demand |
| `GET /api/admin/qr-token` | `GET` | Admin | None | `{ token, created_at, expires_at, valid_seconds, qr_image }` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L492) | QR tab load & 7-min timer |
| `POST /api/admin/qr-token/rotate` | `POST` | Admin | None | `{ token, created_at, expires_at, valid_seconds, qr_image }` | [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L571) | Click "Generate New Token" |

---

## 5. Authentication Flow

### Complete Authentication Diagram

```text
User opens Page (index.html / login.html / dashboard.html)
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ supabase-config.js initializes window.SUPABASE_CLIENT│
│ & sets up window.SUPABASE_AUTH_READY Promise         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
       Is user on login.html?
         ├── YES ──► User clicks "Sign In with Google"
         │               │
         │               ▼
         │           supabase.auth.signInWithOAuth({
         │             provider: 'google',
         │             options: { queryParams: { hd: 'iiitdm.ac.in' } }
         │           })
         │               │
         │               ▼
         │           Redirects to Google OAuth Consent Page
         │               │
         │               ▼
         │           User authenticates with @iiitdm.ac.in email
         │               │
         │               ▼
         │           Redirected back to dashboard.html with #access_token=...
         │
         └── NO ───► requireAuth() / redirectIfAuth() awaits window.SUPABASE_AUTH_READY
                         │
                         ▼
             Has valid Supabase session?
               ├── NO ──► Redirect to login.html
               └── YES ──► Fetch GET /api/profile
                               │
                               ▼
                   Check user profile role
                     ├── role === 'admin' ──► Redirect/stay on admin.html
                     └── role === 'student' ──► Stay on dashboard.html (or redirect check-in.html?token=...)
```

### Detailed Token & Permission Mechanics

1. **State Storage**: Supabase Auth persists access and refresh tokens in `localStorage` under `sb-<project-id>-auth-token`. `sessionStorage` is used to hold temporary states like `pending_qr_token` across OAuth redirects.
2. **JWT Transmission**: The frontend retrieves the JWT string via `const { data: { session } } = await supabase.auth.getSession(); token = session.access_token;` and adds `headers['Authorization'] = 'Bearer ' + token;` in `apiRequest()`.
3. **Logout Mechanics**: `handleLogout()` calls `supabase.auth.signOut()`, clears `sessionStorage`, removes all `sb-` and `supabase` keys from `localStorage`, displays an info toast, and redirects to `index.html`.
4. **Session Expiration**: If FastAPI returns `401 Unauthorized` (expired JWT), `apiRequest()` throws an error. The user is redirected to `login.html` upon next navigation check.
5. **Admin Access Determination**: `require_admin` dependency in FastAPI checks `public.profiles.role == 'admin'` for the authenticated user ID. On the frontend, `admin.js` verifies `profile.role === 'admin'`; if not admin, it displays an error toast and redirects to `dashboard.html`.

---

## 6. Student Workflow

```text
Login (login.html)
  ↓ Google OAuth
Student Dashboard (dashboard.html)
  ├─► 1. View Live Headcount Gauge (GET /api/occupancy)
  ├─► 2. Select Workout Focus Pill (Chest, Back, Legs, Shoulders, Cardio, Full Body, Others)
  ├─► 3. Check In:
  │      ├─► Direct Check-In (POST /api/check-in)
  │      └─► Camera QR Scanner / Manual 12-char OTP (POST /api/check-in with qr_token)
  ├─► 4. Active Session Screen:
  │      ├─► Live 1-second elapsed timer (`00:00:00`)
  │      ├─► 120-minute auto-checkout countdown trigger
  │      └─► Check Out button (POST /api/check-out)
  ├─► 5. Personal Session History Table (GET /api/my-sessions)
  ├─► 6. 30-Day Hourly Traffic Density Heatmap (GET /api/analytics/peak-hours)
  └─► 7. Smart Workout Planner & Crowd Forecast Tabs:
         ├─► Pre-Plan Date (POST/DELETE /api/planner/plan)
         ├─► Weekly Routine Template (POST/DELETE /api/planner/template)
         └─► Crowd Forecast Query (GET /api/planner/crowd-forecast)
```

### Detailed Student Flow Execution

* **Check-In**: Student chooses a workout focus pill. If "Others" is selected, a text input appears. Clicking "Check In Now" triggers the live camera viewfinder (via Html5-QRCode) or allows manual 12-char OTP token submission. Successful check-in hides the check-in panel and reveals the active session panel with live timer.
* **Active Session**: Runs `startTimer()` updating `display` every second. If elapsed time exceeds 120 minutes, `handleCheckOut(true)` fires automatically to enforce auto-checkout.
* **Check-Out**: Sends `POST /api/check-out`. Resets active session UI back to check-in panel, clears active token from `sessionStorage`, reloads occupancy gauge, and refreshes personal attendance history.

---

## 7. Admin Workflow

```text
Login (login.html)
  ↓ Google OAuth (admin role check)
Admin Command Center (admin.html)
  ├─► 1. Executive Overview (#overview)
  │      ├─► Live headcount banner & capacity fill bar (GET /api/occupancy)
  │      ├─► 6 KPI cards: Today, Week, Month, Avg Duration, Peak Slot, Unique Students (GET /api/analytics/summary)
  │      └─► Live recent session activity table (GET /api/admin/all-sessions)
  ├─► 2. Attendance Register & Audit Logs (#attendance)
  │      ├─► Student name / roll number search input (debounced 300ms)
  │      ├─► Date range filter (`date-from`, `date-to`)
  │      └─► CSV Report Export button (`exportToCSV()`)
  ├─► 3. Analytics & Telemetry Metrics (#analytics)
  │      ├─► 30-Day Daily Visitors line chart (Chart.js)
  │      ├─► Hourly Peak Density bar chart (Chart.js)
  │      └─► Workout Focus Share doughnut chart (Chart.js)
  ├─► 4. Facility Configuration (#settings)
  │      ├─► Max Rated Capacity input (default 50)
  │      ├─► Shift 1 Hours (Morning: 05:00 - 09:00 IST)
  │      ├─► Shift 2 Hours (Evening: 17:00 - 22:00 IST)
  │      └─► Operational Status checkbox toggle (is_open)
  └─► 5. Dynamic Entrance QR Check-In (#qr-code)
         ├─► Live 7-minute countdown timer (`07:00`)
         ├─► SVG QR Code image render (target URL: `check-in.html?token=...`)
         ├─► Large 12-character Entrance OTP Token display
         └─► "Generate New Token" rotation button (POST /api/admin/qr-token/rotate)
```

---

## 8. State Matrix

| Feature / UI Element | Loading State | Success State | Empty State | Error State | Special States |
| -------------------- | ------------- | ------------- | ----------- | ----------- | -------------- |
| **Landing Occupancy Gauge** | Rings filled offset 553; count shows `—`; status shows `Loading...` | Animated SVG ring fill, colored headcount number, badge `● Open Now` | Count `0`, label `Plentiful Space` | Count `—`, label `Unable to connect` | Badge `● Closed` when `is_open === false` or outside hours |
| **Student Check-In Panel** | Button shows `<span class="spinner"></span> Loading...` disabled | Panel hides, checkout panel shows with active workout type & timer | Workout pills default to `Chest` active | Toast notification with error message | Toast `⛔ Gym is currently closed` if outside operating hours |
| **Active Session Panel** | Timer displays `00:00:00` | Timer ticks every second; checkout button active | N/A | Toast error if check-out request fails | Auto-checkout trigger after **120 minutes** limit reached |
| **Camera QR Scanner Modal** | Camera initializing in `#qr-reader` box | Scans QR token, closes modal, executes check-in | N/A | Camera permission error toast; manual token input visible as fallback | Scanned token stale -> Toast `❌ Stale QR Code` |
| **Attendance History Table** | `Loading attendance records...` row in `<tbody>` | Displays rows with date, check-in, check-out, workout pill, duration | `No sessions yet. Check in to start tracking!` | `No attendance records found` | Active sessions display `<span class="badge badge-green">Active</span>` |
| **Peak Hours Heatmap** | `Loading traffic density...` | 17 hour cells (6 AM - 10 PM) colored green/amber/red | `Not enough data yet` | Heatmap area remains empty | Cell opacity scales with relative traffic intensity |
| **Smart Workout Planner** | `Loading schedule...` / form inputs enabled | Pre-plans rendered in horizontal cards; template grid filled | `No upcoming date-specific plans recorded.` | Toast error on save failure | Selected date defaults to tomorrow |
| **Crowd Forecast Tab** | `● Checking forecast` badge | Predicted headcount count `X / 50` with color badge & workout breakdown | `Select a date and time slot to view predicted student activity.` | Forecast fields display default `—` | Calculates from (planned date + template + 30-day historical avg) |
| **Admin Telemetry & KPIs** | Metrics initialized to `0` or `—` | KPI values update (e.g. `22`, `45m`, `6 PM`) | KPIs display `0` | Values stay at `0` / `—` | Status badge toggles `Operational` / `Facility Closed` |
| **Admin Attendance Logs** | `Loading attendance records...` | Multi-column table with student names, roll numbers, dates, times | `No session records found` | Table shows error row | Search filter updates table in real-time (300ms debounce) |
| **Admin Analytics Charts** | Empty `<canvas>` containers | Line chart, bar chart, and doughnut chart render via Chart.js | Empty chart axes | Console error logged | Tooltips present dark mode styling |
| **Admin Facility Config** | Inputs hold previous state | Toast `Gym configuration updated` on submit | N/A | Toast error message | Saving config updates `gym_config` table and re-checks occupancy |
| **Admin Dynamic QR Display** | `Generating QR Code...` / timer `07:00` | SVG QR code rendered, OTP hex code shown, timer countdown active | N/A | Fallback canvas or static message | Gym closed -> Displays `🔒 Facility Currently Closed` and suspends QR |

---

## 9. Responsive Behavior

### Current Responsive Implementation Details

1. **Desktop (> 1024px)**:
   * Fixed top navbar (height 56px, backdrop blur).
   * Landing page: 2-column grid (Left: Hero text & stats; Right: Occupancy widget card).
   * Student Dashboard: 2-column layout for top cards (340px gauge + 1fr check-in) and middle cards (1fr breakdown + 1fr heatmap).
   * Admin Panel: 240px fixed left sidebar navigation + flexible main content area. KPI grid renders 6 columns.

2. **Tablet (641px - 1024px)**:
   * Admin sidebar hides (`display: none`). Top sticky horizontal subnav (`.admin-mobile-subnav`) appears with horizontal scrolling links.
   * Admin telemetry grid and charts grid collapse from 2-column to 1-column layout.
   * KPI grid scales down to 3 columns per row.

3. **Mobile (<= 640px)**:
   * Top navbar height reduced to 52px. User role badge and "Logout" button label are hidden to save header space.
   * Student dashboard top grids stack vertically (1-column layout).
   * Heatmap and data tables wrap inside `overflow-x: auto` scroll containers.
   * Pre-plan form inputs stack into a 2x2 grid, then single column on screens <= 480px.
   * CTA buttons span 100% container width.

### Identified Responsive Issues (To Be Fixed in Redesign Phase)

* **Mobile Table Horizontal Scrolling**: Tables require horizontal scrolling, causing student names and status badges to clip off-screen rather than transforming into responsive mobile card view.
* **Peak Hours Heatmap Touch Targets**: The 52px x 52px heatmap cells overflow horizontally on smaller mobile viewports (< 360px width) without smooth touch feedback.
* **Fixed Header Overlap**: Mobile page content sometimes experiences subtle top padding overlap under the fixed 52px navbar on initial load.
* **Camera Viewfinder Sizing**: The `html5-qrcode` viewfinder box on mobile devices with narrow aspect ratios occasionally distorts camera preview padding.

---

## 10. Existing Component System

The repository currently uses a set of ad-hoc UI CSS classes in `frontend/css/styles.css` without React component encapsulation:

| Primitive Pattern | CSS Classes / Elements | Defined Location | Reused In | Issues / Inconsistencies |
| ----------------- | ---------------------- | ---------------- | --------- | ------------------------ |
| **Glass Card** | `.glass-card`, `.glass-card-static` | [styles.css:L87](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L87) | All HTML pages (`index`, `dashboard`, `admin`, `check-in`, `login`) | Padding and margin applied via inline HTML `style="..."` attributes instead of component props. |
| **Primary Button** | `.btn-primary` | [styles.css:L129](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L129) | `index`, `login`, `dashboard`, `admin`, `check-in` | Button height and font sizes vary between inline styles (`padding: 12px`, `padding: 8px 16px`). |
| **Secondary Button** | `.btn-secondary` | [styles.css:L163](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L163) | `index`, `dashboard`, `admin` | Used for both secondary actions and navigation links. |
| **Danger Button** | `.btn-danger` | [styles.css:L185](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L185) | `dashboard.html` (check-out) | Standalone class, rarely reused. |
| **Workout Focus Pills** | `.workout-pill`, `.workout-pill.active` | [styles.css:L308](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L308) | `dashboard.html`, `check-in.html` | Duplicated DOM structure and click handlers in `dashboard.js` and `check-in.js`. |
| **Status Badges** | `.badge`, `.badge-green`, `.badge-amber`, `.badge-red`, `.badge-blue` | [styles.css:L365](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L365) | All HTML pages | Bullet indicator (`●`) hardcoded inside inner text across different pages. |
| **Data Table** | `.data-table` | [styles.css:L401](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L401) | `dashboard.html`, `admin.html` | Table headers and cells rendered imperatively via string concat in JS files. |
| **Segmented Tab Toggle** | `.tab-toggle`, `.tab-btn`, `.tab-btn.active` | [styles.css:L559](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L559) | `dashboard.html` (Planner tabs) | Manual JS tab switching logic bound directly to element IDs. |
| **Executive KPI Cards** | `.kpi-card`, `.kpi-title`, `.kpi-value` | [styles.css:L731](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L731) | `admin.html` | 6 color variations hardcoded via inline `style="color: var(--accent-...)"`. |
| **Toast Container** | `.toast-container`, `.toast`, `.toast-success`, `.toast-error`, `.toast-info` | [styles.css:L518](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L518) | `utils.js` | Dynamically injected into `document.body` via imperative JS creation. |
| **Occupancy Ring Gauge** | `.occupancy-ring`, `.ring-bg`, `.ring-fill`, `.ring-center` | [styles.css:L272](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/css/styles.css#L272) | `index.html`, `dashboard.html` | SVG circle offset calculation duplicated in `index.html` inline script and `dashboard.js`. |

---

## 11. Styling Architecture

* **CSS Methodology**: Hybrid system combining CSS custom properties (`:root` tokens in `styles.css`) and Tailwind CSS v4 CDN for select browser layout utilities.
* **Color Palette**: Dark theme anchored around `--bg-primary: #09090b`, `--bg-surface: #121215`, and semantic accents (`--accent-blue`, `--accent-emerald`, `--accent-amber`, `--accent-rose`).
* **Typography**: Google Fonts loaded via CDN: `Inter` for interface typography and `JetBrains Mono` for tabular telemetry numbers and OTP tokens.
* **Styling Flaws**:
  * Massive overuse of inline `style="..."` attributes directly on HTML tags (over 150 instances across `dashboard.html`, `admin.html`, and `index.html`).
  * Duplicated layout rules between Tailwind classes and custom `styles.css` rules.
  * Inconsistent spacing primitives (mix of `rem`, `px`, and inline percentage margins).

---

## 12. Technical Debt Audit

1. **Duplicated Business & Rendering Logic**:
   * Workout pill selection logic is duplicated almost line-for-line in [dashboard.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/dashboard.js#L299-L316) and [check-in.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/check-in.js#L98-L115).
   * UTC date parsing helper `parseUTC()` is defined in [utils.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/utils.js#L77) and re-defined in [admin.js](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/js/admin.js#L481).
   * Landing page contains 130 lines of inline JavaScript in `index.html` for fetching occupancy rather than importing shared logic.

2. **Inline Styling Overload**:
   * Hundreds of elements specify layout width, font size, flexbox properties, and margins via inline `style=""` attributes. This will make Tailwind migration and component extraction challenging if not sanitized systematically.

3. **Global Scope Pollution**:
   * Lack of module bundling causes reliance on `window.SUPABASE_CLIENT`, `window.API_BASE_URL`, `window.SUPABASE_AUTH_READY`, `window.handleLogout`, `window.parseUTC`, `window.switchPlannerTab`, etc.

4. **Direct DOM Manipulation & InnerHTML String Building**:
   * Tables and analytics lists are constructed using standard string interpolation (e.g. `` `<tr><td>${s.full_name}</td></tr>` ``). This lacks XSS escaping safety for custom text inputs (like custom workout names) and causes full DOM node replacement on every refresh.

5. **External CDN Dependencies**:
   * Supabase JS, Tailwind CSS, Chart.js, QRCode.js, and Html5-QRCode are loaded directly from external CDNs (`cdn.jsdelivr.net`, `unpkg.com`, `cdnjs.cloudflare.com`). If an adblocker or network hiccup blocks CDN access, script execution halts (partially mitigated by inline try-catch blocks in `supabase-config.js`).

6. **Inconsistent Error & Empty States**:
   * Empty states in tables display plain text rows without visual iconography or call-to-action buttons.
   * API failures in `admin.js` catch errors and print `console.error()` without always providing user-visible toast notifications.

---

## 13. Redesign Constraints

### MUST PRESERVE (DO NOT ALTER)

* **Backend FastAPI Architecture & Endpoints**: All existing REST routes (`/api/occupancy`, `/api/check-in`, `/api/check-out`, `/api/active-session`, `/api/my-sessions`, `/api/profile`, `/api/analytics/*`, `/api/planner/*`, `/api/admin/*`, `/api/qr-tokens/*`) must remain untouched.
* **Database Schema & PostgreSQL Triggers**: Supabase tables (`profiles`, `gym_sessions`, `gym_config`, `qr_tokens`, `workout_plans`, `workout_templates`) and RLS policies must not be changed.
* **Authentication Behavior**: Supabase Google OAuth restricting access strictly to `@iiitdm.ac.in` domain emails must be preserved.
* **Role-Based Access Control**: Strict separation between Student (`role: 'student'`) and Admin (`role: 'admin'`) route authorization.
* **Anti-Screenshot QR Security**: Dynamic 7-minute QR token rotation and single-latest-token validation logic.
* **Core Business Rules**:
  * Max capacity limit enforcement (default 50).
  * 120-minute (2-hour) auto-checkout timeout.
  * Operating hours enforcement (Shift 1 & Shift 2 IST times).
  * Gym operational status toggle.
  * Duplicate check-in prevention.

### MAY CHANGE LATER (DURING REDESIGN PHASES)

* **Frontend Framework**: Migrate from static HTML/Vanilla JS files to React.js with modern component architecture.
* **Component System & Design Tokens**: Standardize colors, typography, glassmorphism cards, buttons, badges, tables, and modals into reusable React UI components.
* **Global Layout & Navigation**: Introduce unified sidebar/topbar layouts, responsive mobile navigation drawers, and improved page hierarchy.
* **Visual Styling & Micro-Interactions**: Modernize card elevation, status badges, progress bars, chart aesthetics, and loading skeletons.
* **Information Architecture**: Better grouping of telemetry metrics, actionable CTAs, and crowd forecast presentations.

---

## 14. Recommended Migration Strategy

When transitioning from Phase 0 to Phase 1 (React migration & Redesign), execute in ordered, non-breaking steps:

1. **Setup Modern React App Build Pipeline (Vite + React)**:
   * Initialize React frontend inside `frontend/` using Vite with React + TypeScript/JS.
   * Configure Tailwind CSS v4 locally via PostCSS/Vite plugin (removing CDN script tags).

2. **Establish Central API & Auth Provider**:
   * Port `supabase-config.js` and `utils.js` into React Context / Custom Hooks (`useAuth`, `useGymApi`).
   * Wrap application in an Auth Provider that manages user session, profile loading, and role routing.

3. **Build Atomic UI Design System First**:
   * Create foundational design token variables in `index.css`.
   * Implement base primitives: `Button`, `Card`, `Badge`, `Input`, `Table`, `Modal`, `Toast`, `SkeletonLoader`, `OccupancyGauge`.

4. **Migrate Page Features Incremental Feature-by-Feature**:
   * **Step A**: Landing Page (`Landing.jsx`) & Login Page (`Login.jsx`).
   * **Step B**: Student Dashboard (`StudentDashboard.jsx` + subcomponents: `CheckInPanel`, `ActiveSessionTimer`, `PlannerTabs`, `AttendanceHistory`).
   * **Step C**: Dynamic Entrance QR Landing (`QRCheckIn.jsx`).
   * **Step D**: Admin Command Center (`AdminDashboard.jsx` + modules: `ExecutiveOverview`, `AttendanceAudit`, `AnalyticsTrends`, `FacilityConfig`, `EntranceKioskQR`).

5. **Verification & Parity Audit**:
   * Test complete student and admin workflows against live FastAPI backend to ensure 100% functional equivalence before decommissioning legacy HTML files.

---

## 15. Risks

| Risk Area | Potential Impact | Mitigation Strategy |
| --------- | ---------------- | ------------------- |
| **OAuth Redirect Path Discrepancy** | Post-OAuth redirect lands on wrong page or fails token parsing in React Router. | Match exact redirect URLs (`/dashboard.html` -> `/dashboard` rewrite) in Supabase OAuth config. |
| **2-Hour Auto-Checkout Timer Drift** | React component unmounting could clear active session timer prematurely. | Move active session timer and 120-min auto-checkout check into a global state / React context level effect. |
| **Chart.js Re-render Leaks** | React component re-renders causing multiple Chart.js instances on same `<canvas>`. | Use `react-chartjs-2` or destroy existing Chart instance cleanly in `useEffect` cleanup return. |
| **QR Code Scanner Camera Permissions** | `html5-qrcode` library failing to release camera hardware on unmount. | Call `html5QrCodeScanner.stop()` cleanly inside React component cleanup hooks (`useEffect` return). |
| **Timezone Parsing Issues (IST vs UTC)** | Datetime formatting mismatch for session check-ins or operating shift times. | Preserve existing `parseUTC()` helper and explicit IST (+5:30) offset calculations. |

---

## 16. Phase 0 Completion Checklist

- [x] Repository inspected completely (`frontend/`, `backend/`, `supabase/`, configs)
- [x] Every frontend page identified and documented in Page Inventory
- [x] Every major API dependency mapped with HTTP method, params, response & refresh behavior
- [x] Authentication flow fully documented from OAuth button to backend JWT validation
- [x] Student workflow documented from login to attendance history and crowd forecast
- [x] Admin workflow documented across all 5 command modules
- [x] Loading states documented for every major component
- [x] Empty states documented for tables, charts, and forecasts
- [x] Error states documented for network, auth, QR, and backend validation failures
- [x] Special states documented (Gym closed, full capacity, active session, 2-hr timeout, QR expiry)
- [x] Responsive behavior and mobile breakpoints audited
- [x] Existing reusable UI components and primitive patterns identified
- [x] Styling architecture and design tokens documented
- [x] Technical debt and code duplication audited
- [x] Migration strategy and risks evaluated
- [x] Redesign constraints (MUST PRESERVE vs MAY CHANGE LATER) explicitly specified
- [x] `FRONTEND_AUDIT.md` created in repository root

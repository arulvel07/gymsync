# GymSync - Smart Campus Gym Management System

[![Frontend Framework](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite%206-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Backend Framework](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Database & Auth](https://img.shields.io/badge/Database-Supabase%20(PostgreSQL)-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-000000?logo=vercel&logoColor=white)](https://vercel.com)

A full-stack, enterprise-grade web application built for IIITDM Kancheepuram to manage campus gym operations in real-time. GymSync provides live occupancy tracking, anti-screenshot dynamic QR check-ins, automated operating hours enforcement, 2-hour idle auto-checkouts, workout analytics, weekly planner & crowd forecasting, and an admin control suite.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Directory Structure](#project-directory-structure)
- [Database Schema & Policies](#database-schema--policies)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Supabase Setup](#1-supabase-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Deployment Guide](#deployment-guide)
- [Environment Variables](#environment-variables)
- [Security & Automation Features](#security--automation-features)
- [Contributing](#contributing)

---

## Overview

GymSync addresses traditional campus gym operational challenges (paper registers, overcrowding, lack of data analytics, and fraudulent attendance) with a modern digital platform.

### Operational Challenges Solved:
- **No Visibility**: Students used to walk to the gym without knowing if it was at peak capacity.
- **Manual Registers**: Paper sign-ins are prone to proxy attendance, slow down entry, and offer zero actionable insights.
- **Capacity Violations**: Admins had no automated tool to limit concurrent entries or manage operating hours.
- **Lack of Planning**: Students could not predict peak hours or align workouts with lower crowd density.

### How GymSync Solves It:
1. **Public Occupancy Hub**: Real-time headcount ring & capacity badge visible to all students without requiring login.
2. **Dynamic Anti-Screenshot QR Entry**: Rotating entrance QR tokens with automated invalidation prevent proxy check-ins via screenshot sharing.
3. **Student Portal**: QR scanner integration (camera & manual OTP fallback), active session management with 120-minute auto-checkout, attendance logs, and workout analytics.
4. **Workout Planner & Crowd Forecast**: AI-inspired crowd prediction combining user-scheduled workout plans, weekly recurring templates, and historical 30-day attendance trends.
5. **Admin Control Suite**: Real-time rotating QR entrance display, user lookup, live session monitoring, gym config overrides (hours, capacity, open state), monthly metrics, and CSV exports.

---

## Key Features

### 🌐 Public Landing Page (`/`)
| Feature | Description |
|---------|-------------|
| **Live Occupancy Ring** | Animated SVG capacity indicator comparing current live headcount vs max capacity limit |
| **Gym Status Badge** | Real-time status indicator showing whether the gym is Open, Closed (Outside Hours), or Closed by Admin |
| **Workout Split Chart** | Interactive Chart.js donut/bar visualization breaking down active member workout types |
| **Auto Refresh** | Background polling engine keeping occupancy data fresh every 30 seconds |

### 🔑 Authentication (`/login`)
| Feature | Description |
|---------|-------------|
| **Single-Click Google OAuth** | Instant sign-in integrated via Supabase Auth |
| **Domain Restriction** | Restricted exclusively to institutional emails (`@iiitdm.ac.in`) |
| **Global Auth Context** | React `AuthProvider` managing session state, role validation (`student` vs `admin`), and auto-redirects |

### 🏋️ Student Dashboard (`/dashboard` & `/check-in`)
| Feature | Description |
|---------|-------------|
| **QR Check-In** | Web camera QR code scanner powered by `html5-qrcode` |
| **Manual OTP Fallback** | 12-character token manual entry for devices without camera permissions |
| **Active Session Card** | Real-time session elapsed timer, selected workout type, and instant Check-Out button |
| **2-Hour Auto-Checkout** | Automated client & server idle timeout closing sessions over 120 minutes |
| **Session History** | Paginated table of past gym sessions with duration, date/time, and workout category |
| **Analytics & Heatmaps** | Chart.js visual analytics showing peak hours heatmap and daily attendance trends |

### 📅 Workout Planner & Crowd Forecast (`/planner`)
| Feature | Description |
|---------|-------------|
| **Custom Date Planner** | Schedule future workout types and target hourly time slots |
| **Weekly Recurring Templates** | Configure default weekly workout routines (e.g., Push every Monday at 17:00 IST) |
| **Crowd Forecast Engine** | Predictive hourly crowd density calculation combining user schedules with 30-day historical averages |

### 🛡️ Admin Control Suite (`/admin`)
| Feature | Description |
|---------|-------------|
| **Live Entrance QR Display** | Dedicated full-screen auto-rotating QR display for gym entrance hardware |
| **Instant Rotation** | Manual refresh button invalidating current QR and issuing a fresh single-use token |
| **User Directory** | Searchable student database by name or institutional roll number |
| **Session Operations** | Real-time monitoring of active and historical sessions with filter controls |
| **Facility Configuration** | Dynamic adjustment of max capacity, opening hours, closing hours, and emergency open/close override |
| **Monthly Reports & CSV** | Comprehensive monthly operational metrics with one-click CSV export |

### 🎨 Design System Preview (`/design-system`)
| Feature | Description |
|---------|-------------|
| **Component Gallery** | Live interactive showcase of design tokens, color scales, buttons, badges, modals, toasts, and card layouts |

---

## Tech Stack

### Frontend Architecture
- **Core Framework**: [React 19](https://react.dev) with [TypeScript 5.7](https://www.typescriptlang.org/)
- **Build Tool & Dev Server**: [Vite 6.1](https://vitejs.dev) with optimized Rollup code splitting
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (`@tailwindcss/vite`) + Custom CSS Design System Tokens
- **Routing**: [React Router v7](https://reactrouter.com) (`react-router-dom`) with `React.lazy()` route splitting & `Suspense`
- **Icons**: [Lucide React](https://lucide.dev)
- **Data Visualization**: [Chart.js 4](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **QR Utilities**: `html5-qrcode` (camera scanning) & `qrcode` (token generation)
- **Authentication Client**: `@supabase/supabase-js` (v2.49)

### Backend Architecture
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (v0.115) on Python 3.11
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/) (v0.34)
- **Database & Auth SDK**: [Supabase Python Client](https://github.com/supabase-community/supabase-py) (v2.11)
- **Security & Validation**: Pydantic v2, `python-jose` (JWT verification), `pydantic-settings`
- **HTTP Client**: `httpx` (v0.28)

### Database & Authentication
- **Database Engine**: [Supabase PostgreSQL](https://supabase.com)
- **Security**: Row Level Security (RLS) policies, PostgreSQL Triggers & Stored Procedures
- **Authentication**: Supabase Auth (Google OAuth with `hd` domain constraint)

### Infrastructure & Deployment
- **Frontend Hosting**: [Vercel](https://vercel.com) (Static SPA bundle with custom single-page rewrites & security headers)
- **Backend Hosting**: [Render](https://render.com) (Containerized Docker deployment running Python 3.11)

---

## System Architecture

```
                          BROWSER / CLIENT (React 19 SPA)
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                                                                         │
   │  ┌───────────────┐   ┌──────────────────┐   ┌────────────────────────┐  │
   │  │  Landing Page │   │ Student Dashboard│   │ Admin Control Panel    │  │
   │  │  (Public /)   │   │  (/dashboard)    │   │      (/admin)          │  │
   │  └───────┬───────┘   └────────┬─────────┘   └───────────┬────────────┘  │
   │          │                    │                         │               │
   │   Live Occupancy        QR Camera Scanner        Entrance QR Display    │
   │   Polling (30s)         (html5-qrcode)           (qrcode generator)     │
   │          │                    │                         │               │
   └──────────┼────────────────────┼─────────────────────────┼───────────────┘
              │                    │                         │
              ▼                    ▼                         ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                        FastAPI REST API (Render)                        │
   │                                                                         │
   │  • Router Handlers: /api/attendance, /api/analytics, /api/planner...   │
   │  • Middleware: JWT Bearer Token Verification & Admin Role Checks        │
   │  • Engines: 120-Min Auto-Checkout Engine, IST Operating Hours Checker   │
   │  • Anti-Screenshot QR Token Validation Logic                             │
   └────────────────────────────────────┬────────────────────────────────────┘
                                        │
                                        ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                     Supabase Cloud (PostgreSQL DB & Auth)               │
   │                                                                         │
   │  • Auth: Google OAuth (@iiitdm.ac.in constraint)                        │
   │  • Row Level Security (RLS) & DB Triggers (handle_new_user)             │
   │  • Stored Procedures: get_current_occupancy(), get_workout_dist()...    │
   │  • Core Tables: profiles, gym_sessions, gym_config, qr_tokens...        │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Directory Structure

```
gymsync/
├── backend/                             # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py                      # Application entry point, CORS, router mounting
│   │   ├── config.py                    # Environment settings validation
│   │   ├── database.py                  # Supabase client instantiation
│   │   ├── auth.py                      # JWT decoding & role-based middleware
│   │   ├── models.py                    # Pydantic schemas
│   │   └── routes/                      # API Endpoints
│   │       ├── attendance.py            # Check-in, check-out, active session, occupancy
│   │       ├── analytics.py             # Peak hours, daily stats, workout distribution
│   │       ├── admin.py                 # User management, config update, reports, QR tokens
│   │       └── planner.py               # Workout schedules, templates, crowd forecast
│   ├── .env.example                     # Backend env template
│   ├── Dockerfile                       # Production container setup
│   ├── render.yaml                      # Render deployment specification
│   └── requirements.txt                 # Python dependencies
│
├── frontend/                            # React 19 + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── app/                         # Application Core & Routing
│   │   │   ├── App.tsx                  # Root component with Providers
│   │   │   ├── layouts/                 # Page Layout Wrappers (Public, Student, Admin)
│   │   │   ├── providers/               # Context Providers (AuthProvider)
│   │   │   └── router/                  # React Router setup & ProtectedRoute guards
│   │   ├── components/                  # UI & Feature Components
│   │   │   ├── charts/                  # Chart.js wrapper components
│   │   │   ├── layout/                  # Navbar, Footer, Loading Fallbacks
│   │   │   ├── navigation/              # Admin Sidebar & TopNav
│   │   │   └── ui/                      # Reusable UI elements (Button, Card, Modal, Toast)
│   │   ├── hooks/                       # Custom React Hooks
│   │   ├── lib/                         # Core Utilities & Supabase Client
│   │   ├── pages/                       # Route Pages (Landing, Login, Student, Admin, etc.)
│   │   ├── services/                    # API Service Integration Layer
│   │   ├── styles/                      # Global Styles & Design System Tokens (CSS)
│   │   └── types/                       # TypeScript Interface Definitions
│   ├── .env.example                     # Frontend env template
│   ├── index.html                       # HTML Entry Point
│   ├── package.json                     # Node.js dependencies & scripts
│   ├── tsconfig.json                    # TypeScript Configuration
│   ├── vercel.json                      # Vercel SPA rewrite & security configuration
│   └── vite.config.ts                   # Vite build & alias configuration
│
├── supabase/
│   └── schema.sql                       # Database migrations, schema, RLS, functions
├── vercel.json                          # Root Vercel deployment configuration
├── DESIGN_SYSTEM.md                     # Visual design system specifications
└── README.md                            # Comprehensive project documentation
```

---

## Database Schema & Policies

The relational database is built on Supabase PostgreSQL. Full schema script is maintained at [`supabase/schema.sql`](supabase/schema.sql).

### Key Tables Overview

#### `profiles`
Created automatically via database trigger upon user authentication.
- `id` (`UUID`, PK, FK -> `auth.users.id`)
- `full_name` (`TEXT`)
- `roll_number` (`TEXT`, Unique)
- `role` (`TEXT`, default `'student'`, allowed: `'student'`, `'admin'`)
- `created_at` (`TIMESTAMPTZ`)

#### `gym_sessions`
Tracks individual student gym visits.
- `id` (`UUID`, PK)
- `user_id` (`UUID`, FK -> `profiles.id`)
- `check_in` (`TIMESTAMPTZ`)
- `check_out` (`TIMESTAMPTZ`, Nullable — NULL represents an active session)
- `workout_type` (`TEXT`)
- `duration_minutes` (`INT`, Nullable)

#### `gym_config`
Single-row configuration state (`id = 1`).
- `max_capacity` (`INT`, default 50)
- `open_time` (`TIME`, default `06:00` IST)
- `close_time` (`TIME`, default `22:00` IST)
- `is_open` (`BOOLEAN`, default `true`)

#### `qr_tokens`
Stores the currently active entrance QR token.
- `id` (`UUID`, PK)
- `token` (`TEXT`, 12-char hex string)
- `created_at` (`TIMESTAMPTZ`)
- `expires_at` (`TIMESTAMPTZ`)

#### `workout_plans` & `workout_templates`
User workout schedules and recurring weekly templates used for crowd forecasting.

---

## API Reference

FastAPI automatically serves interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Public Endpoints
- `GET /` — System health check
- `GET /health` — Detailed status check including Supabase DB latency
- `GET /api/occupancy` — Live headcount, capacity, open status, workout distribution, and triggers auto-checkout
- `GET /api/qr-tokens/validate?token={token}` — Validates entrance QR token

### Student Endpoints (Requires Bearer JWT)
- `POST /api/check-in` — Check in with `workout_type` and `qr_token`
- `POST /api/check-out` — Check out of active session
- `GET /api/active-session` — Retrieves active session state for current user
- `GET /api/my-sessions` — User session history with pagination (`limit`, `offset`)
- `GET /api/profile` — User profile details
- `GET /api/analytics/*` — Peak hours, daily stats, and personal workout summaries
- `GET /api/planner/*` — Manage workout schedules, templates, and check crowd forecasts

### Admin Endpoints (Requires Admin Bearer JWT)
- `GET /api/admin/users` — List and search student directory
- `GET /api/admin/all-sessions` — Filter and view all system sessions
- `GET /api/admin/config` & `PUT /api/admin/config` — View and update gym operational parameters
- `GET /api/admin/reports/monthly` — Operational monthly report generation

---

## Getting Started

### Prerequisites
- **Node.js**: `v18+` and `npm`
- **Python**: `v3.11+`
- **Supabase Account**: Free tier hosted project or local CLI instance

---

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor in Supabase and execute the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Navigate to **Authentication > Providers** and enable **Google OAuth**.
   - Configure Google Cloud OAuth Credentials.
   - Set Authorized Redirect URI to your Supabase Auth callback URL.
4. Retrieve project keys from **Project Settings > API**:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (`service_role` key — kept secure in backend environment)
   - `SUPABASE_ANON_KEY` (public client key)
   - `SUPABASE_JWT_SECRET`
5. To grant admin access to a user in SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE roll_number = 'YOUR_ROLL_NUMBER';
   ```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Configure .env with your Supabase credentials:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# SUPABASE_JWT_SECRET=...
# FRONTEND_URL=http://localhost:3000

# Start Uvicorn development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will run at `http://localhost:8000`.

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Create environment configuration
cp .env.example .env

# Configure .env:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
# VITE_API_BASE_URL=http://localhost:8000

# Start Vite development server
npm run dev
```
Frontend React app will open at `http://localhost:3000`.

To build the production distribution bundle:
```bash
npm run build
npm run preview
```

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. The root [`vercel.json`](file:///c:/Users/moodm/Documents/gymsync/vercel.json) configures build commands automatically:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Rewrite Rules**: SPA catch-all rewrite to `/index.html`
3. Add Environment Variables in Vercel settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL`

### Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) and connect the repo.
2. Set **Root Directory** to `backend`.
3. Select **Docker** environment (Render will read `backend/Dockerfile`).
4. Set Environment Variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_JWT_SECRET`
   - `FRONTEND_URL` (Production Vercel URL)
   - `PORT=10000`

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase Project Endpoint |
| `SUPABASE_KEY` | Yes | Supabase `service_role` key (Bypasses RLS for admin tasks) |
| `SUPABASE_JWT_SECRET` | Yes | JWT secret used to decode and verify user tokens |
| `FRONTEND_URL` | No | CORS allowed origin (Default: `http://localhost:3000`) |
| `PORT` | No | Uvicorn server port (Default: `8000`) |

### Frontend (`frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase Project Endpoint |
| `VITE_SUPABASE_ANON_KEY` | Yes | Public anonymous key for client side Supabase SDK |
| `VITE_API_BASE_URL` | Yes | Backend FastAPI endpoint base URL |

> [!CAUTION]
> Never expose the Supabase `service_role` key in frontend environment variables. It bypasses Row Level Security.

---

## Security & Automation Features

1. **Anti-Screenshot Dynamic QR Code**:
   - The backend validates check-ins exclusively against the latest token stored in `qr_tokens`.
   - Rotating or regenerating the QR token immediately invalidates all prior screenshots.
2. **2-Hour Auto-Checkout Engine**:
   - Client-side countdown timer flags sessions reaching 120 minutes.
   - Every `/api/occupancy` call automatically scans and checks out any active session exceeding 120 minutes.
3. **Automated Operating Hours Enforcement**:
   - System automatically blocks check-ins outside configured facility open/close hours (e.g., 06:00 to 22:00 IST).
   - Past closing time, active sessions are force-closed and entrance QR generation is suspended.
4. **Domain-Restricted OAuth**:
   - Institutional authentication restricted to `@iiitdm.ac.in` email addresses via OAuth parameters and backend checks.

---

## Contributing

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

---

Built with ❤️ for **IIITDM Kancheepuram**

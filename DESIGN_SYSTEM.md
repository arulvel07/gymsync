# GymSync Design System & Visual Foundation

This document defines the official visual design system, technical tokens, and component guidelines for the **GymSync** campus gym management system.

---

## 1. DESIGN GOAL & PHILOSOPHY

> **Create a restrained, coherent design system that makes GymSync feel like a real operational product intentionally built for a campus gym.**

GymSync is:

**Operational software + fitness utility + campus tool**

It is **NOT** a generic AI-generated dark mode template with rainbow cards, excessive rounded corners, glowing text, and empty buzzwords.

---

## 2. DESIGN PRINCIPLES

### Principle 1 — Hierarchy Over Decoration
Important information must visually dominate. Metric values and operational status take precedence over supporting metadata. Avoid assigning equal visual weight to every element.

### Principle 2 — Fewer Cards
Do not wrap every metric or sentence inside an isolated card. Prefer open layouts, structured sections, subtle dividers, inline metrics, and tables. Use cards exclusively for distinct grouped operational contexts.

### Principle 3 — Semantic Color
Colors communicate precise status and function:
* **Green (`#10b981` / `#34d399`)**: Active sessions, gym open, light traffic, operationally normal
* **Blue (`#3b82f6` / `#60a5fa`)**: Primary actions, navigation, information focus
* **Orange/Amber (`#f59e0b` / `#fbbf24`)**: Moderate traffic, warnings, peak periods
* **Red (`#ef4444` / `#f87171`)**: Gym closed, full capacity, errors, high traffic, expired sessions
* **Neutral (`#a1a1aa` / `#71717a`)**: Secondary metadata, inactive states, supporting text

### Principle 4 — Restraint
Avoid rainbow-colored metric cards, excessive glow/gradients, high border radii, and non-stop pulsing effects. GymSync must remain calm, technical, and trustworthy.

### Principle 5 — Human Copy
Avoid AI buzzwords. Use grounded operational terms:
* Use **Gym Overview** instead of *Executive Command Center*
* Use **Gym Insights** instead of *Analytics & Telemetry Metrics*
* Use **Operations** instead of *Telemetry & Control*
* Use **Attendance** instead of *Attendance Register & Audit Logs*
* Use **Gym Entrance** instead of *Dynamic Entrance QR Check-In*

---

## 3. COLOR TOKENS

Centralized CSS variables defined in [tokens.css](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/styles/tokens.css):

```css
:root {
  /* Surface Scale */
  --color-background: #09090b;       /* Near-black base */
  --color-surface: #121215;          /* Neutral dark surface */
  --color-surface-hover: #18181c;    /* Hover interaction state */
  --color-surface-elevated: #1f1f24; /* Dialogs & dropdowns */

  /* Border Scale */
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-hover: rgba(255, 255, 255, 0.16);
  --color-border-focus: rgba(59, 130, 246, 0.5);

  /* Text Scale */
  --color-text-primary: #fafafa;   /* High contrast primary text */
  --color-text-secondary: #a1a1aa; /* Secondary body & descriptions */
  --color-text-muted: #71717a;     /* Metadata & uppercase labels */

  /* Accents & Actions */
  --color-accent: #3b82f6;        /* Primary action blue */
  --color-accent-hover: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;
}
```

---

## 4. TYPOGRAPHY SYSTEM

Fonts:
* **Primary (Sans)**: `Inter`, system-ui, -apple-system, sans-serif
* **Telemetry & Monospace**: `JetBrains Mono`, `Fira Code`, monospace

Scale & Utility Classes:

| Token / Class | Size / Line-Height | Font Weight | Usage |
| ------------- | ------------------ | ----------- | ----- |
| `.text-display` | 36px / 40px | 700 (Bold) | Major hero headings |
| `.text-h1` | 28px / 32px | 700 (Bold) | Main page titles |
| `.text-h2` | 20px / 26px | 600 (Semibold) | Section headers |
| `.text-h3` | 16px / 22px | 600 (Semibold) | Card titles, block headers |
| `.text-body` | 14px / 20px | 400 (Regular) | Standard body copy |
| `.text-body-small` | 12px / 16px | 400 (Regular) | Secondary descriptions, captions |
| `.text-label` | 12px / 16px | 600 (Semibold, Uppercase) | Eyebrow titles, form field labels |
| `.text-caption` | 11px / 14px | 400 (Regular) | Timestamps, supporting details |
| `.text-metric` | 32px / 36px | 700 (Bold, Mono) | Occupancy counts, duration numbers |

---

## 5. SPACING SYSTEM

Fixed predictable scale based on a 4px grid:

| Variable | Value | Usage |
| -------- | ----- | ----- |
| `--space-1` | 4px | Micro padding, indicator gaps |
| `--space-2` | 8px | Button item gaps, input padding |
| `--space-3` | 12px | Compact container padding, list gaps |
| `--space-4` | 16px | Standard component padding, grid gaps |
| `--space-5` | 20px | Card internal padding |
| `--space-6` | 24px | Section gaps, header spacing |
| `--space-8` | 32px | Major section margins |
| `--space-10` | 40px | Page container margins |
| `--space-12` | 48px | Outer page vertical padding |

---

## 6. BORDER RADIUS SYSTEM

* `--radius-sm`: `8px` (Inputs, buttons, form controls)
* `--radius-md`: `12px` (Cards, dropdowns, table containers)
* `--radius-lg`: `16px` (Feature panels, modals, kiosk widgets)
* `--radius-xl`: `20px` (Large status panels, kiosk hero frames, dialog overlays)
* `--radius-full`: `9999px` (Badges, status indicators, pill toggles)

---

## 7. SHADOW SYSTEM

* `--shadow-none`: `none`
* `--shadow-sm`: `0 1px 3px rgba(0, 0, 0, 0.35)` (Buttons, subtle interactive elements)
* `--shadow-md`: `0 4px 16px rgba(0, 0, 0, 0.45)` (Standard cards, dropdowns)
* `--shadow-lg`: `0 12px 36px rgba(0, 0, 0, 0.65)` (Modals, floating toasts, kiosk overlays)

---

## 8. BUTTON SYSTEM

Component: [Button.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Button.tsx)

Variants:
* `primary`: Blue solid (`bg-blue-600`), main actions (e.g. Check In)
* `secondary`: Dark neutral (`bg-[#121215]`), standard actions (e.g. Filter, Cancel)
* `ghost`: Transparent (`hover:bg-white/5`), navigation, tertiary controls
* `danger`: Red solid (`bg-red-600`), destructive actions (e.g. End Session, Delete)
* `success`: Emerald solid (`bg-emerald-600`), affirmative confirmations

Sizes:
* `sm`: 32px height, 12px font
* `md`: 40px height, 14px font
* `lg`: 48px height, 16px font

States: Default, Hover, Active, Focus Ring (`focus-visible:ring-2 focus-visible:ring-blue-500`), Disabled, Loading (Spinner).

---

## 9. INPUT SYSTEM

Components:
* [Input.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Input.tsx)
* [Select.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Select.tsx)
* [SearchInput.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/SearchInput.tsx)
* [DateInput.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/DateInput.tsx)
* [Textarea.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Textarea.tsx)
* [Checkbox.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Checkbox.tsx)
* [Radio.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Radio.tsx)
* [Toggle.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Toggle.tsx)

All form elements share:
* Surface background (`#121215`)
* Subtle border (`rgba(255,255,255,0.1)`)
* Blue focus ring (`focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`)
* Standard uppercase label treatment (`.text-label`)
* Error text in red (`#f87171`)
* Accessible helper text

---

## 10. CARD SYSTEM

Components: [Card.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Card.tsx) (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).

Usage Guidelines:
* **USE CARDS FOR**: Feature panels, key operational widgets (Occupancy Gauge, Active Workout focus), Modal containers.
* **DO NOT USE CARDS FOR**: Every individual line item, every single metric number, or simple list rows.

---

## 11. BADGES & STATUS INDICATORS

Components:
* [Badge.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Badge.tsx)
* [StatusBadge.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/StatusBadge.tsx)
* [StatusIndicator.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/StatusIndicator.tsx)

Status mappings:
* `OPEN` / `ACTIVE` / `LIGHT TRAFFIC`: Green badge + dot indicator
* `MODERATE TRAFFIC` / `WARNING`: Amber badge + dot indicator
* `CLOSED` / `FULL` / `EXPIRED` / `HIGH TRAFFIC`: Red badge + dot indicator
* `INFO`: Blue badge + dot indicator

---

## 12. TABLE SYSTEM

Component: [Table.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Table.tsx) (`Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`).

Features:
* Dark header with uppercase column labels (`#71717a`)
* Row hover transition (`hover:bg-[#18181c]`)
* Selected row highlight (`bg-blue-500/10`)
* Responsive horizontal overflow container wrapper

---

## 13. MODAL & DIALOG SYSTEM

Component: [Modal.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Modal.tsx)

Features:
* Dark semi-transparent backdrop blur (`bg-black/80 backdrop-blur-sm`)
* Escape key listener (`closeOnEscape={true}`)
* Overlay click dismiss (`closeOnOverlayClick={true}`)
* Accessible dialog attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)

---

## 14. TOAST SYSTEM

Component: [Toast.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Toast.tsx)

Variants: `success`, `error`, `warning`, `info`.

Guidelines:
* Short, human readable text (e.g., "Checked in successfully.")
* Auto-dismiss after 4 seconds
* Accessible announcements (`aria-live="polite"`, `role="status"`)

---

## 15. LOADING & SKELETON SYSTEM

Components:
* [Skeleton.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Skeleton.tsx) (`Skeleton`, `SkeletonText`, `SkeletonCard`, `SkeletonTable`)
* [Spinner.tsx](file:///c:/Users/DHARMENDRA%20R/Desktop/gymsync/frontend/src/components/ui/Spinner.tsx) (`Spinner`, `PageLoader`)

Prefer content skeleton placeholders over full-screen spinners for section updates.

---

## 16. MOTION & ANIMATION SYSTEM

Timing tokens:
* Fast: `150ms` (`--motion-fast`) - Buttons, hover states, toggles
* Normal: `250ms` (`--motion-normal`) - Dropdowns, status badge transitions
* Slow: `350ms` (`--motion-slow`) - Modals, occupancy gauge sweep

Animations must remain calm and non-intrusive. Never animate cards continuously.

---

## 17. ANTI-AI DESIGN CHECKLIST

* [x] No rainbow metric cards
* [x] No excessive glassmorphism or neon text shadows
* [x] No emoji icons in buttons or headers
* [x] No AI buzzwords in labels or headers
* [x] No hardcoded pixel margins scattered in JSX
* [x] No unhandled focus states for keyboard users

Summary about the project rn
# 📖 SahyogSeva (सहयोग सेवा) — Complete Project Documentation & Master Summary

---

## 📑 Table of Contents
1. [Executive Summary & Project Vision](#1-executive-summary--project-vision)
2. [Complete System Architecture](#2-complete-system-architecture)
3. [Standardized Error Code System](#3-standardized-error-code-system)
4. [Audit Logging & Troubleshooting Engine](#4-audit-logging--troubleshooting-engine)
5. [Database Schema & Supabase Dual-Layer Layer](#5-database-schema--supabase-dual-layer-layer)
6. [Role-Based Workflows & Implemented Features](#6-role-based-workflows--implemented-features)
7. [UI/UX Evolution & Reference Design Implementations](#7-uiux-evolution--reference-design-implementations)
8. [Internationalization & Localization (English / Hindi)](#8-internationalization--localization-english--hindi)
9. [Git Setup, Repository History & Backups](#9-git-setup-repository-history--backups)
10. [Team Task Division & Parallel Work Blueprint](#10-team-task-division--parallel-work-blueprint)

---

## 1. Executive Summary & Project Vision

**SahyogSeva (सहयोग सेवा)** is a cooperative gig-services booking web application prototype built for informal skilled artisans (electricians, wiremen, technicians). 

### The Core Problem Solved:
- **Zero Intermediary Commissions**: Existing gig platforms extract 20%–30% of worker earnings. SahyogSeva is designed as a direct worker-owned cooperative protocol with zero brokerage.
- **Fair Cooperative Tariffs**: Fixed, transparent pricing (e.g. ₹249–₹399/hr) with no hidden fees or surge pricing.
- **Escrow Payout Guarantee**: Customer funds are securely held in cooperative escrow and released immediately upon satisfactory service completion.
- **Background & Skill Verification**: Every artisan is verified through state cooperative federations (e.g., *Delhi Vidyut Sahyog*, *Shramik Shakti Sangathan*, *Noida Shramik Ekta Manch*).

---

## 2. Complete System Architecture

The codebase follows a **strictly decoupled, plug-and-play modular architecture**. Every functional module in `/src/modules/` can be independently routed, edited, or removed without breaking any other part of the platform.

```
d:/Smart India Hackathon/
├── package.json                    # Project dependencies & Vite scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── tailwind.config.js              # Theme colors, fonts & extensions
├── vite.config.ts                  # Vite bundler configuration
├── schema.sql                      # PostgreSQL database schema for Supabase
├── .gitignore                      # Git ignore rules
├── README.md                       # Repository master documentation
├── public/
│   └── assets/logos/               # Official SahyogSeva logos
│       ├── logo-square.png         # Circular emblem logo
│       ├── logo-en.png             # English logo with tagline
│       └── logo-hi.png             # Hindi logo with tagline
└── src/
    ├── main.tsx                    # React DOM root entry point
    ├── App.tsx                     # Main layout & modular route switcher
    ├── index.css                   # Tailwind directives & custom scrollbars
    ├── vite-env.d.ts               # Environment variable typings
    ├── shared/                     # Global reusable foundation
    │   ├── constants/
    │   │   └── error-codes.ts      # Standard error code specification
    │   ├── types/
    │   │   └── index.ts            # TypeScript domain schemas
    │   ├── i18n/
    │   │   ├── i18n.ts             # react-i18next configuration
    │   │   ├── en.json             # English localization dictionary
    │   │   └── hi.json             # Hindi localization dictionary
    │   ├── services/
    │   │   ├── supabase.ts         # Supabase client setup
    │   │   ├── database.ts         # Dual-layer hybrid data provider
    │   │   └── logger.ts           # Audit logging service with IP detection
    │   ├── data/
    │   │   └── seed-data.ts        # 6 verified electricians, demo bookings, logs
    │   └── components/
    │       ├── Navbar.tsx          # Responsive navbar with logo & hamburger
    │       ├── BottomNav.tsx       # Mobile bottom navigation bar
    │       ├── Footer.tsx          # Comprehensive dark navy footer
    │       ├── Toast.tsx           # Standardized toast provider
    │       ├── Modal.tsx           # Wide responsive modal wrapper
    │       ├── Badge.tsx           # Status, Verified & Role badges
    │       └── StarRating.tsx      # Interactive & display star ratings
    └── modules/
        ├── auth/                   # Authentication & role management
        │   ├── AuthContext.tsx     # Session state & role switcher
        │   ├── LoginModal.tsx      # Quick 1-click profiles & login form
        │   └── index.ts
        ├── booking/                # Customer booking & catalog
        │   ├── HeroSection.tsx     # Personalized 'Namaste' greeting banner
        │   ├── EmergencySOSBanner.tsx # 30-min urgent dispatch banner
        │   ├── HowItWorksSection.tsx  # 3-step guide & trust metrics
        │   ├── WorkerList.tsx      # Electrician directory with live search
        │   ├── WorkerDetailModal.tsx # Wide profile modal with sorting tabs
        │   ├── BookingWizard.tsx   # Slot scheduler with conflict checks
        │   ├── PaymentConfirmModal.tsx # Mock escrow payment receipt
        │   ├── MyBookings.tsx      # Booking tracker & status timeline
        │   ├── ReviewModal.tsx     # 1-5 star review submission dialog
        │   └── index.ts
        ├── worker-profile/         # Artisan self-service dashboard
        │   ├── WorkerDashboard.tsx # Active job queue (Accept / Complete)
        │   ├── WorkerProfileForm.tsx # Edit credentials, skill, area, tariff
        │   └── index.ts
        ├── admin-dashboard/        # Administrative portal
        │   ├── AdminDashboard.tsx  # Master tables for workers & bookings
        │   └── index.ts
        ├── demand-forecast/        # Predictive analytics
        │   ├── DemandForecast.tsx  # Recharts next-week area demand chart
        │   └── index.ts
        ├── logging/                # Troubleshooting & audit
        │   ├── LogsViewer.tsx      # Audit log viewer with filters
        │   └── index.ts
        └── settings/               # User settings & helpdesk
            ├── SettingsPage.tsx    # Address book, security, support tickets
            └── index.ts
```

---

## 3. Standardized Error Code System

All form validations, API interactions, authentication checks, and database mutations resolve to explicit, standardized error codes defined in [`src/shared/constants/error-codes.ts`](file:///d:/Smart%20India%20Hackathon/src/shared/constants/error-codes.ts).

### Error Code Specification:

| Code | Constant Identifier | Trigger Condition | Standard UI Notification |
|---|---|---|---|
| **`101`** | `INVALID_CREDENTIALS` | Incorrect username/password during sign-in | `ERROR 101: Invalid credentials. Please check your login details.` |
| **`102`** | `INVALID_PHONE_NUMBER` | Phone number is not a valid 10-digit mobile | `ERROR 102: Invalid phone number. Must be a valid 10-digit mobile number.` |
| **`400`** | `BAD_REQUEST` | Missing service address, missing review text | `ERROR 400: Bad request. Required fields are missing or invalid.` |
| **`401`** | `UNAUTHORIZED` | Performing restricted action without permissions | `ERROR 401: Unauthorized. Please sign in to perform this action.` |
| **`404`** | `NOT_FOUND` | Worker ID or Booking ID not found in records | `ERROR 404: Resource not found in cooperative records.` |
| **`409`** | `CONFLICT` | Double-booking the same artisan on the same slot | `ERROR 409: Conflict detected. Selected time slot is already booked.` |
| **`500`** | `SERVER_ERROR` | Database failure or unexpected runtime crash | `ERROR 500: Internal server or database error. Please try again later.` |

Every error renders through the global [`ToastProvider`](file:///d:/Smart%20India%20Hackathon/src/shared/components/Toast.tsx) with colored status indicators and error code badges.

---

## 4. Audit Logging & Troubleshooting Engine

To ensure transparency and rapid troubleshooting, every critical platform action creates an immutable log entry in the `logs` table via [`src/shared/services/logger.ts`](file:///d:/Smart%20India%20Hackathon/src/shared/services/logger.ts).

### Log Entry Structure:
- `id`: Unique UUID/identifier
- `timestamp`: UTC timestamp
- `user_id`: Authenticated user ID (or `null` for guest)
- `phone`: Mobile number associated with the event
- `action`: Action category (e.g. `LOGIN_SUCCESS`, `BOOKING_CREATED`, `BOOKING_STATUS_CHANGE`, `PAYMENT_MOCK_SUCCESS`, `REVIEW_SUBMITTED`, `ERROR_<ACTION>`)
- `route`: Client-side route where the action occurred
- `ip_address`: Best-effort client IP detection with fallback
- `result_code`: Numeric HTTP / Error Code (e.g. `200`, `201`, `102`, `409`, `500`)
- `details`: Human-readable description

### Admin Audit Logs Screen:
The **Audit Logs** view allows administrative personnel to:
- Filter logs by action type (`ALL`, `LOGIN_SUCCESS`, `BOOKING_CREATED`, `BOOKING_STATUS_CHANGE`, `PAYMENT_MOCK_SUCCESS`, `REVIEW_SUBMITTED`, etc.).
- Search by user ID, phone, IP address, or error code.
- View color-coded result badges: `200/201 OK (Green)`, `101/102/400 WARN (Amber)`, `404/409/500 ERR (Rose)`.

---

## 5. Database Schema & Supabase Dual-Layer Layer

The application includes complete PostgreSQL DDL in [`schema.sql`](file:///d:/Smart%20India%20Hackathon/schema.sql) and a **Dual-Layer Data Architecture** in [`database.ts`](file:///d:/Smart%20India%20Hackathon/src/shared/services/database.ts).

```
┌─────────────────────────────────────────────────────────────┐
│                 SAHYOGSEVA DATABASE LAYER                   │
├──────────────────────────────┬──────────────────────────────┤
│      LIVE SUPABASE MODE      │   ZERO-CONFIG LOCAL STORE    │
│  Connects when env vars set: │  Automatic reactive storage  │
│  - VITE_SUPABASE_URL         │  using browser persistence   │
│  - VITE_SUPABASE_ANON_KEY    │  pre-seeded with demo data   │
└──────────────────────────────┴──────────────────────────────┘
```

### PostgreSQL Table Definitions:

```sql
-- 1. Users Table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Customer', 'Worker', 'Admin')),
    phone TEXT NOT NULL,
    language_pref TEXT DEFAULT 'en' CHECK (language_pref IN ('en', 'hi')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Workers Table
CREATE TABLE public.workers (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    cooperative_id TEXT NOT NULL,
    skill TEXT NOT NULL,
    area TEXT NOT NULL,
    verified BOOLEAN DEFAULT TRUE,
    rating_avg NUMERIC(3, 2) DEFAULT 5.00,
    hourly_rate NUMERIC(10, 2) DEFAULT 299.00,
    experience_years INTEGER DEFAULT 5,
    completed_jobs_count INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Bookings Table
CREATE TABLE public.bookings (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    address TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    problem_description TEXT,
    amount NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Reviews Table
CREATE TABLE public.reviews (
    id TEXT PRIMARY KEY,
    booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    customer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Logs Table
CREATE TABLE public.logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id TEXT,
    phone TEXT,
    action TEXT NOT NULL,
    route TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    result_code INTEGER NOT NULL,
    details TEXT
);
```

---

## 6. Role-Based Workflows & Implemented Features

### 👤 Customer Workflow:
1. **Browse Electricians**: View 6 verified cooperative master electricians with photos, skill descriptions, standard rates (₹249–₹399), and verified badges.
2. **Book Slot**: Select service date, available time slot (`09:00 AM - 11:00 AM`, `11:00 AM - 01:00 PM`, etc.), address, and problem description.
3. **Double-Booking Protection**: If another customer has already booked that artisan for that time, the system rejects it immediately with **`ERROR 409: Conflict detected`**.
4. **Simulated Escrow Payment**: Mock payment confirmation step generating a simulated transaction reference (`TXN-COOP-XXXXXX-MOCK`).
5. **My Bookings Page**: Real-time status tracking (`pending` → `confirmed` → `completed`).
6. **1–5 Star Rating & Review**: Once the worker marks the service complete, the review modal unlocks. Submitting feedback recalculates the artisan's average rating.

### ⚡ Worker (Artisan) Workflow:
1. **Cooperative Dashboard**: Displays active job stats (Pending Acceptance, Confirmed/Scheduled, Completed Services).
2. **Credential Editor**: Edit Name, Cooperative Registry ID, Skills, Operating Zone, and Hourly Tariff.
3. **Job Queue Actions**:
   - Click **Accept Job** → changes status to `confirmed`.
   - Click **Mark Complete** → changes status to `completed`, releasing escrow and unlocking customer review.

### 🛡️ Admin Portal Workflow:
1. **Registered Electricians Master Table**: Full directory of workers with experience, completed jobs count, and cooperative affiliation IDs.
2. **Bookings Master Register**: Full registry of all customer bookings across the city.
3. **Demand Forecast (AI Preview)**: Recharts bar chart showing next-week predicted demand by area vs. active available workers.
4. **System Audit Logs**: Real-time log inspector.

---

## 7. UI/UX Evolution & Reference Design Implementations

During the project, the user provided reference screenshots and detailed UI annotations which were incorporated:

### 1. Official SahyogSeva Logos Integrated
- **Square Emblem Logo**: Circular unity emblem featuring 3 cooperative figures (Blue, Yellow, Green) surrounding an orange heart.
- **Horizontal English Logo**: Features the official tagline *"Together We Serve, Together We Rise"*.
- **Horizontal Hindi Logo**: Features the official Hindi tagline *"हम साथ हैं, सेवा के लिए"*.

### 2. Top Announcement Ribbon
`🛡️ 100% Background & Police Verified Local Professionals • Zero Advance Payment • Pay Cash / UPI After Service | Emergency 24x7 Help: 1800-SAHYOG`

### 3. Hero Banner ("Namaste, [UserName]!")
- Deep Forest Green container (`#064e3b`).
- Local area tag (*Serving Indiranagar, Bengaluru • Verified Local Experts*).
- Dynamic greeting greeting the logged-in customer (e.g. *"Namaste, Ramesh!"* / *"नमस्ते, रमेश!"*).
- 4 Trust Badges: *Police Verified Pros*, *Cash on Delivery*, *Rapid 30m Arrival*, *30-Day Guarantee*.
- Desktop right card: Centered cooperative logo emblem, tagline, and zero-brokerage badge.

### 4. Urgent Emergency SOS Banner
High-visibility banner for electrical emergencies (*"Water Leak / Short Circuit / MCB Trip?"*) with a 30-minute dispatch trigger.

### 5. "How SahyogSeva Works For You" Section
- 3-step workflow: `1. Pick Service & Slot` → `2. Verified Pro Arrives` → `3. Pay Cash After Work`.
- Live stats: **25,000+ Bookings**, **4.88 ★ Rating**, **100% Verified**, **< 30 Mins SOS Arrival**.
- 4 Value Cards: *100% Police Verified*, *Pay After Service*, *30-Min Rapid Response*, *30-Day Service Guarantee*.

### 6. Comprehensive Dark Navy Footer (`#091424`)
Includes 1800-SAHYOG helpline, email, operations coverage, services directory, specialized care links, popular localities, and *"Made for Indian Neighborhoods ❤️"*.

### 7. Spacious Worker Profile Modal (`WorkerDetailModal.tsx`)
- Expanded from a narrow dialog to a spacious `max-w-5xl` two-column layout.
- Quick navigation tabs: `Worker Info`, `Skills & Diagnostics`, `Experience & Verification`, `Fair Tariff & Escrow`, `Reviews`.
- **True Review Sorting Rules**:
  - **Positive**: Highest stars first, with higher helpful votes ranked higher (e.g. `5★ (7 helpful)` → `4.9★ (20 helpful)` → `4.9★ (15 helpful)`).
  - **Helpful**: Strictly sorted by highest net upvotes (`upvotes - downvotes`).
  - **Critical**: Lowest stars first (1★ → 2★ → 3★), prioritized by helpful votes.
- Interactive **Helpful? Upvote (▲) / Downvote (▼)** buttons on every review card.

### 8. Dedicated Settings & Support Page (`SettingsPage.tsx`)
- **Language & Theme**: Toggle English / हिंदी and display themes.
- **User Profile & Security**: Edit Name, Phone, Email, with **"REQUIRES PASSWORD TO PROCEED"** security rule.
- **Address Book Management**: Add/edit/delete multiple addresses with custom recipient names and phone numbers (e.g. *"Mom's House - 9811223344"*).
- **Technical Issues & Support Ticket System**: Form with Subject, Phone, Email, Details, and Screenshot file attachment dropzone.

### 9. Top-Right Hamburger / User Account Menu
- **User Header**: Avatar, Name, Role badge, Phone number.
- **Settings & Language**: Direct link to the settings page.
- **Contact Us & Helpline**: Modal with 24x7 emergency helpline numbers.
- **Switch Account**: Hover flyout with *Customer*, *Worker (Verified)*, and *Admin*.
- **"Not a worker? Apply Now!"**: Interactive modal for technicians to apply for cooperative membership.
- **Log Out**.

---

## 8. Internationalization & Localization (English / Hindi)

Configured via `react-i18next` in [`src/shared/i18n/i18n.ts`](file:///d:/Smart%20India%20Hackathon/src/shared/i18n/i18n.ts).

- Instant toggle between **English (EN)** and **हिंदी (HI)** via the top navigation bar and settings page.
- Translates navigation items, hero titles, button labels, booking status badges, and error alerts.
- Automatically switches between the English and Hindi SahyogSeva logo banners.

---

## 9. Git Setup, Repository History & Backups

The project is hosted and tracked via Git on branch `main`:
- **Repository URL**: `https://github.com/vaibhavkushwaha215/SmartIndiaHackthon.git`
- Configured `.gitignore` to keep `node_modules`, `dist`, and `.env` secure.

### Standard Git Workflow for the Project:
```powershell
# 1. Check changed files
git status

# 2. Stage all modifications
git add .

# 3. Commit with a meaningful message
git commit -m "feat: your feature summary"

# 4. Push to remote GitHub repository
git push origin main
```

---

## 10. Team Task Division & Parallel Work Blueprint

To allow multiple developers/designers to work concurrently without merge conflicts, tasks are partitioned into 4 distinct blocks:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SAHYOGSEVA TEAM DIVISION                        │
├────────────────────┬────────────────────┬──────────────────────────────┤
│       BLOCK        │     ASSIGNED       │          FILE SCOPE          │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 🎨 UI & Design     │ Frontend Lead      │ `src/index.css`              │
│                    │                    │ `src/shared/components/`     │
│                    │                    │ `public/assets/`             │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 🗄️ Backend / DB    │ Supabase Lead      │ `schema.sql`                 │
│                    │                    │ `src/shared/services/`       │
│                    │                    │ `.env.local`                 │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ ⚙️ Core Logic      │ Services Lead      │ `src/shared/services/db.ts`  │
│                    │                    │ `src/shared/services/log.ts` │
│                    │                    │ `src/shared/constants/`      │
├────────────────────┼────────────────────┼──────────────────────────────┤
│ 📦 Feature Modules │ Module Developers  │ `src/modules/booking/`       │
│                    │                    │ `src/modules/worker-profile/`│
│                    │                    │ `src/modules/admin/`         │
│                    │                    │ `src/modules/settings/`      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

### Git Branching Workflow for Teammates:
```powershell
# Design lead works in:
git checkout -b feature/ui-styling

# Backend lead works in:
git checkout -b feature/supabase-rls

# Worker module lead works in:
git checkout -b feature/worker-portal

# Settings lead works in:
git checkout -b feature/settings-address
```

---

*This document contains the complete record of all architectural requirements, database schemas, error handling systems, UI components, and collaborative workflows built for **SahyogSeva**.*

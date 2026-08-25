# SahyogSeva (सहयोग सेवा) 🤝⚡

> **A Cooperative Gig-Services Booking Platform Prototype**  
> Empowering informal electrical artisans through cooperative-backed verification, transparent fair-tariff booking, worker self-management, predictive demand dispatch, standardized error codes, and end-to-end audit logging.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E.svg)](https://supabase.com/)
[![i18n](https://img.shields.io/badge/i18n-English%20%7C%20Hindi-orange.svg)](https://react.i18next.com/)

---

## 🌟 Key Features

### 1. 👥 Multi-Role Ecosystem
- **Customer**: Browse 6 pre-seeded verified electricians, inspect cooperative credentials, book service slots with conflict detection, simulate escrow payments, track booking progress, and submit 1–5 star reviews.
- **Worker (Artisan)**: Self-service profile management (Name, Cooperative ID, Skill, Area, Tariff) and an interactive job queue with **Accept** and **Mark Complete** actions.
- **Admin**: Read-only master registers for all registered electricians and bookings, next-week demand forecasting, and system audit logs.

### 2. 🧩 Strictly Modular Architecture
Code is organized into completely decoupled, independently routable and removable modules:
```
src/
├── shared/                       # Shared UI, constants, types, services, and i18n
│   ├── constants/error-codes.ts  # Standard error codes (101, 102, 400, 401, 404, 409, 500)
│   ├── types/index.ts            # Domain types (User, Worker, Booking, Review, LogEntry)
│   ├── i18n/                     # English and Hindi localization dictionary
│   ├── services/                 # Supabase client, hybrid DB provider, audit logger
│   └── components/               # Navbar, BottomNav, Toast, Modal, Badge, StarRating
└── modules/
    ├── auth/                     # Auth context, role switcher, mock login modal
    ├── booking/                  # Worker listing, detail modal, booking wizard, mock payment, my bookings, reviews
    ├── worker-profile/           # Worker dashboard & profile editor
    ├── admin-dashboard/          # Admin portal master tables
    ├── demand-forecast/          # Recharts predictive demand preview chart
    └── logging/                  # System audit and troubleshooting log viewer
```

### 3. 🚨 Standardized Error Code System (`error-codes.ts`)
All validation, auth, and database operations resolve to standardized error codes with consistent UI toasts:
- **`101`**: `INVALID_CREDENTIALS` (Invalid authentication credentials)
- **`102`**: `INVALID_PHONE_NUMBER` (Must be a valid 10-digit mobile number)
- **`400`**: `BAD_REQUEST` (Missing required fields or invalid payload)
- **`401`**: `UNAUTHORIZED` (Action not permitted for current role)
- **`404`**: `NOT_FOUND` (Worker or booking record not found)
- **`409`**: `CONFLICT` (Slot collision — prevents double-booking an artisan)
- **`500`**: `SERVER_ERROR` (Internal server or database failure)

### 4. 📜 Audit Logging for Troubleshooting (`logs` Table)
Every critical action captures:
- `id`, `timestamp` (UTC)
- `user_id` & `phone`
- `action` (`LOGIN_SUCCESS`, `BOOKING_CREATED`, `BOOKING_STATUS_CHANGE`, `PAYMENT_MOCK_SUCCESS`, `REVIEW_SUBMITTED`, etc.)
- `route` & `ip_address` (best-effort client IP)
- `result_code` (e.g. 200, 201, 102, 409, 500)

Admins can inspect, filter, and audit these logs in real-time under the **Audit Logs** tab.

### 5. 🌐 English & Hindi Localization (`react-i18next`)
Switch seamlessly between **English** and **हिंदी** via the top navigation bar toggle.

### 6. 📊 Predictive Demand Forecast (Preview Feature)
Interactive Recharts bar chart showing next-week predicted service demand by area compared to available registered electricians.

---

## 🛠️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/vaibhavkushwaha215/SmartIndiaHackthon.git
cd SmartIndiaHackthon

# Install dependencies
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
npm run preview
```

---

## 🗄️ Supabase Configuration (Optional)

The application includes a **Dual-Layer Architecture**:
1. **Zero-Config Local Mode**: Runs automatically out-of-the-box with reactive local persistence pre-seeded with 6 verified electricians, bookings, reviews, and logs.
2. **Live Supabase Mode**: Connects directly to Supabase when environment variables are provided.

### Setup Supabase:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run the [`schema.sql`](./schema.sql) file.
3. Create a `.env.local` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart the development server (`npm run dev`).

---

## 🧪 Demo User Profiles

Use the **Switch Role** dropdown in the top navigation bar to test different views:

| Role | Name | Phone | Key Flow |
|---|---|---|---|
| **Customer** | Ramesh Kumar | `9876543210` | Browse electricians, book slots, view escrow receipt, leave 5-star review |
| **Worker** | Rajesh Sharma | `9820011223` | Edit profile credentials, accept bookings, mark jobs completed |
| **Admin** | Sunita Patel | `9900011223` | Master registry, demand forecast chart, real-time audit logs |

---

## 📄 License
MIT License. Built for Smart India Hackathon cooperative gig-services innovation.

# SahyogSeva (सहयोगसेवा) — Technical Specifications

---

## 1. Executive Summary & Vision

**SahyogSeva** is an open, decentralized, and cooperative-owned gig-economy platform engineered to revolutionize household maintenance and artisanal trade services across India. 

Operating under a **0% platform commission** charter, the platform connects verified trade professionals (electricians, plumbers, carpenters, appliance technicians, painters, cleaning staff) directly with local residential households. Built on transparency, equitable job allocation (anti-monopoly algorithms), and full escrow protection, SahyogSeva eliminates middlemen exploitation while ensuring homeowners receive reliable, vetted doorstep service within 30 minutes.

---

## 2. Core Technology Stack

| Layer / Concern | Technology | Version | Purpose & Description |
| :--- | :--- | :--- | :--- |
| **Core UI Library** | React | `^18.3.1` | Declarative, component-driven frontend with React 18 Concurrent features and Hooks. |
| **Language Runtime** | TypeScript | `~5.7.2` | Strict end-to-end type safety, interfaces, union types, and compile-time validation. |
| **Build Tool & Bundler**| Vite | `^6.1.0` | Next-generation ESM development environment and Rollup production bundler. |
| **Styling Framework** | Tailwind CSS | `3.4.17` | Utility-first styling engine integrated with CSS Custom Properties for theme tokens. |
| **CSS Processors** | PostCSS / Autoprefixer | `8.5.2` / `10.4.20` | Dynamic vendor prefixing and CSS minification. |
| **Iconography** | Lucide React | `^0.475.0` | Accessible, tree-shakeable SVG icon collection. |
| **Data Visualization** | Recharts | `^2.15.1` | Responsive SVG charts for Demand Forecasting and Gini Opportunity Analytics. |
| **Internationalization**| Custom Modular Engine + i18next | `^24.2.2` | In-memory 5-language localization with hierarchical fallback and parameter interpolation. |
| **Progressive Web App**| `vite-plugin-pwa` / Workbox | `^1.3.0` | Service Worker registration, offline precaching, web manifest, and install prompts. |
| **Database & Auth** | Supabase JS Client (Optional) | `^2.49.1` | Pluggable client for hybrid local/cloud backend persistence. |

---

## 3. Architecture & Modular Directory Structure

```
d:/Smart India Hackathon/
├── public/                         # Public assets & Web Manifest
│   ├── assets/logos/               # Optimized WebP brand logos (EN, HI, Square)
│   ├── favicon.ico
│   └── manifest.webmanifest        # PWA application manifest
├── src/
│   ├── modules/                    # Self-Contained, Pluggable Feature Modules
│   │   ├── admin-dashboard/        # Cooperative administration, worker compliance & fairness analytics
│   │   ├── auth/                   # RBAC AuthContext, Login, Registration, Worker Intake
│   │   ├── booking/                # Customer discovery, service categories, booking wizard, review modal
│   │   ├── chatbot/                # Cooperative assistant powered by Gemini API
│   │   ├── demand-forecast/        # AI predictive service demand heatmaps & mobilization alerts
│   │   ├── i18n/                   # Multilingual Localization Engine
│   │   │   ├── components/         # Accessible LanguageSelector (Dropdown & Chips variants)
│   │   │   ├── context/            # I18nContext & useI18n hook
│   │   │   ├── locales/            # en.json, hi.json, te.json, kn.json, ta.json
│   │   │   ├── services/           # TranslationService singleton & interpolation engine
│   │   │   └── types.ts            # LanguageCode, LanguageInfo, TranslationProvider interface
│   │   ├── logging/                # Real-time system audit & troubleshooting logs
│   │   ├── settings/               # User preferences, themes, language switcher, address book
│   │   ├── superadmin/             # Governance control plane & Feature Flags management
│   │   └── worker-profile/         # Worker dashboard, job queue, dispatch toggle, and earnings ledger
│   ├── shared/                     # Shared Cross-Cutting Utilities & Components
│   │   ├── components/             # Navbar, BottomNav, Footer, Modal, Toast, Badge, StarRating
│   │   ├── config/                 # Feature flags registry (features.config.ts), Service trade taxonomy
│   │   ├── constants/              # Error code taxonomy (error-codes.ts)
│   │   ├── context/                # ThemeContext & color token definitions
│   │   ├── data/                   # Seed datasets (SEED_USERS, SEED_WORKERS, SEED_BOOKINGS)
│   │   ├── services/               # Database abstraction (LocalStorage/IndexedDB), Logger, Router
│   │   └── types/                  # Global TypeScript domain definitions & enum types
│   ├── App.tsx                     # Root application wrapper & router view switcher
│   ├── index.css                   # Global theme tokens, typography, custom scrollbars
│   └── main.tsx                    # Application bootstrap entry point
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Routing Engine (Clean Pathname Navigation)

SahyogSeva uses a **custom HTML5 History API routing engine** ([router.ts](file:///d:/Smart%20India%20Hackathon/src/shared/services/router.ts)) delivering clean, modern URLs without `#` hash fragments:

### Canonical Route Registry

| Pathname | Component | Access Restriction |
| :--- | :--- | :--- |
| `/` | `WorkerList` | Public / All Roles |
| `/my-bookings` | `MyBookings` | Customer, Admin, SuperAdmin |
| `/worker/dashboard` | `WorkerDashboard` | Worker, Admin, SuperAdmin |
| `/worker/jobs` | `WorkerJobs` | Worker, Admin, SuperAdmin |
| `/worker/earnings` | `WorkerEarnings` | Worker, Admin, SuperAdmin |
| `/admin/dashboard` | `AdminDashboard` (Overview) | Admin, SuperAdmin |
| `/admin/workers` | `AdminDashboard` (Workers Tab) | Admin, SuperAdmin |
| `/admin/analytics` | `AdminDashboard` (Analytics Tab) | Admin, SuperAdmin |
| `/demand-forecast` | `DemandForecast` | Admin, SuperAdmin |
| `/logs` | `LogsViewer` | Admin, SuperAdmin |
| `/superadmin` | `SuperAdminPortal` | SuperAdmin Only |
| `/settings` | `SettingsPage` | Public / All Roles |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/apply-worker` | `ApplyWorkerPage` | Public |

- **Popstate Synchronization**: Browser back and forward buttons update reactive state seamlessly.
- **Direct Link Support**: Refreshing or loading deep URLs directly resolves the appropriate module view.
- **404 Recovery**: Unmatched routes automatically render the `NotFound404` component with quick return navigation.

---

## 5. Multilingual Localization Architecture (i18n)

### Supported Languages

| Language | ISO Code | Native Script | Direction | Default Status |
| :--- | :--- | :--- | :--- | :--- |
| **English** | `en` | English | LTR | Default Primary Fallback |
| **Hindi** | `hi` | हिन्दी | LTR | Full Coverage |
| **Telugu** | `te` | తెలుగు | LTR | Full Coverage |
| **Kannada** | `kn` | ಕನ್ನಡ | LTR | Full Coverage |
| **Tamil** | `ta` | தமிழ் | LTR | Full Coverage |

### Localization Features
1. **Zero External Translation API Dependency**: Dictionaries are loaded locally into memory with zero network delay or rate limits.
2. **Missing-Key Fallback Hierarchy**:
   ```
   Target Language (e.g. te.json)
     ↓ (if missing)
   English Default (en.json)
     ↓ (if missing)
   Explicit Default Text / Readable Key Suffix
   ```
3. **Variable Parameter Interpolation**:
   - Dotted keys accept named tokens: `t("home.hero.greeting", { name: "Ramesh" })` → `"Namaste, Ramesh!"` / `"నమస్కారం, Ramesh!"`.
4. **Local Persistence**: User language choice is saved in `localStorage` under `sahyog_lang` and synchronized on startup.
5. **AI4Bharat IndicTrans2 Pluggable Abstraction**:
   - Ready for dynamic user review and chat translation through the exported `TranslationProvider` interface:
   ```typescript
   export interface TranslationProvider {
     name: string;
     translate(text: string, source: LanguageCode, target: LanguageCode): Promise<string>;
   }
   ```

---

## 6. Design System & Theme Tokens

The application employs a **CSS Custom Property design token architecture** mapped through Tailwind CSS classes.

### Available Theme Palettes

1. **Forest Green (Cooperative Default)**:
   - Primary: `#047857` (Emerald 700) | Secondary: `#f59e0b` (Amber 500)
   - Background: `#f8fafc` / Dark: `#091424`
2. **Ocean Navy**:
   - Primary: `#1d4ed8` (Blue 700) | Secondary: `#06b6d4` (Cyan 500)
   - Background: `#f0fdf4` / Dark: `#020617`
3. **Terracotta Warmth**:
   - Primary: `#c2410c` (Orange 700) | Secondary: `#eab308` (Yellow 500)
   - Background: `#fffbeb` / Dark: `#1c1917`
4. **Slate Executive**:
   - Primary: `#334155` (Slate 700) | Secondary: `#8b5cf6` (Purple 500)
   - Background: `#f8fafc` / Dark: `#0f172a`

### Visual Design Rules
- **Aesthetic Excellence**: Vibrant accents, rich dark modes, glassmorphic blurred surfaces (`backdrop-blur-md`), and micro-interactions.
- **Accessibility & Contrast**: Strict compliance with WCAG AA contrast standards.
- **No Device Placeholders**: All graphics use optimized WebP vector assets.

---

## 7. Role-Based Access Control (RBAC)

Four distinct user roles are enforced across UI components and route resolvers:

```
                  ┌───────────────┐
                  │  SuperAdmin   │ (Full Governance & Feature Control)
                  └───────┬───────┘
                          │
                  ┌───────▼───────┐
                  │     Admin     │ (Worker Compliance & Analytics)
                  └───────┬───────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
  ┌───────▼───────┐               ┌───────▼───────┐
  │    Worker     │               │   Customer    │
  └───────────────┘               └───────────────┘
```

- **Customer**: Browse services, search trades, book time slots, simulate escrow payment, rate completed jobs.
- **Worker**: Toggle live dispatch availability, view job requests, mark jobs completed, inspect 0%-commission earnings.
- **Admin**: Review onboarding worker applications, inspect KYC credentials, audit Gini fairness coefficient, view audit logs.
- **SuperAdmin**: Toggle platform feature flags, manage system settings, inspect error logs and diagnostics.

---

## 8. Feature Flag Engine & Governance

All major capabilities are decoupled through `src/shared/config/features.config.ts`. Feature states can be toggled in real time without code deployment:

| Feature Key | Default State | Target Description |
| :--- | :--- | :--- |
| `customerModule` | **Enabled** | Customer service discovery and booking wizards. |
| `workerModule` | **Enabled** | Worker operations portal, job queue, and dispatch toggles. |
| `adminModule` | **Enabled** | Admin portal, intake registry, and analytics. |
| `demandForecasting` | **Enabled** | AI predictive demand forecasting and mobilization alerts. |
| `multilingual` | **Enabled** | Multi-language switcher and Indic localization dictionaries. |
| `workerReviewsVisibility`| **Disabled** (Admin only) | Restricts customer review cards and star ratings to Admin/SuperAdmin. |
| `emergencyBooking` | **Enabled** | 24/7 Rapid SOS dispatch for emergency electrical/water leaks. |
| `workerApplications` | **Enabled** | Self-service worker onboarding and credential submission. |
| `payments` | **Enabled** | Cooperative escrow simulation and booking receipts. |

---

## 9. Error Taxonomy & Diagnostics

The platform categorizes all application and network exceptions via standardized numeric error codes:

| Error Code | Constant Key | Meaning & Action |
| :--- | :--- | :--- |
| **101** | `INVALID_CREDENTIALS` | Password or authentication mismatch. |
| **102** | `INVALID_PHONE` | Mobile number does not match 10-digit Indian standard. |
| **103** | `USER_ALREADY_EXISTS` | Registration attempt with an existing mobile number. |
| **201** | `WORKER_NOT_FOUND` | Referenced worker profile does not exist or is inactive. |
| **301** | `SLOT_UNAVAILABLE` | Concurrency check: selected appointment time is occupied. |
| **304** | `INVALID_PINCODE` | Pincode is not exactly 6 digits. |
| **400** | `BAD_REQUEST` | Missing mandatory form fields. |
| **401** | `UNAUTHORIZED` | Role clearance failure on protected endpoints. |
| **404** | `NOT_FOUND` | Route or database entity missing. |
| **409** | `CONFLICT` | State mutation collision. |
| **500** | `DATABASE_ERROR` | Storage quota or runtime database error. |

---

## 10. Progressive Web App (PWA) & Offline Capabilities

- **Workbox Precaching**: Automatically precaches 24 critical assets (app shell, HTML, CSS, JavaScript, fonts, and logos) for instant offline startup.
- **Web App Manifest**: Standalone display configuration with responsive adaptive icons (`192x192` and `512x512`).
- **Install Flow**: Non-intrusive bottom banner and footer action buttons supporting native browser installation on Android, iOS, and Desktop Chrome/Edge.

---

## 11. Build & Validation Metrics

- **Build Pipeline**: `tsc && vite build` (TypeScript compilation + Vite Rollup bundling).
- **Compilation Output**: 0 Errors, 0 Warnings on core types.
- **Production Asset Bundle**:
  - CSS: `~74 KB` (`11.8 KB` gzipped)
  - Core JS Bundle: `~1.29 MB` (`341 KB` gzipped with full localized dictionaries and Recharts)
  - Workbox Service Worker: `5.8 KB`

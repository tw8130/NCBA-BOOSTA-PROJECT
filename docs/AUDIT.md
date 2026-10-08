# NCBA BOOSTA — Frontend Codebase Audit & Evolution Roadmap

> **Audit Date:** 2026-10-08  
> **Source Specifications:** `docs/NCBA_BOOSTA_Master_Prompt_v3.md` (Part A), `docs/4. DETAILED SPECIFICATIONS OF SCREE.txt`, and NCBA Brand Guidelines.  
> **Target Status:** Baseline verification complete; ready for Phase 1 execution upon approval.

---

## 1. Executive Summary & Baseline Build Status

The NCBA BOOSTA prototype is an existing, functional React + TypeScript + Vite web application serving retail borrowers (approved distributors/stockists) and anchor corporate suppliers (e.g., EABL, Coca-Cola).

In accordance with **Part A, Section A2 (Golden Rule — Inspect first, then evolve)**, the entire existing codebase was audited against the authoritative business rules, brand tokens, and detailed screen specifications. 

### Baseline Build Verification
Before making any architectural or code changes, a baseline production build was executed:

```bash
npm run build
# Executes: tsc -b && vite build
```

**Result:**
- **Exit Code:** `0` (Successful clean build)
- **TypeScript Compiler (`tsc -b`):** 0 errors, strict type checking passed.
- **Vite Bundler Output:**
  - `dist/index.html`: `0.42 kB` (gzip: `0.29 kB`)
  - `dist/assets/index-DJTyaLgL.css`: `22.34 kB` (gzip: `4.82 kB`)
  - `dist/assets/index-BrJVpbeH.js`: `729.26 kB` (gzip: `207.84 kB`)
- **Build Duration:** 33.94 seconds.
- **Vendor Integrity Check:** A recursive case-insensitive search (`grep`) across all source code in `src/` confirmed **0 occurrences** of former vendor names (`Pezesha`, `Patascore`).

---

## 2. Existing Codebase Inventory

### 2.1 Existing Routes (`src/App.tsx`)

| Route | Component | Current Role / Protection | Description |
|---|---|---|---|
| `/` | `Splash` | Public | Entry screen simulating SMS invite with pre-approved limit. |
| `/role` | `RoleSwitch` | Public | Switcher between `CUSTOMER` and `ANCHOR` demo roles. |
| `/customer/login` | `SignIn` | Public / Onboarding | Phone number + PIN login. |
| `/customer/signup` | `SignUp` | Public / Onboarding | Mobile entry for onboarding activation. |
| `/customer/otp` | `Otp` | Public / Onboarding | 6-digit OTP verification with 45s countdown. |
| `/customer/create-pin` | `CreatePin` | Public / Onboarding | 4-digit PIN setup with reveal toggle. |
| `/customer/profile` | `Profile` | Public / Onboarding | Prefilled T24 data + customer details. |
| `/customer/kyc` | `Kyc` | Public / Onboarding | ID front/back + selfie upload. |
| `/customer/business-documents` | `BusinessDocuments` | Public / Onboarding | Business type selection + conditional documents. |
| `/customer/account-verification` | `AccountVerification` | Public / Onboarding | NCBA core account lookup and verification. |
| `/customer/select-anchors` | `SelectAnchor` | Public / Onboarding | Select from backend-eligible anchor partners. |
| `/customer/dashboard` | `Dashboard` | `RequireRole('CUSTOMER')` | Main borrower facility overview & active loans. |
| `/customer/anchors` | `Anchors` | `RequireRole('CUSTOMER')` | List of approved anchor facilities. |
| `/customer/anchors/:id` | `AnchorDetail` | `RequireRole('CUSTOMER')` | Single anchor details, limits & active loans. |
| `/customer/loans` | `Loans` | `RequireRole('CUSTOMER')` | Borrower loan portfolio list. |
| `/customer/loans/:id` | `LoanDetail` | `RequireRole('CUSTOMER')` | Loan breakdown, schedule & repayment shortcut. |
| `/customer/drawdown` | `Drawdown` | `RequireRole('CUSTOMER')` | Multi-step loan drawdown wizard. |
| `/customer/repay` | `Repay` | `RequireRole('CUSTOMER')` | Loan repayment selector (NCBA debit / M-Pesa STK). |
| `/customer/repay/status` | `RepayStatus` | `RequireRole('CUSTOMER')` | Repayment result receipt screen. |
| `/customer/transactions` | `Transactions` | `RequireRole('CUSTOMER')` | History of disbursements, fees & repayments. |
| `/customer/notifications` | `Notifications` | `RequireRole('CUSTOMER')` | Customer in-app notification center. |
| `/customer/support` | `Support` | `RequireRole('CUSTOMER')` | FAQ and support issue logger. |
| `/customer/profile/settings` | `ProfileSettings` | `RequireRole('CUSTOMER')` | Borrower profile view. |
| `/anchor/login` | `AnchorLogin` | Public | Anchor user authentication. |
| `/anchor/dashboard` | `AnchorDashboard` | `RequireRole('ANCHOR')` | Corporate anchor metrics & customer sales. |
| `/anchor/customers` | `AnchorCustomers` | `RequireRole('ANCHOR')` | List of retailers financed under this anchor. |
| `/anchor/customers/:id` | `AnchorCustomerDetail` | `RequireRole('ANCHOR')` | Retailer credit limit and sales detail. |
| `/anchor/sales` | `AnchorSales` | `RequireRole('ANCHOR')` | Sales trends (weekly/monthly/annual). |
| `/anchor/transactions` | `AnchorTransactions` | `RequireRole('ANCHOR')` | Anchor collection account transaction feed. |
| `/anchor/turnover-review` | `AnchorTurnoverReview` | `RequireRole('ANCHOR')` | Annual turnover document submission & status. |
| `/anchor/notifications` | `AnchorNotifications` | `RequireRole('ANCHOR')` | Anchor portal notifications with email preview. |
| `/anchor/reports` | `AnchorReports` | `RequireRole('ANCHOR')` | Exportable portfolio and transaction reports. |
| `/anchor/settings` | `AnchorSettings` | `RequireRole('ANCHOR')` | Anchor company settings & contacts. |

---

### 2.2 Existing Components

#### UI Components (`src/components/ui/`)
- `AmountDisplay.tsx`: Formats currency amounts with KES label.
- `Button.tsx`: Generic button with variants (`primary`, `secondary`, `ghost`, `danger`). Currently uses non-brand blues and 12px border radius.
- `Card.tsx`: White container with `rounded-2xl` and `shadow-sm` (violates A5 flat 1px border rule).
- `ConfirmDialog.tsx`: Modal dialog for action confirmation.
- `EmptyState.tsx`: Icon + title + message for empty lists.
- `ErrorAlert.tsx`: Inline warning/error banner.
- `LoadingState.tsx`: Centered spinner with label.
- `Modal.tsx`: Bottom sheet on mobile / modal on desktop with backdrop.
- `ProgressIndicator.tsx`: Circular/linear progress indicator.
- `StatusBadge.tsx`: Pill badge with Tailwind colors (`emerald`, `amber`, `red`, `blue`, `slate`).
- `Stepper.tsx`: Linear progress bar segments for wizard steps.

#### Domain Components (`src/components/domain/`)
- `AnchorCard.tsx`: Displays anchor limits, logo initial, and active loan counts.
- `CRBRestrictionModal.tsx`: Explains that drawdown is restricted due to credit reference check while limit remains intact.
- `DocumentUploader.tsx`: File upload simulator with progress, success, and error states.
- `LimitCard.tsx`: Facility aggregate overview (Total Approved, Available, Utilised).
- `LoanCard.tsx`: Single loan card with balance, due date, and repayment button.
- `NotificationItem.tsx`: In-app notification card with unread badge and actions.
- `PaymentStatus.tsx`: Dynamic icon for STK push stages.
- `TransactionRow.tsx`: Single row in transaction history.

#### Anchor Components (`src/components/anchor/`)
- `MetricCard.tsx`: KPI card with value, sub-label, and trend chip.
- `SalesChart.tsx`: Recharts responsive bar/line chart for sales.
- `StatusPie.tsx`: Recharts pie chart for status breakdown.

#### Layout Components (`src/components/layout/`)
- `AppShell.tsx`: Mobile header + main container + bottom navigation / desktop sidebar.
- `AnchorShell.tsx`: Anchor portal wrapper with sidebar and top bar.
- `Sidebar.tsx`: Desktop navigation sidebar (currently 256px wide, navy theme).
- `Header.tsx`: Mobile header (title, back button, notifications bell).
- `BottomNav.tsx`: Mobile 4-tab bottom navigation bar.

---

### 2.3 Existing Contexts (`src/context/`)
- `AuthContext.tsx`: Minimal prototype auth state (`role: 'CUSTOMER' | 'ANCHOR' | null`, `signInAs`, `signOut`). Does not yet support Bank Maker/Checker roles.
- `AppContext.tsx`: Stores customer profile, anchor facilities, loans, loan applications, transactions, and notifications. Handles simulated fetching and state refresh.
- `AnchorContext.tsx`: Stores anchor user, retailer customer list, sales data series, turnover review state, and anchor notifications.

---

### 2.4 Existing Services (`src/services/`)
- `api.ts`: Mock customer API layer with simulated latency. Provides `getProfile`, `getAnchors`, `getLoans`, `getApplications`, `submitApplication`, `repayFromNcbaAccount`, `applyMpesaRepayment`, `getScorecardDecision`. In-memory store mutable during session.
- `anchorApi.ts`: Mock anchor portal API layer. Provides `getUser`, `getCustomers`, `getSales`, `getTurnoverReview`, `submitTurnoverReview`, `getNotifications`, `getTransactions`.
- `mpesa.ts`: Safaricom Daraja STK Push simulator with deterministic outcomes (`WRONG_PIN` on attempts 1 & 2, `SUCCESS` on attempt 3) and `MAX_STK_ATTEMPTS = 3`.

---

### 2.5 Existing Mock Data & Utilities
- `src/mocks/data.ts`: Comprehensive fixtures for `mockCustomer` (Bonface Macharia), `mockAnchors` (EABL, Coca-Cola, NCBA Anchor), `mockLoans` (`loan-1`, `loan-2`), `mockApplications`, `mockTransactions`, `mockNotifications`, anchor users, and anchor turnover records.
- `src/lib/format.ts`: `formatKES`, `formatDate`, `formatDateTime`, `daysUntil`.
- `src/lib/onboardingSteps.ts`: `ONBOARDING_STEPS` string array.
- `src/lib/status.ts`: Status label and tone dictionaries for loan applications, loans, transactions, and turnover review.

---

## 3. Mapping Table: Existing Codebase vs. Part A & Screen Specifications

| Screen / Feature | Master Prompt Part A & Screen Spec Reference | Existing Codebase State | Evaluation & Action Required |
|---|---|---|---|
| **Design System & Tokens** | **A5:** Cocoa `#39302D`, Sky `#3AB3E5`, Sun `#F8E200`, Mediterranean `#00A8A9`, Coral `#E4032C`, Passion `#9F197E`. Font: Century Gothic / Questrial. Geometry: 4px/6px/20px radius. No box-shadows. WCAG AA Cocoa-on-Sky. | `tailwind.config.js` defines arbitrary navy `#0B1F3A` and blue `#0B63CE`. Uses `rounded-xl`, `rounded-2xl`, drop shadows. | **Refactor:** Overhaul `tailwind.config.js` and `index.css` with CSS variables, exact hex tokens, Questrial Google font fallback, and WCAG AA contrast rules. |
| **Layouts & Shells** | **A5, A6:** `AppShell`, `AnchorShell`, `LmsShell`, `SignatoryShell`, `Navbar` (42px), `Sidebar` (195px / 50px collapsed), `BottomNav`, `FormLayout` (65/35 split collapsing <1024px). | `AppShell` (no 65/35), `Sidebar` (256px wide, no collapse), `AnchorShell`. No `LmsShell`, no `SignatoryShell`, no `Navbar`. | **Refactor & Add:** Standardize `Sidebar` to 195px/50px; build `Navbar` (42px with dark mode toggle), `LmsShell`, `SignatoryShell`, and responsive `FormLayout` (65/35). |
| **Screen 1: Splash & Whitelist Entry** | **Spec Screen 1, A9:** `/`, `/customer/login`, `/customer/signup`. Mobile + National ID lookup against mock T24. If NTB -> NCBA NOW redirect. If existing -> prefill CIF & accounts -> OTP. | `Splash.tsx` simulates SMS invite; `SignUp.tsx` accepts mobile only. No National ID lookup, no T24 CIF branch, no NTB NCBA NOW flow. | **Refactor:** Add National ID input, mock T24 lookup service (`services/t24.ts`), and create `/customer/ncba-now` simulation route. |
| **Screen 2: OTP & PIN Setup** | **Spec Screen 2, A7:** `/customer/otp`, `/customer/create-pin`. 6-digit split numeric input, 45s countdown. 4-digit PIN with reveal toggle and numeric keypad mask. | `Otp.tsx` uses single input with letter spacing. `CreatePin.tsx` works but needs numeric keypad styling and brand tokens. | **Refactor & Add:** Create reusable `OTPInput.tsx` (6 separate cells with auto-focus); refine `CreatePin.tsx` with strict 4-digit numeric formatting. |
| **Screen 3: 65/35 KYB & Geotagging Wizard** | **Spec Screen 3, A4.7, A7:** 65/35 layout. Pre-filled T24 details + badges. Sole Prop / Partnership / Ltd Company (CR12). Mandate single/joint. Dynamic partner roster. ID front/back. Live Facial Capture (oval guide). **`GeoCameraCapture`** (GPS + shopfront photo + fallbacks). **`SignaturePad`** (HTML5 canvas). Sticky right summary card. | Split across `Profile.tsx`, `Kyc.tsx`, `BusinessDocuments.tsx`. No 65/35 layout, no `GeoCameraCapture`, no facial oval guide, no canvas signature, no partner list builder. | **Major Refactor & Add:** Build `GeoCameraCapture.tsx`, `SignaturePad.tsx`, oval facial capture, partner/director dynamic roster, mandate selector, and wire into 65/35 `FormLayout`. |
| **Screen 4: Main Customer Dashboard** | **Spec Screen 4, A4.2, A4.8, A5:** Cocoa hero band with total available/approved and Sky progress ring. Credit Score Card (751/900 "Excellent" + [Improve My Score] modal). Multi-anchor grid. Active loans with independent due dates. CRB restriction modal & simulated SMS. | `Dashboard.tsx` exists with `LimitCard`, `LoanCard`, `AnchorCard`, and CRB modal. Missing Cocoa hero band, Scorecard ring, and M-Pesa statement upload modal. | **Refactor & Add:** Add Cocoa hero band, utilization progress ring, Credit Score Card with 751/900, and `ReassessmentModal.tsx` (M-Pesa statement upload). |
| **Screen 5: Multi-Tenor Drawdown Stepper** | **Spec Screen 5, A4.3-A4.7:** 65/35 split. Anchor select, amount chips (25/50/Full), tenors (7, 14, 30, 60, 90 anchor-allowed), purpose. **`lib/calculations.ts`**: pro-rated interest (base + 4.1%), facility fee (0.5–4%), credit life (0.011%), excise duty (20%). Single mandate -> instant disbursement. Joint mandate -> `PENDING_APPROVAL` + SMS simulation to signatories. | `Drawdown.tsx` is single-column stepper with hard-coded 3.5% fee and fixed interest. No 65/35 split, no mandate branch, no joint approval submission. | **Refactor & Add:** Extract `lib/calculations.ts` with unit tests. Rebuild `Drawdown.tsx` in 65/35 split. Add mandate handling (instant vs multi-signatory approval queue). |
| **Screen 6: Multi-Signatory Review Portal** | **Spec Screen 6, A3, A4.7:** `/signatory/review/:token`. Standalone mobile-first `SignatoryShell`. No login, OTP verification. Approve & Sign (canvas), Request Rework (comments -> rework loop), Decline. Expired/used token states. | **Does not exist.** | **Add from Scratch:** Create `SignatoryShell.tsx`, `src/pages/signatory/SignatoryReview.tsx`, token expiration simulation, rework comment drawer, and canvas signing. |
| **Screen 7: Loans Portfolio & Dual Repayment** | **Spec Screen 7, A4.10, A4.11:** `/customer/loans`, `/customer/repay`. Tabs: All, Active, Overdue, Paid Off. Full vs Partial payment. NCBA account debit (instant) or M-Pesa STK push (3 attempts, WRONG_PIN, CANCELLED, TIMEOUT, SUCCESS). FTX reference receipt. | `Loans.tsx`, `LoanDetail.tsx`, `Repay.tsx`, `RepayStatus.tsx` exist. M-Pesa STK is embedded in page; needs extraction to reusable domain modal. | **Refactor & Add:** Extract `MpesaStkModal.tsx`. Ensure loan balance updates, transactions, and available limits reconcile automatically. Add FTX receipt generation. |
| **Screen 8: Bank LMS Portal (Maker-Checker)** | **Spec Screen 8, A3, A4.9, A4.11:** `/lms/*`. Roles: `BANK_MAKER`, `BANK_CHECKER`. Maker: partner setup form, limit amendment with memo upload. Checker: approval queue (Maker≠Checker enforced), audit trail. Portfolio table with CBK grades (Normal, Watch, Substandard, Doubtful, Loss) and 30% p.a. penalty. Core accounting mirror (T24 GL entries without vendor names). | **Does not exist.** No LMS pages, no LMS context, no LMS API service, no LMS components. | **Add from Scratch:** Build `LmsShell.tsx`, `LmsContext.tsx`, `lmsApi.ts`, `ParBadge.tsx`, `AuditTrail.tsx`, `QueueTable.tsx`, and 7 LMS routes under `/lms/*`. |
| **Anchor Portal Polish** | **Spec, Phase 5, A4.14:** Anchor portal table with search/pagination, turnover review state machine (`DUE_SOON → DOCUMENTS_UPLOADED → SUBMITTED → UNDER_NCBA_REVIEW → APPROVED | MORE_INFO_REQUIRED | DECLINED`), reminder schedule, email preview. | `src/pages/anchor/*` exists with 10 pages, Recharts charts, and basic turnover review. | **Refactor:** Apply brand tokens and typography. Enhance turnover review state machine. Add customer portfolio search and overdue aging table. |
| **Style Guide & Scenario Switcher** | **A6, A7, Phase 1:** `/dev/StyleGuide` showing every UI component in light and dark mode. Demo scenario switcher (normal, CRB-restricted, multi-anchor, overdue, joint mandate, NTB, etc.). | `RoleSwitch.tsx` only has 2 roles and no scenario switcher. No style guide exists. | **Add from Scratch:** Build `/dev/StyleGuide.tsx` and `src/mocks/scenarios.ts` with comprehensive scenario presets. |

---

## 4. Reuse, Refactor, and Add Matrix

### 4.1 To Reuse Directly
- **Routing Infrastructure:** `react-router-dom` v6 routing patterns and nested route setup.
- **Data Visualization Foundations:** `recharts` responsive charts (`SalesChart`, `StatusPie`) in the Anchor portal.
- **Icons:** `lucide-react` library (styled to 16px, 1.75 stroke width).
- **Formatters:** `src/lib/format.ts` (`formatKES`, `formatDate`, `daysUntil`).
- **Notification Model:** Base notifications state and unread tracking in `AppContext` and `AnchorContext`.
- **M-Pesa STK State Model:** `src/services/mpesa.ts` outcome mapping and retry logic.

### 4.2 To Refactor
- **`tailwind.config.js` & `src/index.css`:**
  - Introduce brand tokens: `boosta-cocoa`, `boosta-sky`, `boosta-sun`, `boosta-mediterranean`, `boosta-coral`, `boosta-passion`.
  - Configure CSS custom variables for light and dark surfaces.
  - Set font family to Century Gothic with Questrial fallback.
  - Implement geometry constraints: border radius 4px (inputs, buttons, chips), 6px (cards), 20px (badges); remove all drop shadows.
- **UI Kit Components (`src/components/ui/`):**
  - `Button.tsx`: Enforce Cocoa text on Sky background (`#39302D` on `#3AB3E5` = 5.4:1 WCAG AA contrast). Height 38px desktop, 44px touch target on mobile.
  - `Card.tsx`: Border 1px, radius 6px, no shadow, padding 16px.
  - `StatusBadge.tsx`: Pill badge (`rounded-full` 20px) using brand colors (Mediterranean, Sun + Cocoa text, Coral, Sky).
  - `Modal.tsx`: Accessible dialog with focus trap and brand styling.
  - `Stepper.tsx`: Refined 3–4px progress indicator.
- **Layout Shells (`src/components/layout/`):**
  - `Sidebar.tsx`: Adjust width to exactly 195px desktop / 50px collapsed.
  - `AppShell.tsx`: Integrate with new top `Navbar` (42px) and role switcher.
  - `AnchorShell.tsx`: Align with design system tokens and collapsed sidebar states.
- **Contexts & Types:**
  - `AuthContext.tsx`: Expand to support 4 distinct roles: `CUSTOMER`, `ANCHOR`, `BANK_MAKER`, `BANK_CHECKER`.
  - `src/types/index.ts`: Integrate all Part A types (`MandateType`, `GeoCapture`, `Signatory`, `DrawdownRequest`, `LimitAmendment`, `PartnerSetup`, `LoanTenorDays`).
- **Core Feature Pages:**
  - `Drawdown.tsx`: Convert into the mandatory 65/35 responsive layout with live calculations panel and mandate submission handling.
  - `Repay.tsx`: Decouple M-Pesa STK modal into `MpesaStkModal.tsx`.

### 4.3 To Add (New Artifacts)
- **Design & UI Kit:**
  - `src/components/ui/Input.tsx` (with helper text, error state, and input masks).
  - `src/components/ui/Select.tsx`.
  - `src/components/ui/Skeleton.tsx` (skeleton loaders replacing plain spinners).
  - `src/components/ui/Toast.tsx`.
  - `src/pages/dev/StyleGuide.tsx` (`/dev/StyleGuide` showcasing all components in light and dark mode).
- **Layouts:**
  - `src/components/layout/Navbar.tsx` (42px fixed navbar, no shadow, dark mode toggle).
  - `src/components/layout/FormLayout.tsx` (65/35 desktop split, collapses to 1 column with sticky bottom summary sheet below 1024px).
  - `src/components/layout/LmsShell.tsx` (internal bank portal shell).
  - `src/components/layout/SignatoryShell.tsx` (standalone mobile-first wrapper for SMS link approval).
- **Domain Components:**
  - `src/components/domain/GeoCameraCapture.tsx` (HTML5 geolocation + camera viewfinder with permission fallback).
  - `src/components/domain/SignaturePad.tsx` (HTML5 canvas signature pad with clear, export, and touch support).
  - `src/components/domain/OTPInput.tsx` (6-box split numeric input).
  - `src/components/domain/MpesaStkModal.tsx` (self-contained STK push dialog with 3-attempt lifecycle).
  - `src/components/domain/ReassessmentModal.tsx` (M-Pesa statement upload and 6-digit password protection).
  - `src/components/domain/MakerCheckerModal.tsx`.
- **LMS Back-Office Components (`src/components/lms/`):**
  - `src/components/lms/ParBadge.tsx` (Portfolio at Risk grade badges: Normal, Watch, Substandard, Doubtful, Loss).
  - `src/components/lms/AuditTrail.tsx` (Immutable Maker-Checker action history timeline).
  - `src/components/lms/QueueTable.tsx` (Checker pending approval requests table).
- **Business Logic & Services:**
  - `src/lib/calculations.ts` (single source of truth for pro-rated interest, fees, excise duty, net disbursement, total repayable, and unit tests).
  - `src/lib/validators.ts` (Kenyan mobile, KES currency, National ID, NCBA account, OTP, PIN).
  - `src/services/t24.ts` (mock T24 customer verification and account balance lookups).
  - `src/services/lmsApi.ts` (LMS Maker-Checker operations, partner creation, limit amendments).
  - `src/mocks/scenarios.ts` (demo state presets).
- **New Pages:**
  - `/customer/ncba-now` (NTB account opening simulation).
  - `/customer/business-profile` (Legal entity details, sector, county/sub-county).
  - `/customer/drawdown/:id` (Joint mandate signatory tracker).
  - `/signatory/review/:token` (Director/partner SMS review portal).
  - `/lms/login`
  - `/lms/dashboard`
  - `/lms/partners/new` (Maker: partner onboarding)
  - `/lms/limits/new` (Maker: limit amendment request)
  - `/lms/limits/queue` (Checker: approval queue)
  - `/lms/customers` (LMS customer portfolio list)
  - `/lms/accounting` (T24 GL mirror: principal, interest, penalty, facility fee, BOOSTA control account)
  - `/lms/exceptions` (T24 FT reference reconciliation vs gateway logs)

---

## 5. Architectural & Technical Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation Strategy |
|---|---|---|---|
| **1. Former Vendor Name Leakage** | Critical brand/legal violation (Rule A1). Any occurrence in code, mock data, or UI labels violates bank guidelines. | Medium | Automated grep assertions in build/test scripts; strictly enforce NCBA BOOSTA branding; verified baseline clean (0 occurrences). |
| **2. Financial Calculation & Rounding Discrepancies** | Confusion or financial mismatch across drawdown review, loan balance, and transactions (Rule A4.5). | High | Centralize all calculations in `src/lib/calculations.ts` as the single source of truth; provide comprehensive unit tests; label all quotes "Indicative — prototype". |
| **3. Accessibility & Contrast Violations (WCAG AA)** | Ineligible contrast on brand colors (e.g. White text on Sky is only 2.4:1; Mediterranean on White is 2.9:1). | High | Follow Part A strict contrast rules: Cocoa text on Sky background (5.4:1); Cocoa text on Sun; Mediterranean used as fill or with Cocoa text (13px+ bold); no color-only statuses. |
| **4. Multi-Role Route Guard Leaks** | CUSTOMER viewing ANCHOR routes or BANK_CHECKER approving their own BANK_MAKER requests (Rules A3, A4.9). | Medium | Strengthen `RequireRole` route guard; enforce separate role contexts; hard-code UI validation preventing a user from approving a request where `makerId === currentUserId`. |
| **5. Hardware Incompatibilities (Camera / Geolocation)** | Geolocation or camera permissions denied or unavailable on desktop browsers, blocking onboarding progression. | High | Implement robust fallback modes in `GeoCameraCapture.tsx`: manual retry, file upload fallback for desktop without webcam, and mock location injection with low-accuracy advisory. |
| **6. 65/35 Responsive Layout Collapse Breakdown** | Form layout overflow or unreadable summaries on mobile (375px) and tablet (768px). | Medium | Implement `FormLayout.tsx` using CSS Grid/Flexbox collapsing into 1 column below 1024px; render the 35% panel as a sticky bottom sheet/bar on smaller screens. |
| **7. Multi-Party Signatory Workflow State Explosion** | Complex asynchronous approvals (`SINGLE`, `JOINT_ANY`, `JOINT_ALL`), rework loops, and link expiry breaking prototype state. | Medium | Model explicit state machines for `DrawdownRequest`; implement simulated SMS notifications containing valid/expired tokens; ensure clean rework loops back to the initiator. |

---

## 6. Exact Step-by-Step Task List for Phases 1–7

### Phase 1 — Foundation, Theme, Design System & UI Kit
- [ ] **Task 1.1: Design Tokens & CSS Variables**
  - Update `tailwind.config.js` with exact hex tokens: Cocoa (`#39302D`), Sky (`#3AB3E5`, hover `#2A9ED0`, active `#2188B5`), Sun (`#F8E200`), Mediterranean (`#00A8A9`), Coral (`#E4032C`), Passion (`#9F197E`).
  - Configure light and dark surface variables in `src/index.css` (`#F7F8FA`/`#0D1117`, paper `#FFFFFF`/`#161B22`, border `#EDF2F7`/`#30363D`).
  - Import Google Font Questrial as fallback for Century Gothic.
  - Enforce border radius rules (4px inputs/buttons, 6px cards, 20px badges) and 1px borders with zero drop shadows.
- [ ] **Task 1.2: Restyle & Expand UI Component Kit**
  - Refactor `Button.tsx` (Cocoa on Sky, minimum 36–38px desktop, 44px touch target on mobile).
  - Refactor `Card.tsx` (6px radius, 1px border, 16px padding).
  - Refactor `StatusBadge.tsx` (20px radius, blur backdrop, brand tone mapping, optional pulsing dot).
  - Refactor `Modal.tsx`, `Stepper.tsx`, and `EmptyState.tsx`.
  - Create `src/components/ui/Input.tsx` (38px height, 4px radius, inline validation, masks).
  - Create `src/components/ui/Select.tsx`.
  - Create `src/components/ui/Skeleton.tsx`.
  - Create `src/components/ui/Toast.tsx`.
- [ ] **Task 1.3: Navigation & Shell Layouts**
  - Build `src/components/layout/Navbar.tsx` (42px height, NCBA wordmark/logo, dark mode toggle).
  - Refactor `src/components/layout/Sidebar.tsx` (195px expanded / 50px collapsed).
  - Refactor `src/components/layout/BottomNav.tsx`.
  - Create `src/components/layout/FormLayout.tsx` (65/35 split desktop, collapses to single column with sticky bottom summary below 1024px).
  - Create `src/components/layout/LmsShell.tsx` and `src/components/layout/SignatoryShell.tsx`.
- [ ] **Task 1.4: Style Guide Page**
  - Create `src/pages/dev/StyleGuide.tsx` mapped to `/dev/StyleGuide`.
  - Display all UI components in all states (default, hover, focus, disabled, loading, error) in both Light and Dark modes.
- [ ] **Phase 1 Checkpoint:** Run `npm run build`; verify style guide renders; verify all existing pages continue functioning under new theme.

---

### Phase 2 — Customer Onboarding and KYB
- [ ] **Task 2.1: Entry & Whitelist Verification**
  - Update `Splash.tsx` and `SignUp.tsx` to accept Mobile Number and National ID.
  - Implement mock T24 lookup in `src/services/t24.ts`.
  - Build `/customer/ncba-now` redirect screen for New-To-Bank (NTB) applicants with resume onboarding action.
- [ ] **Task 2.2: Verification OTP & 4-Digit PIN**
  - Build `src/components/domain/OTPInput.tsx` (6 split numeric boxes, 45s countdown timer, resend button, demo code `123456`).
  - Refactor `CreatePin.tsx` with 4-digit numeric keypad mask, confirmation validation, and reveal toggle.
- [ ] **Task 2.3: Profile & 65/35 KYB Wizard Implementation**
  - Convert onboarding flow to use `FormLayout` (65% form steps, 35% sticky dynamic checklist and summary).
  - Personal Details step with "From NCBA T24" read-only badges.
  - Business Profile step: entity selection (Sole Proprietor, Partnership, Limited Company), sector, employee count, county, and sub-county.
  - Entity Mandate step: Single vs Multi-party mandate; dynamic roster builder for Partners/Directors.
- [ ] **Task 2.4: Hardware & Verification Components**
  - Document Uploader: National ID front & back, KRA certificates, CR12 / Certificate of Incorporation.
  - Live Facial Capture component with HTML5 canvas and oval face guide.
  - Create `src/components/domain/GeoCameraCapture.tsx` (live GPS lat/long/accuracy/timestamp lookup + shopfront photo snapshot with desktop/denied fallbacks).
  - Create `src/components/domain/SignaturePad.tsx` (HTML5 canvas drawing pad, touch/mouse support, clear, and export).
- [ ] **Task 2.5: Account Verification & Anchor Selection**
  - Wire `AccountVerification.tsx` to validate linked NCBA core account (success / not found / mismatch / unavailable).
  - Polish `SelectAnchor.tsx` allowing multi-selection from backend-eligible anchors.
- [ ] **Phase 2 Checkpoint:** Run `npm run build`; verify all 3 entity journeys (Sole Prop, Partnership, Ltd Co) and the NTB pathway end to end.

---

### Phase 3 — Dashboard, Anchors, Drawdown & Multi-Signatory Review
- [ ] **Task 3.1: Financial Calculations Engine**
  - Create `src/lib/calculations.ts`:
    - Base rate + 4.1% margin pro-rated by tenor.
    - Facility fee: 0.5%–4% per drawdown (anchor config).
    - Credit life insurance: 0.011%.
    - Excise duty: 20% on fees.
    - Disbursed amount to anchor collection account.
    - Total repayable and maturity date.
  - Add comprehensive calculation tests/verifications.
- [ ] **Task 3.2: Customer Dashboard Polish**
  - Add Cocoa hero band with total approved, utilised, available limits, and Sky progress ring.
  - Add Credit Score Card (751/900 "Excellent") with [Improve My Score] trigger.
  - Create `src/components/domain/ReassessmentModal.tsx` (M-Pesa statement upload + 6-digit password protection).
  - Anchor facility cards with CRB restriction states (disabled button, calm explanatory modal, simulated SMS).
- [ ] **Task 3.3: 65/35 Multi-Tenor Drawdown Stepper**
  - Rebuild `Drawdown.tsx` using `FormLayout` (65/35):
    - Left: Anchor selector, amount input (25%, 50%, Full chips), tenor pills (7, 14, 30, 60, 90), purpose selection.
    - Right: Sticky summary table with live fee breakdown updating on every keystroke.
  - Mandate execution branch:
    - `SINGLE` mandate: instant disbursement simulation to anchor collection account.
    - `JOINT_ANY` / `JOINT_ALL`: creates `PENDING_APPROVAL` drawdown and triggers simulated SMS alerts to signatories.
- [ ] **Task 3.4: Multi-Signatory Web Review Portal**
  - Create `/signatory/review/:token` with `SignatoryShell.tsx`.
  - Mobile-first standalone view with OTP verification.
  - Three distinct action paths:
    1. **Approve & sign** (canvas signature -> moves to `APPROVED` / `DISBURSED`).
    2. **Request rework** (comment drawer -> returns drawdown to initiator with notes).
    3. **Decline** (reason required -> audit rejection).
  - Handle expired and used token states.
- [ ] **Phase 3 Checkpoint:** Run `npm run build`; verify two concurrent drawdowns, a JOINT_ALL multi-signatory approval, and a rework cycle.

---

### Phase 4 — Repayment, Transactions, Notifications
- [ ] **Task 4.1: Loan Portfolio & Dual-Method Repayment**
  - Update `Loans.tsx` with filterable tabs: `All`, `Active`, `Overdue`, `Paid Off`.
  - Refactor `Repay.tsx`: Full vs Partial repayment with live remaining balance calculation.
  - NCBA Account debit option (instant simulation).
- [ ] **Task 4.2: M-Pesa STK Push Component**
  - Create `src/components/domain/MpesaStkModal.tsx`.
  - Model all A4.10 states: `IDLE`, `SENDING`, `WAITING_CONFIRMATION`, `SUCCESS`, `WRONG_PIN`, `CANCELLED`, `TIMEOUT`, `INSUFFICIENT_FUNDS`, `SYSTEM_FAILURE`.
  - Max 3 attempts with attempts-remaining counter; retry stays on screen without resetting flow.
- [ ] **Task 4.3: Financial Ledger & Notifications Synchronization**
  - Generate FTX payment reference and printable receipt screen.
  - Ensure repayments immediately update loan balance, anchor available limit, and transactions list.
  - Refactor `Transactions.tsx` with category filters (`All`, `Loans`, `Disbursements`, `Repayments`, `Fees`).
  - Implement per-loan 3-day due date reminders (in-app + simulated SMS).
- [ ] **Phase 4 Checkpoint:** Run `npm run build`; verify wrong PIN twice then success updates loan balance, available limit, transactions, and notifications.

---

### Phase 5 — Anchor Portal Polish
- [ ] **Task 5.1: Anchor Portal Design System Alignment**
  - Apply brand tokens, Century Gothic typography, and 195px sidebar to `AnchorShell.tsx` and all anchor views.
  - Restyle charts to 140–160px height in Sky, Mediterranean, Cocoa, and Passion.
- [ ] **Task 5.2: Retailer Portfolio Table & Aging**
  - Add search, filtering, and pagination to `AnchorCustomers.tsx`.
  - Columns: Customer Name, National ID, Facility Limit, Utilisation %, Overdue Ageing, Status.
  - Data minimisation enforcement (anchor sees only authorised fields for its own network).
- [ ] **Task 5.3: Annual Turnover Review State Machine**
  - Implement turnover review states: `DUE_SOON → DOCUMENTS_UPLOADED → SUBMITTED → UNDER_NCBA_REVIEW → APPROVED | MORE_INFO_REQUIRED | DECLINED`.
  - Add 30/14/7-day reminder banners, email preview drawer, and document upload history.
- [ ] **Phase 5 Checkpoint:** Run `npm run build`; verify anchor customer search, turnover review state transitions, and responsive chart layouts.

---

### Phase 6 — Bank LMS (Maker-Checker Operations)
- [ ] **Task 6.1: LMS Architecture & Role Separation**
  - Add `LmsShell.tsx` and `src/context/LmsContext.tsx`.
  - Create `src/services/lmsApi.ts`.
  - Extend `AuthContext.tsx` to support `BANK_MAKER` and `BANK_CHECKER` with demo switcher.
- [ ] **Task 6.2: LMS Dashboard & Portfolio Health**
  - Build `/lms/dashboard`: Gross portfolio, collections YTD, and PAR breakdown by CBK grade (`Normal` 0–30, `Watch` 30–90, `Sub-standard` 90–180, `Doubtful` 180–360, `Loss` 360+ DPD).
  - Create `src/components/lms/ParBadge.tsx` and default penalty calculation (30% p.a.).
- [ ] **Task 6.3: Partner Setup & Limit Amendment (Maker)**
  - Build `/lms/partners/new` (65/35 form: anchor core account validation, contact, facility limit, max tenor, base rate + margin).
  - Build `/lms/limits/new` (Maker: search customer, enter proposed limit, upload justification memo).
- [ ] **Task 6.4: Checker Queue & Audit Trail (Checker)**
  - Build `/lms/limits/queue` and `src/components/lms/QueueTable.tsx`.
  - Create `src/components/lms/AuditTrail.tsx` (immutable timeline of Maker submission and Checker decisions).
  - **Enforce Maker≠Checker separation:** Checkers cannot approve requests they created.
- [ ] **Task 6.5: Accounting Mirror & Reconciliations**
  - Build `/lms/accounting`: T24 GL entries mirror for principal, interest, penalty, facility fees, and BOOSTA control account (**strictly zero vendor names**).
  - Build `/lms/exceptions`: T24 FT references matching against gateway mobile transaction logs.
- [ ] **Phase 6 Checkpoint:** Run `npm run build`; verify Maker request appears in Checker queue, Maker cannot approve own request, and approval updates audit trail and customer limit.

---

### Phase 7 — QA, Scenario Walkthrough & Hardening
- [ ] **Task 7.1: Demo Scenario Switcher**
  - Create `src/mocks/scenarios.ts` covering all required states:
    - Normal customer (multi-anchor, active loans)
    - CRB-restricted customer (limit visible, drawdown locked)
    - Sole Proprietor, Partnership, and Limited Company profiles
    - New-to-Bank customer
    - Delinquent / overdue loan customer
    - Anchor turnover review due soon vs completed
    - Bank Maker / Bank Checker queues
- [ ] **Task 7.2: Brand & Design Hardening**
  - Grep codebase for zero vendor names (`Pezesha`, `Patascore`).
  - Grep codebase for zero arbitrary hex colors or hard-coded inline box shadows.
  - Verify WCAG AA contrast on all screens in Light and Dark mode.
  - Verify responsive layouts at 375px (mobile), 768px (tablet), and 1440px (desktop).
- [ ] **Task 7.3: Documentation & Production Handover**
  - Update `README.md` with prototype architecture, route map, simulation notes, and real API integration contracts (T24, Safaricom Daraja, CRB, Scorecard).
  - Document all confirmation items flagged for the NCBA product team.
- [ ] **Phase 7 Checkpoint:** Final `npm run build` passes; full scenario walkthrough verified.

---

## 7. Checkpoint & Sign-Off Criteria

| Phase | Core Deliverable | Verification Command | Gate / Acceptance Condition |
|---|---|---|---|
| **Phase 0 (Current)** | Audit Document (`docs/AUDIT.md`) | `npm run build` | Audit approved by user before code edits. |
| **Phase 1** | Design Tokens, UI Kit, Shells, `/dev/StyleGuide` | `npm run build` | Style guide renders all states in light & dark; existing views styled with brand tokens. |
| **Phase 2** | Onboarding 65/35, `GeoCameraCapture`, `SignaturePad` | `npm run build` | Sole Prop, Partnership, Ltd Co, and NTB onboarding flows operable. |
| **Phase 3** | Cocoa Hero Band, Calculations, Drawdown, Signatory Portal | `npm run build` | Drawdown fees match calculations; joint mandate triggers SMS and signatory approval/rework. |
| **Phase 4** | M-Pesa STK Push (3 attempts), Repayments, Ledger Sync | `npm run build` | STK retry sequence functions; repayments update balances and transactions. |
| **Phase 5** | Anchor Table, Aging, Turnover Review State Machine | `npm run build` | Anchor customer search and turnover state machine operational. |
| **Phase 6** | Bank LMS Shell, Maker-Checker Queue, Accounting Mirror | `npm run build` | Maker request reviewed and approved in Checker queue; Maker≠Checker enforced; 0 vendor names. |
| **Phase 7** | Full Scenario Switcher, Multi-Device QA, README | `npm run build` | Clean build, responsive 375/768/1440px, 0 lints, 0 vendor names. |

**Audit Status:** Complete. Ready for Phase 1 execution upon your review and approval.

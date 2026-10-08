# NCBA BOOSTA — Master Build Prompt v3 (Evolve the existing `src/`, do not rebuild)

> **How to use this file (not part of the prompt)**
> 1. Save **PART A** into the repo as `docs/BOOSTA_RULES.md` and tell the agent to re-read it at the start of every session.
> 2. Paste **one phase from PART B at a time**. Each phase ends with a checkpoint: the agent must run `npm run build`, summarise what changed, and stop for your review.
> 3. Ask the agent to write its task list / plan first and approve it before it edits code.

---

# PART A — PROJECT RULES (persistent)

## A1. Mission
You are a senior product designer, UX architect, FinTech solution architect and frontend engineer. You are extending the **NCBA BOOSTA** frontend: NCBA's digital unsecured working-capital product for approved distributors, retailers and stockists trading under approved anchors (e.g. EABL, Coca-Cola). The product moves from a vendor-built system to an NCBA-owned platform integrated (later) with T24, Safaricom Daraja, CRB/KYC services and an NCBA Data Team scorecard. **Nothing in any UI, copy, mock label or code identifier may name the former vendor.**

## A2. Golden rule — inspect first, then evolve
The project already contains a working React + TypeScript + Vite + Tailwind + React Router app with: a customer app (onboarding, dashboard, anchors, multiple loans per anchor, drawdown, repay with M-Pesa STK retry, transactions, notifications, support), an Anchor Portal (dashboard, sales, customers, turnover review, notifications, transactions, reports, settings), role-based routing, mock services and Recharts charts.

Before changing anything: list existing routes, components, contexts, services and mock data, and map each to what this document needs. **Reuse and refactor; do not delete working functionality or restart from scratch.** `npm run build` must pass at the end of every phase. If a requirement here conflicts with existing behaviour, this document wins.

## A3. Personas and roles
`type Role = 'CUSTOMER' | 'ANCHOR' | 'BANK_MAKER' | 'BANK_CHECKER'`

- **CUSTOMER** — borrower (sole proprietor, partnership, limited company).
- **ANCHOR** — corporate supplier; read-only view of its own ecosystem plus the annual turnover review.
- **BANK_MAKER** — NCBA officer who initiates changes (create anchor, amend product margins, request a customer limit change).
- **BANK_CHECKER** — NCBA approver who approves or rejects Maker requests. **A Checker can never approve a request they created** (enforce in UI; note for backend).
- **SIGNATORY** is *not* a Role. A partner/director opens a single-use, expiring tokenized link from an SMS (`/signatory/review/:token`) and uses a standalone mobile-first `SignatoryShell`. No login; verify with an OTP on that screen.

Enforce role separation with route guards: a role may never reach another role's routes (redirect to the demo role switcher).

## A4. Business rules (authoritative)
1. **The frontend never calculates eligibility, scores or limits.** It consumes decisions from services shaped like `{ status, limit, anchors[{anchorId, approvedLimit}], crbStatus, drawdownAllowed }`. Do not invent scorecard weights, CRB thresholds or limit formulas.
2. **CRB rule.** A credit-reference issue restricts **drawdown only**. The approved limit stays visible everywhere (never hidden, never shown as zero). Disable "Draw down", show a calm explanation modal, an in-app notification and a simulated SMS. Wording: "outstanding credit-reference issue". Never write "blacklisted" or "failed CRB".
3. **Multi-anchor.** One customer → many anchors, each with its own approved, utilised and available limit. Dashboard aggregates; anchor cards show detail. Customers choose only from anchors returned by the backend. No free-text anchor creation.
4. **Multi-loan, multi-tenor.** Every drawdown is its own `Loan` with its own reference, tenor, fees, schedule, due date, balance and repayment history. Several loans per anchor may be active at once. Allowed tenors come from the anchor config (`allowedTenors`, subset of 7/14/30/60/90, never above 90).
5. **Pricing is configuration, not code.** All rates live in a `pricingConfig` mock (base rate, margin, facility fee range 0.5%–4% per drawdown set per anchor, credit-life insurance rate, 20% excise duty on fees). Label every figure "Indicative — prototype". Confirmation items for the product team (flag in the UI notes, do not hard-code): the interest basis is *base rate + 4.1% margin pro-rated*, not a fixed percentage; the framework describes the credit-life fee (0.011%) as based on the **limit amount**, so confirm whether it applies per drawdown or per limit. Put all maths in `lib/calculations.ts` (single source of truth) with unit tests.
6. **Disbursement** goes only to the anchor's NCBA collection account (shown on the review screen).
7. **Mandates and approvals.** `MandateType = 'SINGLE' | 'JOINT_ANY' | 'JOINT_ALL'`. SINGLE: instant submission. JOINT_ANY: first approval completes. JOINT_ALL: every signatory must approve. Signatory actions: **Approve & sign**, **Request rework** (comment returns the drawdown to the initiator), **Decline** (reason required). Statuses: `PENDING_APPROVAL → APPROVED → DISBURSED`, or `REWORK_REQUESTED`, `REJECTED`. Links expire; show expired/used-token states.
8. **Limits are never edited by the customer.** "Request reassessment" (optional 6–12 month M-Pesa statement PDF + 6-digit password) only submits a request and shows "Reassessment requested". The result arrives later as a notification; any limit change is made by the backend and, where policy requires, through the Maker-Checker queue. The statement password is never stored, logged or echoed.
9. **Maker-Checker** (internal LMS): Maker submits a request with reason and supporting upload; Checker reviews audit trail and approves or rejects with comments; full history is visible and immutable.
10. **Repayment**: NCBA account debit (instant) or M-Pesa STK push. STK states: `IDLE, SENDING, WAITING_CONFIRMATION, SUCCESS, WRONG_PIN, CANCELLED, TIMEOUT, INSUFFICIENT_FUNDS, SYSTEM_FAILURE, DUPLICATE`. Maximum 3 attempts with an attempts-remaining counter; retries stay on the same screen. The M-Pesa PIN is never typed into the BOOSTA UI.
11. **Delinquency grades** (CBK): Normal 0–30, Watch 30–90, Sub-standard 90–180, Doubtful 180–360, Loss 360+ days past due. Default penalty shown as 30% p.a. (confirm with Credit).
12. **Reminders** are per loan: three days before each loan's own due date (in-app + simulated SMS). Three loans → three independent reminders.
13. **New-to-bank customers** who qualify but have no NCBA account are redirected to **NCBA NOW** (simulated), then return to resume onboarding.
14. **Data minimisation for anchors**: an anchor sees only authorised portfolio fields for its own customers.

## A5. Design system (brand-verified)
Colours come from the NCBA Corporate Guidelines (colour page) and the UI Complete Blueprint.

| Token | Hex | Use |
|---|---|---|
| Cocoa | `#39302D` | Primary text, brand dark, nav, hero bands |
| Sky | `#3AB3E5` | Primary interactive, active states, focus |
| Sky hover / dark | `#2A9ED0` / `#2188B5` | Hover / pressed |
| Sun | `#F8E200` | Accent highlights, badges (use sparingly) |
| Mediterranean | `#00A8A9` | Secondary, data viz, success |
| Coral | `#E4032C` | Critical, overdue, destructive |
| Passion | `#9F197E` | Optional third chart colour |
| Light: bg / paper / border | `#F7F8FA` / `#FFFFFF` / `#EDF2F7` | Surfaces |
| Light text: primary / secondary / muted | `#39302D` / `#525252` / `#9AA0A6` | |
| Dark: bg / paper / border | `#0D1117` / `#161B22` / `#30363D` | |
| Dark text: primary / secondary / muted | `#F0F6FC` / `#C9D1D9` / `#8B949E` | |

**Semantic mapping (brand-derived; replaces the blueprint's Bootstrap colours):** success = Mediterranean, warning = Sun with Cocoa text, error/critical = Coral, info = Sky. Confirm with NCBA brand owners.

**Contrast rules (measured, WCAG AA needs 4.5:1 for small text):**
- White text on Sky is only **2.4:1 — do not use it**. Primary buttons are Sky background with **Cocoa text (5.4:1)**.
- Sky as link text on white is 2.4:1 — use Cocoa text with a Sky underline/indicator, or a darker link token.
- White on Coral 4.8:1 (OK). White on Mediterranean 2.9:1 (not OK for small text) — use Cocoa on Mediterranean (4.4:1, use at 13px+ bold) or Mediterranean as a fill with no text.
- Never use Sun as text on white. Muted `#9AA0A6` on white is 2.6:1 — use only for non-essential captions, never for required information.
- Status is never colour-only: always an icon or text label.

**Typography:** `font-family: 'Century Gothic', 'CenturyGothic', 'AppleGothic', 'Questrial', sans-serif` (load Questrial from Google Fonts as the fallback so Android devices don't drop to a default font; confirm the official brand font with NCBA Marketing). Page title 18px/600, section 15px/600, card title 12px/600, body 13px/400, label 12px/500, table header 9px uppercase +0.5px tracking, caption 10px, badge 10px/500. Headings letter-spacing −0.02em.

**Geometry:** radius 4px (inputs, buttons, chips), 6px (cards), 20px (badges only). No box-shadows; 1px borders only. Input height 38px, button 36–38px on desktop; **minimum 44px touch targets below 768px**. Sidebar 195px / 50px collapsed. Navbar 42px, no shadow. Cards padding 16px (max 24px). Progress bars 3–4px.

**Layout:** complex forms (onboarding, KYB, drawdown, partner setup, limit amendment) use a **65/35 split**: left = inputs, uploads, camera, signature; right = sticky summary, step progress, document checklist, live calculations. Below 1024px collapse to one column with the summary as a sticky bottom bar/sheet.

**Badges:** `background: rgba(c, .15); border: 1px solid rgba(c, .3); backdrop-filter: blur(8px); border-radius: 20px; font-size: 10px` plus an optional 6px pulsing dot for live states.

**Dark mode:** implement with CSS variables and Tailwind `darkMode: 'class'`; no hard-coded colours in components; toggle in the navbar; persist the preference in memory only (no browser storage in the prototype).

**Motion:** 150–200ms transitions, `translateY(-1px)` hover on cards, skeleton loaders instead of spinners for page loads, respect `prefers-reduced-motion`.

**Eye-catching, within the blueprint:** the polish comes from hierarchy, not shadows. Required: a Cocoa hero band on dashboards with the total available limit large and a Sky progress ring for utilisation; sparkline mini-charts in metric cards; a score/limit ring; clear empty states with an icon and one primary action; consistent Lucide icons (16px, stroke 1.75); real NCBA logo SVG in `assets/` (placeholder wordmark until supplied); restrained use of Sun for one highlight per screen; charts 140–160px high in Sky/Mediterranean/Cocoa/Passion with right-aligned legends.

## A6. Technical stack and structure
React 18, TypeScript strict, Vite, Tailwind (tokens above in `tailwind.config` and CSS variables), React Router v6, Lucide, Recharts, HTML5 Canvas for signatures. **No UI kits** (MUI, AntD, Chakra). Extend this structure:

```
src/
├── assets/                 NCBA logo SVG
├── components/
│   ├── ui/                 Button, Card, Input, Select, StatusBadge, Modal, Stepper, EmptyState, Skeleton, Toast
│   ├── domain/             AnchorCard, LoanCard, LimitCard, DocumentUploader, GeoCameraCapture, SignaturePad,
│   │                       MpesaStkModal, ReassessmentModal, CRBRestrictionModal, MakerCheckerModal, TransactionRow, OTPInput
│   ├── anchor/             MetricCard, SalesChart, StatusPie
│   ├── lms/                ParBadge, AuditTrail, QueueTable
│   └── layout/             AppShell, AnchorShell, LmsShell, SignatoryShell, Navbar, Sidebar, BottomNav, FormLayout (65/35)
├── context/                AppContext, AnchorContext, LmsContext, AuthContext (4 roles)
├── lib/                    format.ts, calculations.ts (+ tests), status.ts, validators.ts, onboardingSteps.ts
├── mocks/                  data.ts, scenarios.ts
├── services/               api.ts, anchorApi.ts, lmsApi.ts, t24.ts, mpesa.ts   (all return Promises, simulated latency)
├── pages/ onboarding/ customer/ anchor/ lms/ signatory/  + RoleSwitch.tsx, dev/StyleGuide.tsx
└── types/index.ts
```

## A7. Engineering standards
- No `TODO` stubs, no truncated files, no placeholder logic.
- Validation with inline messages and input masks: Kenyan mobile (07XX / +2547XX), KES with thousands separators, National ID (7–8 digits), NCBA account number, 6-digit OTP, 4-digit PIN with reveal toggle.
- Every async operation models `idle | loading | success | error | pending | empty`. Every error says what happened, why it matters, and what to do next — no error codes.
- Accessibility: labels on all fields, keyboard navigation, visible focus rings, `aria-live` for status changes, logical heading order.
- Responsive at 375px, 768px and 1440px.
- Security (prototype-level, written so the real thing slots in): never persist PIN, OTP or statement password; mask sensitive values; signatory tokens are single-use and expire; file uploads validate type and size; idle-session timeout state; geolocation and camera only on secure contexts with explicit permission, with **denied / unavailable / low-accuracy fallbacks** (manual retry, desktop-without-camera upload, and a note that captured location is evidence the backend must validate).
- Mock services only. Do not claim T24, M-Pesa, CRB or the scorecard are connected. Provide a demo scenario switcher (normal, CRB-restricted, multi-anchor, multiple active loans, overdue loan, new-to-bank, sole proprietor, partnership, limited company, anchor review due, anchor review done).

## A8. Types (extend `src/types/index.ts`)
```ts
export type Role = 'CUSTOMER' | 'ANCHOR' | 'BANK_MAKER' | 'BANK_CHECKER';
export type BusinessType = 'SOLE_PROPRIETOR' | 'PARTNERSHIP' | 'LIMITED_COMPANY';
export type MandateType = 'SINGLE' | 'JOINT_ANY' | 'JOINT_ALL';
export type LoanTenorDays = 7 | 14 | 30 | 60 | 90;
export type CrbStatus = 'CLEAR' | 'REVIEW_REQUIRED';
export type LoanStatus = 'ACTIVE' | 'OVERDUE' | 'PAID' | 'IN_DEFAULT';
export type DrawdownStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'REWORK_REQUESTED' | 'REJECTED' | 'APPROVED' | 'DISBURSED';

export interface GeoCapture { latitude: number; longitude: number; accuracy: number; timestamp: string; photoUrl: string }
export interface Signatory { id: string; fullName: string; nationalId: string; phone: string; email?: string;
  role: 'DIRECTOR' | 'PARTNER'; status: 'PENDING' | 'APPROVED' | 'REWORK_REQUESTED' | 'DECLINED';
  signatureUrl?: string; signedAt?: string; comments?: string }
export interface CustomerProfile { id: string; t24Cif?: string; isExistingNcbaCustomer: boolean;
  fullName: string; nationalId: string; phone: string; email?: string; dob: string; educationLevel?: string;
  prefilledFromT24: string[]; ncbaAccounts: { number: string; name: string }[];
  businessName: string; businessType: BusinessType; mandate: MandateType; sector: string; employees: number;
  dateStarted: string; county: string; subCounty: string; premises?: GeoCapture; signatories: Signatory[] }
export interface AnchorFacility { id: string; name: string; logoInitial: string; type: 'ANCHOR' | 'SUB_ANCHOR';
  approvedLimit: number; availableLimit: number; collectionAccountNumber: string;
  crbStatus: CrbStatus; drawdownAllowed: boolean; allowedTenors: LoanTenorDays[];
  baseRateMarginPct: number; facilityFeePct: number }
export interface Loan { id: string; reference: string; anchorId: string; anchorName: string; principal: number;
  outstandingBalance: number; tenorDays: LoanTenorDays; purpose: string; interestAmount: number; facilityFee: number;
  insuranceFee: number; exciseDuty: number; totalRepayable: number; disbursedAt: string; dueDate: string; status: LoanStatus }
export interface DrawdownRequest { id: string; reference: string; anchorId: string; amount: number; tenorDays: LoanTenorDays;
  purpose: string; status: DrawdownStatus; initiatedBy: string; approvals: { signatoryId: string; status: Signatory['status']; comments?: string; at?: string }[];
  tokenExpiresAt?: string; createdAt: string }
export interface LimitAmendment { id: string; customerId: string; customerName: string; anchorId: string; currentLimit: number;
  proposedLimit: number; reason: string; attachments: string[]; makerId: string; checkerId?: string; checkerComments?: string;
  status: 'PENDING_CHECKER' | 'APPROVED' | 'REJECTED'; createdAt: string; decidedAt?: string }
export interface PartnerSetup { name: string; coreAccountNumber: string; contactPerson: string; facilityLimit: number;
  maxTenor: LoanTenorDays; baseRate: number; marginPct: number; allowedTenors: LoanTenorDays[] }
```

## A9. Routes
Public/onboarding: `/` · `/customer/login` · `/customer/signup` · `/customer/otp` · `/customer/create-pin` · `/customer/profile` · `/customer/kyc` · `/customer/business-profile` · `/customer/business-documents` · `/customer/ncba-now` · `/customer/account-verification` · `/customer/select-anchors` · `/signatory/review/:token` · `/role`
Customer: `/customer/dashboard` · `/customer/anchors` · `/customer/anchors/:id` · `/customer/loans` · `/customer/loans/:id` · `/customer/drawdown` · `/customer/drawdown/:id` (approval tracker) · `/customer/repay` · `/customer/repay/status` · `/customer/transactions` · `/customer/notifications` · `/customer/support` · `/customer/profile/settings`
Anchor: `/anchor/login` · `/anchor/dashboard` · `/anchor/customers` · `/anchor/customers/:id` · `/anchor/sales` · `/anchor/transactions` · `/anchor/turnover-review` · `/anchor/reports` · `/anchor/notifications` · `/anchor/settings`
Bank LMS: `/lms/login` · `/lms/dashboard` · `/lms/partners/new` · `/lms/limits/new` (Maker) · `/lms/limits/queue` (Checker) · `/lms/customers` · `/lms/accounting` · `/lms/exceptions`

---

# PART B — PHASE PROMPTS (run one at a time)

## Phase 0 — Audit (no code changes)
Read Part A. Inspect the codebase and write `docs/AUDIT.md`: existing routes, components, contexts, services, mock data; a table mapping each to Part A; what will be reused, refactored, added; risks; and the exact task list for Phases 1–7. Run `npm run build` and record the result. **Stop and wait for approval.**

## Phase 1 — Foundation, theme and UI kit
Implement the A5 tokens in `tailwind.config` and CSS variables (light + dark), fonts, and restyle the UI kit (Button, Card, Input, Select, StatusBadge, Modal, Stepper, EmptyState, Skeleton, Toast) to the blueprint, applying the contrast rules. Build `Navbar` (42px), `Sidebar` (195/50), `BottomNav`, the four shells, and a reusable `FormLayout` (65/35, collapses below 1024px). Add `/dev/StyleGuide` showing every component in every state in light and dark. **Checkpoint:** build passes, style guide complete, existing pages still render with the new theme.

## Phase 2 — Customer onboarding and KYB
Order: invitation SMS → mobile number → OTP (6 digits, 45s resend, demo code 123456, invalid/expired/success) → 4-digit PIN (reveal toggle) → identity lookup (phone, National ID, NCBA account) → T24 branch: existing customer = prefill with "From NCBA T24" read-only badges; new-to-bank = NCBA NOW redirect screen and return → personal details → ID front/back + live selfie with oval guide (all `DocumentUploader` states) → business profile → **`GeoCameraCapture`** (permission prompt, live viewfinder, latitude/longitude/accuracy/timestamp, retake, all fallbacks) → entity selection with conditional documents (sole proprietor: permit + registration + KRA; partnership: deed + registration + partner roster; limited company: CR12 + certificate of incorporation + director roster; KRA personal/business, CR1/CR2/CR8 optional) → **`SignaturePad`** (canvas, clear, PNG output) → mandate and signatory roster → NCBA account verification (success / not found / mismatch / unavailable; blocks progress until verified) → select anchors from the backend-provided eligible list (select all / none) → dashboard. Use the 65/35 layout with a live checklist on the right. **Checkpoint:** all three entity paths and the NTB path demonstrable.

## Phase 3 — Dashboard, anchors, drawdown and approvals
Dashboard: Cocoa hero band with total approved / utilised / available and a utilisation ring; reassessment entry point (A4.8); multi-anchor grid; "My active loans" with independent due dates and progress bars; CRB-restricted states (disabled button, modal, notification, SMS simulation). Build `lib/calculations.ts` + tests, then the drawdown flow in 65/35: anchor → amount (25/50/Full chips, live limit validation) → tenor (anchor-allowed only) + purpose → live breakdown (principal, facility fee, interest, insurance, excise, net to anchor collection account, total repayable, due date) → submit. SINGLE mandate disburses instantly; joint mandates create `PENDING_APPROVAL`, show a signatory progress tracker and simulated SMS links. Build `/signatory/review/:token` (terms review, OTP check, Approve & sign / Request rework / Decline, expired/used token states) and the rework loop back to the initiator. **Checkpoint:** same-day drawdowns from two anchors, two loans from one anchor, a JOINT_ALL approval and a rework loop all work end to end with consistent balances.

## Phase 4 — Repayment, transactions, notifications
Loan selector, full/partial toggle with live remaining balance, NCBA debit and `MpesaStkModal` implementing every A4.10 state (3 attempts, counters, clear copy, fallback method). Receipt with FTX reference. Transactions with filters (All, Loans, Disbursements, Repayments, Fees) driven by real prototype actions; notification centre with categories; per-loan three-day reminders. **Checkpoint:** wrong PIN twice then success updates the loan, available limit, transactions and notifications consistently.

## Phase 5 — Anchor portal polish
Apply the design system to the existing portal. Add the portfolio table (search, pagination; columns: name, National ID, limit, utilisation %, overdue ageing, status), upcoming/overdue obligation alerts, and the turnover review state machine `DUE_SOON → DOCUMENTS_UPLOADED → SUBMITTED → UNDER_NCBA_REVIEW → APPROVED | MORE_INFO_REQUIRED | DECLINED` with 30/14/7-day and due-date reminders, email preview, and unread/read/archived notifications. Charts 140–160px.

## Phase 6 — Bank LMS (Maker-Checker)
Add `LmsShell`, `LmsContext`, `lmsApi.ts` and a Maker/Checker role switcher. Pages: dashboard (gross portfolio, collections YTD, PAR by CBK grade with `ParBadge`), partner/anchor creation form (65/35; core account validation, contact, facility limit, max tenor, base rate + margin, allowed tenors), Maker limit-amendment form with justification upload, Checker queue (approve / reject with comments, Maker≠Checker enforced), customer list, accounting mirror (T24 GL entries for principal interest, penalty interest, facility fees and a BOOSTA control account — **no vendor names**), and an exceptions view matching T24 FT references to gateway logs. **Checkpoint:** a Maker request appears in the Checker queue and the decision is reflected in the audit trail.

## Phase 7 — QA and hardening
Walk every demo scenario at 375 / 768 / 1440px in light and dark. Verify: no vendor names (grep), no hard-coded colours, no box-shadows, contrast rules, keyboard access, role separation, financial consistency (utilised + available = approved; overall outstanding = sum of loan balances), every error follows what/why/next. Update `README.md` with run steps, a route map, what is simulated, and what depends on real APIs (T24, scorecard, CRB/KYC, SMS/email, authentication). Final output: summary of preserved / changed / added / simulated / backend-dependent items.

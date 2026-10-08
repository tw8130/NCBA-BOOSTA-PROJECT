# NCBA BOOSTA — Customer + Anchor Prototype (v2)

A clickable, fully NCBA-owned prototype of NCBA BOOSTA covering **both** the
customer experience and a new **Anchor Portal** — built on top of the v1
prototype, updated to the revised business rules from NCBA Retail Innovation.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. The landing page simulates the invitation SMS a
customer receives once NCBA's scoring engine has already assessed them. Use
**"Switch demo role"** (or go to `/role`) at any time to jump straight into
either the customer app or the Anchor Portal with pre-seeded data — this is a
prototype-only mechanism, not a real login.

`npm run build` produces a static production build in `dist/`.

## What changed in this revision

This update preserved the existing v1 screens, components, and NCBA visual
language, and layered the new business rules on top — nothing was rebuilt
from scratch. Route paths did change (everything now sits under `/customer/`
or `/anchor/`), and the loan data model changed from "one active loan per
anchor" to "many independent loans per anchor," which touched most pages.

### Preserved
- All original onboarding screens, in spirit and structure (KYC, business
  documents, PIN, profile).
- The visual language, components (`Card`, `Button`, `StatusBadge`,
  `AnchorCard`, `Modal`, etc.), and the Tailwind/NCBA colour system.
- The M-Pesa STK Push retry state machine from v1 (wrong PIN → retry →
  success), now reused per-loan since a customer can have several loans.
- The mock API abstraction pattern — still no page or component talks to
  T24/CRB/the scorecard directly.

### Changed
- **Onboarding order**: invitation SMS → mobile number → OTP → PIN → profile
  (NCBA-prefilled fields marked) → KYC → business documents (conditional on
  entity type) → **NCBA account verification (new)** → select anchors (now
  the *last* step, from an NCBA-provided eligible list, not the first step
  from an open list).
- **CRB rule**: a credit-reference issue now restricts *drawdown only*. The
  approved limit is never hidden or zeroed — see `Anchor.crbStatus` /
  `drawdownAllowed` in `src/types/index.ts`, and `CRBRestrictionModal.tsx`
  for the customer-facing explanation.
- **Multiple loans per anchor**: a customer can draw down again from an
  anchor even with an active loan there, as long as available limit permits.
  Every drawdown is its own `Loan` record with its own reference and due
  date — see "My Active Loans" on the dashboard and the new `/customer/loans`
  list.
- **Limit review moved to the anchor.** The old customer-facing "request a
  limit review" flow is gone. Annual turnover review is now an **anchor-side**
  workflow (`/anchor/turnover-review`) — upload → submit → NCBA review →
  outcome, with a reminder schedule.

### Added
- **A complete Anchor Portal** (`/anchor/*`), an entirely separate role from
  the customer app, with its own layout, data, and mock services:
  dashboard, sales (weekly/monthly/annual charts + per-customer table),
  customers table + detail, annual turnover review workflow, a notification
  centre with unread/read/archived states and an email-preview simulation,
  an NCBA transactions ledger, and a reports page with trend/pie charts
  (recharts).
- **Account verification** as its own onboarding step, with all four outcome
  states (success, not found, mismatch, system unavailable).
- **Richer document upload states** (`DocumentUploader.tsx`): not uploaded →
  uploading → verifying → verified/failed → replace — reused across KYC,
  business documents, and the anchor's turnover upload.
- **Role-based routing** (`RequireRole` in `App.tsx`) — an anchor session
  cannot reach `/customer/*` and vice versa.

### Simulated (prototype-only, not real integrations)
- OTP verification (demo code is always `123456`).
- NCBA account verification (any account number containing "4455", or a
  blank field, succeeds — see the on-screen prototype tip).
- The credit decision / scorecard response shape (`ScorecardDecision` in
  `src/types/index.ts`) — the frontend consumes this shape but never
  computes it.
- M-Pesa STK Push outcomes, turnover review approval, and application
  approval are all timed `setTimeout` sequences standing in for real
  asynchronous backend callbacks.

### Still dependent on real backend work
- T24 for actual disbursement/repayment ledger entries and GL postings.
- The real NCBA credit-decision/scorecard service (NCBA Data Team).
- Real CRB/KYC/AML checks and anchor trading-data integrations.
- Real OTP delivery, SMS, and email sending.
- Authentication and role enforcement — the `RequireRole` guard here is a
  frontend convenience only; a real deployment must enforce this
  server-side.

## Project structure

```
src/
  types/            Shared TypeScript types (v2 domain model)
  mocks/             Seed data — customer, anchors, loans, anchor portal data
  services/
    api.ts            Customer-side mock API (loans, applications, repayments)
    anchorApi.ts       Anchor portal mock API (sales, customers, turnover, notifications)
    mpesa.ts           M-Pesa STK Push simulation
  context/
    AppContext.tsx     Customer-side global store
    AnchorContext.tsx  Anchor portal global store (mounted only under /anchor)
    AuthContext.tsx    Prototype-only role state
  lib/               Formatting, status→label/colour maps, onboarding step labels
  components/
    ui/                Generic building blocks
    domain/            Customer-specific: AnchorCard, LoanCard, DocumentUploader, CRBRestrictionModal, etc.
    anchor/             Anchor-specific: MetricCard, SalesChart, StatusPie
    layout/             AppShell (customer), AnchorShell (anchor portal)
  pages/
    onboarding/         New customer, in the revised order
    loan/                Drawdown.tsx (the full apply → review → confirm flow)
    repay/               Repay.tsx, RepayStatus.tsx
    anchor/              The entire Anchor Portal
    Dashboard.tsx, Anchors.tsx, AnchorDetail.tsx, Loans.tsx, LoanDetail.tsx, ...
```

## Prototype data

All customer, anchor, loan, and sales data in `src/mocks/data.ts` is
fictional sample data for demonstration only.

import { useState } from 'react'
import {
  Wallet,
  ArrowRight,
  Check,
  Search,
  Eye,
  AlertTriangle,
  Building2,
  Sun,
  Moon,
  Sparkles,
  Phone,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Stepper } from '../../components/ui/Stepper'
import { EmptyState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Skeleton'
import { Toast } from '../../components/ui/Toast'
import { Modal } from '../../components/ui/Modal'
import { useTheme } from '../../context/ThemeContext'
import { Navbar } from '../../components/layout/Navbar'

export default function StyleGuide() {
  const { isDark, toggleTheme } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [stepperStep, setStepperStep] = useState(1)

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      <Navbar title="Brand Design System & Style Guide" />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Header & Theme Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border dark:border-surface-dark-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-[20px] bg-sky-tint text-cocoa dark:bg-sky/20 dark:text-sky text-[10px] font-semibold border border-sky/30">
                Phase 1 Foundation
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-medium">
                Century Gothic / Questrial · Flat 1px Borders · WCAG AA
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
              NCBA BOOSTA Design System
            </h1>
            <p className="text-[13px] text-text-light-secondary dark:text-text-dark-secondary mt-1 max-w-2xl">
              Brand-verified design tokens from the NCBA Corporate Guidelines and Ecosystem Financing Framework.
              Strictly enforcing WCAG AA contrast, 4px/6px geometry, and zero box-shadows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={toggleTheme}
              leftIcon={isDark ? <Sun size={15} className="text-sun" /> : <Moon size={15} />}
            >
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </Button>
          </div>
        </div>

        {/* 1. Color Tokens Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
              1. Brand Color Tokens (A5)
            </h2>
            <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
              Authoritative Hex Specifications
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <ColorSwatch name="Cocoa" hex="#39302D" bg="bg-[#39302D]" text="text-white" role="Brand Dark / Text / Hero Band" />
            <ColorSwatch name="Sky" hex="#3AB3E5" bg="bg-[#3AB3E5]" text="text-[#39302D]" role="Primary Interactive (Cocoa Text)" />
            <ColorSwatch name="Sun" hex="#F8E200" bg="bg-[#F8E200]" text="text-[#39302D]" role="Accent Highlight (Sparingly)" />
            <ColorSwatch name="Mediterranean" hex="#00A8A9" bg="bg-[#00A8A9]" text="text-white" role="Secondary / Success / Viz" />
            <ColorSwatch name="Coral" hex="#E4032C" bg="bg-[#E4032C]" text="text-white" role="Critical / Overdue / Destructive" />
            <ColorSwatch name="Passion" hex="#9F197E" bg="bg-[#9F197E]" text="text-white" role="Tertiary Chart Accent" />
          </div>

          {/* Contrast Rules Banner */}
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Card className="border-mediterranean/30 bg-mediterranean/5">
              <div className="flex items-start gap-2.5">
                <Check className="text-mediterranean mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-[12px] font-semibold text-mediterranean">
                    Enforced WCAG AA Compliant Combinations
                  </p>
                  <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                    <strong>Primary Buttons:</strong> Cocoa on Sky is <span className="font-semibold text-cocoa dark:text-white">5.4:1</span> (Passes AA).
                    <br />
                    <strong>Warning Badges:</strong> Cocoa text on Sun background is <span className="font-semibold text-cocoa dark:text-white">9.1:1</span> (Passes AAA).
                    <br />
                    <strong>Critical Buttons:</strong> White on Coral is <span className="font-semibold text-cocoa dark:text-white">4.8:1</span> (Passes AA).
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-coral/30 bg-coral/5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="text-coral mt-0.5 shrink-0" size={16} />
                <div>
                  <p className="text-[12px] font-semibold text-coral">
                    Prohibited Combinations (Part A5)
                  </p>
                  <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-1 leading-relaxed">
                    <strong>Forbidden:</strong> White text on Sky is only 2.4:1 (Fails AA).
                    <br />
                    <strong>Forbidden:</strong> Sun text on white background (Fails AA).
                    <br />
                    <strong>Forbidden:</strong> Plain box-shadows or gradients; 1px borders only.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. Typography Scale */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            2. Typography Hierarchy (Century Gothic / Questrial)
          </h2>
          <Card className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-[18px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
                Page Title — 18px / 600 (Letter-spacing: -0.02em)
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                text-page-title
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
                Section Heading — 15px / 600 (Letter-spacing: -0.02em)
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                text-section-title
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-[13px] font-normal text-cocoa dark:text-text-dark-primary">
                Body Text — 13px / 400 (Leading: 18px)
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                text-body-sm
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-surface-border dark:border-surface-dark-border">
              <span className="text-[12px] font-medium text-text-light-secondary dark:text-text-dark-secondary">
                Input & Card Label — 12px / 500
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                text-label-sm
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.5px] font-semibold text-text-light-muted dark:text-text-dark-muted">
                TABLE HEADER — 9PX UPPERCASE (+0.5PX TRACKING)
              </span>
              <span className="text-[11px] text-text-light-muted dark:text-text-dark-muted font-mono">
                text-table-header
              </span>
            </div>
          </Card>
        </section>

        {/* 3. Buttons Kit */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            3. Buttons Kit (`Button.tsx`)
          </h2>
          <Card className="space-y-5">
            <div>
              <p className="text-[11px] font-medium text-text-light-muted dark:text-text-dark-muted uppercase tracking-wider mb-2">
                Variants (Radius 4px, Min Touch Target 44px on Mobile)
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary (Sky + Cocoa)</Button>
                <Button variant="secondary">Secondary (Paper + Border)</Button>
                <Button variant="accent">Accent (Sun Highlight)</Button>
                <Button variant="danger">Danger (Coral)</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="primary" disabled>Disabled State</Button>
                <Button variant="primary" loading>Loading State</Button>
              </div>
            </div>

            <div className="border-t border-surface-border dark:border-surface-dark-border pt-4">
              <p className="text-[11px] font-medium text-text-light-muted dark:text-text-dark-muted uppercase tracking-wider mb-2">
                Sizes & Icons
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" leftIcon={<Sparkles size={13} />}>Small Button</Button>
                <Button size="md" leftIcon={<Wallet size={15} />}>Medium (Default)</Button>
                <Button size="lg" rightIcon={<ArrowRight size={16} />}>Large CTA Button</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Form Controls */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            4. Inputs & Selects (`Input.tsx`, `Select.tsx`)
          </h2>
          <Card>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                label="Registered Mobile Number"
                placeholder="07XX XXX XXX"
                prefixAddon={<Phone size={15} />}
                helperText="Kenyan mobile number for OTP dispatch."
              />
              <Input
                label="Full Legal Name"
                defaultValue="Bonface Macharia"
                badgeText="From T24"
                helperText="Verified against NCBA CIF."
              />
              <Input
                label="Requested Drawdown Amount"
                placeholder="0"
                defaultValue="6,500,000"
                error="Exceeds available limit of KES 5,000,000."
              />
              <Select
                label="Repayment Tenor"
                options={[
                  { value: '7', label: '7 Days Tenor' },
                  { value: '14', label: '14 Days Tenor' },
                  { value: '30', label: '30 Days Tenor' },
                  { value: '60', label: '60 Days Tenor' },
                  { value: '90', label: '90 Days Tenor' },
                ]}
                helperText="Allowed by anchor configuration."
              />
              <Input
                label="National ID Number"
                placeholder="24567891"
                prefixAddon={<Search size={15} />}
              />
              <Input
                label="Disabled Field"
                defaultValue="Locked for audit"
                disabled
                helperText="Read-only system metadata."
              />
            </div>
          </Card>
        </section>

        {/* 5. Status Badges */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            5. Status Badges (A5: 20px Radius, Blur Backdrop, Optional Pulsing Dot)
          </h2>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label="Disbursed" tone="success" pulsing />
              <StatusBadge label="Under Assessment" tone="warning" pulsing />
              <StatusBadge label="Drawdown On Hold (CRB)" tone="warning" />
              <StatusBadge label="Overdue / Default" tone="danger" pulsing />
              <StatusBadge label="Pending Maker Review" tone="info" />
              <StatusBadge label="Draft" tone="neutral" />
              <StatusBadge label="Turnover FY26" tone="accent" />
            </div>
          </Card>
        </section>

        {/* 6. Stepper & Progress */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            6. Steppers (`Stepper.tsx`, 3px Bars)
          </h2>
          <Card className="space-y-4">
            <Stepper
              steps={['Verify OTP', 'Set PIN', 'Business KYB', 'Account Link', 'Select Anchors']}
              current={stepperStep}
              showLabels
            />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setStepperStep((p) => Math.max(0, p - 1))}>
                Previous Step
              </Button>
              <Button size="sm" onClick={() => setStepperStep((p) => Math.min(4, p + 1))}>
                Next Step
              </Button>
            </div>
          </Card>
        </section>

        {/* 7. Toasts, Alerts & Empty States */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            7. Toasts & Feedback (`Toast.tsx`, `EmptyState.tsx`, `Skeleton.tsx`)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Toast
                type="success"
                title="Drawdown Disbursed"
                message="KES 1,200,000 sent directly to EABL collection account."
              />
              <Toast
                type="warning"
                title="Outstanding Credit-Reference Issue"
                message="Your approved limit of KES 5,000,000 remains visible, but drawdown is temporarily restricted."
              />
              <Toast
                type="danger"
                title="Payment Timed Out"
                message="Safaricom Daraja STK prompt was not confirmed in 60s. You have 2 retries remaining."
              />
              <Toast
                type="info"
                title="T24 Verification Linked"
                message="Your NCBA core banking account has been validated."
              />
            </div>

            <div className="space-y-4">
              <EmptyState
                icon={Building2}
                title="No Pending Director Approvals"
                detail="All joint-mandate drawdown applications have been signed or disbursed."
                action={<Button size="sm" variant="secondary">Check Audit Trail</Button>}
              />

              <Card className="space-y-2">
                <p className="text-[11px] font-semibold text-text-light-muted dark:text-text-dark-muted uppercase">
                  Skeleton Loading Pattern
                </p>
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" width={36} height={36} />
                  <div className="flex-1 space-y-1">
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="40%" />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* 8. Interactive Modal Demo */}
        <section className="space-y-4">
          <h2 className="text-[15px] font-semibold tracking-tight text-cocoa dark:text-text-dark-primary">
            8. Modal Dialog (`Modal.tsx`)
          </h2>
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary">
                Test Modal Component
              </p>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary">
                Opens accessible dialog with 6px radius, flat 1px border, and ESC key listener.
              </p>
            </div>
            <Button onClick={() => setModalOpen(true)} leftIcon={<Eye size={14} />}>
              Open Test Modal
            </Button>
          </Card>

          {modalOpen && (
            <Modal
              title="NCBA Scorecard Assessment Details"
              subtitle="Prototype reference decision #CRB-9982"
              onClose={() => setModalOpen(false)}
            >
              <div className="space-y-3 text-[13px] text-text-light-secondary dark:text-text-dark-secondary">
                <p>
                  This modal verifies that dialogs render cleanly without box-shadows, applying 1px borders,
                  proper typography, and accessible button actions.
                </p>
                <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/10 border border-sky/30 text-cocoa dark:text-sky text-[12px]">
                  <strong>CRB Rule Verified:</strong> The approved limit of KES 5,000,000 is always visible. Drawdown is restricted until resolution.
                </div>
                <div className="pt-2 flex gap-3">
                  <Button full variant="secondary" onClick={() => setModalOpen(false)}>
                    Close Modal
                  </Button>
                  <Button full onClick={() => setModalOpen(false)}>
                    Acknowledge
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </section>
      </main>
    </div>
  )
}

function ColorSwatch({
  name,
  hex,
  bg,
  text,
  role,
}: {
  name: string
  hex: string
  bg: string
  text: string
  role: string
}) {
  return (
    <div className="rounded-[6px] border border-surface-border dark:border-surface-dark-border overflow-hidden bg-white dark:bg-surface-dark-paper">
      <div className={`h-16 ${bg} flex items-end p-2 ${text}`}>
        <span className="text-[11px] font-bold tracking-tight">{hex}</span>
      </div>
      <div className="p-2">
        <p className="text-[12px] font-semibold text-cocoa dark:text-text-dark-primary">{name}</p>
        <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted mt-0.5 line-clamp-2 leading-tight">
          {role}
        </p>
      </div>
    </div>
  )
}

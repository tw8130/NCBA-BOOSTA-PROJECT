import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react'
import { LmsShell } from '../../components/layout/LmsShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatKES } from '../../lib/format'
import { useLms } from '../../context/LmsContext'

const TENOR_OPTIONS = [7, 14, 30, 60, 90]

export default function LmsPartnerNew() {
  const { createPartner, validateCoreAccount, currentUser } = useLms()
  const navigate = useNavigate()

  // Form State
  const [name, setName] = useState('')
  const [anchorCode, setAnchorCode] = useState('')
  const [coreAccount, setCoreAccount] = useState('')
  const [validatedAccount, setValidatedAccount] = useState<{
    valid: boolean
    accountName?: string
    branch?: string
    error?: string
  } | null>(null)
  const [validating, setValidating] = useState(false)

  const [contactPerson, setContactPerson] = useState('')
  const [contactPhone, setContactPhone] = useState('+254')
  const [contactEmail, setContactEmail] = useState('')

  const [facilityLimit, setFacilityLimit] = useState(50_000_000)
  const [maxTenor, setMaxTenor] = useState(90)
  const [baseRate, setBaseRate] = useState(13.0)
  const [margin, setMargin] = useState(3.0)
  const [allowedTenors, setAllowedTenors] = useState<number[]>([7, 14, 30, 60, 90])
  const [disbursementMode, setDisbursementMode] = useState<
    'DIRECT_SETTLEMENT' | 'ESCROW' | 'CORE_ACCOUNT'
  >('DIRECT_SETTLEMENT')

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const effectiveRate = Number((baseRate + margin).toFixed(2))

  async function handleValidateAccount() {
    if (!coreAccount.trim()) return
    setValidating(true)
    setValidatedAccount(null)
    const res = await validateCoreAccount(coreAccount)
    setValidatedAccount(res)
    setValidating(false)
  }

  function toggleTenor(t: number) {
    if (allowedTenors.includes(t)) {
      if (allowedTenors.length > 1) {
        setAllowedTenors(allowedTenors.filter((item) => item !== t))
      }
    } else {
      setAllowedTenors([...allowedTenors, t].sort((a, b) => a - b))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !anchorCode || !coreAccount || !contactPerson || !contactEmail) {
      setFormError('Please fill in all mandatory corporate partner fields.')
      return
    }

    if (!validatedAccount?.valid) {
      setFormError('Please validate the T24 Core Account before submitting to Maker workflow.')
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      await createPartner({
        anchorCode,
        name,
        coreAccount,
        accountName: validatedAccount.accountName || `${name} Corporate Account`,
        contactPerson,
        contactPhone,
        contactEmail,
        facilityLimit,
        maxTenor,
        baseRate,
        margin,
        effectiveRate,
        allowedTenors,
        disbursementMode,
        makerId: currentUser.id,
      })
      navigate('/lms/dashboard')
    } catch (err: unknown) {
      setFormError((err as Error).message || 'Failed to create partner.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <LmsShell
      title="Onboard Corporate Anchor (Maker)"
      subtitle="Configure enterprise supply-chain partner parameters, core settlement account, and pricing grid"
    >
      <form onSubmit={handleSubmit}>
        {/* 65 / 35 Layout Container */}
        <div className="grid lg:grid-cols-12 gap-5">
          {/* 65% Main Form Panel */}
          <div className="lg:col-span-8 space-y-4">
            {/* Section 1: Corporate Profile & T24 Core Account */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
                <Building2 size={16} className="text-cocoa dark:text-sky" />
                <h2 className="text-sm font-bold text-cocoa dark:text-white">
                  1. Anchor Identity & Core Account Verification
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Corporate Legal Name <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. East African Breweries PLC"
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Anchor Code / Acronym <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={anchorCode}
                    onChange={(e) => setAnchorCode(e.target.value.toUpperCase())}
                    placeholder="e.g. EABL-001"
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky font-mono"
                  />
                </div>
              </div>

              {/* T24 Core Account Live Validation Box */}
              <div className="p-3.5 rounded-[4px] bg-surface-light dark:bg-surface-dark-bg border border-surface-border dark:border-surface-dark-border text-xs">
                <label className="block font-bold text-cocoa dark:text-white mb-1">
                  NCBA T24 Core Settlement Account (10 Digits) <span className="text-coral">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={coreAccount}
                    onChange={(e) => {
                      setCoreAccount(e.target.value)
                      setValidatedAccount(null)
                    }}
                    placeholder="e.g. 1002938471"
                    className="flex-1 p-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white font-mono focus:outline-none focus:border-sky"
                  />
                  <button
                    type="button"
                    disabled={validating || coreAccount.length < 5}
                    onClick={handleValidateAccount}
                    className="px-3 py-2 rounded-[4px] bg-cocoa text-white dark:bg-sky dark:text-cocoa font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {validating ? (
                      'Validating…'
                    ) : (
                      <>
                        <Search size={13} /> Validate with T24
                      </>
                    )}
                  </button>
                </div>

                {validatedAccount && (
                  <div className="mt-2.5">
                    {validatedAccount.valid ? (
                      <div className="p-2.5 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 flex items-start gap-2 text-xs">
                        <CheckCircle2 size={16} className="text-mediterranean shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-mediterranean">
                            T24 Core Account Verified
                          </p>
                          <p className="text-cocoa dark:text-white font-semibold">
                            {validatedAccount.accountName}
                          </p>
                          <p className="text-[10px] text-text-light-muted">
                            Branch: {validatedAccount.branch} • Currency: KES
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-[4px] bg-coral/10 border border-coral/30 flex items-start gap-2 text-xs text-coral">
                        <AlertCircle size={15} className="shrink-0 mt-0.5" />
                        <span>{validatedAccount.error || 'Invalid account number'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Section 2: Contact Person */}
            <Card className="p-4 sm:p-5">
              <h2 className="text-sm font-bold text-cocoa dark:text-white mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
                2. Anchor Relationship & Operational Contact
              </h2>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Contact Person <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Grace Wanjiru"
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Phone Number <span className="text-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+254711000111"
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Corporate Email <span className="text-coral">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="grace.wanjiru@eabl.co.ke"
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Facility Limits & Tenors */}
            <Card className="p-4 sm:p-5">
              <h2 className="text-sm font-bold text-cocoa dark:text-white mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
                3. Facility Limits, Tenors & Disbursement Mode
              </h2>

              <div className="grid sm:grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Overall Anchor Ecosystem Limit (KES) <span className="text-coral">*</span>
                  </label>
                  <input
                    type="number"
                    min={1_000_000}
                    step={1_000_000}
                    value={facilityLimit}
                    onChange={(e) => setFacilityLimit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white font-mono font-bold focus:outline-none focus:border-sky"
                  />
                  <p className="text-[10px] text-text-light-muted mt-1">
                    Formatted: {formatKES(facilityLimit)}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Maximum Tenor (Days) <span className="text-coral">*</span>
                  </label>
                  <select
                    value={maxTenor}
                    onChange={(e) => setMaxTenor(Number(e.target.value))}
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white focus:outline-none focus:border-sky"
                  >
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                    <option value={90}>90 Days</option>
                  </select>
                </div>
              </div>

              {/* Allowed Tenor Multi-select */}
              <div className="mb-3 text-xs">
                <label className="block font-bold text-cocoa dark:text-white mb-1.5">
                  Allowed Retailer Tenors
                </label>
                <div className="flex flex-wrap gap-2">
                  {TENOR_OPTIONS.map((t) => {
                    const active = allowedTenors.includes(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTenor(t)}
                        className={`px-3 py-1.5 rounded-[4px] font-semibold border flex items-center gap-1.5 transition-colors ${
                          active
                            ? 'bg-sky text-cocoa border-sky'
                            : 'bg-white dark:bg-surface-dark-paper text-text-light-muted border-surface-border dark:border-surface-dark-border hover:bg-black/5'
                        }`}
                      >
                        {active && <Check size={12} strokeWidth={2.5} />}
                        {t} Days
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Disbursement Mode */}
              <div className="text-xs">
                <label className="block font-bold text-cocoa dark:text-white mb-1">
                  Settlement & Disbursement Mode
                </label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { id: 'DIRECT_SETTLEMENT', label: 'Direct Anchor Settlement', desc: 'Disburses straight to anchor core account' },
                    { id: 'ESCROW', label: 'Escrow Retention', desc: 'Held in BOOSTA control account until order proof' },
                    { id: 'CORE_ACCOUNT', label: 'Core Retailer Account', desc: 'Disburses to retailer NCBA account' },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      className={`p-2.5 rounded-[4px] border cursor-pointer flex flex-col justify-between transition-colors ${
                        disbursementMode === mode.id
                          ? 'bg-sky-tint/30 dark:bg-sky/15 border-sky text-cocoa dark:text-white'
                          : 'bg-white dark:bg-surface-dark-paper border-surface-border dark:border-surface-dark-border text-text-light-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="mode"
                          checked={disbursementMode === mode.id}
                          onChange={() => setDisbursementMode(mode.id as typeof disbursementMode)}
                          className="accent-sky"
                        />
                        <span className="font-bold text-[11px]">{mode.label}</span>
                      </div>
                      <p className="text-[10px] text-text-light-muted">{mode.desc}</p>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Section 4: Base Rate + Margin */}
            <Card className="p-4 sm:p-5">
              <h2 className="text-sm font-bold text-cocoa dark:text-white mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
                4. Pricing Structure (Base Rate + Margin)
              </h2>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    CBK / Base Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step={0.25}
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white font-mono font-bold focus:outline-none focus:border-sky"
                  />
                  <span className="text-[10px] text-text-light-muted">Current CBR benchmark: 13.0%</span>
                </div>

                <div>
                  <label className="block font-bold text-cocoa dark:text-white mb-1">
                    Anchor Risk Margin (% p.a.)
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white font-mono font-bold focus:outline-none focus:border-sky"
                  />
                  <span className="text-[10px] text-text-light-muted">Approved margin tier</span>
                </div>

                <div className="p-2.5 rounded-[4px] bg-sky-tint/30 dark:bg-sky/15 border border-sky/30 flex flex-col justify-center">
                  <span className="text-[10px] text-text-light-muted font-bold uppercase tracking-wider">
                    Effective Borrower APR
                  </span>
                  <span className="text-lg font-extrabold text-cocoa dark:text-sky font-mono mt-0.5">
                    {effectiveRate}% p.a.
                  </span>
                  <span className="text-[9px] text-text-light-muted">({baseRate}% base + {margin}% margin)</span>
                </div>
              </div>
            </Card>

            {formError && (
              <div className="p-3 rounded-[4px] bg-coral/10 border border-coral/30 flex items-start gap-2 text-xs text-coral">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
          </div>

          {/* 35% Sticky Summary & Compliance Checklist Panel */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4 sm:p-5 sticky top-[60px] bg-surface-light dark:bg-surface-dark-paper border-surface-border dark:border-surface-dark-border shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
                <ShieldCheck size={16} className="text-mediterranean" />
                <h3 className="text-sm font-bold text-cocoa dark:text-white">
                  Partner Setup Summary
                </h3>
              </div>

              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between py-1 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-text-light-muted">Anchor:</span>
                  <span className="font-bold text-cocoa dark:text-white">
                    {name || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-text-light-muted">Code:</span>
                  <span className="font-mono text-cocoa dark:text-white font-semibold">
                    {anchorCode || '—'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-text-light-muted">Facility Cap:</span>
                  <span className="font-bold text-cocoa dark:text-white font-mono">
                    {formatKES(facilityLimit)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-text-light-muted">Effective Rate:</span>
                  <span className="font-extrabold text-mediterranean dark:text-sky font-mono">
                    {effectiveRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-surface-border dark:border-surface-dark-border">
                  <span className="text-text-light-muted">Settlement Core:</span>
                  <span className="font-mono text-cocoa dark:text-white">
                    {coreAccount ? (
                      validatedAccount?.valid ? (
                        <span className="text-mediterranean font-bold">✓ Validated</span>
                      ) : (
                        coreAccount
                      )
                    ) : (
                      'Pending'
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-light-muted">Active Tenors:</span>
                  <span className="font-semibold text-cocoa dark:text-white">
                    {allowedTenors.join(', ')} Days
                  </span>
                </div>
              </div>

              {/* Covenant & Prerequisite Checklist */}
              <div className="p-3 rounded-[4px] bg-white dark:bg-white/[0.03] border border-surface-border dark:border-surface-dark-border text-[11px] space-y-1.5 mb-4">
                <p className="font-bold text-cocoa dark:text-white uppercase tracking-wider text-[10px] mb-1">
                  Mandatory Prerequisite Checklist
                </p>
                <div className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                  <CheckCircle2 size={12} className={validatedAccount?.valid ? 'text-mediterranean' : 'text-text-light-muted'} />
                  <span>T24 Core Account verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                  <CheckCircle2 size={12} className={name && contactPerson ? 'text-mediterranean' : 'text-text-light-muted'} />
                  <span>Authorized signatory contact specified</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary">
                  <CheckCircle2 size={12} className="text-mediterranean" />
                  <span>Initiated by logged-in Maker ({currentUser.name})</span>
                </div>
              </div>

              {/* Submission Button */}
              <Button
                type="submit"
                full
                disabled={submitting || !validatedAccount?.valid}
              >
                {submitting
                  ? 'Submitting Partner Setup…'
                  : 'Submit Partner Onboarding (Maker)'}
              </Button>

              <p className="text-[10px] text-text-light-muted text-center mt-2 leading-tight">
                Partner parameters will be activated in the BOOSTA directory and available for retailer linkage.
              </p>
            </Card>
          </div>
        </div>
      </form>
    </LmsShell>
  )
}

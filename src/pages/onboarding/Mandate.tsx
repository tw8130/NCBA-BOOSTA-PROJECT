// -----------------------------------------------------------------------------
// NCBA BOOSTA — Step 10: Mandate, Signatory Roster & SignaturePad (65/35)
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PenTool,
  Users,
  UserPlus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { SignaturePad } from '../../components/domain/SignaturePad'
import { FormLayout } from '../../components/layout/FormLayout'
import { OnboardingHeader } from '../../components/onboarding/OnboardingHeader'
import { OnboardingChecklist } from '../../components/onboarding/OnboardingChecklist'
import { useOnboarding } from '../../context/OnboardingContext'
import type { MandateType } from '../../types'

export default function Mandate() {
  const navigate = useNavigate()
  const {
    state,
    setMandate,
    addSignatory,
    removeSignatory,
    setApplicantSignature,
  } = useOnboarding()

  const [signatureData, setSignatureData] = useState<string | null>(
    state.applicantSignature || null
  )

  // New signatory modal/form state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNationalId, setNewNationalId] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'DIRECTOR' | 'PARTNER'>(
    state.businessType === 'PARTNERSHIP' ? 'PARTNER' : 'DIRECTOR'
  )
  const [addError, setAddError] = useState<string | null>(null)

  const isSoleProp = state.businessType === 'SOLE_PROPRIETOR'

  function handleSaveSignature(pngUrl: string) {
    setSignatureData(pngUrl)
    setApplicantSignature(pngUrl)
  }

  function handleClearSignature() {
    setSignatureData(null)
    setApplicantSignature(null)
  }

  function handleAddSignatory() {
    if (!newName.trim() || !newNationalId.trim() || !newPhone.trim()) {
      setAddError('Please fill in Full Name, National ID, and Mobile Phone')
      return
    }

    addSignatory({
      fullName: newName.trim(),
      nationalId: newNationalId.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      role: newRole,
    })

    setNewName('')
    setNewNationalId('')
    setNewPhone('')
    setNewEmail('')
    setAddError(null)
    setShowAddModal(false)
  }

  function handleContinue() {
    if (!signatureData) return
    navigate('/customer/account-verification')
  }

  const leftContent = (
    <div className="space-y-5">
      {/* 1. Signing Mandate Selection */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="text-[16px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            1. Signing Authority Mandate
          </h2>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Define how loan drawdown orders are legally authorized by authorized company officials.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: 'SINGLE' as MandateType,
              title: 'Single Mandate (Sole Signatory)',
              desc: 'Applicant signs and releases orders instantly without secondary approvals.',
              disabled: false,
            },
            {
              id: 'JOINT_ANY' as MandateType,
              title: 'Joint Mandate — Any to Sign',
              desc: 'Any registered partner or director can authorize drawdown requests.',
              disabled: isSoleProp,
            },
            {
              id: 'JOINT_ALL' as MandateType,
              title: 'Joint Mandate — All Must Sign',
              desc: 'Drawdown requires unanimous digital sign-off from all listed directors/partners.',
              disabled: isSoleProp,
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => !item.disabled && setMandate(item.id)}
              className={`p-3.5 rounded-[4px] border transition-all flex items-start justify-between ${
                item.disabled
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/30'
                  : state.mandate === item.id
                  ? 'border-sky bg-sky-tint/30 dark:bg-sky/15 ring-1 ring-sky/50 cursor-pointer'
                  : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper hover:border-sky/30 cursor-pointer'
              }`}
            >
              <div>
                <p className="text-[13px] font-bold text-cocoa dark:text-text-dark-primary">
                  {item.title}
                </p>
                <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  {item.desc}
                </p>
                {item.disabled && (
                  <span className="text-[10px] text-text-light-muted mt-1 block">
                    (Not applicable to Sole Proprietorships)
                  </span>
                )}
              </div>
              <input
                type="radio"
                checked={state.mandate === item.id}
                disabled={item.disabled}
                onChange={() => setMandate(item.id)}
                className="text-sky focus:ring-sky mt-1"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Signatory Roster (Partners & Directors) */}
      {!isSoleProp && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
                2. Authorized Signatory Roster
              </h3>
              <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                List of partners or directors matching your registration deed / CR12.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<UserPlus size={14} />}
              onClick={() => setShowAddModal(true)}
            >
              Add Signatory
            </Button>
          </div>

          {/* Signatories Table */}
          <div className="rounded-[4px] border border-surface-border dark:border-surface-dark-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-text-light-secondary dark:text-text-dark-secondary font-semibold border-b border-surface-border dark:border-surface-dark-border">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">National ID</th>
                    <th className="py-2.5 px-3">Mobile</th>
                    <th className="py-2.5 px-3">Approval Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {state.signatories.map((sig, idx) => (
                    <tr key={sig.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-cocoa dark:text-text-dark-primary">
                        {sig.fullName} {idx === 0 && <span className="text-[10px] text-sky font-normal">(Applicant)</span>}
                      </td>
                      <td className="py-2.5 px-3 text-text-light-secondary dark:text-text-dark-secondary">
                        {sig.role}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{sig.nationalId}</td>
                      <td className="py-2.5 px-3 font-mono">{sig.phone}</td>
                      <td className="py-2.5 px-3">
                        {sig.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-mediterranean dark:text-teal-400">
                            <CheckCircle2 size={12} /> Signed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-light-muted">
                            <Clock size={12} /> SMS Pending
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeSignatory(sig.id)}
                            className="text-text-light-muted hover:text-coral p-1"
                            title="Remove signatory"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Signatory Inline Form Drawer / Card */}
          {showAddModal && (
            <div className="p-4 rounded-[4px] bg-slate-50 dark:bg-slate-800/80 border border-sky/30 space-y-3">
              <h4 className="text-[12px] font-bold text-cocoa dark:text-text-dark-primary">
                Add Director / Partner to Signatory Roster
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Full Legal Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. David Kimani Mwangi"
                />
                <Input
                  label="National ID Number"
                  value={newNationalId}
                  onChange={(e) => setNewNationalId(e.target.value)}
                  placeholder="e.g. 26781299"
                />
                <Input
                  label="Mobile Phone Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 0721 889 900"
                />
                <Select
                  label="Legal Role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'DIRECTOR' | 'PARTNER')}
                  options={[
                    { value: 'DIRECTOR', label: 'Director (Company)' },
                    { value: 'PARTNER', label: 'Partner (Partnership)' },
                  ]}
                />
              </div>

              {addError && <p className="text-[11px] text-coral font-medium">{addError}</p>}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleAddSignatory}>
                  Save Signatory
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 3. HTML5 Canvas SignaturePad */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-[15px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            {isSoleProp ? '2. Digital Signature' : '3. Applicant Digital Signature'}
          </h3>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Sign using your mouse or touchscreen to execute the NCBA BOOSTA credit facility master agreement.
          </p>
        </div>

        <SignaturePad
          label="Authorized Applicant Signature"
          signatoryName={state.fullName}
          savedSignature={signatureData}
          onSave={handleSaveSignature}
          onClear={handleClearSignature}
        />

        <div className="pt-2">
          <Button
            full
            size="md"
            disabled={!signatureData}
            onClick={handleContinue}
            rightIcon={<ArrowRight size={15} />}
          >
            {signatureData ? 'Continue to Account Verification' : 'Sign Above to Continue'}
          </Button>
        </div>

        <div className="p-3 rounded-[4px] bg-mediterranean/10 border border-mediterranean/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-start gap-2">
          <ShieldCheck size={16} className="text-mediterranean shrink-0 mt-0.5" />
          <p>
            Your electronic signature is securely encrypted and embedded into the digital loan contract under Kenya's Evidence Act.
          </p>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary">
      <OnboardingHeader
        currentStep={10}
        totalSteps={12}
        stepTitle="Mandate & Signature"
        backPath="/customer/business-documents"
      />
      <main className="px-4 sm:px-6 py-6">
        <FormLayout
          title="Step 10: Signing Mandate & Signatory Roster"
          subtitle="Configure authorization rules, add directors/partners, and sign agreement"
          left={leftContent}
          right={<OnboardingChecklist currentStepId="mandate" />}
          summaryTitle="Onboarding Status"
        />
      </main>
    </div>
  )
}

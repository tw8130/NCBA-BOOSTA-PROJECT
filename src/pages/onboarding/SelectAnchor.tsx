import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users2, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Stepper } from '../../components/ui/Stepper'
import { ONBOARDING_STEPS } from '../../lib/onboardingSteps'
import { mockAnchors } from '../../mocks/data'
import { useAuth } from '../../context/AuthContext'

export default function SelectAnchor() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()
  const [selected, setSelected] = useState<string[]>(mockAnchors.map((a) => a.id))

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function finish() {
    signInAs('CUSTOMER')
    navigate('/customer/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary px-4 py-8 flex flex-col justify-center transition-colors">
      <div className="max-w-md mx-auto w-full">
        <Stepper steps={ONBOARDING_STEPS} current={6} />
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Users2 size={18} className="text-sky" />
            <span className="text-[11px] font-semibold text-sky uppercase tracking-wide">Ecosystem Partners</span>
          </div>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight">
            Businesses You Trade With
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            NCBA identified these eligible corporate anchors linked to your business. Select all you wish to activate.
          </p>
        </div>

        <Card className="p-5">
          <div className="flex gap-4 mb-3 pb-2 border-b border-surface-border dark:border-surface-dark-border">
            <button
              onClick={() => setSelected(mockAnchors.map((a) => a.id))}
              className="text-[11px] font-semibold text-cocoa dark:text-sky underline decoration-sky"
            >
              Select all
            </button>
            <button
              onClick={() => setSelected([])}
              className="text-[11px] font-semibold text-text-light-muted dark:text-text-dark-muted"
            >
              Deselect all
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {mockAnchors.map((a) => {
              const isSelected = selected.includes(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-[4px] border text-left transition-colors ${
                    isSelected
                      ? 'border-sky bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-white'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-text-light-secondary dark:text-text-dark-secondary hover:border-sky/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-[4px] bg-cocoa text-sky font-bold flex items-center justify-center text-[12px] shrink-0 border border-white/10">
                    {a.logoInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-cocoa dark:text-text-dark-primary text-[13px] truncate">
                      {a.name}
                    </p>
                    <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted">
                      {a.type === 'ANCHOR' ? 'Corporate Anchor' : 'Sub-Anchor Partner'} · Approved
                    </p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-sky bg-sky text-cocoa'
                        : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              )
            })}
          </div>

          <Button full disabled={selected.length === 0} onClick={finish}>
            Continue to Dashboard ({selected.length} {selected.length === 1 ? 'anchor' : 'anchors'})
          </Button>
        </Card>
      </div>
    </div>
  )
}

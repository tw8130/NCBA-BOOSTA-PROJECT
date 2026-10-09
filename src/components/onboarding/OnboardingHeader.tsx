// -----------------------------------------------------------------------------
// NCBA BOOSTA — Onboarding 42px Top Navigation Bar
// -----------------------------------------------------------------------------

import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ArrowLeft, LogOut } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface OnboardingHeaderProps {
  currentStep?: number
  totalSteps?: number
  stepTitle?: string
  backPath?: string
}

export function OnboardingHeader({
  currentStep,
  totalSteps = 12,
  stepTitle,
  backPath,
}: OnboardingHeaderProps) {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="h-[42px] sticky top-0 z-40 bg-cocoa text-white border-b border-cocoa-light px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backPath ? (
          <button
            onClick={() => navigate(backPath)}
            className="p-1 -ml-1 text-white/80 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>
        ) : null}

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-5 h-5 rounded-[3px] bg-sky flex items-center justify-center font-bold text-[10px] text-cocoa leading-none">
            B
          </div>
          <span className="text-[13px] font-bold tracking-tight text-white">
            NCBA BOOSTA
          </span>
          <span className="hidden sm:inline-block text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-[2px] bg-sky text-cocoa font-bold">
            Onboarding
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentStep && (
          <div className="hidden sm:flex items-center gap-2">
            {stepTitle && (
              <span className="text-[11px] text-white/80 font-medium">{stepTitle}</span>
            )}
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-[20px] text-sky font-semibold">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 border-l border-white/20 pl-2">
          <button
            onClick={toggleTheme}
            className="p-1 rounded-[4px] text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={() => navigate('/')}
            className="p-1 rounded-[4px] text-white/80 hover:text-coral transition-colors"
            title="Exit Onboarding"
            aria-label="Exit onboarding"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}

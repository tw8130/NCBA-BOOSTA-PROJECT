import type { ReactNode } from 'react'
import { Sun, Moon, ShieldCheck } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export interface SignatoryShellProps {
  title?: string
  tokenValid?: boolean
  children: ReactNode
}

export function SignatoryShell({
  title = 'Director / Partner Drawdown Review',
  tokenValid = true,
  children,
}: SignatoryShellProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      {/* Dedicated standalone 42px top bar */}
      <header className="h-[42px] bg-cocoa text-white px-4 flex items-center justify-between border-b border-white/10 select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[3px] bg-sky flex items-center justify-center font-bold text-[10px] text-cocoa">
            B
          </div>
          <span className="font-bold text-[13px] tracking-tight">NCBA BOOSTA</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-sky bg-white/10 px-2 py-0.5 rounded-[20px]">
            <ShieldCheck size={11} /> Secure Signatory Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-7 h-7 rounded-[4px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={15} className="text-sun" /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-lg mx-auto p-4 sm:py-8 flex flex-col justify-start">
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">
            Multi-Party Mandate
          </p>
          <h1 className="text-[18px] font-bold text-cocoa dark:text-text-dark-primary mt-0.5">
            {title}
          </h1>
          {!tokenValid && (
            <p className="text-[12px] text-coral mt-1 font-medium">
              This review link has expired or has already been used.
            </p>
          )}
        </div>

        {children}
      </main>

      {/* Clean footer */}
      <footer className="py-4 text-center text-[10px] text-text-light-muted dark:text-text-dark-muted border-t border-surface-border dark:border-surface-dark-border">
        NCBA Bank Kenya PLC · Authorized Financial Services Provider
      </footer>
    </div>
  )
}

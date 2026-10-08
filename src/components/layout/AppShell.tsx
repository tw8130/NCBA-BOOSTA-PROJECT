import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export interface AppShellProps {
  title: string
  back?: boolean
  nav?: boolean
  children: ReactNode
}

export function AppShell({
  title,
  back = false,
  nav = true,
  children,
}: AppShellProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      <Navbar title={title} />

      <div className="flex-1 flex min-h-[calc(100vh-42px)]">
        {nav && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sub-header */}
          <div className="lg:hidden sticky top-[42px] z-30 bg-white dark:bg-surface-dark-paper border-b border-surface-border dark:border-surface-dark-border px-4 py-2.5 flex items-center gap-3">
            {back && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 -ml-1 text-text-light-secondary dark:text-text-dark-secondary hover:text-cocoa dark:hover:text-white"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="flex-1 font-semibold text-[15px] truncate text-cocoa dark:text-text-dark-primary">
              {title}
            </h1>
          </div>

          <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 pb-20 lg:pb-8 lg:px-8 lg:py-6">
            {children}
          </main>

          {nav && (
            <div className="lg:hidden">
              <BottomNav />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

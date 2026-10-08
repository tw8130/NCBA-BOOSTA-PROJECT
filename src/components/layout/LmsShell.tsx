import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  Sliders,
  Building,
  Users,
  BookOpen,
  AlertTriangle,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { useAuth } from '../../context/AuthContext'

const lmsNavItems = [
  { to: '/lms/dashboard', label: 'LMS Dashboard', icon: LayoutDashboard },
  { to: '/lms/limits/queue', label: 'Checker Queue', icon: Inbox },
  { to: '/lms/limits/new', label: 'Request Limit (Maker)', icon: Sliders },
  { to: '/lms/partners/new', label: 'Partner Setup', icon: Building },
  { to: '/lms/customers', label: 'Borrowers Portfolio', icon: Users },
  { to: '/lms/accounting', label: 'T24 GL Accounting', icon: BookOpen },
  { to: '/lms/exceptions', label: 'Reconciliations', icon: AlertTriangle },
]

export function LmsShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { role, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      <Navbar title={title} showNotifications={false} />

      <div className="flex-1 flex min-h-[calc(100vh-42px)]">
        {/* Desktop LMS Sidebar (195px / 50px collapsed) */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 border-r border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper transition-all duration-200 select-none ${
            collapsed ? 'w-[50px]' : 'w-[195px]'
          }`}
          style={{ height: 'calc(100vh - 42px)' }}
        >
          <div className="p-2 border-b border-surface-border dark:border-surface-dark-border flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-cocoa text-sky flex items-center justify-center shrink-0">
              <ShieldCheck size={14} />
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-[11px] font-bold tracking-tight text-cocoa dark:text-white uppercase">
                  NCBA Credit Ops
                </p>
                <p className="text-[9px] text-text-light-muted dark:text-text-dark-muted">
                  {role === 'BANK_CHECKER' ? 'Checker Mode' : 'Maker Mode'}
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 py-3 px-1.5 space-y-1 overflow-y-auto">
            {lmsNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-[4px] text-[12px] font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky font-semibold border-l-2 border-sky'
                      : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon size={16} strokeWidth={1.75} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </div>

          <div className="p-2 border-t border-surface-border dark:border-surface-dark-border flex flex-col gap-1">
            <button
              onClick={() => {
                signOut()
                navigate('/role')
              }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-[11px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              title="Switch demo role"
            >
              <RefreshCcw size={14} strokeWidth={1.75} />
              {!collapsed && <span className="text-[11px]">Switch Role</span>}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-[4px] text-[11px] text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                collapsed ? 'justify-center px-0' : ''
              }`}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight size={14} strokeWidth={1.75} />
              ) : (
                <>
                  <ChevronLeft size={14} strokeWidth={1.75} />
                  <span className="text-[11px]">Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

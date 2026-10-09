import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Building2,
  FileEdit,
  BookOpen,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  RefreshCcw,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { useLms } from '../../context/LmsContext'
import { useAuth } from '../../context/AuthContext'

interface LmsShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function LmsShell({ title, subtitle, children }: LmsShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, switchLmsRole, pendingQueueCount } = useLms()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const isChecker = currentUser.role === 'BANK_CHECKER'

  const navItems = [
    { to: '/lms/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/lms/customers', label: 'Customers', icon: Users },
    {
      to: '/lms/limits/queue',
      label: 'Checker Queue',
      icon: CheckSquare,
      badge: pendingQueueCount > 0 ? pendingQueueCount : undefined,
    },
    { to: '/lms/limits/new', label: 'Amend Limit (Maker)', icon: FileEdit },
    { to: '/lms/partners/new', label: 'New Partner (Maker)', icon: Building2 },
    { to: '/lms/accounting', label: 'T24 GL Mirror', icon: BookOpen },
    { to: '/lms/exceptions', label: 'Gateway Exceptions', icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      {/* Universal 42px Navbar */}
      <Navbar title={`NCBA LMS • ${title}`} unreadCount={pendingQueueCount} />

      <div className="flex-1 flex min-h-[calc(100vh-42px)]">
        {/* LMS Sidebar (195px expanded / 50px collapsed) */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 border-r border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper transition-all duration-200 select-none ${
            collapsed ? 'w-[50px]' : 'w-[195px]'
          }`}
          style={{ height: 'calc(100vh - 42px)' }}
        >
          {/* Active Role Card & Switcher */}
          {!collapsed && (
            <div className="p-2.5 mx-2 my-2 rounded-[4px] bg-cocoa text-white shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sky">
                  NCBA Core LMS
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-[2px] ${
                    isChecker ? 'bg-mediterranean text-white' : 'bg-sun text-cocoa'
                  }`}
                >
                  {isChecker ? 'CHECKER' : 'MAKER'}
                </span>
              </div>
              <p className="font-bold text-[11px] truncate mt-1">{currentUser.name}</p>
              <p className="text-[10px] text-white/70 truncate">{currentUser.employeeNumber}</p>

              {/* Instant Maker/Checker Toggle */}
              <button
                type="button"
                onClick={() =>
                  switchLmsRole(isChecker ? 'BANK_MAKER' : 'BANK_CHECKER')
                }
                className="mt-2 w-full py-1 px-1.5 rounded-[3px] bg-white/10 hover:bg-white/20 text-[10px] font-semibold text-white flex items-center justify-center gap-1 transition-colors"
                title="Toggle between Maker (initiator) and Checker (approver)"
              >
                {isChecker ? (
                  <>
                    <UserCheck size={11} className="text-sun" /> Switch to Maker
                  </>
                ) : (
                  <>
                    <ShieldCheck size={11} className="text-sky" /> Switch to Checker
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 py-1 px-1.5 space-y-1 overflow-y-auto">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
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
                <span className="relative shrink-0">
                  <Icon size={16} strokeWidth={1.75} />
                  {badge !== undefined && collapsed && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral" />
                  )}
                </span>
                {!collapsed && (
                  <span className="truncate flex-1 flex items-center justify-between">
                    <span>{label}</span>
                    {badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full bg-coral text-white text-[9px] font-bold">
                        {badge}
                      </span>
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Bottom Sidebar Tools */}
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
              {!collapsed && <span className="text-[11px]">All Roles</span>}
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

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile subheader with horizontal tabs */}
          <div className="lg:hidden sticky top-[42px] z-30 bg-white dark:bg-surface-dark-paper border-b border-surface-border dark:border-surface-dark-border px-4 py-2.5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="font-bold text-[14px] text-cocoa dark:text-text-dark-primary">
                  {title}
                </h1>
                <p className="text-[10px] text-text-light-muted">
                  Logged in as <strong className="text-cocoa dark:text-white">{currentUser.name}</strong> ({isChecker ? 'Checker' : 'Maker'})
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  switchLmsRole(isChecker ? 'BANK_MAKER' : 'BANK_CHECKER')
                }
                className="px-2 py-1 rounded-[3px] bg-cocoa text-white text-[10px] font-bold"
              >
                Switch to {isChecker ? 'Maker' : 'Checker'}
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-2.5 py-1 rounded-[20px] text-[11px] font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-sky text-cocoa font-semibold'
                        : 'bg-black/5 dark:bg-white/5 text-text-light-secondary dark:text-text-dark-secondary'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4 lg:px-8 lg:py-6">
            <div className="mb-4">
              <h1 className="text-xl font-bold text-cocoa dark:text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

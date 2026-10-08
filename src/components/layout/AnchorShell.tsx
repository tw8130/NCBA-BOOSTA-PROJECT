import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  LineChart,
  Receipt,
  FileBarChart2,
  Bell,
  Settings,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { Navbar } from './Navbar'
import { useAnchorPortal } from '../../context/AnchorContext'
import { useAuth } from '../../context/AuthContext'

const anchorNavItems = [
  { to: '/anchor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/anchor/customers', label: 'Customers', icon: Users },
  { to: '/anchor/sales', label: 'Sales', icon: LineChart },
  { to: '/anchor/transactions', label: 'Transactions', icon: Receipt },
  { to: '/anchor/turnover-review', label: 'Turnover Review', icon: FileBarChart2 },
  { to: '/anchor/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/anchor/notifications', label: 'Notifications', icon: Bell },
  { to: '/anchor/settings', label: 'Settings', icon: Settings },
]

export function AnchorShell({
  title,
  back = false,
  children,
}: {
  title: string
  back?: boolean
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, notifications } = useAnchorPortal()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const unread = notifications ? notifications.filter((n) => n.state === 'unread').length : 0

  return (
    <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors duration-150">
      <Navbar
        title={title}
        unreadCount={unread}
        notificationsUrl="/anchor/notifications"
      />

      <div className="flex-1 flex min-h-[calc(100vh-42px)]">
        {/* Desktop Anchor Sidebar (195px / 50px collapsed) */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 border-r border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper transition-all duration-200 select-none ${
            collapsed ? 'w-[50px]' : 'w-[195px]'
          }`}
          style={{ height: 'calc(100vh - 42px)' }}
        >
          <div className="flex-1 py-3 px-1.5 space-y-1 overflow-y-auto">
            {anchorNavItems.map(({ to, label, icon: Icon }) => (
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
                  {label === 'Notifications' && unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-coral" />
                  )}
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </div>

          {!collapsed && user && (
            <div className="p-2.5 mx-2 mb-2 rounded-[4px] bg-surface-light dark:bg-white/5 border border-surface-border dark:border-white/10 text-[11px]">
              <p className="font-semibold text-cocoa dark:text-text-dark-primary truncate">
                {user.contactName}
              </p>
              <p className="text-text-light-muted dark:text-text-dark-muted truncate text-[10px] mt-0.5">
                {user.anchorName}
              </p>
            </div>
          )}

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
          {/* Mobile subheader */}
          <div className="lg:hidden sticky top-[42px] z-30 bg-white dark:bg-surface-dark-paper border-b border-surface-border dark:border-surface-dark-border px-4 py-2.5">
            <div className="flex items-center gap-3">
              {back && (
                <button
                  onClick={() => navigate(-1)}
                  className="p-1 -ml-1 text-text-light-secondary dark:text-text-dark-secondary"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h1 className="flex-1 font-semibold text-[15px] truncate text-cocoa dark:text-text-dark-primary">
                {title}
              </h1>
            </div>

            <div className="flex gap-1 pt-2 overflow-x-auto no-scrollbar">
              {anchorNavItems.map(({ to, label }) => (
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
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

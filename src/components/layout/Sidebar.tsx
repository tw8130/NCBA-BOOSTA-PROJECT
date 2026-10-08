import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Landmark,
  Wallet,
  Receipt,
  LifeBuoy,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

const customerNavItems = [
  { to: '/customer/dashboard', label: 'My Boosta', icon: Home },
  { to: '/customer/anchors', label: 'My Anchors', icon: Landmark },
  { to: '/customer/loans', label: 'My Loans', icon: Wallet },
  { to: '/customer/transactions', label: 'Transactions', icon: Receipt },
  { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  { to: '/customer/support', label: 'Help & Support', icon: LifeBuoy },
  { to: '/customer/profile/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const { customer, notifications } = useApp()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const unread = notifications ? notifications.filter((n) => !n.read).length : 0

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 border-r border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper transition-all duration-200 select-none ${
        collapsed ? 'w-[50px]' : 'w-[195px]'
      }`}
      style={{ height: 'calc(100vh - 42px)' }}
    >
      {/* Navigation List */}
      <nav className="flex-1 py-3 px-1.5 space-y-1 overflow-y-auto">
        {customerNavItems.map(({ to, label, icon: Icon }) => (
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
      </nav>

      {/* User profile snippet */}
      {!collapsed && customer && (
        <div className="p-2.5 mx-2 mb-2 rounded-[4px] bg-surface-light dark:bg-white/5 border border-surface-border dark:border-white/10 text-[11px]">
          <p className="font-semibold text-cocoa dark:text-text-dark-primary truncate">
            {customer.fullName}
          </p>
          <p className="text-text-light-muted dark:text-text-dark-muted truncate text-[10px] mt-0.5">
            {customer.businessName}
          </p>
        </div>
      )}

      {/* Footer controls: Collapse Toggle & Switch Demo Role */}
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
  )
}

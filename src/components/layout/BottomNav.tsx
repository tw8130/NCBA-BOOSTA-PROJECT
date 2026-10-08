import { NavLink } from 'react-router-dom'
import { Home, Landmark, Wallet, Bell } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function BottomNav() {
  const { notifications } = useApp()
  const unread = notifications ? notifications.filter((n) => !n.read).length : 0

  const items = [
    { to: '/customer/dashboard', label: 'Home', icon: Home },
    { to: '/customer/anchors', label: 'Anchors', icon: Landmark },
    { to: '/customer/loans', label: 'Loans', icon: Wallet },
    { to: '/customer/notifications', label: 'Alerts', icon: Bell, badge: unread },
  ]

  return (
    <nav className="sticky bottom-0 z-30 bg-white dark:bg-surface-dark-paper border-t border-surface-border dark:border-surface-dark-border select-none">
      <div className="max-w-3xl mx-auto grid grid-cols-4">
        {items.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center min-h-[48px] py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-sky font-semibold'
                  : 'text-text-light-muted dark:text-text-dark-muted hover:text-cocoa dark:hover:text-white'
              }`
            }
          >
            <span className="relative">
              <Icon size={18} strokeWidth={1.75} />
              {!!badge && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-coral text-white text-[8px] flex items-center justify-center font-bold">
                  {badge}
                </span>
              )}
            </span>
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

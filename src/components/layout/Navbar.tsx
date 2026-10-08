import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Bell, RefreshCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useApp } from '../../context/AppContext'

export interface NavbarProps {
  title?: string
  showNotifications?: boolean
  unreadCount?: number
  notificationsUrl?: string
}

export function Navbar({
  title,
  showNotifications = true,
  unreadCount,
  notificationsUrl = '/customer/notifications',
}: NavbarProps) {
  const navigate = useNavigate()
  const { role, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { notifications } = useApp()

  const defaultUnread = notifications ? notifications.filter((n) => !n.read).length : 0
  const unread = unreadCount !== undefined ? unreadCount : defaultUnread

  const roleLabels: Record<string, string> = {
    CUSTOMER: 'Borrower',
    ANCHOR: 'Anchor Portal',
    BANK_MAKER: 'Bank Maker',
    BANK_CHECKER: 'Bank Checker',
  }

  return (
    <header className="h-[42px] min-h-[42px] max-h-[42px] sticky top-0 z-40 bg-cocoa text-white border-b border-white/10 px-3 sm:px-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => navigate(role === 'ANCHOR' ? '/anchor/dashboard' : '/customer/dashboard')}
          className="flex items-center gap-1.5 focus:outline-none"
          aria-label="NCBA BOOSTA Home"
        >
          <div className="w-5 h-5 rounded-[3px] bg-sky flex items-center justify-center font-bold text-[10px] text-cocoa leading-none">
            B
          </div>
          <span className="font-bold text-[13px] tracking-tight">NCBA BOOSTA</span>
        </button>

        {role && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[20px] bg-white/10 text-[9px] font-medium text-sky border border-white/15">
            {roleLabels[role] || role}
          </span>
        )}

        {title && (
          <span className="hidden md:inline text-[11px] text-white/60 border-l border-white/20 pl-2">
            {title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dark mode toggle (A5 requirement: persist in memory only) */}
        <button
          onClick={toggleTheme}
          className="w-7 h-7 rounded-[4px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={15} className="text-sun" /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        {showNotifications && (
          <button
            onClick={() => navigate(notificationsUrl)}
            className="relative w-7 h-7 rounded-[4px] flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-coral" />
            )}
          </button>
        )}

        {/* Demo role switcher shortcut */}
        <button
          onClick={() => {
            signOut()
            navigate('/role')
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-[11px] text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="Switch Demo Role"
        >
          <RefreshCcw size={12} />
          <span className="hidden sm:inline text-[10px]">Switch Role</span>
        </button>
      </div>
    </header>
  )
}

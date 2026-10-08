import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export function Header({
  title,
  back = false,
  bellTo = '/customer/notifications',
}: {
  title: string
  back?: boolean
  bellTo?: string
}) {
  const navigate = useNavigate()
  const { notifications } = useApp()
  const unread = notifications ? notifications.filter((n) => !n.read).length : 0

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-surface-dark-paper border-b border-surface-border dark:border-surface-dark-border select-none">
      <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-2.5">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 text-text-light-secondary dark:text-text-dark-secondary hover:text-cocoa dark:hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="flex-1 font-semibold text-cocoa dark:text-text-dark-primary text-[15px] truncate tracking-tight">
          {title}
        </h1>
        <button
          onClick={() => navigate(bellTo)}
          className="relative p-1 text-text-light-secondary dark:text-text-dark-secondary hover:text-cocoa dark:hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-coral" />
          )}
        </button>
      </div>
    </header>
  )
}

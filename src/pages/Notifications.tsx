import { Bell } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingState } from '../components/ui/LoadingState'
import { NotificationItem } from '../components/domain/NotificationItem'
import { useApp } from '../context/AppContext'

export default function Notifications() {
  const { notifications, loading, markNotificationRead } = useApp()

  return (
    <AppShell title="Notifications">
      {loading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" detail="We'll let you know here when something about your account changes." />
      ) : (
        <Card className="p-4 max-w-2xl">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onClick={() => markNotificationRead(n.id)} />
          ))}
        </Card>
      )}
    </AppShell>
  )
}

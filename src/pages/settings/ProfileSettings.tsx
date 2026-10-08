import { LogOut, ShieldCheck, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'

export default function ProfileSettings() {
  const { customer, loading } = useApp()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  if (loading || !customer) {
    return (
      <AppShell title="Settings">
        <LoadingState />
      </AppShell>
    )
  }

  return (
    <AppShell title="Settings">
      <div className="max-w-md space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-cocoa dark:text-white">{customer.fullName}</p>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{customer.businessName}</p>
          </div>
          <StatusBadge label={customer.kycStatus === 'VERIFIED' ? 'Verified' : 'Pending'} tone={customer.kycStatus === 'VERIFIED' ? 'success' : 'warning'} />
        </Card>

        <Card className="p-4">
          <Row label="Phone number" value={customer.phone} />
          <Row label="Email" value={customer.email ?? '—'} />
          <Row label="NCBA account" value={customer.ncbaAccountNumber} />
          <Row label="Member since" value={new Date(customer.memberSince).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })} />
        </Card>

        <Card className="p-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors">
            <ShieldCheck size={18} className="text-cocoa dark:text-sky" />
            <span className="text-sm font-medium text-cocoa dark:text-white">Change PIN</span>
          </button>
        </Card>

        <Button full variant="danger" className="flex items-center justify-center gap-2" onClick={() => { signOut(); navigate('/role') }}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </AppShell>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-border dark:border-surface-dark-border last:border-0 text-sm">
      <span className="text-text-light-muted dark:text-text-dark-muted">{label}</span>
      <span className="font-medium text-cocoa dark:text-white">{value}</span>
    </div>
  )
}

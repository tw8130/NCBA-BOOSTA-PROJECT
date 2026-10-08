import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Mail, Shield, User } from 'lucide-react'
import { AnchorShell } from '../../components/layout/AnchorShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingState } from '../../components/ui/LoadingState'
import { useAnchorPortal } from '../../context/AnchorContext'
import { useAuth } from '../../context/AuthContext'

export default function AnchorSettings() {
  const { user, loading } = useAnchorPortal()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)

  if (loading || !user) {
    return (
      <AnchorShell title="Settings">
        <LoadingState />
      </AnchorShell>
    )
  }

  return (
    <AnchorShell title="Settings">
      <div className="max-w-md space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sky-tint dark:bg-sky/15 text-cocoa dark:text-sky flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="font-bold text-cocoa dark:text-white">{user.contactName}</p>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted">{user.anchorName} · {user.email}</p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold text-cocoa dark:text-white mb-3">Business information</p>
          <Row label="Business name" value={user.anchorName} />
          <Row label="Contact email" value={user.email} />
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-cocoa dark:text-sky" />
            <p className="text-sm font-semibold text-cocoa dark:text-white">Notification preferences</p>
          </div>
          <ToggleRow icon={Mail} label="Email notifications" checked={emailNotifs} onChange={setEmailNotifs} />
          <ToggleRow icon={Bell} label="SMS notifications" checked={smsNotifs} onChange={setSmsNotifs} />
        </Card>

        <Card className="p-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors">
            <Shield size={18} className="text-cocoa dark:text-sky" />
            <span className="text-sm font-medium text-cocoa dark:text-white">Change password</span>
          </button>
        </Card>

        <Button full variant="danger" className="flex items-center justify-center gap-2" onClick={() => { signOut(); navigate('/role') }}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </AnchorShell>
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

function ToggleRow({ icon: Icon, label, checked, onChange }: { icon: typeof Bell; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary">
        <Icon size={14} className="text-text-light-muted dark:text-text-dark-muted" /> {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full relative transition-colors ${checked ? 'bg-sky' : 'bg-surface-border dark:bg-surface-dark-border'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white dark:bg-surface-dark-paper transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

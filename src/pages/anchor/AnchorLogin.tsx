import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export default function AnchorLogin() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()
  const [email, setEmail] = useState('grace.wanjiru@eabl.co.ke')
  const [password, setPassword] = useState('')

  function signIn() {
    signInAs('ANCHOR')
    navigate('/anchor/dashboard')
  }

  return (
    <div className="min-h-screen bg-cocoa flex flex-col justify-center px-6 py-10 selection:bg-sky/30">
      <div className="max-w-sm mx-auto w-full">
        <p className="text-[12px] text-white/70 font-medium mb-1">NCBA BANK KENYA</p>
        <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">Anchor Portal</h1>
        <p className="text-xs text-white/70 mb-6">Sign in to manage your BOOSTA ecosystem.</p>

        <Card className="p-5">
          <label className="text-xs font-semibold text-text-light-muted dark:text-text-dark-muted">Work email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 mb-4 px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-sm focus:outline-none focus:border-sky"
          />
          <label className="text-xs font-semibold text-text-light-muted dark:text-text-dark-muted">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 mb-5 px-3 py-2 rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper text-cocoa dark:text-white text-sm focus:outline-none focus:border-sky"
          />
          <Button full onClick={signIn}>Sign in</Button>
        </Card>

        <button onClick={() => navigate('/role')} className="text-center w-full text-xs text-sky hover:text-white mt-6 transition-colors">
          Switch demo role
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'

export default function SignIn() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()
  const [phone, setPhone] = useState('0712 345 678')
  const [pin, setPin] = useState('')
  const [stage, setStage] = useState<'phone' | 'pin'>('phone')

  function signIn() {
    signInAs('CUSTOMER')
    navigate('/customer/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-10 bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors">
      <div className="max-w-sm mx-auto w-full">
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-sky uppercase tracking-wide">NCBA BOOSTA</p>
          <h1 className="text-[20px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-0.5">
            Welcome Back
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Sign in to access your approved working-capital facilities.
          </p>
        </div>

        <Card className="p-5">
          {stage === 'phone' ? (
            <div className="space-y-4">
              <Input
                label="Registered Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                helperText="Use the Safaricom number linked to your NCBA facility."
              />
              <Button full onClick={() => setStage('pin')}>Continue</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Enter your 4-digit BOOSTA PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                type="password"
                placeholder="••••"
                className="text-center tracking-[0.5em] text-base"
              />
              <div className="flex justify-end">
                <button className="text-[11px] text-cocoa dark:text-sky font-semibold underline decoration-sky/40">
                  Forgot PIN?
                </button>
              </div>
              <Button full disabled={pin.length < 4} onClick={signIn}>Sign in</Button>
            </div>
          )}
        </Card>

        <p className="text-center text-[12px] text-text-light-muted dark:text-text-dark-muted mt-6">
          New to NCBA BOOSTA?{' '}
          <button
            className="text-cocoa dark:text-sky font-bold underline decoration-sky"
            onClick={() => navigate('/customer/signup')}
          >
            Activate account
          </button>
        </p>
      </div>
    </div>
  )
}

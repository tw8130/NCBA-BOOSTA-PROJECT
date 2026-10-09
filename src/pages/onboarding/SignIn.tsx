// -----------------------------------------------------------------------------
// NCBA BOOSTA — Customer Sign In Screen
// -----------------------------------------------------------------------------

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { PinField } from '../../components/domain/PinField'
import { useAuth } from '../../context/AuthContext'
import { useOnboarding } from '../../context/OnboardingContext'
import { DEMO_PIN, isValidKenyanPhone, PIN_LENGTH } from '../../lib/validators'

export default function SignIn() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()
  const { setPhone: saveOnboardingPhone } = useOnboarding()

  const [phone, setPhone] = useState('0712 345 678')
  const [pin, setPin] = useState('')
  const [stage, setStage] = useState<'phone' | 'pin'>('phone')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleContinuePhone() {
    if (!isValidKenyanPhone(phone)) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g. 0712 345 678)')
      return
    }
    setPhoneError(null)
    saveOnboardingPhone(phone)
    setStage('pin')
  }

  function handleSignIn() {
    if (pin.length !== PIN_LENGTH) {
      setPinError(`Please enter your ${PIN_LENGTH}-digit PIN`)
      return
    }

    setIsLoading(true)
    setPinError(null)

    setTimeout(() => {
      setIsLoading(false)
      // Allow DEMO_PIN (2580) or any 4-digit PIN for demo convenience
      if (pin === DEMO_PIN || pin === '1234' || attempts >= 2) {
        signInAs('CUSTOMER')
        navigate('/customer/dashboard')
      } else {
        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)
        if (nextAttempts >= 3) {
          setIsLocked(true)
          setPinError('Account locked due to 3 incorrect attempts. Please reset your PIN via OTP.')
        } else {
          setPinError(`Incorrect PIN. ${3 - nextAttempts} attempt(s) remaining. (Demo PIN: ${DEMO_PIN})`)
        }
      }
    }, 400)
  }

  function handleForgotPin() {
    saveOnboardingPhone(phone)
    navigate('/customer/otp?purpose=reset')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 py-10 bg-surface-light dark:bg-surface-dark-bg text-cocoa dark:text-text-dark-primary transition-colors">
      <div className="max-w-sm mx-auto w-full">
        {/* Top Header */}
        <div className="mb-6">
          <button
            onClick={() => (stage === 'pin' ? setStage('phone') : navigate('/'))}
            className="inline-flex items-center gap-1.5 text-[12px] text-text-light-secondary dark:text-text-dark-secondary hover:text-cocoa dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <span className="text-[10px] font-semibold text-cocoa bg-sky px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
            NCBA BOOSTA
          </span>
          <h1 className="text-[22px] font-bold text-cocoa dark:text-text-dark-primary tracking-tight mt-1">
            Welcome Back
          </h1>
          <p className="text-[12px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
            Sign in to access your pre-approved distributor credit line.
          </p>
        </div>

        <Card className="p-5">
          {stage === 'phone' ? (
            <div className="space-y-4">
              <Input
                label="Registered Mobile Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (phoneError) setPhoneError(null)
                }}
                error={phoneError || undefined}
                placeholder="07XX XXX XXX"
                helperText="Enter the phone number registered on your NCBA invitation SMS."
                autoFocus
              />

              <Button full size="md" onClick={handleContinuePhone}>
                Continue to PIN
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-2.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-text-light-secondary dark:text-text-dark-secondary">
                  Mobile: <strong>{phone}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setStage('phone')}
                  className="text-sky hover:underline font-medium"
                >
                  Change
                </button>
              </div>

              <PinField
                label={`Enter your ${PIN_LENGTH}-digit BOOSTA PIN`}
                value={pin}
                onChange={(v) => {
                  setPin(v)
                  if (pinError) setPinError(null)
                }}
                error={pinError || undefined}
                disabled={isLocked}
                autoFocus
              />

              {/* Demo Hint Banner */}
              <div className="p-2 rounded-[4px] bg-sky-tint dark:bg-sky/15 border border-sky/30 text-[11px] text-cocoa dark:text-text-dark-primary flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <KeyRound size={12} className="text-sky" /> Demo PIN:{' '}
                  <strong className="font-mono">{DEMO_PIN}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPin(DEMO_PIN)}
                  className="text-[10px] text-sky font-semibold hover:underline"
                >
                  Fill Demo
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleForgotPin}
                  className="text-[11px] text-cocoa dark:text-sky font-semibold underline decoration-sky hover:text-sky transition-colors"
                >
                  Forgot PIN?
                </button>
                <span className="text-[11px] text-text-light-muted">
                  Attempts: {attempts}/3
                </span>
              </div>

              <Button
                full
                size="md"
                disabled={pin.length < PIN_LENGTH || isLocked}
                loading={isLoading}
                onClick={handleSignIn}
              >
                Sign in to Dashboard
              </Button>

              {isLocked && (
                <div className="p-3 rounded-[4px] bg-coral-tint/30 border border-coral/30 text-coral text-[11px] flex items-start gap-2">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Security Lockout Active</p>
                    <p className="mt-0.5">
                      Use the OTP reset button above to verify your phone and unlock your PIN.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Bottom Activation Link */}
        <div className="text-center text-[12px] text-text-light-muted dark:text-text-dark-muted mt-6">
          First time accessing NCBA BOOSTA?{' '}
          <button
            className="text-cocoa dark:text-sky font-bold underline decoration-sky ml-1"
            onClick={() => navigate('/customer/signup')}
          >
            Activate pre-approved facility
          </button>
        </div>
      </div>
    </div>
  )
}

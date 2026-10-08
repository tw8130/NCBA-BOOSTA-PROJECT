import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { AppShell } from '../../components/layout/AppShell'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatKES } from '../../lib/format'
import { useApp } from '../../context/AppContext'

export default function RepayStatus() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loans } = useApp()
  const state = location.state as { outcome: 'SUCCESS'; amount: number; loanId: string } | undefined
  const loan = state ? loans.find((l) => l.id === state.loanId) : undefined

  return (
    <AppShell title="Payment status" nav={false}>
      <div className="max-w-sm mx-auto text-center py-8">
        <CheckCircle2 className="mx-auto text-mediterranean mb-4" size={56} />
        <h1 className="text-xl font-extrabold text-cocoa dark:text-white mb-1">Payment successful</h1>
        <p className="text-sm text-text-light-muted dark:text-text-dark-muted mb-6">
          {state ? `${formatKES(state.amount)} has been applied to ${loan?.reference ?? 'your loan'}.` : 'Your payment has been applied.'}
        </p>

        <Card className="p-4 mb-6 text-left">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-light-muted dark:text-text-dark-muted">New outstanding balance</span>
            <span className="font-bold text-cocoa dark:text-white">{loan ? formatKES(loan.outstandingBalance) : formatKES(0)}</span>
          </div>
          {loan && loan.outstandingBalance === 0 && (
            <p className="text-xs text-mediterranean font-semibold">This loan is fully paid off 🎉</p>
          )}
        </Card>

        <div className="space-y-2">
          <Button full onClick={() => navigate('/customer/dashboard')}>Back to dashboard</Button>
          <Button full variant="secondary" onClick={() => navigate('/customer/transactions')}>View transaction history</Button>
        </div>
      </div>
    </AppShell>
  )
}

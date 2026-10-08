import { useNavigate } from 'react-router-dom'
import { MessageSquareText } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export default function Splash() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-cocoa text-white flex flex-col justify-between px-6 py-10 selection:bg-sky/30">
      <div>
        <p className="text-[12px] text-white/70 font-medium mb-1">NCBA BANK KENYA</p>
        <h1 className="text-3xl font-extrabold leading-tight mb-1 tracking-tight">NCBA BOOSTA</h1>
        <p className="text-sky text-[12px] font-medium">Digital working-capital financing</p>
      </div>

      <div>
        <p className="text-[11px] text-white/70 mb-2 flex items-center gap-1.5 font-medium">
          <MessageSquareText size={14} className="text-sky" /> SMS from NCBA (Simulated)
        </p>
        <Card className="p-4 bg-white text-cocoa border border-white/20 rounded-[6px]">
          <p className="text-[13px] leading-relaxed">
            Hello Bonface, you have been approved for an NCBA BOOSTA working-capital limit of{' '}
            <span className="font-bold text-cocoa">KES 5,000,000</span>. To activate your account and access your
            facility, use the secure link below.
          </p>
          <button
            onClick={() => navigate('/customer/signup')}
            className="text-cocoa font-bold text-[13px] underline decoration-sky decoration-2 underline-offset-4 mt-3 block hover:text-sky-dark transition-colors"
          >
            boosta.ncbagroup.com/activate/8f2e1
          </button>
        </Card>
      </div>

      <div className="space-y-2.5">
        <Button full onClick={() => navigate('/customer/signup')}>
          Activate my account
        </Button>
        <Button full variant="secondary" onClick={() => navigate('/customer/login')}>
          I already have an account
        </Button>
        <button
          onClick={() => navigate('/role')}
          className="text-center w-full text-[11px] text-white/60 hover:text-white pt-2 transition-colors"
        >
          Switch demo role
        </button>
      </div>
    </div>
  )
}

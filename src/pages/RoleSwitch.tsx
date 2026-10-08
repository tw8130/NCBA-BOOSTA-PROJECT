import { useNavigate } from 'react-router-dom'
import { User, Landmark, ShieldAlert, CheckCircle2, Palette } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export default function RoleSwitch() {
  const navigate = useNavigate()
  const { signInAs } = useAuth()

  function pick(role: Role) {
    signInAs(role)
    if (role === 'CUSTOMER') navigate('/customer/dashboard')
    else if (role === 'ANCHOR') navigate('/anchor/dashboard')
    else if (role === 'BANK_MAKER') navigate('/lms/dashboard')
    else if (role === 'BANK_CHECKER') navigate('/lms/limits/queue')
  }

  return (
    <div className="min-h-screen bg-cocoa text-white flex flex-col justify-center px-4 py-10 selection:bg-sky/30">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[20px] bg-white/10 text-sky text-[10px] font-semibold mb-2 border border-white/15">
          NCBA BOOSTA Prototype
        </div>
        <h1 className="text-[22px] font-bold text-white mb-1 tracking-tight">
          Choose a Demo Role
        </h1>
        <p className="text-[12px] text-white/70 mb-6">
          Switch between borrower, anchor, and internal bank roles. Route guards isolate each role.
        </p>

        <div className="space-y-2.5 text-left">
          {/* 1. Customer */}
          <button
            onClick={() => pick('CUSTOMER')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[6px] bg-white text-cocoa border border-white/20 hover:border-sky transition-all hover:-translate-y-[1px]"
          >
            <div className="w-10 h-10 rounded-[4px] bg-sky-tint text-cocoa flex items-center justify-center shrink-0 border border-sky/30">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[13px] text-cocoa">Borrower (Customer)</p>
                <span className="text-[10px] font-medium text-sky px-1.5 py-0.2 rounded-[20px] bg-sky-tint border border-sky/20">Active</span>
              </div>
              <p className="text-[11px] text-text-light-secondary truncate">
                Bonface Macharia — Macharia General Traders
              </p>
            </div>
          </button>

          {/* 2. Anchor */}
          <button
            onClick={() => pick('ANCHOR')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[6px] bg-white text-cocoa border border-white/20 hover:border-sky transition-all hover:-translate-y-[1px]"
          >
            <div className="w-10 h-10 rounded-[4px] bg-sky-tint text-cocoa flex items-center justify-center shrink-0 border border-sky/30">
              <Landmark size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[13px] text-cocoa">Corporate Anchor</p>
                <span className="text-[10px] font-medium text-sky px-1.5 py-0.2 rounded-[20px] bg-sky-tint border border-sky/20">Active</span>
              </div>
              <p className="text-[11px] text-text-light-secondary truncate">
                EABL Finance Team — Grace Wanjiru
              </p>
            </div>
          </button>

          {/* 3. Bank Maker */}
          <button
            onClick={() => pick('BANK_MAKER')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[6px] bg-white text-cocoa border border-white/20 hover:border-sky transition-all hover:-translate-y-[1px]"
          >
            <div className="w-10 h-10 rounded-[4px] bg-sun-tint text-cocoa flex items-center justify-center shrink-0 border border-sun/40">
              <ShieldAlert size={18} className="text-cocoa" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[13px] text-cocoa">Bank Maker (LMS)</p>
                <span className="text-[10px] font-medium text-cocoa px-1.5 py-0.2 rounded-[20px] bg-sun border border-sun/50">Initiator</span>
              </div>
              <p className="text-[11px] text-text-light-secondary truncate">
                NCBA Credit Officer — Initiates Limit Amendments & Anchors
              </p>
            </div>
          </button>

          {/* 4. Bank Checker */}
          <button
            onClick={() => pick('BANK_CHECKER')}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-[6px] bg-white text-cocoa border border-white/20 hover:border-sky transition-all hover:-translate-y-[1px]"
          >
            <div className="w-10 h-10 rounded-[4px] bg-mediterranean/15 text-mediterranean flex items-center justify-center shrink-0 border border-mediterranean/30">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-[13px] text-cocoa">Bank Checker (LMS)</p>
                <span className="text-[10px] font-medium text-mediterranean px-1.5 py-0.2 rounded-[20px] bg-mediterranean/10 border border-mediterranean/30">Approver</span>
              </div>
              <p className="text-[11px] text-text-light-secondary truncate">
                NCBA Credit Manager — Maker≠Checker Enforced
              </p>
            </div>
          </button>
        </div>

        {/* Link to StyleGuide */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-center">
          <button
            onClick={() => navigate('/dev/StyleGuide')}
            className="inline-flex items-center gap-1.5 text-[11px] text-sky hover:text-white transition-colors"
          >
            <Palette size={13} /> Open Brand Design System & Style Guide
          </button>
        </div>
      </div>
    </div>
  )
}

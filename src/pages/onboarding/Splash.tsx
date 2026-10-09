// -----------------------------------------------------------------------------
// NCBA BOOSTA — Entry Experience (SMS Invitation & Splash Carousel)
// -----------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MessageSquareText,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

interface CarouselSlide {
  title: string
  subtitle: string
  icon: typeof Sparkles
  badge: string
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    title: 'Up to KES 5M Working Capital',
    subtitle: 'Revolving distributor financing tailored to stock turnover cycles without branch visits.',
    icon: Sparkles,
    badge: 'Pre-Approved Credit',
  },
  {
    title: 'Flexible 7 to 90-Day Tenors',
    subtitle: 'Choose individual tenor periods per order. Early repayment discount with zero penalty.',
    icon: Calendar,
    badge: 'Custom Tenors',
  },
  {
    title: '100% Digital KYB & Geotagging',
    subtitle: 'Fast 5-minute registration with live storefront GPS verification and digital signing.',
    icon: ShieldCheck,
    badge: 'Paperless Onboarding',
  },
  {
    title: 'Direct Anchor Settlement',
    subtitle: 'Disbursement directly to certified anchors like EABL, Coca-Cola, Bata, and Devki.',
    icon: Building2,
    badge: 'Anchor Network',
  },
]

export default function Splash() {
  const navigate = useNavigate()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isPaused])

  const slide = CAROUSEL_SLIDES[activeSlide]
  const Icon = slide.icon

  return (
    <div
      className="min-h-screen bg-cocoa text-white flex flex-col justify-between px-5 sm:px-8 py-8 selection:bg-sky/30 max-w-md mx-auto sm:max-w-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Brand Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[3px] bg-sky flex items-center justify-center font-bold text-[11px] text-cocoa leading-none">
            B
          </div>
          <span className="text-[14px] font-bold tracking-tight text-white">NCBA BOOSTA</span>
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-[20px] bg-white/10 text-sky border border-sky/30">
          Retail Innovation
        </span>
      </header>

      {/* Main Content Area: Carousel & SMS Card */}
      <main className="my-6 space-y-6">
        {/* Interactive Carousel */}
        <section
          aria-roledescription="carousel"
          aria-label="BOOSTA Key Features"
          className="relative bg-white/5 border border-white/10 rounded-[6px] p-5 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-cocoa bg-sky px-2 py-0.5 rounded-[2px] uppercase tracking-wider">
              {slide.badge}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setActiveSlide((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1))
                }
                aria-label="Previous feature"
                className="p-1 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length)}
                aria-label="Next feature"
                className="p-1 rounded-[4px] hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3.5 my-2 min-h-[90px]">
            <div className="w-10 h-10 rounded-[4px] bg-sky/20 border border-sky/30 flex items-center justify-center shrink-0 text-sky">
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[16px] font-bold tracking-tight text-white leading-snug">
                {slide.title}
              </h2>
              <p className="text-[12px] text-white/80 mt-1 leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4 pt-2 border-t border-white/10">
            {CAROUSEL_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-[1px] transition-all ${
                  idx === activeSlide ? 'w-6 bg-sky' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Invitation SMS Preview Card */}
        <section aria-label="Simulated Invitation SMS">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-white/80 font-medium flex items-center gap-1.5">
              <MessageSquareText size={14} className="text-sky" />
              Invitation SMS from NCBA (Simulated)
            </span>
            <span className="text-[10px] font-mono text-white/50">Sender: NCBA-BOOSTA</span>
          </div>

          <Card className="p-4 bg-white text-cocoa border border-white/20 rounded-[6px]">
            <div className="flex items-start gap-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-light-muted mb-1 font-mono">Today, 09:41 AM</p>
                <p className="text-[13px] text-cocoa leading-relaxed">
                  Dear Bonface Macharia, you have a pre-approved NCBA BOOSTA working capital limit of{' '}
                  <span className="font-bold text-cocoa bg-sun/30 px-1 rounded-[2px]">
                    KES 5,000,000
                  </span>{' '}
                  for your registered business. Activate in 3 minutes with zero paperwork:
                </p>
                <button
                  onClick={() => navigate('/customer/signup')}
                  className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-cocoa underline decoration-sky decoration-2 underline-offset-4 hover:text-sky-dark transition-colors"
                >
                  boosta.ncbagroup.com/activate/8f2e1 <ArrowRight size={13} className="no-underline text-sky" />
                </button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Action Footer */}
      <footer className="space-y-2.5 pt-2">
        <Button
          full
          size="lg"
          onClick={() => navigate('/customer/signup')}
          rightIcon={<ArrowRight size={16} />}
        >
          Activate my account
        </Button>

        <Button
          full
          size="md"
          variant="secondary"
          onClick={() => navigate('/customer/login')}
        >
          I already have an account (Sign In)
        </Button>

        <div className="pt-2 text-center">
          <button
            onClick={() => navigate('/role')}
            className="text-[11px] text-white/60 hover:text-white transition-colors underline decoration-white/30"
          >
            Switch demo role (Customer / Anchor / Bank)
          </button>
        </div>
      </footer>
    </div>
  )
}

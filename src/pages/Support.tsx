import { useState } from 'react'
import { PhoneCall, MessageCircle, ChevronDown } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { supportCategories } from '../mocks/data'

export default function Support() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <AppShell title="Help & Support">
      <div className="max-w-xl space-y-2">
        <p className="text-sm text-text-light-muted dark:text-text-dark-muted mb-2">Choose what you need help with.</p>
        {supportCategories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-sm font-semibold text-cocoa dark:text-white">{cat.title}</span>
              <ChevronDown size={16} className={`text-text-light-muted dark:text-text-dark-muted transition-transform ${open === cat.id ? 'rotate-180' : ''}`} />
            </button>
            {open === cat.id && (
              <div className="px-4 pb-4 -mt-1">
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-2">{cat.explanation}</p>
                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-3">{cat.solution}</p>
                {cat.hasReference && (
                  <p className="text-xs text-text-light-muted dark:text-text-dark-muted mb-3">Have a reference number ready to speed things up.</p>
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex items-center gap-1.5 !py-2 !px-3 text-xs">
                    <MessageCircle size={14} /> Chat with us
                  </Button>
                  <Button variant="secondary" className="flex items-center gap-1.5 !py-2 !px-3 text-xs">
                    <PhoneCall size={14} /> Call support
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </AppShell>
  )
}

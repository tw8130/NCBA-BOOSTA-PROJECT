// -----------------------------------------------------------------------------
// NCBA BOOSTA — HTML5 Canvas Signature Pad Component
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { Eraser, CheckCircle2, PenLine } from 'lucide-react'
import { Button } from '../ui/Button'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  onClear: () => void
  savedSignature?: string | null
  label?: string
  signatoryName?: string
}

export function SignaturePad({
  onSave,
  onClear,
  savedSignature,
  label = 'Applicant Digital Signature',
  signatoryName,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#39302D' // Cocoa brand ink
      ctx.lineWidth = 2.5
    }
  }, [])

  function startDrawing(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    canvas.setPointerCapture(e.pointerId)
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
    setStrokeCount((c) => c + 1)
  }

  function stopDrawing(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.releasePointerCapture(e.pointerId)

    if (strokeCount > 5) {
      const dataUrl = canvas.toDataURL('image/png')
      onSave(dataUrl)
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setStrokeCount(0)
    onClear()
  }

  function useDemoSignature() {
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = 400
    canvas.height = 140
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 400, 140)
      ctx.strokeStyle = '#39302D'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      // Draw simulated script cursive signature
      ctx.moveTo(50, 75)
      ctx.bezierCurveTo(90, 30, 100, 110, 140, 60)
      ctx.bezierCurveTo(160, 40, 180, 80, 220, 50)
      ctx.bezierCurveTo(240, 90, 270, 45, 330, 75)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(70, 95)
      ctx.lineTo(310, 85)
      ctx.stroke()
    }
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
    setStrokeCount(20)
  }

  return (
    <div className="w-full rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary flex items-center gap-1.5">
            <PenLine size={15} className="text-sky" />
            {label}
          </h4>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
            {signatoryName
              ? `Signing as authorized legal representative: ${signatoryName}`
              : 'Sign inside the designated area using your finger or stylus.'}
          </p>
        </div>

        {savedSignature && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mediterranean dark:text-teal-400">
            <CheckCircle2 size={13} /> Captured
          </span>
        )}
      </div>

      {savedSignature ? (
        <div className="p-3 rounded-[4px] bg-sky-tint/40 dark:bg-sky/10 border border-sky/30">
          <div className="flex items-center justify-center p-3 bg-white dark:bg-surface-dark-paper rounded-[4px] border border-surface-border dark:border-surface-dark-border mb-3 h-28">
            <img src={savedSignature} alt="Applicant signature" className="max-h-24 max-w-full object-contain" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-light-muted">
              Digital signature legally binding under Kenya Information and Communications Act (KICA).
            </span>
            <Button variant="secondary" size="sm" leftIcon={<Eraser size={13} />} onClick={clearCanvas}>
              Clear & Re-sign
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full h-32 rounded-[4px] border-2 border-dashed border-surface-border dark:border-surface-dark-border bg-surface-light dark:bg-slate-900/60 overflow-hidden touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
            />

            {/* Signature Baseline Guide */}
            <div className="absolute bottom-6 left-6 right-6 border-b border-black/15 dark:border-white/15 pointer-events-none flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider text-text-light-muted">
                Sign on the line above
              </span>
              <span className="text-[9px] text-text-light-muted">X</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[10px] text-text-light-muted">
              {strokeCount > 0 ? `${strokeCount} stroke points registered` : 'Canvas blank — start drawing'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={useDemoSignature}>
                Use Demo Signature
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Eraser size={13} />}
                disabled={strokeCount === 0}
                onClick={clearCanvas}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

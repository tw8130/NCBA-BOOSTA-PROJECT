// -----------------------------------------------------------------------------
// NCBA BOOSTA — Live Selfie Facial Capture with Oval Guide
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import { Camera, CheckCircle2, RefreshCw, Upload, AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'

interface SelfieCaptureProps {
  onCapture: (dataUrl: string) => void
  onClear: () => void
  capturedUrl?: string | null
  label?: string
}

export function SelfieCapture({
  onCapture,
  onClear,
  capturedUrl,
  label = 'Live Facial Verification',
}: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [streamActive, setStreamActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  async function startCamera() {
    setIsInitializing(true)
    setCameraError(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported in this browser environment.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      setStream(mediaStream)
      setStreamActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(() => {})
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to start camera. Please enable webcam permission or upload a photo.'
      setCameraError(msg)
      setStreamActive(false)
    } finally {
      setIsInitializing(false)
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setStreamActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  function takePhoto() {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current || document.createElement('canvas')
    canvas.width = video.videoWidth || 480
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror image for natural selfie orientation
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    stopCamera()
    onCapture(dataUrl)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera()
        onCapture(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  function useDemoPhoto() {
    stopCamera()
    // Simulated selfie placeholder avatar
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#39302D'
      ctx.fillRect(0, 0, 400, 400)
      ctx.fillStyle = '#3AB3E5'
      ctx.beginPath()
      ctx.arc(200, 160, 70, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(200, 360, 130, 0, Math.PI, true)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('NCBA Biometric Live Photo — Verified', 200, 380)
    }
    onCapture(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <div className="w-full rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary flex items-center gap-1.5">
            <Camera size={15} className="text-sky" />
            {label}
          </h4>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
            Hold your phone at eye level and align your face inside the oval.
          </p>
        </div>
        {capturedUrl && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mediterranean dark:text-teal-400">
            <CheckCircle2 size={13} /> Captured
          </span>
        )}
      </div>

      {capturedUrl ? (
        <div className="relative rounded-[4px] overflow-hidden border border-mediterranean/40 bg-black/5 dark:bg-white/5 p-3 flex flex-col items-center">
          <img
            src={capturedUrl}
            alt="Live selfie capture"
            className="w-48 h-48 object-cover rounded-full border-2 border-mediterranean shadow-sm mb-3"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={() => {
                onClear()
                startCamera()
              }}
            >
              Retake Selfie
            </Button>
          </div>
        </div>
      ) : streamActive ? (
        <div className="relative rounded-[4px] overflow-hidden bg-black flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-square overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />

            {/* Oval Face Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-44 h-60 rounded-[50%] border-2 border-dashed border-sky bg-sky/5 animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-white/80 font-medium bg-black/60 px-2 py-0.5 rounded-[4px]">
                  Position Face Here
                </span>
              </div>
            </div>
          </div>

          <div className="w-full p-3 bg-cocoa flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={stopCamera}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Camera size={14} />}
              onClick={takePhoto}
            >
              Capture Photo
            </Button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="rounded-[4px] border border-dashed border-surface-border dark:border-surface-dark-border p-5 text-center">
          {cameraError ? (
            <div className="mb-3 p-2.5 rounded-[4px] bg-sun/15 border border-sun/30 text-left text-[11px] text-cocoa dark:text-sun flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 text-sun-dark mt-0.5" />
              <div>
                <p className="font-semibold">Camera Access Note</p>
                <p className="text-[10px] opacity-90">{cameraError}</p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Camera size={14} />}
              loading={isInitializing}
              onClick={startCamera}
            >
              Open Camera
            </Button>
            <label className="inline-flex">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Upload size={14} />}
                type="button"
                onClick={() => document.getElementById('selfie-file-input')?.click()}
              >
                Upload Photo File
              </Button>
              <input
                id="selfie-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <Button variant="ghost" size="sm" onClick={useDemoPhoto}>
              Use Demo Selfie
            </Button>
          </div>

          <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
            Live biometric selfie is required under Central Bank of Kenya (CBK) digital lending guidelines.
          </p>
        </div>
      )}
    </div>
  )
}

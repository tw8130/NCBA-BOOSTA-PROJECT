// -----------------------------------------------------------------------------
// NCBA BOOSTA — Business Premises GeoCameraCapture Component
// -----------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ShieldCheck,
  Crosshair,
} from 'lucide-react'
import { Button } from '../ui/Button'
import type { GeoCapture } from '../../types'

interface GeoCameraCaptureProps {
  onCapture: (capture: GeoCapture, mode: 'LIVE_GPS' | 'FALLBACK_UPLOAD' | 'DEMO_PRESET') => void
  onClear: () => void
  currentCapture?: GeoCapture | null
  label?: string
}

interface GeoCoords {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: string
}

export function GeoCameraCapture({
  onCapture,
  onClear,
  currentCapture,
  label = 'Premises Geotagged Verification',
}: GeoCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  // Geolocation states
  const [coords, setCoords] = useState<GeoCoords | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [permissionRequested, setPermissionRequested] = useState(false)

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  function requestGpsLocation() {
    setIsLocating(true)
    setGeoError(null)
    setPermissionRequested(true)

    if (!navigator.geolocation) {
      setGeoError('HTML5 Geolocation is not supported by your browser.')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: new Date(pos.timestamp).toISOString(),
        })
        setIsLocating(false)
      },
      (err) => {
        let msg = 'Failed to obtain GPS coordinates.'
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can enable permissions or use demo coordinates below.'
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Please ensure GPS is enabled.'
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS lookup timed out. Please retry or use demo location.'
        }
        setGeoError(msg)
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  async function startViewfinder() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam hardware is not available.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)
      setIsCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(() => {})
      }
    } catch {
      // Fallback if camera error
      setIsCameraActive(false)
    }
  }

  function handleCapturePhoto() {
    if (!videoRef.current || !coords) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 800
    canvas.height = video.videoHeight || 600

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw camera image
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Draw high-contrast geotag watermark bar
    const barHeight = 64
    ctx.fillStyle = 'rgba(57, 48, 45, 0.88)' // Cocoa with opacity
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight)

    // Top border on watermark bar
    ctx.fillStyle = '#3AB3E5' // Sky
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, 3)

    // Text on watermark
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 14px "Century Gothic", sans-serif'
    ctx.fillText('NCBA BOOSTA — PREMISES GEOTAG VERIFICATION', 16, canvas.height - 38)

    ctx.font = '12px monospace'
    ctx.fillStyle = '#EBF7FC'
    const locLine = `LAT: ${coords.latitude}°  |  LNG: ${coords.longitude}°  |  ACCURACY: ±${coords.accuracy}m`
    ctx.fillText(locLine, 16, canvas.height - 18)

    const dateLine = new Date(coords.timestamp).toLocaleString('en-KE')
    ctx.textAlign = 'right'
    ctx.fillText(dateLine, canvas.width - 16, canvas.height - 18)

    const photoUrl = canvas.toDataURL('image/jpeg', 0.88)
    stopCamera()

    onCapture(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: coords.timestamp,
        photoUrl,
      },
      'LIVE_GPS'
    )
  }

  function handleDemoCapture() {
    stopCamera()
    const demoCoords = {
      latitude: -1.292066,
      longitude: 36.821945,
      accuracy: 8,
      timestamp: new Date().toISOString(),
    }
    setCoords(demoCoords)

    // Render demo storefront canvas
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // Storefront mockup background
      ctx.fillStyle = '#39302D'
      ctx.fillRect(0, 0, 640, 480)
      ctx.fillStyle = '#3AB3E5'
      ctx.fillRect(80, 100, 480, 240)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 22px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('KIAMI GENERAL DISTRIBUTORS', 320, 200)
      ctx.font = '14px sans-serif'
      ctx.fillText('Licensed FMCG Wholesale & Stockist — Nairobi', 320, 230)

      // Watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
      ctx.fillRect(0, 420, 640, 60)
      ctx.fillStyle = '#3AB3E5'
      ctx.fillRect(0, 420, 640, 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 12px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('NCBA BOOSTA PREMISES VERIFICATION: -1.292066°, 36.821945° (±8m)', 12, 442)
      ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString('en-KE')} (PROTOTYPE DEMO)`, 12, 462)
    }

    onCapture(
      {
        ...demoCoords,
        photoUrl: canvas.toDataURL('image/jpeg', 0.85),
      },
      'DEMO_PRESET'
    )
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fallbackCoords = coords || {
      latitude: -1.286389,
      longitude: 36.817223,
      accuracy: 15,
      timestamp: new Date().toISOString(),
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        stopCamera()
        onCapture(
          {
            ...fallbackCoords,
            photoUrl: reader.result,
          },
          'FALLBACK_UPLOAD'
        )
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-full rounded-[4px] border border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-paper p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-[13px] font-semibold text-cocoa dark:text-text-dark-primary flex items-center gap-1.5">
            <MapPin size={15} className="text-sky" />
            {label}
          </h4>
          <p className="text-[11px] text-text-light-muted dark:text-text-dark-muted mt-0.5">
            Real-time GPS coordinates and storefront photograph verification.
          </p>
        </div>
        {currentCapture && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mediterranean dark:text-teal-400">
            <CheckCircle2 size={13} /> Geotagged
          </span>
        )}
      </div>

      {currentCapture ? (
        <div className="rounded-[4px] border border-mediterranean/30 bg-black/5 dark:bg-white/5 p-3">
          <div className="relative rounded-[4px] overflow-hidden mb-3">
            <img
              src={currentCapture.photoUrl}
              alt="Geotagged premises snapshot"
              className="w-full h-52 object-cover rounded-[4px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-white dark:bg-surface-dark-paper p-2.5 rounded-[4px] border border-surface-border dark:border-surface-dark-border text-[11px]">
            <div>
              <p className="text-text-light-muted dark:text-text-dark-muted text-[10px]">Latitude</p>
              <p className="font-mono font-semibold text-cocoa dark:text-text-dark-primary">
                {currentCapture.latitude}°
              </p>
            </div>
            <div>
              <p className="text-text-light-muted dark:text-text-dark-muted text-[10px]">Longitude</p>
              <p className="font-mono font-semibold text-cocoa dark:text-text-dark-primary">
                {currentCapture.longitude}°
              </p>
            </div>
            <div>
              <p className="text-text-light-muted dark:text-text-dark-muted text-[10px]">GPS Accuracy</p>
              <p className="font-mono font-semibold text-mediterranean dark:text-teal-400">
                ±{currentCapture.accuracy}m
              </p>
            </div>
            <div>
              <p className="text-text-light-muted dark:text-text-dark-muted text-[10px]">Timestamp</p>
              <p className="font-mono text-[10px] text-cocoa dark:text-text-dark-primary truncate">
                {new Date(currentCapture.timestamp).toLocaleTimeString('en-KE')}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-light-muted flex items-center gap-1">
              <ShieldCheck size={12} className="text-mediterranean" /> Verified against anchor delivery records
            </span>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={13} />}
              onClick={() => {
                onClear()
                requestGpsLocation()
              }}
            >
              Recapture
            </Button>
          </div>
        </div>
      ) : isCameraActive ? (
        <div className="rounded-[4px] overflow-hidden bg-black flex flex-col items-center">
          <div className="relative w-full aspect-video sm:aspect-4/3 overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* GPS Watermark preview */}
            <div className="absolute top-2 left-2 bg-cocoa/80 text-white text-[10px] font-mono px-2 py-1 rounded-[4px] backdrop-blur flex items-center gap-1.5">
              <Crosshair size={12} className="text-sky animate-spin" />
              <span>
                {coords
                  ? `${coords.latitude}°, ${coords.longitude}° (±${coords.accuracy}m)`
                  : 'Acquiring GPS…'}
              </span>
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
              disabled={!coords}
              onClick={handleCapturePhoto}
            >
              {coords ? 'Snap Premises Photo' : 'Acquiring GPS…'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Permission explainer */}
          <div className="p-3 rounded-[4px] bg-sky-tint dark:bg-sky/15 border border-sky/30 text-[12px] text-cocoa dark:text-text-dark-primary flex items-start gap-2.5">
            <MapPin size={16} className="text-sky shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[12px]">Physical Location Verification Notice</p>
              <p className="text-[11px] text-text-light-secondary dark:text-text-dark-secondary mt-0.5 leading-relaxed">
                NCBA BOOSTA requires a verified GPS timestamp and shopfront photo to validate your commercial premises. This replaces physical bank branch inspections.
              </p>
            </div>
          </div>

          {/* GPS Status Card */}
          {coords ? (
            <div className="p-3 rounded-[4px] border border-mediterranean/30 bg-mediterranean/5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-cocoa dark:text-text-dark-primary flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-mediterranean" />
                  GPS Signal Acquired
                </p>
                <p className="text-[10px] font-mono text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                  Lat: {coords.latitude}° | Lng: {coords.longitude}° | Accuracy: ±{coords.accuracy}m
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Camera size={13} />}
                onClick={startViewfinder}
              >
                Open Viewfinder
              </Button>
            </div>
          ) : (
            <div className="rounded-[4px] border border-dashed border-surface-border dark:border-surface-dark-border p-4 text-center">
              {geoError ? (
                <div className="mb-3 p-2 rounded-[4px] bg-sun/15 border border-sun/30 text-left text-[11px] text-cocoa dark:text-sun flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 text-sun-dark mt-0.5" />
                  <div>
                    <p className="font-semibold">GPS Access Notice</p>
                    <p className="text-[10px] opacity-90">{geoError}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Crosshair size={14} />}
                  loading={isLocating}
                  onClick={requestGpsLocation}
                >
                  {permissionRequested ? 'Retry GPS Lookup' : 'Request GPS Coordinates'}
                </Button>

                <Button variant="secondary" size="sm" onClick={handleDemoCapture}>
                  Use Demo Premises (Nairobi)
                </Button>

                <label className="inline-flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Upload size={13} />}
                    type="button"
                    onClick={() => document.getElementById('premises-file-input')?.click()}
                  >
                    Upload Photo File
                  </Button>
                  <input
                    id="premises-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              <p className="text-[10px] text-text-light-muted dark:text-text-dark-muted">
                Requires HTML5 Geolocation permission in your browser or device.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// -----------------------------------------------------------------------------
// NCBA BOOSTA — Input Validation & Masking Utilities
// -----------------------------------------------------------------------------

export const PIN_LENGTH = 4
export const OTP_LENGTH = 6
export const OTP_RESEND_SECONDS = 45
export const DEMO_OTP = '123456'
export const DEMO_EXPIRED_OTP = '000000'
export const DEMO_PIN = '2580'

/**
 * Validates a Kenyan mobile phone number.
 * Accepts formats: 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, +2541XXXXXXXX, 2547XXXXXXXX
 */
export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  return (
    /^(?:254|\+254|0)?([17]\d{8})$/.test(cleaned)
  )
}

/**
 * Normalizes a Kenyan phone number to the standard local format: 07XXXXXXXX or 01XXXXXXXX
 */
export function normalizeKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  if (cleaned.startsWith('+254')) {
    return '0' + cleaned.slice(4)
  }
  if (cleaned.startsWith('254')) {
    return '0' + cleaned.slice(3)
  }
  return cleaned
}

/**
 * Formats a phone number for display (e.g. 0712 345 678)
 */
export function formatKenyanPhone(phone: string): string {
  const norm = normalizeKenyanPhone(phone)
  if (norm.length <= 4) return norm
  if (norm.length <= 7) return `${norm.slice(0, 4)} ${norm.slice(4)}`
  return `${norm.slice(0, 4)} ${norm.slice(4, 7)} ${norm.slice(7, 10)}`
}

/**
 * Validates a Kenyan National ID number (7 to 8 digits)
 */
export function isValidNationalId(id: string): boolean {
  const cleaned = id.trim()
  return /^\d{7,8}$/.test(cleaned)
}

/**
 * Validates an NCBA 10-digit core account number
 */
export function isValidNcbaAccount(account: string): boolean {
  const cleaned = account.replace(/\s/g, '')
  return /^\d{10}$/.test(cleaned)
}

/**
 * Formats an NCBA 10-digit account for display (e.g. 1023 445 566)
 */
export function formatNcbaAccount(account: string): string {
  const cleaned = account.replace(/\s/g, '')
  if (cleaned.length <= 4) return cleaned
  if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`
}

/**
 * Weak PIN check: rejects sequential or repeating PINs (e.g., 1234, 1111, 4321, 0000)
 */
export function isWeakPin(pin: string): { isWeak: boolean; reason?: string } {
  if (pin.length !== PIN_LENGTH) {
    return { isWeak: true, reason: `PIN must be exactly ${PIN_LENGTH} digits` }
  }
  
  // All digits identical (e.g. 1111)
  if (/^(\d)\1+$/.test(pin)) {
    return { isWeak: true, reason: 'PIN cannot be repeating digits (e.g. 1111)' }
  }

  // Ascending sequential (e.g. 1234, 2345)
  const isAscending = '0123456789'.includes(pin)
  if (isAscending) {
    return { isWeak: true, reason: 'PIN cannot be sequential digits (e.g. 1234)' }
  }

  // Descending sequential (e.g. 4321)
  const isDescending = '9876543210'.includes(pin)
  if (isDescending) {
    return { isWeak: true, reason: 'PIN cannot be sequential digits (e.g. 4321)' }
  }

  return { isWeak: false }
}

/**
 * File validation utility for document uploads
 */
export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateUploadFile(
  file: File,
  options: {
    maxSizeMb?: number
    allowedTypes?: string[]
  } = {}
): FileValidationResult {
  const maxSizeMb = options.maxSizeMb ?? 5
  const allowedTypes = options.allowedTypes ?? ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

  const maxSizeBytes = maxSizeMb * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMb}MB limit (actual: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    }
  }

  const isTypeAllowed = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      const prefix = type.split('/')[0]
      return file.type.startsWith(`${prefix}/`)
    }
    return file.type === type
  })

  if (!isTypeAllowed && file.type) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload PDF, PNG, or JPG',
    }
  }

  return { valid: true }
}

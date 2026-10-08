import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = false,
}: {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" full onClick={onCancel}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} full onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

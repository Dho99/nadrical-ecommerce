import { useAlertStore } from '../stores/alert.store'

type ToastOptions = {
  description?: string
  action?: { label: string; onClick: () => void }
  duration?: number
  position?: string
  style?: Record<string, string>
  closeButton?: boolean
}

function show(title: string, opts?: ToastOptions, variant: 'default' | 'destructive' = 'default') {
  const store = useAlertStore.getState()
  store.show({
    title,
    description: opts?.description,
    variant,
    actionLabel: opts?.action?.label,
    onAction: opts?.action?.onClick,
  })
}

type ToastFn = {
  (title: string, opts?: ToastOptions): void
  success: (title: string, opts?: ToastOptions) => void
  info: (title: string, opts?: ToastOptions) => void
  warning: (title: string, opts?: ToastOptions) => void
  error: (title: string, opts?: ToastOptions) => void
  message: (title: string, opts?: ToastOptions) => void
}

function createToast(): ToastFn {
  const fn = ((title: string, opts?: ToastOptions) => show(title, opts, 'default')) as ToastFn
  fn.success = (title: string, opts?: ToastOptions) => show(title, opts, 'default')
  fn.info = (title: string, opts?: ToastOptions) => show(title, opts, 'default')
  fn.warning = (title: string, opts?: ToastOptions) => show(title, opts, 'default')
  fn.error = (title: string, opts?: ToastOptions) => show(title, opts, 'destructive')
  fn.message = (title: string, opts?: ToastOptions) => show(title, opts, 'default')
  return fn
}

export const toast = createToast()

export function alert(opts: { title: string; description?: string; variant?: 'default' | 'destructive'; actionLabel?: string; onAction?: () => void }) {
  useAlertStore.getState().show(opts)
}

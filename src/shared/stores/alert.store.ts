import { create } from 'zustand'

interface AlertState {
  open: boolean
  title: string
  description?: string
  variant: 'default' | 'destructive'
  actionLabel?: string
  onAction?: () => void
  show: (opts: { title: string; description?: string; variant?: 'default' | 'destructive'; actionLabel?: string; onAction?: () => void }) => void
  close: () => void
}

export const useAlertStore = create<AlertState>()((set) => ({
  open: false,
  title: '',
  description: undefined,
  variant: 'default',
  actionLabel: undefined,
  onAction: undefined,
  show: (opts) => set({ open: true, title: opts.title, description: opts.description, variant: opts.variant ?? 'default', actionLabel: opts.actionLabel, onAction: opts.onAction }),
  close: () => set({ open: false }),
}))

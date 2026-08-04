import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface SectionHeadProps {
  eyebrow: string
  title: ReactNode
  action?: ReactNode
  className?: string
}

export function SectionHead({ eyebrow, title, action, className }: SectionHeadProps) {
  return (
    <header className={cn('flex items-end justify-between gap-6', className)}>
      <div>
        <p className="mb-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </header>
  )
}

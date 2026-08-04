import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { Card } from './card'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center gap-2 border-dashed bg-muted/40 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && <div className="mb-1 text-muted-foreground">{icon}</div>}
      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </Card>
  )
}

import { Minus, Plus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './button'

interface QtyStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (next: number) => void
  className?: string
  label?: string
}

export function QtyStepper({
  value,
  min = 1,
  max = 999,
  onChange,
  className,
  label = 'Quantity',
}: QtyStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div className={cn('inline-flex items-stretch rounded-lg border border-input bg-background', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
        className="rounded-r-none border-r"
      >
        <Minus />
      </Button>
      <output className="flex h-9 min-w-12 items-center justify-center px-1 font-mono text-sm font-semibold">
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
        className="rounded-l-none border-l"
      >
        <Plus />
      </Button>
    </div>
  )
}

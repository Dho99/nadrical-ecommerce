import { useState } from 'react'
import { BadgePercent, LoaderCircle, Tag, X } from 'lucide-react'
import { Button, Input } from '../../../shared/components/ui'
import { formatPrice } from '../../../shared/utils/format'
import { useVoucher } from '../hooks/useVoucher'
import { voucherService } from '../services/voucher.service'

interface VoucherFieldProps {
  subtotal: number
  shipping: number
}

export function VoucherField({ subtotal, shipping }: VoucherFieldProps) {
  const { applied, error, loading, apply, remove, discount: calcDiscount } = useVoucher()
  const [code, setCode] = useState('')

  const discount = applied ? calcDiscount(subtotal, shipping) : 0

  const handleApply = async () => {
    const ok = await apply(code, subtotal)
    if (ok) setCode('')
  }

  const handleRemove = () => {
    remove()
    setCode('')
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Tag className="size-4 text-primary" />
        <p className="text-sm font-semibold">Voucher</p>
        {applied && (
          <span className="ml-auto font-mono text-xs font-medium text-emerald-600">
            -{formatPrice(discount)}
          </span>
        )}
      </div>

      {applied ? (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30">
          <BadgePercent className="size-4 text-emerald-600" />
          <span className="font-mono text-xs font-bold tracking-wide">{applied.code}</span>
          <span className="text-xs text-muted-foreground">{applied.description}</span>
          <Button type="button" variant="ghost" size="icon-sm" className="ml-auto size-7" onClick={handleRemove} aria-label="Remove voucher">
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="NADRICAL10"
            aria-label="Voucher code"
            className="h-9 font-mono text-sm uppercase"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApply())}
          />
          <Button type="button" onClick={handleApply} disabled={loading || !code.trim()} className="shrink-0">
            {loading ? <LoaderCircle className="size-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      )}

      {error && !applied && (
        <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>
      )}

      {!applied && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {voucherService.list().map((v) => (
            <button
              key={v.code}
              type="button"
              onClick={() => setCode(v.code)}
              className="rounded-full border bg-muted px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide hover:bg-accent"
            >
              {v.code}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

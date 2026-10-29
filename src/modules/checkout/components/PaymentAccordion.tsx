import { useEffect } from 'react'
import { Building2, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { gatewayPaymentFee, isManualPaymentMethod } from '../utils/gateway'
import type { CheckoutInput } from '../schemas/checkout.schema'

export function PaymentAccordion() {
  const { setValue } = useFormContext<CheckoutInput>()
  const selected = useCheckoutRuntime((s) => s.paymentMethod)
  const setPaymentMethod = useCheckoutRuntime((s) => s.setPaymentMethod)
  const { methods, loading, error } = usePaymentMethods()
  const manualMethods = methods.filter(isManualPaymentMethod)

  useEffect(() => {
    if (manualMethods.length === 0) return
    const stillExists = selected && manualMethods.some((method) => method.uuid === selected.uuid)
    if (stillExists) return
    const first = manualMethods[0]
    setPaymentMethod(first)
    setValue('payment_method', 'bank', { shouldValidate: true })
    setValue('payment_provider', first.code)
  }, [manualMethods, selected, setPaymentMethod, setValue])

  const selectMethod = (method: (typeof manualMethods)[number]) => {
    setPaymentMethod(method)
    setValue('payment_method', 'bank', { shouldValidate: true, shouldDirty: true })
    setValue('payment_provider', method.code, { shouldDirty: true })
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Metode pembayaran</legend>
      <p className="text-sm text-muted-foreground">
        Transfer manual ke rekening resmi toko. Bukti transfer diunggah setelah pesanan dibuat.
      </p>

      {loading && manualMethods.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" /> Memuat metode pembayaran…
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && manualMethods.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          Belum ada metode transfer bank yang aktif. Hubungi admin toko.
        </div>
      )}

      <div className="grid gap-2" role="radiogroup" aria-label="Rekening tujuan transfer">
        {manualMethods.map((method) => {
          const active = selected?.uuid === method.uuid
          const fee = gatewayPaymentFee(method, 0)
          return (
            <button
              type="button"
              key={method.uuid}
              role="radio"
              aria-checked={active}
              onClick={() => selectMethod(method)}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-colors sm:p-4',
                active
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                    active ? 'border-primary' : 'border-muted-foreground/40',
                  )}
                >
                  {active && <span className="size-2.5 rounded-full bg-primary" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-semibold tracking-tight sm:text-base">
                      {method.bank_name || method.name}
                    </span>
                    {method.logo_url && (
                      <img src={method.logo_url} alt="" className="h-4 w-auto object-contain" />
                    )}
                  </span>
                  {method.account_number && (
                    <span className="mt-0.5 block font-mono text-xs font-semibold text-primary">
                      {method.account_number}
                    </span>
                  )}
                  {(method.account_holder_name || method.account_holder) && (
                    <span className="block text-xs text-muted-foreground">
                      a.n. {method.account_holder_name || method.account_holder}
                    </span>
                  )}
                  {method.instructions && (
                    <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                      {method.instructions}
                    </span>
                  )}
                  {fee > 0 && (
                    <span className="mt-1 block text-[11px] font-medium text-amber-600">
                      Biaya layanan +{formatPrice(fee)}
                    </span>
                  )}
                </span>
                {active && <ShieldCheck className="size-4 shrink-0 text-primary" />}
              </div>
            </button>
          )
        })}
      </div>

      {manualMethods.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="size-4 text-primary" />
          Rekening dan instruksi di atas berasal dari konfigurasi backend.
        </p>
      )}
    </fieldset>
  )
}

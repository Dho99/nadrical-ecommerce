import { useState, useEffect } from 'react'
import { ChevronDown, CreditCard, Building2, Info } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { cn } from '../../../shared/utils/cn'
import { PAYMENT_GROUPS } from '../services/payment.service'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import type { PaymentKind } from '../types/checkout.type'
import type { CheckoutInput } from '../schemas/checkout.schema'
import { CheckoutField } from './CheckoutField'
import { orderRepository, type GatewayPaymentMethod } from '../services/order.repository'
import { formatPrice } from '../../../shared/utils/format'

export function PaymentAccordion() {
  const { setValue } = useFormContext<CheckoutInput>()
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)
  const paymentProvider = useCheckoutRuntime((s) => s.paymentProvider)
  const setPaymentKind = useCheckoutRuntime((s) => s.setPaymentKind)
  const setPaymentProvider = useCheckoutRuntime((s) => s.setPaymentProvider)
  const [openKind, setOpenKind] = useState<PaymentKind | null>('card')
  const [manualMethods, setManualMethods] = useState<GatewayPaymentMethod[]>([])
  const [isManualFallback, setIsManualFallback] = useState(false)

  useEffect(() => {
    orderRepository.fetchPaymentMethods().then((res) => {
      if (res && res.length > 0) {
        const manuals = res.filter((m) => m.gateway_code === 'manual' || m.category === 'BANK_TRANSFER')
        setManualMethods(manuals)
        const hasAutomated = res.some((m) => m.gateway_code !== 'manual')
        if (!hasAutomated) {
          setIsManualFallback(true)
          setPaymentKind('bank')
          setOpenKind('bank')
          if (manuals.length > 0) {
            const code = manuals[0].code.replace('manual_', '').toLowerCase()
            setPaymentProvider(code)
            setValue('payment_method', 'bank', { shouldValidate: true })
            setValue('payment_provider', code)
          }
        }
      }
    }).catch(() => {})
  }, [setPaymentKind, setPaymentProvider, setValue])

  const selectGroup = (kind: PaymentKind) => {
    setOpenKind((prev) => (prev === kind ? null : kind))
  }

  const selectProvider = (kind: PaymentKind, provider: string) => {
    setPaymentKind(kind)
    setPaymentProvider(provider)
    setValue('payment_method', kind, { shouldValidate: true })
    setValue('payment_provider', provider)
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Payment method</legend>
      <p className="text-sm text-muted-foreground">
        Choose how you want to pay. Only one payment method can be active at a time.
      </p>

      {isManualFallback && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <Info className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Mode Transfer Bank Manual Aktif</p>
            <p className="mt-0.5 text-muted-foreground">
              Gateway pembayaran otomatis belum dikonfigurasi. Pembayaran diproses melalui transfer bank manual ke rekening resmi, dan bukti pembayaran dapat diunggah langsung di halaman detail pesanan.
            </p>
          </div>
        </div>
      )}

      {PAYMENT_GROUPS.map((group) => {
        // If in manual fallback mode, hide card and e-money if not configured
        if (isManualFallback && group.kind !== 'bank') {
          return null
        }

        const open = openKind === group.kind
        const active = paymentKind === group.kind
        return (
          <div
            key={group.kind}
            className={cn(
              'overflow-hidden rounded-lg border-2 transition-colors',
              active ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border',
            )}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => selectGroup(group.kind)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                  active ? 'border-primary' : 'border-muted-foreground/40',
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <span className="grow font-display text-base font-semibold tracking-tight">
                {group.kind === 'bank' && isManualFallback ? 'Transfer Bank Manual' : group.label}
              </span>

              {group.feeRate > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  {(group.feeRate * 100).toFixed(0)}% fee
                </span>
              )}
              <ChevronDown
                className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
              />
            </button>

            {open && (
              <div className="border-t px-4 py-3">
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={`${group.label} options`}>
                  {group.options.map((opt) => {
                    const isSelected = active && paymentProvider === opt.id
                    const matchingMethod = manualMethods.find((m) => m.code.toLowerCase().includes(opt.id.toLowerCase()))
                    const extraFee = matchingMethod?.additional_fee ?? 0
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => selectProvider(group.kind, opt.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-sm font-medium transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
                        )}
                      >
                        {opt.label}
                        {extraFee > 0 && (
                          <span className="text-[10px] opacity-80">+{formatPrice(extraFee)}</span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {group.kind === 'card' && active && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="mb-1 text-xs text-muted-foreground">
                        Demo checkout — no card is charged. Use any 16-digit number, e.g. 4242 4242 4242 4242.
                      </p>
                    </div>
                    <CheckoutField
                      name="card_name"
                      label="Name on card"
                      className="sm:col-span-2"
                      autoComplete="cc-name"
                      placeholder="A. Lovelace"
                    />
                    <CheckoutField
                      name="card_number"
                      label="Card number"
                      className="sm:col-span-2"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                    />
                    <CheckoutField name="expiry" label="Expiry (MM/YY)" placeholder="08/28" maxLength={5} />
                    <CheckoutField name="cvc" label="CVC" inputMode="numeric" placeholder="123" maxLength={4} type="password" />
                  </div>
                )}

                {group.kind === 'bank' && active && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="size-4 text-primary" /> Transfer manual ke rekening yang dipilih. Nomor rekening dan formulir unggah bukti transfer akan ditampilkan setelah pesanan dibuat.
                  </p>
                )}

                {group.kind !== 'card' && group.kind !== 'bank' && active && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="size-4" /> You&apos;ll be redirected to {group.label} to authorize payment after placing your order.
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}

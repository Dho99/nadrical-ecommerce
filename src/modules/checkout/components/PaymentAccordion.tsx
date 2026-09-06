import { useState } from 'react'
import { ChevronDown, CreditCard } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { cn } from '../../../shared/utils/cn'
import { PAYMENT_GROUPS } from '../services/payment.service'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import type { PaymentKind } from '../types/checkout.type'
import type { CheckoutInput } from '../schemas/checkout.schema'
import { CheckoutField } from './CheckoutField'

export function PaymentAccordion() {
  const { setValue } = useFormContext<CheckoutInput>()
  const paymentKind = useCheckoutRuntime((s) => s.paymentKind)
  const paymentProvider = useCheckoutRuntime((s) => s.paymentProvider)
  const setPaymentKind = useCheckoutRuntime((s) => s.setPaymentKind)
  const setPaymentProvider = useCheckoutRuntime((s) => s.setPaymentProvider)
  const [openKind, setOpenKind] = useState<PaymentKind | null>('card')

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

      {PAYMENT_GROUPS.map((group) => {
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
                {group.label}
              </span>
              {active && (
                <span className="font-mono text-[10px] font-medium tracking-wider text-primary uppercase">
                  Selected
                </span>
              )}
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

                {group.kind !== 'card' && active && (
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

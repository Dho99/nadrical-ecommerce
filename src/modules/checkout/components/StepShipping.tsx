import { useFormContext } from 'react-hook-form'
import { Box, Package, Rocket, Truck, Zap } from 'lucide-react'
import { Card } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import { SHIPPING_METHODS } from '../types/checkout.type'
import { shippingService } from '../services/shipping.service'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import type { CheckoutInput } from '../schemas/checkout.schema'

const METHOD_ICONS: Record<string, typeof Truck> = {
  standard: Truck,
  express: Zap,
  jne: Package,
  jnt: Box,
  sicepat: Rocket,
}

export function StepShipping({ subtotal }: { subtotal: number }) {
  const selected = useCheckoutRuntime((s) => s.shippingMethod)
  const setShippingMethod = useCheckoutRuntime((s) => s.setShippingMethod)
  const { setValue, register } = useFormContext<CheckoutInput>()

  const select = (id: CheckoutInput['shipping_method']) => {
    setShippingMethod(id)
    setValue('shipping_method', id, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Shipping method</legend>
      <p className="text-sm text-muted-foreground">
        Choose a delivery service. Shipping is calculated from your destination postal code and order weight.
      </p>
      <input type="hidden" value={selected} {...register('shipping_method')} readOnly />
      {SHIPPING_METHODS.map((method) => {
        const Icon = METHOD_ICONS[method.id] ?? Truck
        const active = selected === method.id
        const quote = shippingService.quote(method.id, subtotal)
        return (
          <button type="button" key={method.id} onClick={() => select(method.id)} className="text-left">
            <Card
              role="radio"
              aria-checked={active}
              className={cn(
                'flex cursor-pointer items-center gap-4 border-2 p-4 transition-all',
                active
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  active ? 'border-primary' : 'border-muted-foreground/40',
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-primary" />}
              </span>
              <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              <span className="grow">
                <span className="block font-display text-base font-semibold tracking-tight">
                  {method.label}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{method.eta}</span>
              </span>
              <span className="font-mono text-sm font-semibold">
                {quote.cost === 0 ? 'FREE' : formatPrice(quote.cost)}
              </span>
            </Card>
          </button>
        )
      })}
    </fieldset>
  )
}

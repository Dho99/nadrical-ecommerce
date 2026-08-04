import { useFormContext } from 'react-hook-form'
import { Truck, Zap } from 'lucide-react'
import { Card, RadioGroup, RadioGroupItem } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import { SHIPPING_METHODS } from '../types/checkout.type'
import type { CheckoutInput } from '../schemas/checkout.schema'

const METHOD_ICONS = { standard: Truck, express: Zap } as const

export function StepShipping({ subtotal }: { subtotal: number }) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutInput>()
  const selected = watch('shippingMethod')

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Shipping method</legend>
      <RadioGroup
        value={selected}
        onValueChange={(v: string) =>
          register('shippingMethod').onChange({ target: { name: 'shippingMethod', value: v } })
        }
        className="gap-3"
      >
        {SHIPPING_METHODS.map((method) => {
          const Icon = METHOD_ICONS[method.id]
          const active = selected === method.id
          const free = method.price === 0 || (method.id === 'standard' && subtotal >= 75)
          return (
            <label key={method.id}>
              <Card
                className={cn(
                  'flex cursor-pointer items-center gap-4 p-4 transition-all',
                  active && 'border-primary ring-2 ring-primary/20',
                )}
              >
                <RadioGroupItem
                  value={method.id}
                  {...register('shippingMethod')}
                  className="peer"
                />
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                <span className="grow">
                  <span className="block font-display text-base font-semibold tracking-tight">
                    {method.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{method.eta}</span>
                </span>
                <span className="font-mono text-sm font-semibold">
                  {free ? 'FREE' : formatPrice(method.price)}
                </span>
              </Card>
            </label>
          )
        })}
      </RadioGroup>
      {errors.shippingMethod && (
        <p className="text-xs font-medium text-destructive">{errors.shippingMethod.message}</p>
      )}
    </fieldset>
  )
}
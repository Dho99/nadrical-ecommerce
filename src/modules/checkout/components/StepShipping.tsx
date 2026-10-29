import { useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { Box, LoaderCircle, Package, Rocket, Truck, Zap } from 'lucide-react'
import { Card } from '../../../shared/components/ui'
import { cn } from '../../../shared/utils/cn'
import { formatPrice } from '../../../shared/utils/format'
import { SHIPPING_METHODS } from '../types/checkout.type'
import type { GatewayShippingMethod } from '../services/order.repository'
import { useShippingMethods } from '../hooks/useShippingMethods'
import { useCheckoutRuntime } from '../hooks/useCheckoutRuntime'
import { gatewayShippingCost } from '../utils/gateway'
import type { CheckoutInput } from '../schemas/checkout.schema'

const FALLBACK_METHODS: GatewayShippingMethod[] = SHIPPING_METHODS.map((method) => ({
  uuid: method.id,
  gateway_code: 'fallback',
  courier_code: method.id,
  courier_name: method.label,
  service_code: method.id,
  service_name: method.label,
  full_name: method.label,
  base_rate: method.price,
  fee_type: 'FIXED',
  additional_fee: 0,
  etd: method.eta,
  is_enabled: true,
}))

type ShippingIcon = typeof Truck

const METHOD_ICONS: Record<string, ShippingIcon> = {
  jne: Package,
  jnt: Box,
  sicepat: Rocket,
  kurir_toko: Truck,
  standard: Truck,
  express: Zap,
}

function iconFor(method: GatewayShippingMethod): ShippingIcon {
  const key = (method.courier_code || method.service_code || '').toLowerCase()
  return METHOD_ICONS[key] ?? Truck
}

export function StepShipping() {
  const selected = useCheckoutRuntime((s) => s.shippingMethod)
  const selectedData = useCheckoutRuntime((s) => s.shippingMethodData)
  const setShippingMethod = useCheckoutRuntime((s) => s.setShippingMethod)
  const { setValue, register } = useFormContext<CheckoutInput>()
  const { methods, loading, error } = useShippingMethods()

  const available = methods.length > 0 ? methods : FALLBACK_METHODS
  const activeId = selectedData?.uuid ?? selected
  const activeMethod = useMemo(
    () => available.find((method) => method.uuid === activeId) ?? available[0],
    [activeId, available],
  )

  useEffect(() => {
    if (!activeMethod) return
    if (selectedData?.uuid === activeMethod.uuid) return
    setShippingMethod(activeMethod)
    setValue('shipping_method', activeMethod.uuid, { shouldValidate: true })
  }, [activeMethod, selectedData?.uuid, setShippingMethod, setValue])

  const select = (method: GatewayShippingMethod) => {
    setShippingMethod(method)
    setValue('shipping_method', method.uuid, { shouldValidate: true, shouldDirty: true })
  }

  return (
    <fieldset>
      <legend className="sr-only">Metode pengiriman</legend>
      <p className="text-sm text-muted-foreground">
        Pilih layanan pengiriman yang tersedia. Tarif mengikuti konfigurasi toko.
      </p>
      <input type="hidden" value={activeId} {...register('shipping_method')} readOnly />

      {loading && methods.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircle className="size-3.5 animate-spin" /> Memuat layanan pengiriman…
        </div>
      )}
      {error && (
        <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          Gagal memuat tarif backend. Menampilkan tarif fallback. {error}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {available.map((method) => {
          const Icon = iconFor(method)
          const active = activeId === method.uuid
          const cost = gatewayShippingCost(method)
          return (
            <button type="button" key={method.uuid} onClick={() => select(method)} className="h-full">
              <Card
                role="radio"
                aria-checked={active}
                className={cn(
                  'flex h-full cursor-pointer flex-col gap-1.5 border-2 p-2.5 transition-all sm:p-4',
                  active
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50',
                )}
              >
                <span className="flex items-center justify-between">
                  <span
                    className={cn(
                      'flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors sm:size-5',
                      active ? 'border-primary' : 'border-muted-foreground/40',
                    )}
                  >
                    {active && <span className="size-2 rounded-full bg-primary sm:size-2.5" />}
                  </span>
                  <Icon className="size-4 text-muted-foreground sm:size-5" aria-hidden="true" />
                </span>
                <span className="block truncate text-xs font-semibold tracking-tight sm:text-sm">
                  {method.service_name || method.full_name}
                </span>
                <span className="line-clamp-2 text-[10px] leading-tight text-muted-foreground sm:text-xs">
                  {method.courier_name}
                  {method.etd ? ` · ${method.etd}` : ''}
                </span>
                <span className="mt-auto font-mono text-xs font-semibold sm:text-sm">
                  {cost === 0 ? 'GRATIS' : formatPrice(cost)}
                </span>
              </Card>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

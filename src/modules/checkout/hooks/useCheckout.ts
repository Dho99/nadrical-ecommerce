import { useState } from 'react'
import { useForm, type Path, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { checkoutService } from '../services/checkout.service'
import { checkoutSchema, type CheckoutInput } from '../schemas/checkout.schema'
import type { OrderConfirmation, OrderPayload } from '../types/checkout.type'
import { useVoucher } from '../../voucher/hooks/useVoucher'

export const CHECKOUT_STEPS = [
  { num: '01', label: 'Delivery' },
  { num: '02', label: 'Shipping' },
  { num: '03', label: 'Payment' },
] as const

export type CheckoutStepIndex = 0 | 1 | 2

const STEP_FIELDS: Array<Array<keyof CheckoutInput>> = [
  [
    'recipient_name',
    'email',
    'recipient_phone',
    'shipping_address_line_1',
    'shipping_city',
    'shipping_postal_code',
  ],
  ['shipping_method'],
  ['card_name', 'card_number', 'expiry', 'cvc'],
]

interface UseCheckoutResult {
  step: CheckoutStepIndex
  isFirstStep: boolean
  isLastStep: boolean
  isSubmitting: boolean
  error: string | null
  confirmation: OrderConfirmation | null
  form: ReturnType<typeof useForm<CheckoutInput>>
  next: () => Promise<void>
  back: () => void
  goTo: (index: CheckoutStepIndex) => void
  submit: SubmitHandler<CheckoutInput>
}

export function useCheckout(
  payloadBase: Pick<OrderPayload, 'items' | 'totals'>,
  initialValues: Partial<Pick<CheckoutInput, 'recipient_name' | 'email'>> = {},
): UseCheckoutResult {
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      shipping_method: 'standard',
      ...initialValues,
    },
  })
  const [step, setStep] = useState<CheckoutStepIndex>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)
  const { applied, discount } = useVoucher()

  const isFirstStep = step === 0
  const isLastStep = step === CHECKOUT_STEPS.length - 1

  const next = async () => {
    const fields = STEP_FIELDS[step].map((f) => f as Path<CheckoutInput>)
    const valid = await form.trigger(fields)
    if (!valid) return
    setError(null)
    setStep((prev) => Math.min(prev + 1, CHECKOUT_STEPS.length - 1) as CheckoutStepIndex)
  }

  const back = () => {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 0) as CheckoutStepIndex)
  }

  const goTo = (index: CheckoutStepIndex) => {
    if (index < step) setStep(index)
  }

  const submit: SubmitHandler<CheckoutInput> = async (values) => {
    if (!isLastStep) return
    setIsSubmitting(true)
    setError(null)
    try {
      const shippingForTotals = values.shipping_method === 'express' ? 16 : payloadBase.totals.shipping_total
      const voucherDiscount = applied ? discount(payloadBase.totals.subtotal, shippingForTotals) : 0
      const discountedTotals = {
        ...payloadBase.totals,
        discount: voucherDiscount,
        voucher_code: applied?.code,
        grand_total: Math.max(0, payloadBase.totals.subtotal - voucherDiscount + shippingForTotals),
        shipping_total: shippingForTotals,
      }
      const payload: OrderPayload = {
        customer: {
          recipient_name: values.recipient_name,
          email: values.email,
          recipient_phone: values.recipient_phone,
          shipping_address_line_1: values.shipping_address_line_1,
          shipping_address_line_2: values.shipping_address_line_2,
          shipping_city: values.shipping_city,
          shipping_province: values.shipping_province,
          shipping_postal_code: values.shipping_postal_code,
          shipping_country_code: values.shipping_country_code,
        },
        shipping_method: values.shipping_method,
        payment: {
          card_name: values.card_name,
          card_number: values.card_number,
          expiry: values.expiry,
          cvc: values.cvc,
        },
        items: payloadBase.items,
        totals: discountedTotals,
        voucher_code: applied?.code,
      }
      const result = await checkoutService.placeOrder(payload)
      setConfirmation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return { step, isFirstStep, isLastStep, isSubmitting, error, confirmation, form, next, back, goTo, submit }
}
